var fetch = require('fetch-retry');
let logger = require('perfect-logger');
let settings = require('../settings.json');

module.exports = {
	fetchRetry: async (url, retryCount = settings.global.retryCount, delay = settings.global.delay, options) => {
		options.retries = retryCount;
		options.retryDelay = delay;
		options.retryOn = (attempt, error, response) => {
			if (error !== null || response.status === 429) {
				logger.crit(`Rate limit Exceeded, retrying in: ${delay} Attempt number: ${attempt + 1}`);
				return true;
			}
		};

		fetch(url, options)
			.then(response => {
				return response.json();
			})
			.catch(error => {
				console.log(error);
			});
	},
};
