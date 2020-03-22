const capi = require('../../modules/capi/scriptModule_capi');
const utils = require('../utils/scriptModule_utils');
const settings = require('../../settings.json');

module.exports = {
	valid: async reportchecklist => {
		console.log('Doing stuff valid report stuff');
	},

	invalid: async reportchecklist => {
		console.log('Doing stuff invalid report stuff');
	},
};
