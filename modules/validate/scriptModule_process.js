const logger = require('perfect-logger');
const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../utils/scriptModule_utils');
const settings = require('../../settings.json');

module.exports = {
	valid: async (status, reportchecklist, jwt, url) => {
		let error = false;

		if (status === 'new') {
			let data = {
				system: undefined,
				body: undefined,
				latitude: reportchecklist.report.data.latitude,
				longitude: reportchecklist.report.data.longitude,
				type: reportchecklist.checks.capiv2.type.data.id,
				frontierID: reportchecklist.report.data.frontierID,
				verified: false,
				visible: true,
				discoveredBy: undefined,
			};

			// Create/Assign System
			if (error === false) {
				if (reportchecklist.checks.capiv2.system.add === true) {
					logger.info('--> Creating new System');
					let newsysData = await utils.processSystem('edsm', reportchecklist.checks.edsm.system.data);

					let system = await capi.createSystem(newsysData, jwt, url);
					if (!system.id) {
						error = true;
						logger.warn('<-- System creation failed');
					} else {
						logger.info('<-- System created with ID: ' + system.id);
						data.system = system.id;
					}
				} else if (
					reportchecklist.checks.capiv2.system.exists === true ||
					reportchecklist.checks.capiv2.system.data.id
				) {
					data.system = reportchecklist.checks.capiv2.system.data.id;
				}
			}

			// Create/Assign Body
			if (error === false) {
				if (reportchecklist.checks.capiv2.body.add === true) {
					logger.info('--> Creating new Body');
					let newbdyData = await utils.processBody(
						'edsm',
						reportchecklist.checks.edsm.body.data,
						data.system
					);

					let body = await capi.createBody(newbdyData, jwt, url);
					if (!body.id) {
						error = true;
						logger.warn('<-- Body creation failed');
					} else {
						logger.info('<-- Body created with ID: ' + body.id);
						data.body = body.id;
					}
				} else if (
					reportchecklist.checks.capiv2.body.exists === true ||
					reportchecklist.checks.capiv2.body.data.id
				) {
					data.body = reportchecklist.checks.capiv2.body.data.id;
				}
			}

			// Create/Assign CMDR
			if (error === false) {
				if (reportchecklist.checks.capiv2.cmdr.add === true) {
					logger.info('--> Creating new CMDR');
					let newcmdrData = {
						cmdrName: reportchecklist.report.data.cmdrName,
					};

					let cmdr = await capi.createCMDR(newcmdrData, jwt, url);
					if (!cmdr.id) {
						error = true;
						logger.warn('<-- CMDR creation failed');
					} else {
						logger.info('<-- CMDR created with ID: ' + cmdr.id);
						data.discoveredBy = cmdr.id;
					}
				} else if (
					reportchecklist.checks.capiv2.cmdr.exists === true ||
					reportchecklist.checks.capiv2.cmdr.data.id
				) {
					data.discoveredBy = reportchecklist.checks.capiv2.cmdr.data.id;
				}
			}

			if (error === false && data.system && data.body && data.discoveredBy) {
				logger.info('--> Creating Site');
				let site = await capi.createSite(reportchecklist.report.site, data, jwt, url);

				if (!site.id) {
					logger.warn('<-- Site creation failed');
					error = true;
				} else {
					logger.info(`<-- Created ${reportchecklist.report.site.toUpperCase()} Site ID: ${site.id}`);

					// Update report
					logger.info('--> Updating Report');
					let updatedReport = await capi.updateReport(
						reportchecklist.report.site,
						reportchecklist.report.data.id,
						{
							reportComment: reportchecklist.valid.reason,
							reportStatus: reportchecklist.valid.reportStatus,
							site: site.id,
						},
						jwt,
						url
					);
					logger.info(`<-- Updated Report ID: ${updatedReport.id}`);
					return {
						site: site,
						report: updatedReport,
					};
				}
			} else {
				logger.warn('<-- Processing Failed');
				return {
					site: data,
					report: {},
				};
			}
		} else if (status === 'duplicate') {
			// Do Duplicate stuff
		}
	},

	invalid: async reportchecklist => {
		console.log('Doing stuff invalid report stuff');
	},
};
