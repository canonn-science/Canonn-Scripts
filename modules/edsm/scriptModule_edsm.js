// Fetch EDSM Body
const fetchTools = require('../scriptModule_fetchRetry');
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {

  // Fetch EDSM System
  getSystemEDSM: async (system) => {
    let edsmSystemURL = `https://www.edsm.net/en/api-v1/system?showId=1&showCoordinates=1&showPrimaryStar=1&systemName=${encodeURIComponent(system)}`;
  
    let edsmSystemData = null;

    try {
      edsmSystemData = await fetchTools.fetchRetry( edsmSystemURL, 5, 5000,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      edsmSystemData = {};
      console.log(error);
    }
    delay(200);
    return edsmSystemData;
  },

  // Fetch EDSM Body
  getBodyEDSM: async (system) => {
    let edsmBodyURL = `https://www.edsm.net/en/api-system-v1/bodies?systemName=${encodeURIComponent(system)}`;
  
    let edsmResponse = await fetchTools.fetchRetry( edsmBodyURL, 5, 5000,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  
    let edsmBodyData = null;
    try {
      edsmBodyData = await edsmResponse.json();
    } catch (error) {
      edsmBodyData = {};
      console.log(error);
    }
    delay(200);
    return edsmBodyData;
  }
};
