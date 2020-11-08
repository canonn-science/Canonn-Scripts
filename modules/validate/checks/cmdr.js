const capi = require('../../capi');

async function cmdr(checklist) {
  let data = checklist.report.data;

  let cmdrCheck = await capi.getCMDR(data.cmdrName);

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

  return checklist;
}

module.exports = cmdr;
