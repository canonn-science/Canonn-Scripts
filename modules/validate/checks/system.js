const capi = require('../../capi');
const edsm = require('../../edsm');

async function system(checklist) {
  let data = checklist.report.data;

  let checkSystem = await capi.getSystem(data.systemName);

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

    let checkEDSM = await edsm.getSystemEDSM(data.systemName);

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

module.exports = system;
