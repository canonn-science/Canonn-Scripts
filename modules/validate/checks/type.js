const logger = require('perfect-logger');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();

async function type(checklist, url) {
  let data = checklist.report.data;

  let checkType = await capi.getTypes(checklist.report.site, url);

  if (!Array.isArray(checkType) || !checkType.length) {
    checklist.checks.capiv2.type = {
      checked: false,
      exists: false,
      data: {},
    };
  } else {
    let stop = false;
    for (let i = 0; i < checkType.length; i++) {
      if (data.type.toLowerCase() === checkType[i].type.toLowerCase() && stop === false) {
        stop = true;
        checklist.checks.capiv2.type = {
          checked: true,
          exists: true,
          data: checkType[i],
        };
      } else if (
        data.type.toLowerCase() === checkType[i].journalName.toLowerCase() &&
        stop === false
      ) {
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

  if (checklist.checks.capiv2.type.checked === false) {
    logger.warn('<-- Validation failed: Error on Type Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.capiv2.type.exists === true &&
    checklist.checks.capiv2.type.data === {}
  ) {
    logger.warn('<-- Validation failed: Data missing on Type Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (checklist.checks.capiv2.type.exists === false) {
    logger.warn('<-- Validation failed: Type does not exist in CAPI');
    checklist.valid = reportStatus.capiv2Type;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = type;
