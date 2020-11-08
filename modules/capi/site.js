const { global } = require('../../settings');
const { fetchRetry, env } = require('../utils');
const { capiURL } = require('./api.js');

// Used to fetch the highest siteID to create a new site
let getSiteID = async (siteType, url = capiURL) => {
	let siteIDURL = url + `/${siteType}sites?_limit=1&_sort=siteID:desc`;
	const response = await fetchRetry(siteIDURL, global.retryCount, global.delay, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	});

	let siteIDData = await response;

	if (!Array.isArray(siteIDData) || !siteIDData.length) {
		return 1;
	} else {
		let newSiteID = siteIDData[0].siteID + 1;
		return newSiteID;
	}
};

module.exports = {
	// Get a single site by ID or fetch all sites matching a body
	getSites: async (reportType, body, siteID, url = capiURL, limit = global.capiLimit) => {
		let sites = [];
		let keepGoing = true;
		let API_START = 0;

		var sitesURL;
		if (siteID && (!body || body === null || typeof body === 'undefined')) {
			sitesURL = url + `/${reportType}sites/${siteID}`;
		} else {
			sitesURL =
				url +
				`/${reportType}sites?_limit=${limit}&_start=${API_START}&body.bodyName=` +
				encodeURIComponent(body);
		}

		while (keepGoing) {
			let siteData = await fetchRetry(sitesURL, global.retryCount, global.delay, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});

			sites.push.apply(sites, siteData);
			API_START += limit;

			if (siteData.length < limit) {
				keepGoing = false;
				return sites;
			}
		}
	},

	// Create site if report is valid
	createSite: async (siteType, siteData, jwt, url = capiURL) => {
		if (!siteData.siteID) {
			siteData.siteID = await getSiteID(siteType, url);
		}

		let createSiteURL = url + `/${siteType}sites`;
		let response = await fetchRetry(createSiteURL, global.retryCount, global.delay, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(siteData),
		});

		return await response;
	},

	// Update site if new data exists in a report
	updateSite: async (siteType, siteID, siteData, jwt, url = capiURL) => {
		let siteURL = url + `/${siteType}sites/${siteID}`;
		let response = await fetchRetry(siteURL, global.retryCount, global.delay, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(siteData),
		});

		return await response;
	},
};
