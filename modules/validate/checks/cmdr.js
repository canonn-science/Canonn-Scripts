const logger = require('perfect-logger');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();

async function cmdr(checklist, url) {
  let data = checklist.report.data;

  let cmdrCheck = await capi.getCMDR(data.cmdrName, undefined, url);

  if (!Array.isArray(cmdrCheck) || !cmdrCheck.length) {
    checklist.checks.capiv2.cmdr = {
      add: true,
      checked: true,
      exists: false,
      data: {},
    };
  } else {
    for (let i = 0; i < cmdrCheck.length; i++) {
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

  if (checklist.checks.capiv2.cmdr.checked === false) {
    logger.warn('<-- Validation failed: Error on CMDR Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.capiv2.cmdr.exists === true &&
    checklist.checks.capiv2.cmdr.data === {}
  ) {
    logger.warn('<-- Validation failed: Data missing on CMDR Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = cmdr;
