const { env } = require('../../modules/utils');

module.exports = {
  name: 'CAPIv2 Updater - Guardian Report Validator',
  version: '1.0.0',
  description: 'Used to process guardian reports',
  enabled: true,
  cron: ['45 */4 * * *'],
  settings: {
    duplicateRange: 5,
    cmdrBlacklist: true,
    clientBlacklist: true,
    delay: 1500,
    edsmRetry: 5,
  },
  acceptedTypes: ['gs'],
};
