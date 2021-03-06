const { env } = require('../../modules/utils');

module.exports = {
  name: 'CAPIv2 Updater - Orbital Report Validator',
  version: '1.0.0',
  description: 'Used to process orbital reports',
  enabled: true,
  cron: ['30 */4 * * *'],
  settings: {
    duplicateRange: 5,
    cmdrBlacklist: true,
    clientBlacklist: true,
    delay: 500,
    edsmRetry: 5,
  },
  acceptedTypes: ['gen', 'gb'],
};
