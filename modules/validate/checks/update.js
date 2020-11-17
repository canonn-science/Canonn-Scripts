const logger = require('perfect-logger');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();

async function update(checklist) {
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

  if (
    !checklist.checks.capiv2.duplicate.site.discoveredBy.cmdrName == null ||
    checklist.checks.capiv2.duplicate.site.discoveredBy.cmdrName === 'zzz_Unknown'
  ) {
    checklist.checks.capiv2.duplicate.updateSite = true;
  }

  if (
    checklist.checks.capiv2.duplicate.createSite === true &&
    checklist.checks.capiv2.duplicate.updateSite === true
  ) {
    logger.warn('<-- Validation failed: Error on Update Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.capiv2.duplicate.updateSite === true &&
    checklist.checks.capiv2.duplicate.site === {}
  ) {
    logger.warn('<-- Validation failed: Site missing on Duplicate Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = update;
