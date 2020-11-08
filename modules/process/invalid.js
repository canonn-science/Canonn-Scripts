const logger = require('perfect-logger');
const capi = require('../capi');
const utils = require('../utils');

async function invalid(status, checklist, jwt, url) {
  if (status === 'duplicate') {
    logger.info('--> Updating report');

    let updatedReport = await capi.updateReport(
      checklist.report.site,
      checklist.report.data.id,
      {
        reportStatus: checklist.valid.reportStatus,
        reportComment: checklist.valid.reason,
        added: false,
        site: checklist.checks.capiv2.duplicate.site.id,
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
      checklist.report.site,
      checklist.report.data.id,
      {
        reportStatus: checklist.valid.reportStatus,
        reportComment: checklist.valid.reason,
        added: false,
      },
      jwt,
      url
    );

    logger.info(`<-- Updated Report ID: ${updatedReport.id}`);
    return {
      report: updatedReport,
    };
  }
}
