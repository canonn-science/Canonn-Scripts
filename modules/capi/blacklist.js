const logger = require('perfect-logger');
const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

async function checkBlacklist(blacklistType, query, url) {
  let blacklistURL;
  if (blacklistType === 'cmdr') {
    blacklistURL = url + '/excludecmdrs?cmdrName=' + encodeURIComponent(query);
  } else if (blacklistType === 'client') {
    blacklistURL = url + '/excludeclients?version=' + encodeURIComponent(query);
  }

  let blacklistData = [];
  try {
    blacklistData = await fetchRetry(blacklistURL, global.retryCount, global.delay, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.warn('Blacklist request failed');
  }
  return await blacklistData;
}

module.exports = checkBlacklist;
