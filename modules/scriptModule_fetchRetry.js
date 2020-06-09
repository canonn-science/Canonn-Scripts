var fetch = require('fetch-retry');
let logger = require('perfect-logger');
let settings = require('../settings.json');

module.exports = {
	fetchRetry: async (url, retryCount = settings.global.retryCount, delay = settings.global.delay * 100, options) => {
		options.retries = retryCount;
		options.retryDelay = delay * 30;
		options.retryOn = (attempt, error, response) => {
			if (attempt >= retryCount) {
				response = {};
				logger.warn('Request failed, skipping');
				return false;
			}
			if (response.status === 429) {
				logger.warn(
					`Rate limit Exceeded, retrying in: ${options.retryDelay * 10}ms Attempt number: ${attempt + 1}`
				);
				return true;
			}
			if (error !== null || response.status >= 400) {
				logger.crit(`Request Error, retrying in: ${options.retryDelay}ms Attempt number: ${attempt + 1}`);
				console.log(response);
				return true;
			}
		};

		let data = await fetch(url, options);

		return data.json();
	},
};
