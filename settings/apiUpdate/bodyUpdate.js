const { env } = require('../../modules/utils');

module.exports = {
  name: 'CAPIv2 Updater - Bodies Update',
  version: '1.0.0',
  description: 'Used to update the Canonn API bodies data with EDSM',
  enabled: true,
  cron: ['0 6 * * *'],
  edsmDelay: 1500,
};
