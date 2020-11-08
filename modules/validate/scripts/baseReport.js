const logger = require('perfect-logger');
const checks = require('../checks');
const process = require('../../process');
const capi = require('../../capi');

let reportStatus = capi.reportStatus();
let capiURL = capi.capiURL();

async function baseReport(reportType, reportData, jwt, bodyCache) {
  //
}

module.exports = baseReport;
