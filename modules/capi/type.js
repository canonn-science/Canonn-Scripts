const { global } = require('../../settings');
const { fetchRetry, env } = require('../utils');

module.exports = {
  // Get type to validate against
  getType: async (reportType, type, url) => {
    let typeURL = url + `/${reportType}types?type=` + encodeURIComponent(type);

    let response = await fetchRetry(5, typeURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  },

  getTypes: async (siteType, url, limit = global.capiLimit) => {
    let types = [];
    let keepGoing = true;
    let API_START = 0;

    let typesURL = url + `/${siteType}types?_start=${API_START}&_limit=${limit}`;

    while (keepGoing) {
      let typesData = await fetchRetry(typesURL, global.retryCount, global.delay, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      types.push.apply(types, typesData);
      API_START += limit;

      if (typesData.length < limit) {
        keepGoing = false;
        return types;
      }
    }
  },
};
