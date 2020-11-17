const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger');
const capi = require('../../modules/capi');
const settings = require('../../settings');

// REMOVE after migration to core script
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'deleteMR';
let isCron = true;
let jwt;

// Load params
let params = process.argv;

// Start the logger
loginit(scriptName);

// Delete old material reports
const deleteMR = async () => {
  let length = settings.scripts[scriptName].keepMonthCount;

  // Grab URL
  let url = await capi.capiURL();

  // Login to the Canonn API
  jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS, url);

  // Grab material reports
  logger.info('Fetching material reports older than ' + length + ' month');

  // Grab total count of material reports
  let mrCount = await capi.countMaterialReport(length, url);

  logger.info(`There are ${mrCount} material reports to be deleted`);

  if (mrCount > 0) {
    logger.start('----------------');
    logger.start(`Deleting ${mrCount} material reports`);
    logger.start('----------------');

    try {
      let deleteData = await capi.deleteMaterialReports(length, jwt, url);

      if (deleteData.deletedRecords) {
        logger.info(
          `<-- Deleted ${deleteData.deletedRecords} older than ${deleteData.intervalMonth} months`
        );
      } else {
        logger.info('<-- No records to delete');
      }
    } catch (e) {
      logger.warn('Delete request failed!');
      console.log(e);
    }
  }
  logger.stop('----------------');
  logger.stop('Script Complete!');
  logger.stop('----------------');
};

if (params.includes('--now'.toLowerCase()) === true) {
  isCron = false;
  logger.start('Forcefully running scripts');
  deleteMR();
}

if (isCron === true) {
  logger.start('Starting in cron mode');
  let nodeID = 0;

  if (process.env.NODEID) {
    nodeID = process.env.NODEID;
  }

  cron.schedule(settings.scripts[scriptName].cron[nodeID], () => {
    deleteMR();
  });
}
