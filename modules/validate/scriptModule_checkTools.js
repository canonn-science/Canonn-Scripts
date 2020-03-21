const logger = require('perfect-logger');
const edsm = require('../../modules/edsm/scriptModule_edsm');
const capi = require('../../modules/capi/scriptModule_capi');
const settings = require('../../settings.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

let reportStatus = capi.reportStatus();

module.exports = {
	/**
	 * Check Blacklist for CMDR
	 *
	 * @return {Object}
	 */

	blacklist: async (data, checklist) => {
		if (!data.cmdrName) {
			logger.warn('<-- Missing CMDR');
			checklist.valid = reportStatus.missingCMDR;
			return checklist;
		} else if (!data.clientVersion) {
			logger.warn('<-- Missing Client');
			checklist.valid = reportStatus.missingClient;
			return checklist;
		}

		let checkCMDR = await capi.checkBlacklist('cmdr', data.cmdrName);

		if (checkCMDR.length > 0) {
			for (i = 0; i < checkCMDR.length; i++) {
				if (data.cmdrName.toLowerCase() === checkCMDR[i].cmdrName.toLowerCase()) {
					logger.warn('<-- CMDR Blacklisted');
					checklist.valid = reportStatus.blacklisted;

					checklist.blacklists.cmdr = {
						checked: true,
						blacklisted: true,
					};

					return checklist;
				}
			}
		} else {
			checklist.blacklists.cmdr = {
				checked: true,
				blacklisted: false,
			};
		}

		let checkClient = await capi.checkBlacklist('client', data.clientVersion);

		if (checkClient.length > 0) {
			for (i = 0; i < checkClient.length; i++) {
				if (data.clientVersion.toLowerCase() === checkClient[i].version.toLowerCase()) {
					logger.warn('<-- Client Blacklisted');
					checklist.valid = reportStatus.blacklisted;

					checklist.blacklists.client = {
						checked: true,
						blacklisted: true,
					};

					return checklist;
				}
			}
		} else {
			checklist.blacklists.client = {
				checked: true,
				blacklisted: false,
			};
		}

		return checklist;
	},

	system: async (data, checklist) => {
		if (!data.systemName) {
			logger.warn('<-- Missing System Name');
			checklist.valid = reportStatus.edsmSystem;
			return checklist;
		}

		let checkSystem = await capi.getSystem(data.systemName);

		if (checkSystem.length === 1 && checkSystem[0].systemName.toLowerCase() === data.systemName.toLowerCase()) {
			checklist.capiv2.system = {
				add: false,
				checked: true,
				exists: true,
				data: checkSystem[0],
			};
			return checklist;
		} else if (checkSystem.length > 1) {
			for (i = 0; i < checkSystem.length; i++) {
				if (checkSystem[i].systemName.toLowerCase() === data.systemName.toLowerCase()) {
					checklist.capiv2.system = {
						add: false,
						checked: true,
						exists: true,
						data: checkSystem[i],
					};
					return checklist;
				}
			}
		} else if (checkSystem.length < 1) {
			logger.info('<-- System not in CAPI');
			checklist.capiv2.system = {
				add: true,
				checked: true,
				exists: false,
				data: {},
			};

			logger.info('--> Asking EDSM');
			let checkEDSM = await edsm.getSystemEDSM(data.systemName);

			if (
				checkEDSM.name.toLowerCase() === data.systemName.toLowerCase() &&
				checkEDSM.id &&
				checkEDSM.coords.x &&
				checkEDSM.coords.y &&
				checkEDSM.coords.z
			) {
				checklist.edsm.system = {
					checked: true,
					exists: true,
					hasCoords: true,
					data: checkEDSM,
				};
				return checklist;
			} else if (!checkEDSM || checkEDSM == {} || checkEDSM == [] || checkEDSM == undefined) {
				checklist.edsm.system = {
					checked: true,
					exists: false,
					hasCoords: false,
					data: {},
				};

				checklist.valid = reportStatus.edsmSystem;
				return checklist;
			} else if (
				checkEDSM.name.toLowerCase() === data.systemName.toLowerCase() &&
				(!checkEDSM.coords || !checkEDSM.coords.x || !checkEDSM.coords.y || !checkEDSM.coords.z)
			) {
				checklist.edsm.system = {
					checked: true,
					exists: true,
					hasCoords: false,
					data: checkEDSM,
				};

				checklist.valid = reportStatus.edsmSystem;
				return checklist;
			} else {
				checklist.edsm.system = {
					checked: false,
					exists: false,
					hasCoords: false,
					data: {},
				};

				checklist.valid = reportStatus.edsmSystem;

				return checklist;
			}
		} else {
			checklist.valid = reportStatus.edsmSystem;
			return checklist;
		}
	},

	body: async (data, checklist, bodyCache) => {
		if (!data.bodyName) {
			logger.warn('<-- Missing Body Name');
			checklist.valid = reportStatus.edsmBody;
			return checklist;
		}

		let checkBody = await capi.getBody(data.bodyName);

		if (checkBody.length === 1 && checkBody[0].bodyName.toLowerCase() === data.bodyName.toLowerCase()) {
			checklist.capiv2.body = {
				add: false,
				checked: true,
				exists: true,
				data: checkBody[0],
			};
			return checklist;
		} else if (checkBody.length > 1) {
			for (i = 0; i < checkBody.length; i++) {
				if (checkBody[i].bodyName.toLowerCase() === data.bodyName.toLowerCase()) {
					checklist.capiv2.body = {
						add: false,
						checked: true,
						exists: true,
						data: checkBody[i],
					};
					return checklist;
				}
			}
		} else if (checkBody.length < 1) {
			logger.info('<-- Body not in CAPI');
			checklist.capiv2.body = {
				add: true,
				checked: true,
				exists: false,
				data: {},
			};

			// Check Body Cache
			logger.info('--> Checking EDSM Cache');

			for (c = 0; c < bodyCache.length; c++) {
				if (bodyCache[c].name.toLowerCase() === data.systemName.toLowerCase()) {
					let bodies = bodyCache[c].bodies;
					for (cb = 0; cb < bodies.length; cb++) {
						if (bodies[cb].name.toLowerCase() === data.bodyName.toLowerCase()) {
							checklist.edsm.body = {
								checked: true,
								exists: true,
								data: bodies[cb],
							};
							return checklist;
						}
					}
				}
			}

			logger.info('--> Asking EDSM');
			let checkEDSM = await edsm.getBodyEDSM(data.systemName);

			if (checkEDSM.name.toLowerCase() === data.systemName.toLowerCase()) {
				// Add EDSM looking to cache
				checklist.addToCache = checkEDSM;

				// Continue validation
				for (b = 0; b < checkEDSM.bodies.length; b++) {
					if (checkEDSM.bodies[b].name.toLowerCase() === data.bodyName.toLowerCase()) {
						checklist.edsm.body = {
							checked: true,
							exists: true,
							data: checkEDSM.bodies[b],
						};
						return checklist;
					}
				}
			} else if (!checkEDSM || checkEDSM == {} || checkEDSM == [] || checkEDSM == undefined) {
				checklist.edsm.body = {
					checked: true,
					exists: false,
					data: {},
				};

				checklist.valid = reportStatus.edsmBody;
				return checklist;
			} else {
				checklist.edsm.body = {
					checked: false,
					exists: false,
					data: {},
				};

				checklist.valid = reportStatus.edsmBody;

				return checklist;
			}
		} else {
			checklist.valid = reportStatus.edsmBody;
			return checklist;
		}
	},

	duplicate: async (data, checklist) => {},
};
