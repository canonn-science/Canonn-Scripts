const logger = require('perfect-logger');
const capi = require('../../capi');
const utils = require('../../utils');

let reportStatus = capi.reportStatus();

async function duplicate(checklist, range, url) {
  let data = checklist.report.data;

  let checkDuplicate = await capi.getSites(checklist.report.site, data.bodyName, undefined, url);

  if (!Array.isArray(checkDuplicate) || !checkDuplicate.length) {
    checklist.checks.capiv2.duplicate = {
      createSite: true,
      updateSite: false,
      checkedHaversine: false,
      checkedFrontierID: false,
      isDuplicate: false,
      distance: undefined,
      site: {},
    };
  } else {
    for (let i = 0; i < checkDuplicate.length; i++) {
      let internalChecks = {
        distance: undefined,
        checkedHav: false,
        FIDMatch: false,
        checkedFID: false,
      };
      if (
        checkDuplicate[i].system.systemName.toUpperCase() === data.systemName.toUpperCase() &&
        checkDuplicate[i].body.bodyName.toUpperCase() === data.bodyName.toUpperCase() &&
        Object.keys(checklist.checks.capiv2.duplicate.site).length == 0
      ) {
        if (checkDuplicate[i].body.radius) {
          let distance = await utils.haversine(
            {
              latitude: checkDuplicate[i].latitude,
              longitude: checkDuplicate[i].longitude,
            },
            {
              latitude: data.latitude,
              longitude: data.longitude,
            },
            checkDuplicate[i].body.radius
          );

          internalChecks.distance = distance;
          internalChecks.checkedHav = true;
        }

        if (data.frontierID === checkDuplicate[i].frontierID) {
          internalChecks.checkedFID = true;
          internalChecks.FIDMatch = true;
        } else if (data.frontierID !== null || data.frontierID !== undefined) {
          internalChecks.checkedFID = true;
        }
      }

      if (internalChecks.distance != undefined && internalChecks.checkedHav === true) {
        checklist.checks.capiv2.duplicate.checkedHaversine = true;
        checklist.checks.capiv2.duplicate.distance = internalChecks.distance;
      }

      if (internalChecks.checkedFID === true) {
        checklist.checks.capiv2.duplicate.checkedFrontierID = true;
      }

      if (internalChecks.FIDMatch === true) {
        checklist.checks.capiv2.duplicate.isDuplicate = true;
        checklist.checks.capiv2.duplicate.site = checkDuplicate[i];
      }

      if (internalChecks.distance <= range) {
        checklist.checks.capiv2.duplicate.isDuplicate = true;
        checklist.checks.capiv2.duplicate.site = checkDuplicate[i];
      } else if (internalChecks.distance > range && internalChecks.FIDMatch === false) {
        checklist.checks.capiv2.duplicate.isDuplicate = false;
        checklist.checks.capiv2.duplicate.createSite = true;
      }
    }
  }

  if (
    checklist.checks.capiv2.duplicate.createSite === false &&
    checklist.checks.capiv2.duplicate.isDuplicate === false
  ) {
    logger.warn('<-- Validation failed: Error on Duplicate Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  } else if (
    checklist.checks.capiv2.duplicate.isDuplicate === true &&
    checklist.checks.capiv2.duplicate.site === {}
  ) {
    logger.warn('<-- Validation failed: Site missing on Duplicate Check');
    checklist.valid = reportStatus.network;
    checklist.stopValidation = true;
  }

  return checklist;
}

module.exports = duplicate;
