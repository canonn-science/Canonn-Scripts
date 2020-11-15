const logger = require('perfect-logger');
const checks = require('../checks');
const process = require('../../process');
const capi = require('../../capi');
const { baseChecklist } = require('../checklist');
const { baseSchema } = require('../schemas');

let reportStatus = capi.reportStatus();

async function yupValidate(schema, data) {
  return await schema
    .validate(data, { abortEarly: false })
    .then((valid) => {
      let data = {
        isValid: true,
        valid,
      };

      return data;
    })
    .catch((err) => {
      let data = {
        isValid: false,
        errors: err.errors,
      };

      return data;
    });
}

async function baseReport(reportType, reportData, jwt, bodyCache, url, settings) {
  let reportChecklist = await baseChecklist(reportType, reportData);
  logger.info('--> Running Validation Checks');

  // Do yup validation for missing data
  logger.info('Missing Check');
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
  logger.info('Beta Check');
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
  logger.info('Blacklist Check');
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
  logger.info('System Check');
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
  logger.info('Body Check');
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
  logger.info('Type Check');
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
  logger.info('CMDR Check');
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
  logger.info('Duplication Check');
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
  logger.info('Update Check');
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

  // Run process

  // Return data to main
  console.log(reportChecklist.checks);
  // console.log(reportChecklist.checks);
  // console.log(reportChecklist.valid);
}

module.exports = baseReport;
