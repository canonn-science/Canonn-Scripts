const logger = require('perfect-logger');
const checkTools = require('./scriptModule_checkTools');
const processTools = require('./scriptModule_process');
const capi = require('../../modules/capi/scriptModule_capi');
const settings = require('../../settings.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

let capiURL;

if (process.env.NODE_ENV) {
	capiURL = settings.global.url[process.env.NODE_ENV.toLowerCase()];
} else {
	capiURL = settings.global.url.local;
}

let reportStatus = capi.reportStatus();

module.exports = {
	/**
	 * Validate "Base" reports
	 *
	 * @return {Object}
	 */

	baseReport: async (reportType, reportData, jwt) => {
		let reportChecklist = {
			reportType: reportType + 'reports',
			reportID: reportData.id,
			valid: {
				isValid: false,
				reason: undefined,
				reportStatus: undefined,
			},
			isBeta: true,
			blacklists: {
				cmdr: {
					checked: false,
					blacklisted: true,
				},
				client: {
					checked: false,
					blacklisted: true,
				},
			},
			capiv2: {
				system: {
					add: false,
					checked: false,
					exists: false,
					data: {},
				},
				body: {
					add: false,
					checked: false,
					exists: false,
					data: {},
				},
				type: {
					checked: false,
					exists: false,
					data: {},
				},
				cmdr: {
					add: false,
					checked: false,
					exists: false,
					data: {},
				},
				duplicate: {
					createSite: false,
					updateSite: false,
					checkedHaversine: false,
					checkedFrontierID: false,
					isDuplicate: true,
					distance: undefined,
					site: {},
				},
			},
			edsm: {
				system: {
					checked: false,
					exists: false,
					hasCoords: false,
					data: undefined,
				},
				body: {
					checked: false,
					exists: false,
					data: undefined,
				},
			},
		};

		logger.info('--> Running Validation Checks');

		// Check CMDR/Client Blacklist
		let isBlacklisted = await checkTools.blacklist(reportData, reportChecklist);

		if (isBlacklisted) {
			reportChecklist = isBlacklisted;
		} else {
			logger.warn('<-- Validation failed due to error on blacklist');
		}

		// Check for System (CAPI/EDSM)
		//let checkSystem = await capi.getSystem(reportData.systemName, jwt, capiURL);

		// Check for Body (CAPI/EDSM)
		//let checkBody = await capi.getBody(reportData.bodyName, jwt, capiURL);

		// Check Existing Site/Duplicate
		//let isDuplicate = await checkTools.duplicate(reportData, jwt, capiURL);

		// Check for update existing site

		// Check if Type is valid
		//let checkType = await capi.getType(reportData.type, jwt, capiURL);

		// Check for CMDR
		//let checkCMDR = await capi.getCMDR(reportData.cmdrName, jwt, capiURL);

		// Validate
		if (reportChecklist.valid.reason === undefined && reportChecklist.valid.reportStatus === undefined) {
			reportChecklist.valid = reportStatus.accepted;
		}

		// Process
		if (reportChecklist.valid.isValid === true) {
			logger.info('--> Report is valid, processing');
		} else {
			logger.info('--> Report not Valid, updating report');
		}

		//let processedReport = await processTools.baseReport(reportChecklist, reportData, jwt, capiURL);

		return {
			checklist: reportChecklist,
			data: {},
		};
	},

	/**
	 * Validate "Orbital" reports
	 *
	 * @return {Object}
	 */

	orbitalReport: async () => {},

	/**
	 * Validate "Thargoid" reports
	 *
	 * @return {Object}
	 */

	thargoidReport: async () => {},

	/**
	 * Validate "Guardian" reports
	 *
	 * @return {Object}
	 */

	guardianReport: async () => {},
};
