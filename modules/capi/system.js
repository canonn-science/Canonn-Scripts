const logger = require('perfect-logger');
const { global } = require('../../settings');
const { fetchRetry, env } = require('../utils');
const { capiURL } = require('./api.js');

module.exports = {
	getSystem: async (system, systemID, url = capiURL) => {
		var systemURL;
		if (systemID && (!system || system === null || typeof system === 'undefined')) {
			systemURL = url + `/systems/${systemID}`;
		} else {
			systemURL = url + '/systems?systemName=' + encodeURIComponent(system);
		}

		let systemData = [];
		try {
			systemData = await fetchRetry(systemURL, global.retryCount, global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('getSystem - Request failed');
		}
		return await systemData;
	},

	getSystems: async (start, forced, regionUpdate = false, url = capiURL, limit = global.capiLimit) => {
		let systemsURL;

		if (forced === false && regionUpdate === true) {
			systemsURL = url + `/systems?region_null=true&_limit=${limit}&_start=${start}`;
		} else if (forced === true) {
			systemsURL = url + `/systems?_limit=${limit}&_start=${start}`;
		} else {
			systemsURL = url + `/systems?edsmCoordLocked=false&missingSkipCount_lt=10&_limit=${limit}&_start=${start}`;
		}

		let systemsData = [];
		try {
			systemsData = await fetchRetry(systemsURL, global.retryCount, global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('getSystems - Request failed');
		}
		return await systemsData;
	},

	createSystem: async (systemData, jwt, url = capiURL) => {
		let systemURL = url + '/systems';

		if (systemData.systemName === null || typeof systemData.systemName === 'undefined') {
			return {};
		} else {
			let response = await fetchRetry(systemURL, global.retryCount, global.delay, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify(systemData),
			});

			return await response;
		}
	},

	updateSystem: async (systemID, systemData, jwt, url = capiURL) => {
		let systemURL = url + `/systems/${systemID}`;

		let response = await fetchRetry(systemURL, global.retryCount, global.delay, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(systemData),
		});

		return await response;
	},
};
