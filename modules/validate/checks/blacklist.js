const logger = require('perfect-logger');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();

async function blacklist(checklist, url) {
  let data = checklist.report.data;

  // Check CMDR
  let checkCMDR = await capi.checkBlacklist('cmdr', data.cmdrName, url);

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
  let checkClient = await capi.checkBlacklist('client', data.clientVersion, url);

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

  if (checklist.checks.blacklists.cmdr.checked === false) {
    logger.warn('<-- Validation failed: CMDR Blacklist Check failed');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.blacklists.cmdr.checked === true &&
    checklist.checks.blacklists.cmdr.blacklisted === true
  ) {
    logger.warn('<-- Validation failed: CMDR is Blacklist');
    checklist.valid = reportStatus.blacklisted;
    checklist.stopValidation = true;
  } else if (checklist.checks.blacklists.client.checked === false) {
    logger.warn('<-- Validation failed: Client Blacklist Check failed');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.blacklists.client.checked === true &&
    checklist.checks.blacklists.client.blacklisted === true
  ) {
    logger.warn('<-- Validation failed: Client Blacklist Check failed');
    checklist.valid = reportStatus.blacklisted;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = blacklist;
