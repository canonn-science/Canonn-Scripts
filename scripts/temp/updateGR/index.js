const csv = require('csvtojson');
const logger = require('perfect-logger');
const loginit = require('../../../modules/logger');
const capi = require('../../../modules/capi');

require('dotenv').config({ path: require('find-config')('.env') });
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let scriptName = 'updateGR';
loginit(scriptName);
const filePath = __dirname + '/data/updateGRType.csv';

async function login(url) {
  let data = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS, url);
  return data;
}

const readCSV = async (filePath) => {
  let data = await csv().fromFile(filePath);
  return data;
};

async function update() {
  let url = await capi.capiURL();

  // Login
  let jwt = await login(url);

  // Get Updates
  let data = await readCSV(filePath);

  for (let i = 0; i < data.length; i++) {
    logger.info(`Updating GR Report ID: ${data[i].id}`);
    let updated = await capi.updateReport(
      'gr',
      data[i].id,
      { type: data[i].type, reportStatus: data[i].reportStatus },
      jwt,
      url
    );
    if (updated.id) {
      logger.info(`Report ID: ${updated.id} updated with type: ${updated.type}`);
    } else {
      logger.crit('Update failed');
    }
    await delay(2000);
  }
}

update();
