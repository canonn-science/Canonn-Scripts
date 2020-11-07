const capi = require('../capi/scriptModule_capi');

async function processSystem(source, data) {
	let newData = {};

	if (data.regionID) {
		let regionRequest = await capi.getRegion(undefined, data.regionID);
		newData.region = regionRequest.id;
		newData.region = data.regionID;
	} else if (data.regionName) {
		let regionRequest = await regionTools.getRegion(data.regionName);
		newData.region = regionRequest.id;
	}

	if (source === 'report') {
		newData.systemName = data.systemName.toUpperCase();
		newData.id64 = String(data.systemAddress) || null;
		newData.edsmID = null;
		newData.edsmCoordX = data.coordX || null;
		newData.edsmCoordY = data.coordY || null;
		newData.edsmCoordZ = data.coordZ || null;
		newData.edsmCoordLocked = null;
		newData.primaryStar = {};
	} else if (source === 'capiv2') {
		newData.systemName = data.systemName.toUpperCase();
		if (data.id64 !== null) {
			newData.id64 = String(data.id64);
		} else {
			newData.id64 = null;
		}
		newData.edsmID = data.edsmID || null;
		newData.edsmCoordX = data.edsmCoordX || null;
		newData.edsmCoordY = data.edsmCoordY || null;
		newData.edsmCoordZ = data.edsmCoordZ || null;
		newData.edsmCoordLocked = data.edsmCoordLocked || null;
		newData.primaryStar = data.primaryStar || {};
	} else if (source === 'edsm') {
		newData.systemName = data.name.toUpperCase();
		if (data.id64 !== null) {
			newData.id64 = String(data.id64);
		} else {
			newData.id64 = null;
		}
		newData.edsmID = data.id;
		newData.edsmCoordX = data.coords.x;
		newData.edsmCoordY = data.coords.y;
		newData.edsmCoordZ = data.coords.z;
		newData.edsmCoordLocked = data.coordsLocked;
		newData.primaryStar = data.primaryStar || {};
	}

	return newData;
}

module.exports = processSystem;
