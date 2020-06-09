const logger = require('perfect-logger');
const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../utils/scriptModule_utils');

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

					// Assign region if it exists
					if(reportchecklist.report.data.regionID) {
						newsysData.region = reportchecklist.report.data.regionID
					}

					let system = await capi.createSystem(newsysData, jwt, url);
					if (!system.id) {
						error = true;
						logger.warn('<-- System creation failed');
					} else {
						logger.info('<-- System created with ID: ' + system.id);
						data.system = system.id;
					}
				} else if (
					reportchecklist.checks.capiv2.system.exists === true &&
					reportchecklist.checks.capiv2.system.data.id &&
					reportchecklist.report.data.regionID &&
					(
						reportchecklist.checks.capiv2.system.data.region === null ||
						typeof reportchecklist.checks.capiv2.system.data.region === 'undefined'
					)
				) {
					logger.info('--> Updating system with region ID');
					let system = await capi.updateSystem(
						reportchecklist.checks.capiv2.system.data.id,
						{
							region: reportchecklist.report.data.regionID
						},
						jwt,
						url
					);
						if(system.id) {
							logger.info('<-- System updated with region');
							data.system = system.id
						} else {
							logger.warn('<-- System region update failed');
						}
				} else if (
					reportchecklist.checks.capiv2.system.exists === true &&
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
							added: true,
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
		} else if (status === 'update') {
			let data = {};

			// Make grabbing report/site data easier
			let reportData = reportchecklist.report.data;
			let siteData = reportchecklist.checks.capiv2.duplicate.site;

			// Create CMDR if needed
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
					reportchecklist.checks.capiv2.cmdr.data = cmdr;
					data.discoveredBy = reportchecklist.checks.capiv2.cmdr.data.id;
				}
			}

			// Check if anything needs to be updated
			if (error === false) {
				if (reportData.systemName.toUpperCase() === siteData.system.systemName.toUpperCase()) {
					if (reportData.bodyName.toUpperCase() === siteData.body.bodyName.toUpperCase()) {
						if (!siteData.frontierID) {
							data.frontierID = reportData.frontierID;
						}

						if (!siteData.discoveredBy || siteData.discoveredBy.id === 618) {
							data.discoveredBy = reportchecklist.checks.capiv2.cmdr.data.id;
						}
					} else {
						logger.warn("<-- Body name doesn't match");
						logger.warn('--> Updating report');
					}
				} else {
					logger.warn("<-- System name doesn't match");
					logger.warn('--> Updating report');
				}
			}

			// If nothing to be updated, do nothing
			if (error === false) {
				if (Object.keys(data).length < 1) {
					logger.warn('--> Nothing to update, setting to duplicate');
					let duplicateReport = await module.exports.invalid('duplicate', reportchecklist, jwt, url);
					logger.warn(
						`<-- Updated ${reportchecklist.report.site.toUpperCase()} Report ID: ${
							duplicateReport.id
						} as duplicate`
					);
					error === true;
				} else {
					logger.info('--> Updating site');
					let site = await capi.updateSite(
						reportchecklist.report.site,
						reportchecklist.checks.capiv2.duplicate.site.id,
						data,
						jwt,
						url
					);
					logger.info(`<-- Updated ${reportchecklist.report.site.toUpperCase()} Site ID: ${site.id}`);

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
			}
		}
	},

	invalid: async (status, reportchecklist, jwt, url) => {
		if (status === 'duplicate') {
			logger.info('--> Updating report');

			let updatedReport = await capi.updateReport(
				reportchecklist.report.site,
				reportchecklist.report.data.id,
				{
					reportStatus: reportchecklist.valid.reportStatus,
					reportComment: reportchecklist.valid.reason,
					added: false,
					site: reportchecklist.checks.capiv2.duplicate.site.id
				},
				jwt,
				url
			);

			logger.info(`<-- Updated Report ID: ${updatedReport.id}`);
			return {
				report: updatedReport,
			};

		} else if (status === 'invalid') {
			logger.info('--> Updating report');

			let updatedReport = await capi.updateReport(
				reportchecklist.report.site,
				reportchecklist.report.data.id,
				{
					reportStatus: reportchecklist.valid.reportStatus,
					reportComment: reportchecklist.valid.reason,
					added: false
				},
				jwt,
				url
			);

			logger.info(`<-- Updated Report ID: ${updatedReport.id}`);
			return {
				report: updatedReport,
			};
		}
	},
};
