const envSettings = require('../../settings/global');

async function capiURL() {
  let url;

  if (process.env.NODE_ENV) {
    url = envSettings.url[process.env.NODE_ENV.toLowerCase()];
  } else {
    url = envSettings.url.local;
  }

  return url;
}

module.exports = capiURL;
