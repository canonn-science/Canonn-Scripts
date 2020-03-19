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
		let stopValidation = false;

		// Check CMDR/Client Blacklist
		let isBlacklisted = await checkTools.blacklist(reportData, reportChecklist);

		if (isBlacklisted) {
			reportChecklist = isBlacklisted;

			if (reportChecklist.valid.reportStatus !== undefined) {
				stopValidation = true;
			}
		} else {
			logger.warn('<-- Validation failed due to error on blacklist');
			reportChecklist.valid = reportStatus.network;
			stopValidation = true;
		}

		// Check for System (CAPI/EDSM)
		if (stopValidation === false) {
			let checkSystem = await checkTools.system(reportData, reportChecklist);

			if (checkSystem) {
				reportChecklist = checkSystem;

				if (
					reportChecklist.capiv2.system.checked === false ||
					reportChecklist.edsm.system.checked === false ||
					reportChecklist.edsm.system.exists === false ||
					reportChecklist.edsm.system.hasCoords === false ||
					reportChecklist.edsm.system.data === undefined
				) {
					stopValidation = true;
				}
			} else {
				logger.warn('<-- Validation failed due to error on System Check');
				reportChecklist.valid = reportStatus.network;
				stopValidation = true;
			}
		}

		// Check for Body (CAPI/EDSM)
		if (stopValidation === false) {
			let checkBody = await checkTools.body(reportData, reportChecklist);

			if (checkBody) {
				reportChecklist = checkBody;

				if (
					reportChecklist.capiv2.body.checked === false ||
					reportChecklist.edsm.body.checked === false ||
					reportChecklist.edsm.body.exists === false ||
					reportChecklist.edsm.body.data === undefined
				) {
					stopValidation = true;
				}
			} else {
				logger.warn('<-- Validation failed due to error on Body Check');
				reportChecklist.valid = reportStatus.network;
				stopValidation = true;
			}
		}

		// Check Existing Site/Duplicate
		if (stopValidation === false) {
			let checkDuplicate = await checkTools.duplicate(reportData, reportChecklist);

			if (checkDuplicate) {
				reportChecklist = checkDuplicate;

				if (
					reportChecklist.capiv2.duplicate.isDuplicate === true ||
					reportChecklist.capiv2.duplicate.site !== {} ||
					reportChecklist.capiv2.duplicate.checkedFrontierID === false ||
					reportChecklist.capiv2.duplicate.checkedHaversine === false
				) {
					stopValidation = true;
				}
			} else {
				logger.warn('<-- Validation failed due to error on Duplicate Check');
				reportChecklist.valid = reportStatus.network;
				stopValidation = true;
			}
		}

		// Check if Type is valid
		if (stopValidation === false) {
			//let checkType = await capi.getType(reportData.type, jwt, capiURL);
		}

		// Check for CMDR
		if (stopValidation === false) {
			//let checkCMDR = await capi.getCMDR(reportData.cmdrName, jwt, capiURL);
		}

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
