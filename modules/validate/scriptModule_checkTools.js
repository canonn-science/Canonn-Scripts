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

	blacklist: async checklist => {
		let data = checklist.report.data;

		// Check CMDR
		let checkCMDR = await capi.checkBlacklist('cmdr', data.cmdrName);

		if (checkCMDR.length > 0) {
			for (i = 0; i < checkCMDR.length; i++) {
				if (data.cmdrName.toLowerCase() === checkCMDR[i].cmdrName.toLowerCase()) {
					checklist.checks.blacklists.cmdr = {
						checked: true,
						blacklisted: true,
					};
					return checklist;
				}
			}
		} else {
			checklist.checks.blacklists.cmdr = {
				checked: true,
				blacklisted: false,
			};
		}

		// Check Client
		let checkClient = await capi.checkBlacklist('client', data.clientVersion);

		if (checkClient.length > 0) {
			for (i = 0; i < checkClient.length; i++) {
				if (data.clientVersion.toLowerCase() === checkClient[i].version.toLowerCase()) {
					checklist.checks.blacklists.client = {
						checked: true,
						blacklisted: true,
					};
					return checklist;
				}
			}
		} else {
			checklist.checks.blacklists.client = {
				checked: true,
				blacklisted: false,
			};
		}
		return checklist;
	},

	system: async checklist => {
		let data = checklist.report.data;

		let checkSystem = await capi.getSystem(data.systemName);

		if (checkSystem.length === 1 && checkSystem[0].systemName.toLowerCase() === data.systemName.toLowerCase()) {
			checklist.checks.capiv2.system = {
				add: false,
				checked: true,
				exists: true,
				data: checkSystem[0],
			};
			return checklist;
		} else if (checkSystem.length > 1) {
			for (i = 0; i < checkSystem.length; i++) {
				if (checkSystem[i].systemName.toLowerCase() === data.systemName.toLowerCase()) {
					checklist.checks.capiv2.system = {
						add: false,
						checked: true,
						exists: true,
						data: checkSystem[i],
					};
					return checklist;
				}
			}
		} else if (checkSystem.length < 1) {
			checklist.checks.capiv2.system = {
				add: true,
				checked: true,
				exists: false,
				data: {},
			};

			let checkEDSM = await edsm.getSystemEDSM(data.systemName);

			if (
				checkEDSM.name.toLowerCase() === data.systemName.toLowerCase() &&
				checkEDSM.id &&
				checkEDSM.coords.x &&
				checkEDSM.coords.y &&
				checkEDSM.coords.z
			) {
				checklist.checks.edsm.system = {
					checked: true,
					exists: true,
					hasCoords: true,
					data: checkEDSM,
				};
				return checklist;
			} else if (!checkEDSM || checkEDSM == {} || checkEDSM == [] || checkEDSM == undefined) {
				checklist.checks.edsm.system = {
					checked: true,
					exists: false,
					hasCoords: false,
					data: {},
				};
				return checklist;
			} else if (
				checkEDSM.name.toLowerCase() === data.systemName.toLowerCase() &&
				(!checkEDSM.coords || !checkEDSM.coords.x || !checkEDSM.coords.y || !checkEDSM.coords.z)
			) {
				checklist.checks.edsm.system = {
					checked: true,
					exists: true,
					hasCoords: false,
					data: checkEDSM,
				};
				return checklist;
			} else {
				checklist.checks.edsm.system = {
					checked: false,
					exists: false,
					hasCoords: false,
					data: {},
				};
				return checklist;
			}
		} else {
			return checklist;
		}
	},

	body: async (checklist, bodyCache) => {
		let data = checklist.report.data;

		// Check CAPI
		let checkBody = await capi.getBody(data.bodyName);

		if (checkBody.length >= 1) {
			for (i = 0; i < checkBody.length; i++) {
				if (checkBody[i].bodyName.toLowerCase() === data.bodyName.toLowerCase()) {
					checklist.checks.capiv2.body = {
						add: false,
						checked: true,
						exists: true,
						data: checkBody[i],
					};
					return checklist;
				}
			}
		} else if (checkBody.length < 1) {
			checklist.checks.capiv2.body = {
				add: true,
				checked: true,
				exists: false,
				data: {},
			};

			// Check Body Cache
			for (c = 0; c < bodyCache.length; c++) {
				if (bodyCache[c].name.toLowerCase() === data.systemName.toLowerCase()) {
					let bodies = bodyCache[c].bodies;
					for (cb = 0; cb < bodies.length; cb++) {
						if (bodies[cb].name.toLowerCase() === data.bodyName.toLowerCase()) {
							checklist.checks.edsm.body = {
								checked: true,
								exists: true,
								data: bodies[cb],
							};
							return checklist;
						}
					}
				}
			}

			// Check EDSM
			let checkEDSM = await edsm.getBodyEDSM(data.systemName);

			if (checkEDSM.name.toLowerCase() === data.systemName.toLowerCase()) {
				// Add EDSM looking to cache
				checklist.addToCache = checkEDSM;

				// Continue validation
				for (b = 0; b < checkEDSM.bodies.length; b++) {
					if (checkEDSM.bodies[b].name.toLowerCase() === data.bodyName.toLowerCase()) {
						checklist.checks.edsm.body = {
							checked: true,
							exists: true,
							data: checkEDSM.bodies[b],
						};
						return checklist;
					}
				}
			} else if (!checkEDSM || checkEDSM == {} || checkEDSM == [] || checkEDSM == undefined) {
				checklist.checks.edsm.body = {
					checked: true,
					exists: false,
					data: {},
				};
				return checklist;
			} else {
				checklist.checks.edsm.body = {
					checked: false,
					exists: false,
					data: {},
				};
				return checklist;
			}
		} else {
			return checklist;
		}
	},

	duplicate: async checklist => {
		let data = checklist.report.data;

		let checkDuplicate = await capi.getSites(checklist.report.site, data.bodyName);

		if (!checkDuplicate || checkDuplicate === []) {
			checklist.checks.duplicate = {
				createSite: true,
				updateSite: false,
				checkedHaversine: false,
				checkedFrontierID: false,
				isDuplicate: false,
				distance: undefined,
				site: {},
			};
		} else {
			for (i = 0; i < checkDuplicate; i++) {
				if (checkDuplicate[i].bodyName.toLowerCase() === data.bodyName.toLowerCase()) {
					// Do duplication checks
				}
			}
		}
	},

	update: async checklist => {
		let data = checklist.report.data;
	},

	type: async checklist => {
		let data = checklist.report.data;
	},

	cmdr: async checklist => {
		let data = checklist.report.data;
	},
};
