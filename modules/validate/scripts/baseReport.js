const logger = require('perfect-logger');
const checks = require('../checks');
const process = require('../../process');
const capi = require('../../capi');
const { baseChecklist } = require('../checklist');

let reportStatus = capi.reportStatus();
let capiURL = capi.capiURL();

async function yupValidate(schema, data) {
  schema
    .validate(data, { abortEarly: false })
    .then((valid) => {
      let data = {
        isValid: true,
        valid,
      };

      console.log(data);
      return data;
    })
    .catch((err) => {
      let data = {
        isValid: false,
        errors: err.errors,
      };

      console.log(data);
      return data;
    });
}

async function baseReport(reportType, reportData, jwt, bodyCache) {
  let reportChecklist = baseChecklist(reportType, reportData);

  logger.info('--> Running Validation Checks');
  // Do yup validation for missing data
  let checkMissing = await yupValidate(baseChecklist.report, reportData);
  if (checkMissing.valid === false) {
    checkMissing.errors.forEach((error) => {
      logger.warn('<-- Validation Failed' + error);
    });
    (await reportChecklist).stopValidation = true;
    reportChecklist.reportStatus = 'something'
  }

  // Do beta validation

  // Do blacklist check

  // Do system check

  // Do body check

  // Do type check

  // do cmdr check

  // Do duplicate check

  // Do update check

  // Yup validation of all checks

  // Run process

  // Return data to main
}

module.exports = baseReport;
