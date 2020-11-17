const cron = require('node-cron');
const logger = require('perfect-logger');

const loginit = require('../../modules/logger');
const capi = require('../../modules/capi');
const edsm = require('../../modules/edsm');
const utils = require('../../modules/utils');
const settings = require('../../settings');

const params = require('minimist')(process.argv.slice(2));
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// REMOVE after migration to core script
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'systemUpdate';
let isForced = false;
let isCron = true;
let jwt;
let updateSettings = settings.scripts[scriptName];

// Start the logger
loginit(scriptName);

// Switch between forced updates
if (params.force === true) {
  isForced = true;
  logger.warn('Forcefully updating all systems');
}

// Ask CAPI for systems
const fetchSystems = async (start, limit = settings.global.capiLimit, url) => {
  // Login to the Canonn API
  jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS, url);

  // Grab systems
  logger.info('Fetching systems from Canonn API');
  let keepGoing = true;

  let systems = [];

  while (keepGoing === true) {
    let response = await capi.getSystems(start, isForced, undefined, url);

    for (let i = 0; i < response.length; i++) {
      systems.push(response[i]);
    }

    if (response.length < limit) {
      keepGoing = false;
      logger.info('Fetched ' + systems.length + ' systems from the Canonn API');
    } else {
      start = start + limit;
      await delay(settings.global.delay);
    }
  }

  return systems;
};

const update = async () => {
  // Grab URL
  let url = await capi.capiURL();

  let start = 0;

  if (params.start) {
    try {
      logger.info('Using custom start: ' + params.start);
      start = parseInt(params.start);
    } catch (e) {
      logger.warn('Start parameter is not an integer, defaulting to zero');
    }
  }

  let systems = await fetchSystems(start, undefined, url);

  for (let i = 0; i < systems.length; i++) {
    logger.info(
      `Updating on information on System ID: ${systems[i].id} [${i + 1}/${systems.length}]`
    );
    logger.info('--> Asking EDSM for system data');
    let response = await edsm.getSystem(systems[i].systemName);

    if (!response || Array.isArray(response) === true || response == [] || response == {}) {
      logger.warn('<-- System not found, updating CAPI with skip count');

      let skipCount = 0;
      if (typeof systems[i].missingSkipCount !== 'number') {
        skipCount = 1;
      } else {
        skipCount = skipCount + 1;
      }

      await capi.updateSystem(
        systems[i].id,
        {
          missingSkipCount: skipCount,
        },
        jwt,
        url
      );
    } else {
      logger.info('<-- System Found, updating CAPI with new data');
      let newData = await utils.processSystem('edsm', response, url);

      if (newData.edsmCoordLocked === false && isForced === false) {
        if (typeof systems[i].missingSkipCount !== 'number') {
          newData.missingSkipCount = 1;
        } else {
          newData.missingSkipCount = systems[i].missingSkipCount + 1;
        }
      } else if (isForced === false) {
        newData.missingSkipCount = 0;
      }
      await capi.updateSystem(systems[i].id, newData, jwt, url);
    }
    await delay(updateSettings.edsmDelay);
  }

  logger.stop('----------------');
  logger.stop('Script Complete!');
  logger.stop('----------------');
};

if (params.now === true) {
  isCron = false;
  logger.start('Forcefully running scripts');
  update();
}

if (isCron === true) {
  logger.start('Starting in cron mode');
  let nodeID = 0;

  if (process.env.NODEID) {
    nodeID = process.env.NODEID;
  }

  cron.schedule(settings.scripts[scriptName].cron[nodeID], () => {
    update();
  });
}
