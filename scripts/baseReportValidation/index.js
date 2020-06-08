const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
const capi = require('../../modules/capi/scriptModule_capi');
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
	logger.info(`Fetching ${status} ${type.toUpperCase()} reports from Canonn API`);
	let keepGoing = true;

	let reports = [];

	// Get reports via a loop based on response length
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

// Reset reports from "issue" to "pending"
const resetReports = async count => {
	logger.warn('Performing issue report reset');
	logger.info('----------------');
	for (r = 0; r < reportKeys.length; r++) {
		logger.warn(`Resetting ${reportKeys[r].toUpperCase()} reports to \"pending\"`);

		// Loop through accepted types and reset all of them
		if (count.data[reportKeys[r]].reports.issue > 0) {

			// Fetch list of issue reports
			let resetList = await fetchReports(reportKeys[r], 'issue', 0);

			// Loop through list and fire report updates
			for (z = 0; z < resetList.length; z++) {
				logger.info(
					`Resetting ${reportKeys[r].toUpperCase()} report ID: ${resetList[z].id} [${z + 1}/${
						resetList.length
					}]`
				);
				logger.info(`--> Sending updated Report`);

				// Send updated report status to CAPI
				let reportData = await capi.updateReport(
					reportKeys[r],
					resetList[z].id,
					{
						reportStatus: 'pending',
					},
					jwt
				);

				// Verify report was updated
				if (reportData.reportStatus !== 'pending') {
					logger.warn(
						`<-- ${reportKeys[r].toUpperCase()} report ID: ${resetList[z].id} did not reset successfully`
					);
				} else {
					logger.info('<-- Report reset');
				}

				// Setting larger delay to decrease load on CAPI
				await delay(settings.global.delay * 15);
			}
		} else {
			logger.info(`There are no ${reportKeys[r].toUpperCase()} reports marked as \"issue\"`);
		}
		logger.info('----------------');
	}
	logger.stop('Report reset complete');
	logger.info('----------------');
};

// Validate reports and create/update data as needed
const validate = async () => {
	// Login to the Canonn API
	jwt = await capi.login(process.env.CAPI_USER, process.env.CAPI_PASS);

	logger.info('Getting a count of all reports');
	logger.info('----------------');

	// Get total counts to prevent extra load on CAPI
	let reportCounts = await capi.getReportCount();

	// If reset flag is set, reset first
	if (doReset === true) {
		await resetReports(reportCounts);
	}

	// If validation flag is set, skip validation
	if (doValidate === false) {
		logger.warn('Skipping report validation');
	} else {
		logger.start('Validating Reports');
		logger.info('----------------');

		// Initialize EDSM bodyCache to decrease EDSM API calls
		let bodyCache = [];

		// Loop through acceptable site/report types
		for (l = 0; l < reportKeys.length; l++) {

			// Check counts and skip if there is none to be done
			if (reportCounts.data[reportKeys[l]].reports.pending > 0) {
				logger.info(`Validating ${reportKeys[l].toUpperCase()} Reports`);

				// Fetch reports (loop to fetch all)
				let toValidate = await fetchReports(reportKeys[l], 'pending', 0);

				// Validate each report in the type
				for (v = 0; v < toValidate.length; v++) {
					logger.info(
						`Validating ${reportKeys[l].toUpperCase()} report ID: ${toValidate[v].id} [${v + 1}/${
							toValidate.length
						}]`
					);

					// Fire report off to be validated and processed
					let reportChecked = await validateTools.baseReport(reportKeys[l], toValidate[v], jwt, bodyCache);

					// Push any new EDSM body lookups to cache based on if system name exists
					if (
						typeof reportChecked.addToCache !== 'undefined' &&
						bodyCache.findIndex(
							x => x.name.toLowerCase() == reportChecked.addToCache.name.toLowerCase()
						) === -1
					) {
						logger.info(`<-- Added body to cache [${bodyCache.length + 1}]`);
						bodyCache.push(reportChecked.addToCache);
					}

					// Set delay to prevent load on CAPI
					await delay(settings.global.delay * 15);
				}
			} else {
				logger.info(`There are no ${reportKeys[l].toUpperCase()} reports to process`);
			}
			logger.info('----------------');
			// Set delay to prevent corrupt logging
			await delay(500)
		}
		logger.stop('Report validation complete');
		logger.info('----------------');

		// Clean the EDSM body cache between cron runs
		logger.stop('Clearing EDSM cache');
		bodyCache = [];
	}
	logger.stop('----------------');
	logger.stop('Script Complete!');
	logger.stop('----------------');
};

// Run the script now (for development purposes)
if (params.includes('--now'.toLowerCase()) === true) {
	isCron = false;
	logger.start('Forcefully running scripts');
	validate();
}

// Run as cron, using node id for scaling and offset (offset not implemented yet)
if (isCron === true) {
	logger.start('Starting in cron mode');
	cron.schedule(settings.scripts[scriptName].cron[process.env.NODEID], () => {
		validate();
	});
}
