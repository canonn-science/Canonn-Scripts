const logger = require('perfect-logger');
const capi = require('../capi');
const utils = require('../utils');

async function valid(status, checklist, jwt, url) {
  let error = false;

  if (status === 'new') {
    let data = {
      system: undefined,
      body: undefined,
      latitude: checklist.report.data.latitude,
      longitude: checklist.report.data.longitude,
      type: checklist.checks.capiv2.type.data.id,
      frontierID: checklist.report.data.frontierID,
      verified: false,
      visible: true,
      discoveredBy: undefined,
    };

    // Thargoid handling
    if (checklist.report.site === 'tb') {
      data.subtype = 1;
      data.cycle = 1;
    }

    // Create/Assign System
    if (error === false) {
      if (checklist.checks.capiv2.system.add === true) {
        logger.info('--> Creating new System');
        let newsysData = await utils.processSystem('edsm', checklist.checks.edsm.system.data);

        // Assign region if it exists
        if (checklist.report.data.regionID) {
          newsysData.region = checklist.report.data.regionID;
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
        checklist.checks.capiv2.system.exists === true &&
        checklist.checks.capiv2.system.data.id &&
        checklist.report.data.regionID &&
        (checklist.checks.capiv2.system.data.region === null ||
          typeof checklist.checks.capiv2.system.data.region === 'undefined')
      ) {
        logger.info('--> Updating system with region ID');
        let system = await capi.updateSystem(
          checklist.checks.capiv2.system.data.id,
          {
            region: checklist.report.data.regionID,
          },
          jwt,
          url
        );
        if (system.id) {
          logger.info('<-- System updated with region');
          data.system = system.id;
        } else {
          logger.warn('<-- System region update failed');
        }
      } else if (
        checklist.checks.capiv2.system.exists === true &&
        checklist.checks.capiv2.system.data.id
      ) {
        data.system = checklist.checks.capiv2.system.data.id;
      }
    }

    // Create/Assign Body
    if (error === false) {
      if (checklist.checks.capiv2.body.add === true) {
        logger.info('--> Creating new Body');
        let newbdyData = await utils.processBody(
          'edsm',
          checklist.checks.edsm.body.data,
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
        checklist.checks.capiv2.body.exists === true ||
        checklist.checks.capiv2.body.data.id
      ) {
        data.body = checklist.checks.capiv2.body.data.id;
      }
    }

    // Create/Assign CMDR
    if (error === false) {
      if (checklist.checks.capiv2.cmdr.add === true) {
        logger.info('--> Creating new CMDR');
        let newcmdrData = {
          cmdrName: checklist.report.data.cmdrName,
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
        checklist.checks.capiv2.cmdr.exists === true ||
        checklist.checks.capiv2.cmdr.data.id
      ) {
        data.discoveredBy = checklist.checks.capiv2.cmdr.data.id;
      }
    }

    if (error === false && data.system && data.body && data.discoveredBy) {
      logger.info('--> Creating Site');
      let site = await capi.createSite(checklist.report.site, data, jwt, url);

      if (!site.id) {
        logger.warn('<-- Site creation failed');
        error = true;
      } else {
        logger.info(`<-- Created ${checklist.report.site.toUpperCase()} Site ID: ${site.id}`);

        // Update report
        logger.info('--> Updating Report');
        let updatedReport = await capi.updateReport(
          checklist.report.site,
          checklist.report.data.id,
          {
            reportComment: checklist.valid.reason,
            reportStatus: checklist.valid.reportStatus,
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
    let reportData = checklist.report.data;
    let siteData = checklist.checks.capiv2.duplicate.site;

    // Create CMDR if needed
    if (checklist.checks.capiv2.cmdr.add === true) {
      logger.info('--> Creating new CMDR');
      let newcmdrData = {
        cmdrName: checklist.report.data.cmdrName,
      };

      let cmdr = await capi.createCMDR(newcmdrData, jwt, url);
      if (!cmdr.id) {
        error = true;
        logger.warn('<-- CMDR creation failed');
      } else {
        logger.info('<-- CMDR created with ID: ' + cmdr.id);
        checklist.checks.capiv2.cmdr.data = cmdr;
        data.discoveredBy = checklist.checks.capiv2.cmdr.data.id;
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
            data.discoveredBy = checklist.checks.capiv2.cmdr.data.id;
          }
        } else {
          logger.warn("<-- Body name doesn't match"); // eslint-disable-line
          logger.warn('--> Updating report');
        }
      } else {
        logger.warn("<-- System name doesn't match"); // eslint-disable-line
        logger.warn('--> Updating report');
      }
    }

    // If nothing to be updated, do nothing
    if (error === false) {
      if (Object.keys(data).length < 1) {
        logger.warn('--> Nothing to update, setting to duplicate');
        let duplicateReport = await module.exports.invalid('duplicate', checklist, jwt, url);
        logger.warn(
          `<-- Updated ${checklist.report.site.toUpperCase()} Report ID: ${
            duplicateReport.id
          } as duplicate`
        );
        error === true;
      } else {
        logger.info('--> Updating site');
        let site = await capi.updateSite(
          checklist.report.site,
          checklist.checks.capiv2.duplicate.site.id,
          data,
          jwt,
          url
        );
        logger.info(`<-- Updated ${checklist.report.site.toUpperCase()} Site ID: ${site.id}`);

        // Update report
        logger.info('--> Updating Report');
        let updatedReport = await capi.updateReport(
          checklist.report.site,
          checklist.report.data.id,
          {
            reportComment: checklist.valid.reason,
            reportStatus: checklist.valid.reportStatus,
            added: false,
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
}
