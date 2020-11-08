const { env } = require('../../modules/utils');

module.exports = {
	name: 'CAPIv2 Updater - Material Reports data purge',
	version: '1.0.0',
	description: 'Used to purge old and outdated material reports from the Canonn API',
	enabled: true,
	cron: ['*/30 * * * *'],
	keepMonthCount: 1,
};
