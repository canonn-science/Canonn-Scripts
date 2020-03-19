// Fetch EDSM Body
const fetchTools = require('../scriptModule_fetchRetry');
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
	// Fetch EDSM System
	getSystemEDSM: async system => {
		let edsmSystemURL = `https://www.edsm.net/en/api-v1/system?showId=1&showCoordinates=1&showPrimaryStar=1&systemName=${encodeURIComponent(
			system
		)}`;

		let edsmSystemData = {};
		try {
			edsmSystemData = await fetchTools.fetchRetry(edsmSystemURL, 5, 5000, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.log(error);
		}
		return await edsmSystemData;
	},

	// Fetch EDSM Body
	getBodyEDSM: async system => {
		let edsmBodyURL = `https://www.edsm.net/en/api-system-v1/bodies?systemName=${encodeURIComponent(system)}`;

		let edsmBodyData = {};
		try {
			edsmBodyData = await fetchTools.fetchRetry(edsmBodyURL, 5, 5000, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.log(error);
		}
		return await edsmBodyData;
	},
};
