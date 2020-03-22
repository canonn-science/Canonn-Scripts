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

	baseReport: async (reportType, reportData, jwt, bodyCache) => {
		// Set report data
		let reportChecklist = {
			stopValidation: false,
			report: {
				type: reportType + 'reports',
				site: reportType,
				data: reportData,
			},
			valid: {
				isValid: false,
				reason: undefined,
				reportStatus: undefined,
			},
			checks: {
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
			},
		};

		logger.info('--> Running Validation Checks');

		// Check if missing data
		try {
			if (!reportData.systemName) {
				logger.warn('<-- Validation failed: Missing System');
				reportChecklist.valid = reportStatus.missingSystem;
				reportChecklist.stopValidation = true;
			} else if (!reportData.bodyName) {
				logger.warn('<-- Validation failed: Missing Body');
				reportChecklist.valid = reportStatus.missingBody;
				reportChecklist.stopValidation = true;
			} else if (!reportData.latitude) {
				logger.warn('<-- Validation failed: Missing Latitude');
				reportChecklist.valid = reportStatus.missingLatitude;
				reportChecklist.stopValidation = true;
			} else if (!reportData.longitude) {
				logger.warn('<-- Validation failed: Missing Longitude');
				reportChecklist.valid = reportStatus.missingLongitude;
				reportChecklist.stopValidation = true;
			} else if (!reportData.type) {
				logger.warn('<-- Validation failed: Missing Type');
				reportChecklist.valid = reportStatus.missingType;
				reportChecklist.stopValidation = true;
			} else if (!reportData.cmdrName) {
				logger.warn('<-- Validation failed: Missing CMDR');
				reportChecklist.valid = reportStatus.missingCMDR;
				reportChecklist.stopValidation = true;
			} else if (!reportData.frontierID) {
				logger.warn('<-- Validation failed: Missing Frontier ID');
				reportChecklist.valid = reportStatus.missingFDev;
				reportChecklist.stopValidation = true;
			}
		} catch (error) {
			logger.warn('<-- Script Error: Missing Data');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check if beta
		try {
			if (reportChecklist.stopValidation === false) {
				if (reportData.isBeta === true) {
					logger.warn('<-- Validation failed: Report is beta');
					reportChecklist.valid = reportStatus.beta;
					reportChecklist.stopValidation = true;
				} else if (reportData.isBeta == null || reportData.isBeta == undefined) {
					logger.warn('<-- Validation failed: Beta flag not set');
					reportChecklist.valid = reportStatus.missingBeta;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: Beta');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check CMDR/Client Blacklist
		try {
			if (reportChecklist.stopValidation === false) {
				let isBlacklisted = await checkTools.blacklist(reportChecklist);

				if (isBlacklisted) {
					reportChecklist = isBlacklisted;

					if (reportChecklist.checks.blacklists.cmdr.checked === false) {
						logger.warn('<-- Validation failed: CMDR Blacklist Check failed');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.blacklists.cmdr.checked === true &&
						reportChecklist.checks.blacklists.cmdr.blacklisted === true
					) {
						logger.warn('<-- Validation failed: CMDR is Blacklist');
						reportChecklist.valid = reportStatus.blacklisted;
						reportChecklist.stopValidation = true;
					} else if (reportChecklist.checks.blacklists.client.checked === false) {
						logger.warn('<-- Validation failed: Client Blacklist Check failed');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.blacklists.client.checked === true &&
						reportChecklist.checks.blacklists.client.blacklisted === true
					) {
						logger.warn('<-- Validation failed: Client Blacklist Check failed');
						reportChecklist.valid = reportStatus.blacklisted;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on blacklist');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: Blacklist');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check for System (CAPI/EDSM)
		try {
			if (reportChecklist.stopValidation === false) {
				let checkSystem = await checkTools.system(reportChecklist);

				if (checkSystem) {
					reportChecklist = checkSystem;

					if (reportChecklist.checks.capiv2.system.checked === false) {
						logger.warn('<-- Validation failed: Unknown Error on CAPI System');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.system.exists === false &&
						reportChecklist.checks.edsm.system.checked === false
					) {
						logger.warn('<-- Validation failed: Unknown Error on EDSM System');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.edsm.system.exists === true &&
						reportChecklist.checks.edsm.system.hasCoords === false
					) {
						logger.warn('<-- Validation failed: EDSM Missing Coords');
						reportChecklist.valid = reportStatus.edsmCoords;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.system.exists === false &&
						reportChecklist.checks.edsm.system.exists === false
					) {
						logger.warn('<-- Validation failed: System does not exist in EDSM');
						reportChecklist.valid = reportStatus.edsmSystem;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on System Check');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: System');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check for Body (CAPI/EDSM)
		try {
			if (reportChecklist.stopValidation === false) {
				let checkBody = await checkTools.body(reportChecklist, bodyCache);

				if (checkBody) {
					reportChecklist = checkBody;

					if (reportChecklist.checks.capiv2.body.checked === false) {
						logger.warn('<-- Validation failed: Unknown Error on CAPI Body');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.body.exists === false &&
						reportChecklist.checks.edsm.body.checked === false
					) {
						logger.warn('<-- Validation failed: Unknown Error on EDSM Body');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.body.exists === false &&
						reportChecklist.checks.edsm.body.exists === false
					) {
						logger.warn('<-- Validation failed: Body does not exist in EDSM');
						reportChecklist.valid = reportStatus.edsmBody;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on Body Check');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: Body');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check Duplicate
		try {
			if (reportChecklist.stopValidation === false) {
				let checkDuplicate = await checkTools.duplicate(reportChecklist);

				if (checkDuplicate) {
					reportChecklist = checkDuplicate;

					if (
						reportChecklist.checks.capiv2.duplicate.createSite === false &&
						reportChecklist.checks.capiv2.duplicate.isDuplicate === false
					) {
						logger.warn('<-- Validation failed: Error on Duplicate Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.duplicate.isDuplicate === true &&
						reportChecklist.checks.capiv2.duplicate.site === {}
					) {
						logger.warn('<-- Validation failed: Site missing on Duplicate Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on Duplicate Check');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: Duplicate');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check Update
		try {
			if (reportChecklist.stopValidation === false) {
				let checkUpdate = await checkTools.update(reportChecklist);

				if (checkUpdate) {
					reportChecklist = checkUpdate;

					if (
						reportChecklist.checks.capiv2.duplicate.createSite === true &&
						reportChecklist.checks.capiv2.duplicate.updateSite === true
					) {
						logger.warn('<-- Validation failed: Error on Update Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.duplicate.isDuplicate === true &&
						reportChecklist.checks.capiv2.duplicate.site === {}
					) {
						logger.warn('<-- Validation failed: Site missing on Duplicate Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on Update Check');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: Update');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check if Type is valid
		try {
			if (reportChecklist.stopValidation === false) {
				let checkType = await checkTools.type(reportChecklist);

				if (checkType) {
					reportChecklist = checkType;

					if (reportChecklist.checks.capiv2.type.checked === false) {
						logger.warn('<-- Validation failed: Error on Type Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.type.exists === true &&
						reportChecklist.checks.capiv2.type.data === {}
					) {
						logger.warn('<-- Validation failed: Data missing on Type Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (reportChecklist.checks.capiv2.type.exists === false) {
						logger.warn('<-- Validation failed: Type does not exist in CAPI');
						reportChecklist.valid = reportStatus.capiv2Type;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on Type Check');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: Type');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Check for CMDR
		try {
			if (reportChecklist.stopValidation === false) {
				let checkCMDR = await checkTools.cmdr(reportChecklist);

				if (checkCMDR) {
					reportChecklist = checkCMDR;

					if (reportChecklist.checks.capiv2.cmdr.checked === false) {
						logger.warn('<-- Validation failed: Error on CMDR Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					} else if (
						reportChecklist.checks.capiv2.cmdr.exists === true &&
						reportChecklist.checks.capiv2.cmdr.data === {}
					) {
						logger.warn('<-- Validation failed: Data missing on CMDR Check');
						reportChecklist.valid = reportStatus.network;
						reportChecklist.stopValidation = true;
					}
				} else {
					logger.warn('<-- Validation failed: Unknown Error on CMDR Check');
					reportChecklist.valid = reportStatus.network;
					reportChecklist.stopValidation = true;
				}
			}
		} catch (error) {
			logger.warn('<-- Script Error: CMDR');
			reportChecklist.valid = reportStatus.network;
			reportChecklist.stopValidation = true;
			console.log(error);
		}

		// Validate
		if (reportChecklist.stopValidation === false) {
			if (
				reportChecklist.report.data.isBeta === false &&
				reportChecklist.checks.blacklists.cmdr.checked === true &&
				reportChecklist.checks.blacklists.cmdr.blacklisted === false &&
				reportChecklist.checks.blacklists.client.checked === true &&
				reportChecklist.checks.blacklists.client.blacklisted === false &&
				reportChecklist.checks.capiv2.system.checked === true &&
				reportChecklist.checks.capiv2.body.checked === true &&
				reportChecklist.checks.capiv2.type.checked === true &&
				reportChecklist.checks.capiv2.type.exists === true &&
				reportChecklist.checks.capiv2.cmdr.checked === true &&
				reportChecklist.checks.capiv2.duplicate.isDuplicate === false &&
				reportChecklist.checks.capiv2.duplicate.createSite === true &&
				(reportChecklist.checks.capiv2.system.exists === true ||
					(reportChecklist.checks.edsm.system.exists === true &&
						reportChecklist.checks.edsm.system.hasCoords === true)) &&
				(reportChecklist.checks.capiv2.body.exists === true || reportChecklist.checks.edsm.body.exists === true)
			) {
				reportChecklist.valid = reportStatus.accepted;
			} else if (
				reportChecklist.report.data.isBeta === false &&
				reportChecklist.checks.blacklists.cmdr.checked === true &&
				reportChecklist.checks.blacklists.cmdr.blacklisted === false &&
				reportChecklist.checks.blacklists.client.checked === true &&
				reportChecklist.checks.blacklists.client.blacklisted === false &&
				reportChecklist.checks.capiv2.system.checked === true &&
				reportChecklist.checks.capiv2.body.checked === true &&
				reportChecklist.checks.capiv2.type.checked === true &&
				reportChecklist.checks.capiv2.type.exists === true &&
				reportChecklist.checks.capiv2.cmdr.checked === true &&
				reportChecklist.checks.capiv2.duplicate.updateSite === true &&
				reportChecklist.checks.capiv2.duplicate.isDuplicate === true &&
				(reportChecklist.checks.capiv2.system.exists === true ||
					(reportChecklist.checks.edsm.system.exists === true &&
						reportChecklist.checks.edsm.system.hasCoords === true)) &&
				(reportChecklist.checks.capiv2.body.exists === true || reportChecklist.checks.edsm.body.exists === true)
			) {
				reportChecklist.valid = reportStatus.updated;
			}
		} else if (!reportChecklist.valid.reason) {
			reportChecklist.valid = reportStatus.network;
		}

		// Process
		if (reportChecklist.valid.isValid === true) {
			logger.info('--> Report is valid, processing...');
			console.log(reportChecklist.valid);
			console.log(reportChecklist.report.data.type);
			console.log(reportChecklist.checks.capiv2.type.data);
		} else {
			logger.info('--> Report not Valid, updating report');
			console.log(reportChecklist.valid);
			await delay(2000);
		}

		return {
			checklist: reportChecklist,
			data: {},
			addToCache: reportChecklist.addToCache,
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
