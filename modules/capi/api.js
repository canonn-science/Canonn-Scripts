const { global } = require('../../settings');

async function capiURL() {
  let url;

  if (process.env.NODE_ENV) {
    url = global.url[process.env.NODE_ENV.toLowerCase()];
  } else {
    url = global.url.local;
  }

  return url;
}

module.exports = capiURL;
