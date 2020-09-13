const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
const edsm = require('../../modules/edsm/scriptModule_edsm');
const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../../modules/utils/scriptModule_utils');
const settings = require('../../settings.json');
const params = require('minimist')(process.argv.slice(2));
const delay = ms => new Promise(res => setTimeout(res, ms));
require('dotenv').config({ path: require('find-config')('.env') });

// Init some base Script values
let scriptName = 'edsmRegionUpdate';
let isForced = false;
let isCron = true;
let jwt;

// Start the logger
loginit(scriptName);

// Switch between forced updates
if (params.force === true) {
	isForced = true;
	logger.warn('Forcefully updating all systems');
}

utils.regionMap({systemName: 'Varati'});