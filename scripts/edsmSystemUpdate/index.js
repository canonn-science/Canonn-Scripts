let logger = require('perfect-logger');
let loginit = require('../../modules/logger/scriptModule_loginit');
let edsm = require('../../modules/edsm/scriptModule_edsm');
//let capi = require('../../modules/capi/')
let settings = require('../../settings.json');

let scriptName = 'edsmSystemUpdate';
let isForced = false;

loginit(scriptName);

if (process.argv[2].toLowerCase() === '--force') {
  isForced = true
  logger.warn('Forcfully updating all systems')
};

edsm.getSystemEDSM('Sol').then(data => console.log(data));