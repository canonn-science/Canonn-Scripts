const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

module.exports = {
  // Get cycle to validate against
  getCycle: async (reportCycle, cycle, url) => {
    let cycleURL = url + `/${reportCycle}cycles?cycle=` + encodeURIComponent(cycle);

    let response = await fetchRetry(5, cycleURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Cycle': 'application/json',
      },
    });

    return await response.json();
  },

  getCycles: async (siteCycle, url, limit = global.capiLimit) => {
    let cycles = [];
    let keepGoing = true;
    let API_START = 0;

    let cyclesURL = url + `/${siteCycle}cycles?_start=${API_START}&_limit=${limit}`;

    while (keepGoing) {
      let cyclesData = await fetchRetry(cyclesURL, global.retryCount, global.delay, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Cycle': 'application/json',
        },
      });

      cycles.push.apply(cycles, cyclesData);
      API_START += limit;

      if (cyclesData.length < limit) {
        keepGoing = false;
        return cycles;
      }
    }
  },
};
