const { env } = require('../../modules/utils');

module.exports = {
	name: 'CAPIv2 Updater - Systems Update',
	version: '1.0.0',
	description: 'Used to update the Canonn API systems data with EDSM',
	enabled: true,
	cron: ['0 2 * * *'],
	edsmDelay: 1500,
};
