const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
const capi = require('../../modules/capi/scriptModule_capi');
const settings = require('../../settings.json');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'deleteMaterialReports';
let isCron = true;
let jwt;

// Load params
let params = process.argv;

// Start the logger
loginit(scriptName);

// Delete old material reports
const deleteMR = async () => {
	let length = settings.scripts[scriptName].keepMonthCount;
	let start = 0;
	let limit = settings.global.capiLimit;
	let keepGoing = true;
	let deleteCount = 0;

	// Login to the Canonn API
	jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS);

	// Grab material reports
	logger.info('Fetching material reports from Canonn API');

	// Grab total count of material reports
	let mrCount = await capi.countMaterialReport(length);

	logger.info(`There are ${mrCount} material reports to be deleted`);

	logger.start('----------------');
	logger.start(`Fetching first ${limit} material reports`);
	logger.start('----------------');
	while (keepGoing === true) {
		let response = await capi.getMaterialReports(length, start);

		for (i = 0; i < response.length; i++) {
			logger.info(`Deleting Material Report ID: ${response[i].id} [${deleteCount + 1}/${mrCount}]`);
			logger.info('--> Asking CAPI to delete');
			let responseDelete = await capi.deleteMaterialReport(response[i].id, jwt);

			if (responseDelete) {
				logger.info('<-- Material Report deleted');
			} else {
				logger.warn('<-- Failed to delete Material Report');
			}
			deleteCount = deleteCount + 1;
			await delay(settings.global.delay);
		}

		if (response.length < limit) {
			keepGoing = false;
			logger.info('Deleted ' + deleteCount + ' material reports from the Canonn API');
		} else {
			logger.start('----------------');
			logger.start(`Fetching next ${limit} material reports`);
			logger.start('----------------');
			start = start + limit;
			await delay(settings.global.delay * 3);
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
	cron.schedule(settings.scripts[scriptName].cron[process.env.NODEID], () => {
		deleteMR();
	});
}
