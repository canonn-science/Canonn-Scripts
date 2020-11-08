const logger = require('perfect-logger');
const { global } = require('../../settings');
const { fetchRetry, env } = require('../utils');
const { capiURL } = require('./api.js');

async function checkBlacklist(blacklistType, query, url = capiURL) {
	let blacklistURL;
	if (blacklistType === 'cmdr') {
		blacklistURL = url + '/excludecmdrs?cmdrName=' + encodeURIComponent(query);
	} else if (blacklistType === 'client') {
		blacklistURL = url + '/excludeclients?version=' + encodeURIComponent(query);
	}

	let blacklistData = [];
	try {
		blacklistData = await fetchRetry(blacklistURL, global.retryCount, global.delay, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		logger.warn('Blacklist request failed');
	}
	return await blacklistData;
}

module.exports = checkBlacklist;
