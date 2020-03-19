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
};
