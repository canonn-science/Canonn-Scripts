const edsm = require('../../modules/edsm/scriptModule_edsm');
const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../utils/scriptModule_utils');
const settings = require('../../settings.json');

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

		if (!Array.isArray(checkDuplicate) || !checkDuplicate.length) {
			checklist.checks.capiv2.duplicate = {
				createSite: true,
				updateSite: false,
				checkedHaversine: false,
				checkedFrontierID: false,
				isDuplicate: false,
				distance: undefined,
				site: {},
			};
		} else {
			for (i = 0; i < checkDuplicate.length; i++) {
				let internalChecks = {
					distance: undefined,
					checkedHav: false,
					FIDMatch: false,
					checkedFID: false,
				};
				if (
					checkDuplicate[i].system.systemName.toUpperCase() === data.systemName.toUpperCase() &&
					checkDuplicate[i].body.bodyName.toUpperCase() === data.bodyName.toUpperCase() &&
					Object.keys(checklist.checks.capiv2.duplicate.site).length == 0
				) {
					if (checkDuplicate[i].body.radius) {
						let distance = await utils.haversine(
							{
								latitude: checkDuplicate[i].latitude,
								longitude: checkDuplicate[i].longitude,
							},
							{
								latitude: data.latitude,
								longitude: data.longitude,
							},
							checkDuplicate[i].body.radius
						);

						internalChecks.distance = distance;
						internalChecks.checkedHav = true;
					}

					if (data.frontierID === checkDuplicate[i].frontierID) {
						internalChecks.checkedFID = true;
						internalChecks.FIDMatch = true;
					} else if (data.frontierID !== null || data.frontierID !== undefined) {
						internalChecks.checkedFID = true;
					}
				}

				if (internalChecks.distance != undefined && internalChecks.checkedHav === true) {
					checklist.checks.capiv2.duplicate.checkedHaversine = true;
					checklist.checks.capiv2.duplicate.distance = internalChecks.distance;
				}

				if (internalChecks.checkedFID === true) {
					checklist.checks.capiv2.duplicate.checkedFrontierID = true;
				}

				if (internalChecks.FIDMatch === true) {
					checklist.checks.capiv2.duplicate.isDuplicate = true;
					checklist.checks.capiv2.duplicate.site = checkDuplicate[i];
				}

				if (internalChecks.distance <= settings.scripts.baseReportValidation.settings.duplicateRange) {
					checklist.checks.capiv2.duplicate.isDuplicate = true;
					checklist.checks.capiv2.duplicate.site = checkDuplicate[i];
				} else if (
					internalChecks.distance > settings.scripts.baseReportValidation.settings.duplicateRange &&
					internalChecks.FIDMatch === false
				) {
					checklist.checks.capiv2.duplicate.isDuplicate = false;
					checklist.checks.capiv2.duplicate.createSite = true;
				}
			}
		}
		return checklist;
	},

	update: async checklist => {
		let data = checklist.report.data;

		if (checklist.checks.capiv2.duplicate.createSite === true) {
			checklist.checks.capiv2.duplicate.updateSite = false;
			return checklist;
		}

		if (
			checklist.checks.capiv2.duplicate.site.frontierID == null ||
			(checklist.checks.capiv2.duplicate.site.frontierID == undefined && data.frontierID > 0)
		) {
			checklist.checks.capiv2.duplicate.updateSite = true;
		}

		if (checklist.checks.capiv2.duplicate.site.discoveredBy.cmdrName === 'zzz_Unknown') {
			checklist.checks.capiv2.duplicate.updateSite = true;
		}

		return checklist;
	},

	type: async checklist => {
		let data = checklist.report.data;

		let checkType = await capi.getTypes(checklist.report.site);

		if (!Array.isArray(checkType) || !checkType.length) {
			checklist.checks.capiv2.type = {
				checked: false,
				exists: false,
				data: {},
			};
		} else {
			let stop = false;
			for (i = 0; i < checkType.length; i++) {
				if (data.type.toLowerCase() === checkType[i].type.toLowerCase() && stop === false) {
					stop = true;
					checklist.checks.capiv2.type = {
						checked: true,
						exists: true,
						data: checkType[i],
					};
				} else if (data.type.toLowerCase() === checkType[i].journalName.toLowerCase() && stop === false) {
					stop = true;
					checklist.checks.capiv2.type = {
						checked: true,
						exists: true,
						data: checkType[i],
					};
				} else if (stop === false) {
					checklist.checks.capiv2.type = {
						checked: true,
						exists: false,
						data: {},
					};
				}
			}
		}

		return checklist;
	},

	cmdr: async checklist => {
		let data = checklist.report.data;

		let cmdrCheck = await capi.getCMDR(data.cmdrName);

		if (!Array.isArray(cmdrCheck) || !cmdrCheck.length) {
			checklist.checks.capiv2.cmdr = {
				add: true,
				checked: true,
				exists: false,
				data: {},
			};
		} else {
			for (i = 0; i < cmdrCheck.length; i++) {
				if (data.cmdrName.toLowerCase() === cmdrCheck[i].cmdrName.toLowerCase()) {
					checklist.checks.capiv2.cmdr = {
						add: false,
						checked: true,
						exists: true,
						data: cmdrCheck[i],
					};
				} else {
					checklist.checks.capiv2.cmdr = {
						add: true,
						checked: true,
						exists: false,
						data: {},
					};
				}
			}
		}

		return checklist;
	},
};
