const logger = require('perfect-logger');
const process = require('../../process');
const capi = require('../../capi');
const { yupValidate } = require('../../utils');
const checks = require('../checks');
const { baseChecklist } = require('../checklist');
const { baseSchema } = require('../schemas');
const { baseValidate } = require('../validations');

let reportStatus = capi.reportStatus();

async function baseReport(reportType, reportData, jwt, bodyCache, url, settings) {
  let reportChecklist = await baseChecklist(reportType, reportData);
  logger.info('--> Running Validation Checks');

  // Do yup validation for missing data
  try {
    let checkMissing = await yupValidate(baseSchema.report, reportData);
    if (checkMissing.isValid === false) {
      checkMissing.errors.forEach((error) => {
        logger.warn('<-- Validation Failed: ' + error);
      });

      // Set report status object
      reportChecklist.stopValidation = true;
      reportChecklist.valid = reportStatus.missingData;

      // Add yup errors to reason
      for (let e = 0; e < checkMissing.errors.length; e++) {
        reportChecklist.valid.reason =
          reportChecklist.valid.reason + ' \n' + checkMissing.errors[e];
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Missing Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do beta validation
  try {
    if (reportChecklist.stopValidation === false) {
      if (reportData.isBeta === true) {
        logger.warn('<-- Validation failed: Report is beta');
        reportChecklist.valid = reportStatus.beta;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Beta Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do blacklist check
  try {
    if (reportChecklist.stopValidation === false) {
      let isBlacklisted = await checks.blacklist(reportChecklist, url);

      if (isBlacklisted) {
        reportChecklist = isBlacklisted;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on blacklist');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Blacklist Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do system check
  try {
    if (reportChecklist.stopValidation === false) {
      let checkSystem = await checks.system(reportChecklist, url);

      if (checkSystem) {
        reportChecklist = checkSystem;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on System Check');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: System Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do body check
  try {
    if (reportChecklist.stopValidation === false) {
      let checkBody = await checks.body(reportChecklist, bodyCache, url);

      if (checkBody) {
        reportChecklist = checkBody;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on Body Check');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Body Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do type check
  try {
    if (reportChecklist.stopValidation === false) {
      let checkType = await checks.type(reportChecklist, url);

      if (checkType) {
        reportChecklist = checkType;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on Type Check');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Type Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // do cmdr check
  try {
    if (reportChecklist.stopValidation === false) {
      let checkCMDR = await checks.cmdr(reportChecklist, url);

      if (checkCMDR) {
        reportChecklist = checkCMDR;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on CMDR Check');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: CMDR Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do duplicate check
  try {
    if (reportChecklist.stopValidation === false) {
      let checkDuplicate = await checks.duplicate(reportChecklist, settings.duplicateRange, url);

      if (checkDuplicate) {
        reportChecklist = checkDuplicate;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on Duplicate Check');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Duplicate Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Do update check
  try {
    if (reportChecklist.stopValidation === false) {
      let checkUpdate = await checks.update(reportChecklist);

      if (checkUpdate) {
        reportChecklist = checkUpdate;
      } else {
        logger.warn('<-- Validation failed: Unknown Error on Update Check');
        reportChecklist.valid = reportStatus.network;
        reportChecklist.stopValidation = true;
      }
    }
  } catch (error) {
    logger.warn('<-- Script Error: Update Check');
    reportChecklist.valid = reportStatus.network;
    reportChecklist.stopValidation = true;
    console.log(error);
  }

  // Yup validation of all checks
  let isValid = await baseValidate(reportChecklist);

  if (isValid) {
    reportChecklist = isValid;
  } else {
    reportChecklist.valid = reportStatus.network;
  }

  // Run process
  let data = {};
  if (reportChecklist.valid.isValid === true) {
    if (reportChecklist.checks.capiv2.duplicate.updateSite === true) {
      logger.info('<-- Report is an update');
      let newDuplicate = await process.valid('update', reportChecklist, jwt, url);
      data = newDuplicate;
    } else {
      logger.info('<-- Report is valid');
      let newValid = await process.valid('new', reportChecklist, jwt, url);
      data = newValid;
    }
  } else if (reportChecklist.valid.reportStatus === 'duplicate') {
    logger.info('<-- Report is a duplicate');
    let newInvalid = await process.invalid('duplicate', reportChecklist, jwt, url);
    data = newInvalid;
  } else {
    logger.info('<-- Report is invalid');
    let newInvalid = await process.invalid('invalid', reportChecklist, jwt, url);
    data = newInvalid;
  }

  // Return data to main
  return {
    checklist: reportChecklist,
    data: data,
    addToCache: reportChecklist.addToCache,
  };
}

module.exports = baseReport;
