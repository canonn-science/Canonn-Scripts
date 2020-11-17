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
let scriptName = 'bodyUpdate';
let isForced = false;
let isCron = true;
let jwt;
let updateSettings = settings.scripts[scriptName];

// Start the logger
loginit(scriptName);

// Switch between forced updates
if (params.force === true) {
  isForced = true;
  logger.warn('Forcefully updating all bodies');
}

// Ask CAPI for bodies
const fetchBodies = async (start, limit = settings.global.capiLimit, url) => {
  // Login to the Canonn API
  jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS, url);

  // Grab systems with bodies
  logger.info('Fetching bodies from Canonn API');
  let keepGoing = true;

  let bodies = [];

  while (keepGoing === true) {
    let response = await capi.getBodies(start, isForced, url);

    for (let i = 0; i < response.length; i++) {
      bodies.push(response[i]);
    }

    if (response.length < limit) {
      keepGoing = false;
      logger.info('Fetched ' + bodies.length + ' bodies from the Canonn API');
    } else {
      start = start + limit;
      await delay(settings.global.delay);
    }
  }

  return bodies;
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

  let bodies = await fetchBodies(start, undefined, url);

  // Create edsm system cache
  let edsmSystems = [];

  const searchBodyList = (list, key) => {
    for (let l = 0; l < list.length; l++) {
      if (list[l].name && list[l].name.toUpperCase() === key.toUpperCase()) {
        return list[l];
      }
    }
    return undefined;
  };

  const badBody = async (bodyData) => {
    logger.warn('<-- Body not found, updating CAPI with skip count');
    bodyData.missingSkipCount += 1;
    await capi.updateBody(
      bodyData.id,
      {
        missingSkipCount: bodyData.missingSkipCount,
      },
      jwt,
      url
    );
  };

  const goodBody = async (bodyID, bodyData, systemID) => {
    logger.info('<-- Body Found, updating CAPI with new data');
    let newData = await utils.processBody('edsm', bodyData, systemID);

    if (
      !newData.missingSkipCount &&
      (!bodyData.missingSkipCount || bodyData.missingSkipCount < 0)
    ) {
      newData.missingSkipCount = 0;
    }

    await capi.updateBody(bodyID, newData, jwt, url);
  };

  for (let i = 0; i < bodies.length; i++) {
    logger.info(`Updating information on Body ID: ${bodies[i].id} [${i + 1}/${bodies.length}]`);

    let bodyData;
    let isGood = false;

    // Check cache in case we already asked for the system
    edsmSystems.find((system) => {
      if (system.name && system.name.toUpperCase() === bodies[i].system.systemName.toUpperCase()) {
        logger.info('--> System in cache, looking for body');

        let searchData = searchBodyList(system.bodies, bodies[i].bodyName);

        if (searchData) {
          logger.info('--> Body Found in cache');
          bodyData = searchData;
          isGood = true;
        }
      }
    });

    if (!bodyData) {
      logger.warn('--> System not in cache, asking EDSM');
      let response = await edsm.getBody(bodies[i].system.systemName);
      edsmSystems.push(await response);

      if (
        response.name &&
        response.name.toUpperCase() === bodies[i].system.systemName.toUpperCase()
      ) {
        logger.info('--> System in EDSM, looking for body');

        let searchData = await searchBodyList(response.bodies, bodies[i].bodyName);

        if (searchData) {
          logger.info('--> Body Found in EDSM');
          bodyData = searchData;
          isGood = true;
        } else {
          logger.warn('<-- Body not in EDSM');
        }
      }
    }

    if (isGood === true) {
      await goodBody(bodies[i].id, bodyData, bodies[i].system.id);
    } else {
      await badBody(bodies[i]);
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
