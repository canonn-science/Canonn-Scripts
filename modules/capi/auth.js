const logger = require('perfect-logger');
const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

async function login(username, password, url) {
  logger.info('----------------');
  logger.info('Logging into the Canonn API');

  // set body information to .env options
  let body = {
    identifier: username,
    password: password,
  };

  // try logging in or log the error
  try {
    const response = await fetchRetry(url + '/auth/local', global.retryCount, global.delay, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // waiting for login response
    const json = await response;

    logger.info('Logged in as user: ' + json.user.username);
    logger.info('----------------');
    return json.jwt;
  } catch (error) {
    logger.crit('Canonn API Login Failed!');
    logger.info('----------------');
    logger.crit(error.message);
  }
}

module.exports = login;
