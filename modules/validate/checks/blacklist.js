const capi = require('../../capi');

async function blacklist(checklist) {
  let data = checklist.report.data;

  // Check CMDR
  let checkCMDR = await capi.checkBlacklist('cmdr', data.cmdrName);

  if (checkCMDR.length > 0) {
    for (let i = 0; i < checkCMDR.length; i++) {
      if (data.cmdrName.toLowerCase() === checkCMDR[i].cmdrName.toLowerCase()) {
        checklist.checks.blacklists.cmdr = {
          checked: true,
          blacklisted: true,
        };
        return checklist;
      }
    }
  } else {
    checklist.checks.blacklists.cmdr = {
      checked: true,
      blacklisted: false,
    };
  }

  // Check Client
  let checkClient = await capi.checkBlacklist('client', data.clientVersion);

  if (checkClient.length > 0) {
    for (let i = 0; i < checkClient.length; i++) {
      if (data.clientVersion.toLowerCase() === checkClient[i].version.toLowerCase()) {
        checklist.checks.blacklists.client = {
          checked: true,
          blacklisted: true,
        };
        return checklist;
      }
    }
  } else {
    checklist.checks.blacklists.client = {
      checked: true,
      blacklisted: false,
    };
  }
  return checklist;
}

module.exports = blacklist;
