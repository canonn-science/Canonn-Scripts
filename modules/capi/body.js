const logger = require('perfect-logger');
const { global } = require('../../settings');
const { fetchRetry, env } = require('../utils');
const { capiURL } = require('./api.js');

module.exports = {
	// Fetch a single Body
	getBody: async (body, bodyID, url = capiURL) => {
		var bodyURL;
		if (bodyID && (!body || body === null || typeof body === 'undefined')) {
			bodyURL = url + `/bodies/${bodyID}`;
		} else {
			bodyURL = url + '/bodies?bodyName=' + encodeURIComponent(body);
		}

		let bodyData = [];
		try {
			bodyData = await fetchRetry(bodyURL, global.retryCount, global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('getBody - Request failed');
		}
		return await bodyData;
	},

	// Fetch an array of Bodies
	getBodies: async (start, forced, url = capiURL, limit = global.capiLimit) => {
		let bodiesURL;

		if (forced === true) {
			bodiesURL = url + `/bodies?_limit=${limit}&_start=${start}`;
		} else {
			bodiesURL =
				url +
				'/bodies' +
				'?edsmID_null=true' +
				'&missingSkipCount_lt=10' +
				'&_limit=' +
				limit +
				'&_start=' +
				start;
		}

		let bodiesData = [];
		try {
			bodiesData = await fetchRetry(bodiesURL, global.retryCount, global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('getBodies - Request failed');
		}
		return await bodiesData;
	},

	// Create a single Body
	createBody: async (bodyData, jwt, url = capiURL) => {
		let bodyURL = url + '/bodies';

		if (bodyData.bodyName === null || typeof bodyData.bodyName === 'undefined') {
			return {};
		} else {
			if (bodyData.missingSkipCount === null || typeof bodyData.missingSkipCount === 'undefined') {
				bodyData.missingSkipCount = 0;
			}

			let response = await fetchRetry(bodyURL, global.retryCount, global.delay, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify(bodyData),
			});

			return await response;
		}
	},

	// Update a single Body
	updateBody: async (bodyID, bodyData, jwt, url = capiURL) => {
		let bodyURL = url + `/bodies/${bodyID}`;

		let response = await fetchRetry(bodyURL, global.retryCount, global.delay, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(bodyData),
		});

		return await response;
	},
};
