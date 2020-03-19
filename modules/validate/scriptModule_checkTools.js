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
				if (checkSystem[0].systemName.toLowerCase() === data.systemName.toLowerCase()) {
					checklist.capiv2.system = {
						add: false,
						checked: true,
						exists: true,
						data: checkSystem[0],
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
				};

				checklist.valid = reportStatus.edsmSystem;

				return checklist;
			}
		} else {
			checklist.valid = reportStatus.edsmSystem;
			return checklist;
		}
	},

	body: async (data, checklist) => {},

	duplicate: async (data, checklist) => {},
};
