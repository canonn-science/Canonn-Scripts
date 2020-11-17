const fetchRetry = require('../utils/fetchRetry');

// Fetch EDSM System
async function getSystem(system) {
  let edsmSystemURL = `https://www.edsm.net/en/api-v1/system?showId=1&showCoordinates=1&showPrimaryStar=1&systemName=${encodeURIComponent(
    system
  )}`;

  let edsmSystemData = {};
  try {
    edsmSystemData = await fetchRetry(edsmSystemURL, 5, 5000, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.log(error);
  }
  return await edsmSystemData;
}

module.exports = getSystem;
