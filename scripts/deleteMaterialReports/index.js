const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
const capi = require('../../modules/capi/scriptModule_capi');
const settings = require('../../settings.json');
const delay = ms => new Promise(res => setTimeout(res, ms));
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'deleteMaterialReports';
let isCron = true;
let jwt;

// Load params
let params = process.argv;

// Start the logger
loginit(scriptName);

// Ask CAPI for old material reports
const fetchMaterialReports = async (length, start, limit = settings.global.capiLimit) => {
	// Login to the Canonn API
	jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS);

	// Grab material reports
	logger.info('Fetching material reports from Canonn API');
	let keepGoing = true;

	let materialReports = [];

	while (keepGoing === true) {
		let response = await capi.getMaterialReports(length, start);

		for (i = 0; i < response.length; i++) {
			materialReports.push(response[i]);
		}

		if (response.length < limit) {
			keepGoing = false;
			logger.info('Fetched ' + materialReports.length + ' reports from the Canonn API');
		} else {
			start = start + limit;
			await delay(settings.global.delay);
		}
	}

	return materialReports;
};

// Delete old material reports
const deleteMR = async () => {
	let materialReports = await fetchMaterialReports(settings.scripts[scriptName].keepMonthCount, 0);

	for (i = 0; i < materialReports.length; i++) {
		logger.info(`Deleting Material Report ID: ${materialReports[i].id} [${i + 1}/${materialReports.length}]`);
		logger.info('--> Asking CAPI to delete');
    let response = await capi.deleteMaterialReport(materialReports[i].id, jwt);
    
    if (response) {
      logger.info('<-- Material Report Deleted');
      console.log(response);
    }
    await delay(settings.global.delay * 15)
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
	cron.schedule(settings.scripts[scriptName].cron[process.env.NODEID], () => {
		deleteMR();
	});
}