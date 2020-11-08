const capi = require('../../capi');

async function type(checklist) {
  let data = checklist.report.data;

  let checkType = await capi.getTypes(checklist.report.site);

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

  return checklist;
}

module.exports = type;
