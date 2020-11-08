const logger = require('perfect-logger');
const capi = require('../capi');
const utils = require('../utils');

async function invalid(status, reportchecklist, jwt, url) {
  if (status === 'duplicate') {
    logger.info('--> Updating report');

    let updatedReport = await capi.updateReport(
      reportchecklist.report.site,
      reportchecklist.report.data.id,
      {
        reportStatus: reportchecklist.valid.reportStatus,
        reportComment: reportchecklist.valid.reason,
        added: false,
        site: reportchecklist.checks.capiv2.duplicate.site.id,
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
