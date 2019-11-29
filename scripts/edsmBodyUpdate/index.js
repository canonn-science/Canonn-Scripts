const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
const edsm = require('../../modules/edsm/scriptModule_edsm');
const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../../modules/utils/scriptModule_utils');
const settings = require('../../settings.json');
const delay = ms => new Promise(res => setTimeout(res, ms));
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'edsmBodyUpdate';
let isForced = false;
let isCron = true;
let jwt;

// Load params
let params = process.argv;

// Start the logger
loginit(scriptName);

// Switch between forced updates
if (params.includes('--force'.toLowerCase()) === true) {
	isForced = true;
	logger.warn('Forcfully updating all bodies');
}

// Ask CAPI for bodies
const fetchBodies = async (start, limit = settings.global.capiLimit) => {
	// Login to the Canonn API
	jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS);

	// Grab systems with bodies
	logger.info('Fetching bodies from Canonn API');
	let keepGoing = true;

	let bodies = [];

	while (keepGoing === true) {
		let response = await capi.getBodies(start, isForced);

		for (i = 0; i < response.length; i++) {
			bodies.push(response[i]);
		}

		if (response.length < limit) {
			keepGoing = false;
			logger.info('Fetched ' + bodies.length + ' bodies from the Canonn API');
		} else {
			start = parseInt(start) + limit;
			await delay(settings.global.delay);
		}
	}

	return bodies;
};

const update = async () => {
	// Allow custom start
	let start = 0;
	if (process.env.START) {
		start = process.env.START;
		logger.warn(`Setting custom start: ${start}`);
	}

	let bodies = await fetchBodies(start);

	// Create edsm system cache
	let edsmSystems = [];

	const searchBodyList = (list, key) => {
		for (l = 0; l < list.length; l++) {
			if (list[l].name && list[l].name.toUpperCase() === key.toUpperCase()) {
				return list[l];
			}
		}
		return undefined;
	};

	const badBody = async bodyData => {
		logger.warn('<-- Body not found, updating CAPI with skip count');
		bodyData.missingSkipCount += 1;
		await capi.updateBody(
			bodyData.id,
			{
				missingSkipCount: bodyData.missingSkipCount,
			},
			jwt
		);
	};

	const goodBody = async (bodyID, bodyData, systemID) => {
		logger.info('<-- Body Found, updating CAPI with new data');
		let newData = await utils.processBody('edsm', bodyData, systemID);
		await capi.updateBody(bodyID, newData, jwt);
	};

	for (i = 0; i < bodies.length; i++) {
		logger.info(`Updating information on Body ID: ${bodies[i].id} [${i + 1}/${bodies.length}]`);

		let bodyData;
		let isGood = false;

		// Check cache in case we already asked for the system
		edsmSystems.find(system => {
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
			let response = await edsm.getBodyEDSM(bodies[i].system.systemName);
			edsmSystems.push(await response);

			if (response.name && response.name.toUpperCase() === bodies[i].system.systemName.toUpperCase()) {
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
		await delay(settings.scripts.edsmBodyUpdate.edsmDelay);
	}

	logger.stop('----------------');
	logger.stop('Script Complete!');
	logger.stop('----------------');
};

if (params.includes('--now'.toLowerCase()) === true) {
	isCron = false;
	logger.start('Forcefully running scripts');
	update();
}

if (isCron === true) {
	logger.start('Starting in cron mode');
	cron.schedule(settings.scripts[scriptName].cron[settings.global.nodeID], () => {
		update();
	});
}
