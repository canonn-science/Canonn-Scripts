const logger = require('perfect-logger');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();

async function cycle(checklist, url) {
  let data = checklist.report.data;

  let checkCycle = await capi.getCycles(checklist.report.site, url);

  if (!Array.isArray(checkCycle) || !checkCycle.length) {
    checklist.checks.capiv2.cycle = {
      checked: false,
      exists: false,
      data: {},
    };
  } else {
    let stop = false;
    for (let i = 0; i < checkCycle.length; i++) {
      if (data.cycle.toLowerCase() === checkCycle[i].cycle.toLowerCase() && stop === false) {
        stop = true;
        checklist.checks.capiv2.cycle = {
          checked: true,
          exists: true,
          data: checkCycle[i],
        };
      } else if (stop === false) {
        checklist.checks.capiv2.cycle = {
          checked: true,
          exists: false,
          data: {},
        };
      }
    }
  }

  if (checklist.checks.capiv2.cycle.checked === false) {
    logger.warn('<-- Validation failed: Error on Cycle Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.capiv2.cycle.exists === true &&
    checklist.checks.capiv2.cycle.data === {}
  ) {
    logger.warn('<-- Validation failed: Data missing on Cycle Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (checklist.checks.capiv2.cycle.exists === false) {
    logger.warn('<-- Validation failed: Cycle does not exist in CAPI');
    checklist.valid = reportStatus.capiv2Cycle;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = cycle;
