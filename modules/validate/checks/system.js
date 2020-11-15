const logger = require('perfect-logger');
const capi = require('../../capi');
const edsm = require('../../edsm');

let reportStatus = capi.reportStatus();

async function systemLookup(checklist, url) {
  let data = checklist.report.data;

  let checkSystem = await capi.getSystem(data.systemName, undefined, url);

  if (
    checkSystem.length === 1 &&
    checkSystem[0].systemName.toLowerCase() === data.systemName.toLowerCase()
  ) {
    checklist.checks.capiv2.system = {
      add: false,
      checked: true,
      exists: true,
      data: checkSystem[0],
    };
    return checklist;
  } else if (checkSystem.length > 1) {
    for (let i = 0; i < checkSystem.length; i++) {
      if (checkSystem[i].systemName.toLowerCase() === data.systemName.toLowerCase()) {
        checklist.checks.capiv2.system = {
          add: false,
          checked: true,
          exists: true,
          data: checkSystem[i],
        };
        return checklist;
      }
    }
  } else if (checkSystem.length < 1) {
    checklist.checks.capiv2.system = {
      add: true,
      checked: true,
      exists: false,
      data: {},
    };

    let checkEDSM = await edsm.getSystem(data.systemName);

    if (
      checkEDSM.id &&
      checkEDSM.name.toLowerCase() === data.systemName.toLowerCase() &&
      checkEDSM.coords.x &&
      checkEDSM.coords.y &&
      checkEDSM.coords.z
    ) {
      checklist.checks.edsm.system = {
        checked: true,
        exists: true,
        hasCoords: true,
        data: checkEDSM,
      };
      return checklist;
    } else if (
      !checkEDSM ||
      !checkEDSM.id ||
      checkEDSM == {} ||
      checkEDSM == [] ||
      checkEDSM == undefined
    ) {
      checklist.checks.edsm.system = {
        checked: true,
        exists: false,
        hasCoords: false,
        data: {},
      };
      return checklist;
    } else if (
      (!checkEDSM.coords || !checkEDSM.coords.x || !checkEDSM.coords.y || !checkEDSM.coords.z) &&
      checkEDSM.name.toLowerCase() === data.systemName.toLowerCase()
    ) {
      checklist.checks.edsm.system = {
        checked: true,
        exists: true,
        hasCoords: false,
        data: checkEDSM,
      };
      return checklist;
    } else {
      checklist.checks.edsm.system = {
        checked: false,
        exists: false,
        hasCoords: false,
        data: {},
      };
      return checklist;
    }
  } else {
    return checklist;
  }
}

async function system(checklist, url) {
  let lookup = await systemLookup(checklist, url);

  let reportChecklist = await lookup;

  if (reportChecklist.checks.capiv2.system.checked === false) {
    logger.warn('<-- Validation failed: Unknown Error on CAPI System');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
  } else if (
    reportChecklist.checks.capiv2.system.exists === false &&
    reportChecklist.checks.edsm.system.checked === false
  ) {
    logger.warn('<-- Validation failed: Unknown Error on EDSM System');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
  } else if (
    reportChecklist.checks.edsm.system.exists === true &&
    reportChecklist.checks.edsm.system.hasCoords === false
  ) {
    logger.warn('<-- Validation failed: EDSM Missing Coords');
    reportChecklist.valid = reportStatus.edsmCoords;
    reportChecklist.stopValidation = true;
  } else if (
    reportChecklist.checks.capiv2.system.exists === false &&
    reportChecklist.checks.edsm.system.exists === false
  ) {
    logger.warn('<-- Validation failed: System does not exist in EDSM');
    reportChecklist.valid = reportStatus.edsmSystem;
    reportChecklist.stopValidation = true;
  }

  return reportChecklist;
}

module.exports = system;
