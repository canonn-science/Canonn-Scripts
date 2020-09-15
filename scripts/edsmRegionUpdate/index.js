const cron = require('node-cron');
const logger = require('perfect-logger');
const loginit = require('../../modules/logger/scriptModule_loginit');
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

const getRegion = async () => {
	let data = await utils.findRegion(
    2855.125,
    12470.5625
	);
	console.log(data)
}
getRegion()