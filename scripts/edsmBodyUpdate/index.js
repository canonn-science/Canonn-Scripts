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
			start = start + limit;
			await delay(settings.global.delay);
		}
	}

	return bodies;
};

const update = async () => {
	let bodies = await fetchBodies(0);

	// Create edsm system cache
	let edsmSystems = []

	const searchBodyList = (list, key) => {
		for (l = 0; l < list.length; l++) {
			if (list[i].name.toUpperCase() === key.toUpperCase()){
				return list[i]
			}
		}
		return undefined
	}
	
	for (i = 0; i < bodies.length; i++) {
		logger.info(`Updating information on Body ID: ${bodies[i].id} [${i + 1}/${bodies.length}]`)

		let bodyData;

		// Check cache in case we already asked for the system
		edsmSystems.find(system => {
			if (system.name) {
				if (system.name.toUpperCase() === bodies[i].system.systemName){
					logger.info('--> System in cache, looking for body')
					
					let searchData = await searchBodyList(system.bodies, bodies[i].system.systemName)

					if (searchData) {
						logger.info('--> Body Found in cache')
					}
				}
			}
		});

	}


	await delay(settings.scripts.edsmBodyUpdate.edsmDelay);

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
