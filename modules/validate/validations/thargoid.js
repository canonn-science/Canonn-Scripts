const capi = require('../../capi');
const { yupValidate } = require('../../utils');
const { thargoidSchema } = require('../schemas');

let reportStatus = capi.reportStatus();

async function thargoidValidate(checklist) {
  let yupCheck = await yupValidate(thargoidSchema.checklist, checklist);

  if (yupCheck.isValid === true) {
    if (checklist.stopValidation === false) {
      if (
        checklist.report.data.isBeta === false &&
        checklist.checks.blacklists.cmdr.checked === true &&
        checklist.checks.blacklists.cmdr.blacklisted === false &&
        checklist.checks.blacklists.client.checked === true &&
        checklist.checks.blacklists.client.blacklisted === false &&
        checklist.checks.capiv2.system.checked === true &&
        checklist.checks.capiv2.body.checked === true &&
        checklist.checks.capiv2.type.checked === true &&
        checklist.checks.capiv2.type.exists === true &&
        checklist.checks.capiv2.type.data.id !== 1 &&
        checklist.checks.capiv2.subtype.checked === true &&
        checklist.checks.capiv2.subtype.exists === true &&
        checklist.checks.capiv2.cycle.checked === true &&
        checklist.checks.capiv2.cycle.exists === true &&
        checklist.checks.capiv2.cmdr.checked === true &&
        checklist.checks.capiv2.duplicate.isDuplicate === false &&
        checklist.checks.capiv2.duplicate.createSite === true &&
        (checklist.checks.capiv2.system.exists === true ||
          (checklist.checks.edsm.system.exists === true &&
            checklist.checks.edsm.system.hasCoords === true)) &&
        (checklist.checks.capiv2.body.exists === true || checklist.checks.edsm.body.exists === true)
      ) {
        checklist.valid = reportStatus.accepted;
      } else if (
        checklist.report.data.isBeta === false &&
        checklist.checks.blacklists.cmdr.checked === true &&
        checklist.checks.blacklists.cmdr.blacklisted === false &&
        checklist.checks.blacklists.client.checked === true &&
        checklist.checks.blacklists.client.blacklisted === false &&
        checklist.checks.capiv2.system.checked === true &&
        checklist.checks.capiv2.body.checked === true &&
        checklist.checks.capiv2.type.checked === true &&
        checklist.checks.capiv2.type.exists === true &&
        checklist.checks.capiv2.subtype.checked === true &&
        checklist.checks.capiv2.subtype.exists === true &&
        checklist.checks.capiv2.cycle.checked === true &&
        checklist.checks.capiv2.cycle.exists === true &&
        checklist.checks.capiv2.cmdr.checked === true &&
        checklist.checks.capiv2.duplicate.updateSite === true &&
        checklist.checks.capiv2.duplicate.isDuplicate === true &&
        (checklist.checks.capiv2.system.exists === true ||
          (checklist.checks.edsm.system.exists === true &&
            checklist.checks.edsm.system.hasCoords === true)) &&
        (checklist.checks.capiv2.body.exists === true || checklist.checks.edsm.body.exists === true)
      ) {
        checklist.valid = reportStatus.updated;
      } else if (checklist.checks.capiv2.type.data.id === 1) {
        checklist.valid = reportStatus.capiv2Type;
      } else if (
        checklist.checks.capiv2.duplicate.updateSite === false &&
        checklist.checks.capiv2.duplicate.isDuplicate === true
      ) {
        checklist.valid = reportStatus.duplicate;
      }
    } else if (!checklist.valid.reason) {
      checklist.valid = reportStatus.network;
    }
  } else {
    checklist.valid = reportStatus.network;
  }

  return checklist;
}

module.exports = thargoidValidate;
