const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

module.exports = {
  // Fetch a region type
  getRegion: async (journalName, regionID, url) => {
    var regionURL;
    if (!journalName) {
      regionURL = url + `/regions?regionID=${regionID}`;
    } else {
      regionURL = url + '/regions?journalName=' + encodeURIComponent(journalName);
    }

    let response = await fetchRetry(regionURL, global.retryCount, global.delay, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return await response;
  },

  // Fetch all region types
  getRegions: async (url) => {
    const regionsURL = url + '/regions?_limit=42';

    let response = await fetchRetry(regionsURL, global.retryCount, global.delay, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return await response;
  },
};
