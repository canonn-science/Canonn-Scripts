const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

module.exports = {
  // Get subtype to validate against
  getSubtype: async (reportType, subtype, url) => {
    let subtypeURL = url + `/${reportType}subtypes?subtype=` + encodeURIComponent(subtype);

    let response = await fetchRetry(5, subtypeURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Subtype': 'application/json',
      },
    });

    return await response.json();
  },

  getSubtypes: async (siteType, url, limit = global.capiLimit) => {
    let subtypes = [];
    let keepGoing = true;
    let API_START = 0;

    let subtypesURL = url + `/${siteType}subtypes?_start=${API_START}&_limit=${limit}`;

    while (keepGoing) {
      let subtypesData = await fetchRetry(subtypesURL, global.retryCount, global.delay, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Subtype': 'application/json',
        },
      });

      subtypes.push.apply(subtypes, subtypesData);
      API_START += limit;

      if (subtypesData.length < limit) {
        keepGoing = false;
        return subtypes;
      }
    }
  },
};
