const { env } = require('../modules/utils');

module.exports = {
	url: {
		production: 'https://api.canonn.tech',
		staging: 'https://api.canonn.tech:2053',
		development: 'https://api.canonn.tech:2083',
		local: 'http://localhost:1337',
	},
	timezone: 'America/Phoenix',
	retryCount: 3,
	delay: 100,
	capiLimit: 500,
};
