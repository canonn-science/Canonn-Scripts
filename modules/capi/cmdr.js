const logger = require('perfect-logger');
const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

module.exports = {
  getCMDR: async (cmdr, cmdrID, url) => {
    var cmdrURL;
    if (cmdrID && (!cmdr || cmdr === null || typeof cmdr === 'undefined')) {
      cmdrURL = url + `/cmdrs/${cmdrID}`;
    } else {
      cmdrURL = url + '/cmdrs?cmdrName=' + encodeURIComponent(cmdr);
    }

    let cmdrData = [];
    try {
      cmdrData = await fetchRetry(cmdrURL, global.retryCount, global.delay, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logger.warn('CMDR request failed');
    }

    return await cmdrData;
  },

  // Create a CMDR who doesn't exist
  createCMDR: async (cmdrData, jwt, url) => {
    let cmdrURL = url + '/cmdrs';

    if (cmdrData.cmdrName === null || typeof cmdrData.cmdrName === 'undefined') {
      return {};
    } else {
      let response = await fetchRetry(cmdrURL, global.retryCount, global.delay, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(cmdrData),
      });

      return await response;
    }
  },
};
