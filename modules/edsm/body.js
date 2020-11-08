const { fetchRetry } = require('../utils');

// Fetch EDSM Body
async function getBody(system) {
  let edsmBodyURL = `https://www.edsm.net/en/api-system-v1/bodies?systemName=${encodeURIComponent(
    system
  )}`;

  let edsmBodyData = {};
  try {
    edsmBodyData = await fetchRetry(edsmBodyURL, 5, 5000, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.log(error);
  }
  return await edsmBodyData;
}

module.exports = getBody;
