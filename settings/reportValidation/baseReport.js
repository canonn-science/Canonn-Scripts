const { env } = require('../../modules/utils');

module.exports = {
  name: 'CAPIv2 Updater - Base Report Validator',
  version: '1.0.0',
  description: 'Used to process base reports',
  enabled: true,
  cron: ['0 */4 * * *'],
  settings: {
    duplicateRange: 5,
    cmdrBlacklist: true,
    clientBlacklist: true,
    delay: 500,
    edsmRetry: 5,
  },
  acceptedTypes: ['ap', 'bm', 'bt', 'cs', 'fg', 'fm', 'gv', 'gy', 'ls', 'tw'],
};
