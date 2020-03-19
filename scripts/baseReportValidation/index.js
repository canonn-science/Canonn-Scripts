const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../../modules/utils/scriptModule_utils');
const validateTools = require('../../modules/validate/scriptModule_validation');
const settings = require('../../settings.json');
const delay = ms => new Promise(res => setTimeout(res, ms));
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'baseReportValidation';
let doReset = false;
let doValidate = true;
let isCron = true;
let jwt;

// Load params
let params = process.argv;
let reportKeys = settings.scripts[scriptName].acceptedTypes;

// Start the logger
loginit(scriptName);

// Reset Issue tagged reports to pending
if (params.includes('--reset'.toLowerCase()) === true) {
	doReset = true;
	logger.warn('Forcfully resetting issue reports to pending');
}

// Do not validate reports
if (params.includes('--novalidate'.toLowerCase()) === true) {
	doValidate = false;
	logger.warn('Not validating reports');
}

// Ask CAPI for reports
const fetchReports = async (type, status, start, limit = settings.global.capiLimit) => {
	// Grab systems
	logger.info(`Fetching ${status} ${type.toUpperCase()} reports from Canonn API`);
	let keepGoing = true;

	let reports = [];

	while (keepGoing === true) {
		let response = await capi.getReports(type, status, start);

		for (i = 0; i < response.length; i++) {
			reports.push(response[i]);
		}

		if (response.length < limit) {
			keepGoing = false;
			logger.info('Fetched ' + reports.length + ` ${type.toUpperCase()} reports`);
		} else {
			start = start + limit;
			await delay(settings.global.delay);
		}
	}

	return reports;
};

const resetReports = async count => {
	logger.warn('Performing issue report reset');
	logger.info('----------------');
	for (r = 0; r < reportKeys.length; r++) {
		logger.warn(`Resetting ${reportKeys[r].toUpperCase()} reports to \"pending\"`);
		if (count.data[reportKeys[r]].reports.issue > 0) {
			let resetList = await fetchReports(reportKeys[r], 'issue', 0);

			for (z = 0; z < resetList.length; z++) {
				logger.info(
					`Resetting ${reportKeys[r].toUpperCase()} report ID: ${resetList[z].id} [${z + 1}/${
						resetList.length
					}]`
				);
				logger.info(`--> Sending updated Report`);

				let reportData = await capi.updateReport(
					reportKeys[r],
					resetList[z].id,
					{
						reportStatus: 'pending',
					},
					jwt
				);

				if (reportData.reportStatus !== 'pending') {
					logger.warn(
						`<-- ${reportKeys[r].toUpperCase()} report ID: ${resetList[z].id} did not reset successfully`
					);
				} else {
					logger.info('<-- Report reset');
				}
			}
		} else {
			logger.info(`There are no ${reportKeys[r].toUpperCase()} reports marked as \"issue\"`);
		}
		logger.info('----------------');
	}
	logger.stop('Report reset complete');
	logger.info('----------------');
};

const validate = async () => {
	// Login to the Canonn API
	jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS);

	logger.info('Getting a count of all reports');
	logger.info('----------------');

	let reportCounts = await capi.getReportCount();

	if (doReset === true) {
		await resetReports(reportCounts);
	}

	if (doValidate === false) {
		logger.warn('Skipping report validation');
	} else {
		logger.start('Validating Reports');
		logger.info('----------------');

		for (l = 0; l < reportKeys.length; l++) {
			if (reportCounts.data[reportKeys[l]].reports.pending > 0) {
				logger.info(`Validating ${reportKeys[l].toUpperCase()} Reports`);
				let toValidate = await fetchReports(reportKeys[l], 'pending', 0);

				for (v = 0; v < toValidate.length; v++) {
					logger.info(
						`Validating ${reportKeys[l].toUpperCase()} report ID: ${toValidate[v].id} [${v + 1}/${
							toValidate.length
						}]`
					);

					let reportChecked = await validateTools.baseReport(reportKeys[l], toValidate[v], jwt);

					console.log(reportChecked.checklist);

					await delay(1500);
				}
			} else {
				logger.info(`There are no ${reportKeys[l].toUpperCase()} reports to process`);
			}
			logger.info('----------------');
		}
		logger.stop('Report validation complete');
	}

	logger.stop('----------------');
	logger.stop('Script Complete!');
	logger.stop('----------------');
};

if (params.includes('--now'.toLowerCase()) === true) {
	isCron = false;
	logger.start('Forcefully running scripts');
	validate();
}

if (isCron === true) {
	logger.start('Starting in cron mode');
	cron.schedule(settings.scripts[scriptName].cron[process.env.NODEID], () => {
		validate();
	});
}
