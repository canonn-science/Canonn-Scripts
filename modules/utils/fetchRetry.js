const rax = require('retry-axios');
const axios = require('axios');
let logger = require('perfect-logger');
let settings = require('../../settings');

async function fetchRetry(
  url,
  retryCount = settings.global.retryCount,
  delay = settings.global.delay * 100,
  options
) {
  const interceptorId = rax.attach();
  const res = await axios({
    method: options.method,
    headers: options.headers,
    data: options.body,
    url,
    transformResponse: [(data) => data],
    raxConfig: {
      // Retry 3 times on requests that return a response (500, etc) before giving up.  Defaults to 3.
      retry: retryCount,

      // Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
      noResponseRetries: 2,

      // Milliseconds to delay at first.  Defaults to 100.
      retryDelay: delay,

      // HTTP methods to automatically retry.  Defaults to:
      // ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']
      httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'],

      // The response status codes to retry.  Supports a double
      // array with a list of ranges.  Defaults to:
      // [[100, 199], [429, 429], [500, 599]]
      statusCodesToRetry: [
        [100, 199],
        [429, 429],
        [500, 599],
      ],

      // You can set the backoff type.
      // options are 'exponential' (default), 'static' or 'linear'
      backoffType: 'exponential',

      // You can detect when a retry is happening, and figure out how many
      // retry attempts have been made
      onRetryAttempt: (err) => {
        const cfg = rax.getConfig(err);
        logger.crit(`Retry attempt #${cfg.currentRetryAttempt}`);
      },
    },
  });

  return JSON.parse(res.data);
}

module.exports = fetchRetry;
