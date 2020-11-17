const logger = require('perfect-logger');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();

async function subtype(checklist, url) {
  let data = checklist.report.data;

  let checksubtype = await capi.getSubtypes(checklist.report.site, url);

  if (!Array.isArray(checksubtype) || !checksubtype.length) {
    checklist.checks.capiv2.subtype = {
      checked: false,
      exists: false,
      data: {},
    };
  } else {
    let stop = false;
    for (let i = 0; i < checksubtype.length; i++) {
      if (data.subtype.toLowerCase() === checksubtype[i].type.toLowerCase() && stop === false) {
        stop = true;
        checklist.checks.capiv2.subtype = {
          checked: true,
          exists: true,
          data: checksubtype[i],
        };
      } else if (stop === false) {
        checklist.checks.capiv2.subtype = {
          checked: true,
          exists: false,
          data: {},
        };
      }
    }
  }

  if (checklist.checks.capiv2.subtype.checked === false) {
    logger.warn('<-- Validation failed: Error on Subtype Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.capiv2.subtype.exists === true &&
    checklist.checks.capiv2.subtype.data === {}
  ) {
    logger.warn('<-- Validation failed: Data missing on Subtype Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (checklist.checks.capiv2.subtype.exists === false) {
    logger.warn('<-- Validation failed: Subtype does not exist in CAPI');
    checklist.valid = reportStatus.capiv2Subtype;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = subtype;
