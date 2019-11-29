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

	updateAPILog: async (logdata, jwt, url = capiURL) => {
		let logURL = url + '/apiupdates';

		let response = await fetchTools.fetch_retry(5, logURL, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(logdata),
		});
		let newLog = await response.json();

		return newLog;
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
			logger.warn('Blacklist request failed');
		}
		return await blacklistData;
	},

	// Fetch CMDR from CAPIv2
	getCMDR: async (cmdr, cmdrID, url = capiURL) => {
		var cmdrURL;
		if (cmdrID && (!cmdr || cmdr === null || typeof cmdr === 'undefined')) {
			cmdrURL = url + `/cmdrs/${cmdrID}`;
		} else {
			cmdrURL = url + '/cmdrs?cmdrName=' + encodeURIComponent(cmdr);
		}

		let response = await fetchTools.fetch_retry(5, cmdrURL, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		return await response;
	},

	// Create a CMDR who doesn't exist
	createCMDR: async (cmdrData, jwt, url = capiURL) => {
		let cmdrURL = url + '/cmdrs';

		if (cmdrData.cmdrName === null || typeof cmdrData.cmdrName === 'undefined') {
			return {};
		} else {
			let response = await fetchTools.fetch_retry(5, cmdrURL, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify(cmdrData),
			});

			return await response;
		}
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

	createSystem: async (systemData, jwt, url = capiURL) => {
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

	getBody: async (body, bodyID, url = capiURL) => {
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

	createBody: async (bodyData, jwt, url = capiURL) => {
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

	/**
	 * Update a single Body
	 *
	 * @return {Object}
	 */

	updateBody: async (bodyID, bodyData, jwt, url = capiURL) => {
		let bodyURL = url + `/bodies/${bodyID}`;

		let response = await fetchTools.fetchRetry(bodyURL, settings.global.retryCount, settings.global.delay, {
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

	// Get count of reports to see if we need to validate them
	getReportCount: async (url, reportType, reportStatus) => {
		let reportCountURL = url + `/${reportType}reports/count?reportStatus=${reportStatus}`;
		const response = await fetchTools.fetch_retry(5, reportCountURL, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		return await response.text();
	},

	// Fetch all Reports based on type
	getReports: async (reportType, reportStatus, url = capiURL) => {
		let reports = [];
		let reportData = null;
		let keepGoing = true;
		let API_START = 0;
		let API_LIMIT = 1000;

		while (keepGoing) {
			let reportURL =
				url + `/${reportType}reports?reportStatus=${reportStatus}&_limit=${API_LIMIT}&_start=${API_START}`;
			const response = await fetchTools.fetch_retry(5, reportURL, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});

			reportData = await response.json();
			reports.push.apply(reports, reportData);
			API_START += API_LIMIT;

			if (reportData.length < API_LIMIT) {
				keepGoing = false;
				return reports;
			}
		}
	},

	// Update report based on type and ID
	updateReport: async (reportType, reportID, reportData, jwt, url = capiURL) => {
		let reportURL = url + `/${reportType}reports/${reportID}`;
		let response = await fetchTools.fetch_retry(5, reportURL, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(reportData),
		});

		return await response.json();
	},

	// Get a single site by ID or fetch all sites matching a body
	getSites: async (reportType, body, siteID, url = capiURL) => {
		let sites = [];
		let siteData = null;
		let keepGoing = true;
		let API_START = 0;
		let API_LIMIT = 1000;

		var sitesURL;
		if (siteID && (!body || body === null || typeof body === 'undefined')) {
			sitesURL = url + `/${reportType}sites/${siteID}`;
		} else {
			sitesURL =
				url +
				`/${reportType}sites?_limit=${API_LIMIT}&_start=${API_START}&body.bodyName=` +
				encodeURIComponent(body);
		}

		while (keepGoing) {
			let response = await fetchTools.fetch_retry(5, sitesURL, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});

			siteData = await response.json();
			sites.push.apply(sites, siteData);
			API_START += API_LIMIT;

			if (siteData.length < API_LIMIT) {
				keepGoing = false;
				return sites;
			}
		}
	},

	// Used to fetch the highest siteID to create a new site
	getSiteID: async (reportType, url = capiURL) => {
		let siteIDURL = url + `/${reportType}sites?_limit=1&_sort=siteID:desc`;
		const response = await fetchTools.fetch_retry(5, siteIDURL, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		let siteIDData = await response.json();

		if (!Array.isArray(siteIDData) || !siteIDData.length) {
			return 1;
		} else {
			let newSiteID = siteIDData[0].siteID + 1;
			return newSiteID;
		}
	},

	// Create site if report is valid
	createSite: async (reportType, siteData, jwt, url = capiURL) => {
		let newSiteID = await getSiteID(url, reportType);

		siteData.siteID = newSiteID;

		let createSiteURL = url + `/${reportType}sites`;
		let response = await fetchTools.fetch_retry(5, createSiteURL, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(siteData),
		});

		return await response.json();
	},

	// Update site if new data exists in a report
	updateSite: async (reportType, siteID, siteData, jwt, url = capiURL) => {
		let siteURL = url + `/${reportType}sites/${siteID}`;
		let response = await fetchTools.fetch_retry(5, siteURL, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(siteData),
		});

		return await response.json();
	},

	// Get type to validate against
	getType: async (reportType, type, url = capiURL) => {
		let typeURL = url + `/${reportType}types?type=` + encodeURIComponent(type);

		let response = await fetchTools.fetch_retry(5, typeURL, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	},
};
