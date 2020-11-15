const logger = require('perfect-logger');
const capi = require('../../capi');
const edsm = require('../../edsm');

let reportStatus = capi.reportStatus();

async function bodyLookup(checklist, bodyCache, url) {
  let data = checklist.report.data;

  // Check CAPI
  let checkBody = await capi.getBody(data.bodyName, undefined, url);

  if (checkBody.length >= 1) {
    for (let i = 0; i < checkBody.length; i++) {
      if (checkBody[i].bodyName.toLowerCase() === data.bodyName.toLowerCase()) {
        checklist.checks.capiv2.body = {
          add: false,
          checked: true,
          exists: true,
          data: checkBody[i],
        };
        return checklist;
      }
    }
  } else if (checkBody.length < 1) {
    checklist.checks.capiv2.body = {
      add: true,
      checked: true,
      exists: false,
      data: {},
    };

    // Check Body Cache
    for (let c = 0; c < bodyCache.length; c++) {
      if (bodyCache[c].name.toLowerCase() === data.systemName.toLowerCase()) {
        let bodies = bodyCache[c].bodies;
        for (let cb = 0; cb < bodies.length; cb++) {
          if (bodies[cb].name.toLowerCase() === data.bodyName.toLowerCase()) {
            checklist.checks.edsm.body = {
              checked: true,
              exists: true,
              data: bodies[cb],
            };
            return checklist;
          }
        }
      }
    }

    // Check EDSM
    let checkEDSM = await edsm.getBody(data.systemName);

    if (
      checkEDSM.name.toLowerCase() === data.systemName.toLowerCase() &&
      checkEDSM.bodies.length > 0
    ) {
      // Add EDSM looking to cache
      if (checkEDSM.bodies.length) {
        checklist.addToCache = checkEDSM;
      }

      // Continue validation
      for (let b = 0; b < checkEDSM.bodies.length; b++) {
        if (checkEDSM.bodies[b].name.toLowerCase() === data.bodyName.toLowerCase()) {
          checklist.checks.edsm.body = {
            checked: true,
            exists: true,
            data: checkEDSM.bodies[b],
          };
          return checklist;
        }
      }

      if (checklist.checks.edsm.body.exists === false) {
        checklist.checks.edsm.body.checked = true;
        return checklist;
      }
    } else if (
      checkEDSM.bodies.length === 0 ||
      !checkEDSM ||
      !Object.keys(checkEDSM).length ||
      !checkEDSM.length ||
      !checkEDSM.bodies.length ||
      checkEDSM == undefined
    ) {
      checklist.checks.edsm.body = {
        checked: true,
        exists: false,
        data: {},
      };
      return checklist;
    } else {
      checklist.checks.edsm.body = {
        checked: true,
        exists: false,
        data: {},
      };
      return checklist;
    }
  } else {
    return checklist;
  }
}

async function body(checklist, bodyCache, url) {
  let lookup = await bodyLookup(checklist, bodyCache, url);

  let reportChecklist = await lookup;

  if (reportChecklist.checks.capiv2.body.checked === false) {
    logger.warn('<-- Validation failed: Unknown Error on CAPI Body');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
  } else if (
    reportChecklist.checks.capiv2.body.exists === false &&
    reportChecklist.checks.edsm.body.checked === false
  ) {
    logger.warn('<-- Validation failed: Unknown Error on EDSM Body');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
  } else if (
    reportChecklist.checks.capiv2.body.exists === false &&
    reportChecklist.checks.edsm.body.exists === false
  ) {
    logger.warn('<-- Validation failed: Body does not exist in EDSM');
    reportChecklist.valid = reportStatus.edsmBody;
    reportChecklist.stopValidation = true;
  }

  return reportChecklist;
}

module.exports = body;
