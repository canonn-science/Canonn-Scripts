const logger = require('perfect-logger');
const fetchTools = require('../scriptModule_fetchRetry');
const settings = require('../../settings.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

let capiURL;

if (process.env.NODE_ENV) {
	capiURL = settings.global.url[process.env.NODE_ENV.toLowerCase()];
} else {
	capiURL = settings.global.url.local;
}

module.exports = {
	/**
	 * Login to the Canonn API
	 *
	 * @return {Object}
	 */

	login: async (username, password, url = capiURL) => {
		logger.info('Logging into the Canonn API');

		// set body information to .env options
		let body = {
			identifier: username,
			password: password,
		};

		// try logging in or log the error
		try {
			const response = await fetchTools.fetchRetry(
				url + '/auth/local',
				settings.global.retryCount,
				settings.global.delay,
				{
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(body),
				}
			);

			// waiting for login response
			const json = await response;

			logger.info('Logged in as user: ' + json.user.username);
			return json.jwt;
		} catch (error) {
			logger.crit('Canonn API Login Failed!');
			logger.crit(error.message);
		}
	},

	/**
	 * Check if CMDR or Client is blacklisted
	 *
	 * @return {Object}
	 */

	checkBlacklist: async (blacklistType, query, url = capiURL) => {
		let blacklistURL;
		if (blacklistType === 'cmdr') {
			blacklistURL = url + '/excludecmdrs?cmdrName=' + encodeURIComponent(query);
		} else if (blacklistType === 'client') {
			blacklistURL = url + '/excludeclients?version=' + encodeURIComponent(query);
		}

		let blacklistData = [];
		try {
			blacklistData = await fetchTools.fetchRetry(
				blacklistURL,
				settings.global.retryCount,
				settings.global.delay,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				}
			);
		} catch (error) {
			logger.warn('Request failed');
		}
		return await blacklistData;
	},

	/**
	 * Fetch a single System
	 *
	 * @return {Array}
	 */

	getSystem: async (system, systemID, url = capiURL) => {
		var systemURL;
		if (systemID && (!system || system === null || typeof system === 'undefined')) {
			systemURL = url + `/systems/${systemID}`;
		} else {
			systemURL = url + '/systems?systemName=' + encodeURIComponent(system);
		}

		let systemData = [];
		try {
			systemData = await fetchTools.fetchRetry(systemURL, settings.global.retryCount, settings.global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('Request failed');
		}
		return await systemData;
	},

	/**
	 * Fetch an array of Systems
	 *
	 * @return {Array}
	 */

	getSystems: async (start, forced, url = capiURL, limit = settings.global.capiLimit) => {
		let systemsURL;

		if (forced === true) {
			systemsURL = url + `/systems?_limit=${limit}&_start=${start}`;
		} else {
			systemsURL =
				url +
				'/systems' +
				'?edsmCoordLocked=false' +
				'&missingSkipCount_lt=10' +
				'&_limit=' +
				limit +
				'&_start=' +
				start;
		}

		let systemsData = [];
		try {
			systemsData = await fetchTools.fetchRetry(systemsURL, settings.global.retryCount, settings.global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('Request failed');
		}
		return await systemsData;
	},

	/**
	 * Create a single System
	 *
	 * @return {Object}
	 */

	createSystem: async (url, systemData, jwt) => {
		let systemURL = url + '/systems';

		if (systemData.systemName === null || typeof systemData.systemName === 'undefined') {
			return {};
		} else {
			let response = await fetchTools.fetch_retry(systemURL, settings.global.retryCount, settings.global.delay, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify(systemData),
			});

			return await response.json();
		}
	},

	/**
	 * Update a single System
	 *
	 * @return {Object}
	 */

	updateSystem: async (systemID, systemData, jwt, url = capiURL) => {
		let systemURL = url + `/systems/${systemID}`;

		let response = await fetchTools.fetchRetry(systemURL, settings.global.retryCount, settings.global.delay, {
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

	/**
	 * Fetch a region type
	 *
	 * @return {Array}
	 */

	getRegion: async (journalName, regionID, url = capiURL) => {
		var regionURL;
		if (!journalName) {
			regionURL = url + `/regions?regionID=${regionID}`;
		} else {
			regionURL = url + '/regions?journalName=' + encodeURIComponent(journalName);
		}

		let response = await fetchTools.fetchRetry(regionURL, settings.global.retryCount, settings.global.delay, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		return await response;
	},

	/**
	 * Fetch a single Body
	 *
	 * @return {Array}
	 */

	getBody: async (url, body, bodyID) => {
		var bodyURL;
		if (bodyID && (!body || body === null || typeof body === 'undefined')) {
			bodyURL = url + `/bodies/${bodyID}`;
		} else {
			bodyURL = url + '/bodies?bodyName=' + encodeURIComponent(body);
		}

		let response = await fetchTools.fetch_retry(5, bodyURL, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	},

	/**
	 * Fetch an array of Bodies
	 *
	 * @return {Array}
	 */

	getBodies: async (start, forced, url = capiURL, limit = settings.global.capiLimit) => {
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
			bodiesData = await fetchTools.fetchRetry(bodiesURL, settings.global.retryCount, settings.global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			logger.warn('Request failed');
		}
		return await bodiesData;
	},

	/**
	 * Create a single Body
	 *
	 * @return {Object}
	 */

	createBody: async (url, bodyData, jwt) => {
		let bodyURL = url + '/bodies';

		if (bodyData.bodyName === null || typeof bodyData.bodyName === 'undefined') {
			return {};
		} else {
			let response = await fetchTools.fetch_retry(5, bodyURL, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify(bodyData),
			});

			return await response.json();
		}
	},
};
