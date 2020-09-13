const capi = require('../capi/scriptModule_capi');
const {PythonShell} = require('python-shell')

module.exports = {
	// Processing system data from CAPIv2 or EDSM
	processSystem: async (source, data) => {
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
	},

	// Processing system data from CAPIv2 or EDSM
	processBody: async (source, data, systemID) => {
		let newData = {};

		newData.system = systemID;

		if (source === 'report') {
			newData.bodyName = data.bodyName.toUpperCase();
		} else if (source === 'capiv2') {
			newData.bodyName = data.bodyName.toUpperCase();
			if (data.id64 !== null) {
				newData.id64 = String(data.id64);
			} else {
				newData.id64 = null;
			}
			newData.edsmID = data.edsmID || null;
			newData.bodyID = data.bodyID || null;
			newData.type = data.type || null;
			newData.subType = data.subType || null;
			newData.offset = data.offset || null;
			newData.distanceToArrival = data.distanceToArrival || null;
			newData.isMainStar = data.isMainStar || null;
			newData.isScoopable = data.isScoopable || null;
			newData.isLandable = data.isLandable || null;
			newData.age = data.age || null;
			newData.luminosity = data.luminosity || null;
			newData.absoluteMagnitude = data.absoluteMagnitude || null;
			newData.solarMasses = data.solarMasses || null;
			newData.solarRadius = data.solarRadius || null;
			newData.gravity = data.gravity || null;
			newData.earthMasses = data.earthMasses || null;
			newData.radius = data.radius || null;
			newData.surfaceTemperature = data.surfaceTemperature || null;
			newData.surfacePressure = data.surfacePressure || null;
			newData.volcanismType = data.volcanismType || null;
			newData.atmosphereType = data.atmosphereType || null;
			newData.terraformingState = data.terraformingState || null;
			newData.orbitalPeriod = data.orbitalPeriod || null;
			newData.semiMajorAxis = data.semiMajorAxis || null;
			newData.orbitalEccentricity = data.orbitalEccentricity || null;
			newData.orbitalInclination = data.orbitalInclination || null;
			newData.argOfPeriapsis = data.argOfPeriapsis || null;
			newData.rotationalPeriod = data.rotationalPeriod || null;
			newData.rotationalPeriodTidallyLocked = data.rotationalPeriodTidallyLocked || null;
			newData.axialTilt = data.axialTilt || null;
			newData.solidComposition = data.solidComposition || {};
			newData.atmosphere = data.atmosphere || {};
			newData.material = data.material || {};
		} else if (source === 'edsm') {
			newData.bodyName = data.name.toUpperCase();
			if (data.id64 !== null) {
				newData.id64 = String(data.id64);
			} else {
				newData.id64 = null;
			}
			newData.edsmID = data.id || null;
			newData.bodyID = data.bodyId || null;
			newData.type = data.type || null;
			newData.subType = data.subType || null;
			newData.distanceToArrival = data.distanceToArrival || null;
			newData.isMainStar = data.isMainStar || null;
			newData.isScoopable = data.isScoopable || null;
			newData.isLandable = data.isLandable || null;
			newData.age = data.age || null;
			newData.luminosity = data.luminosity || null;
			newData.absoluteMagnitude = data.absoluteMagnitude || null;
			newData.solarMasses = data.solarMasses || null;
			newData.solarRadius = data.solarRadius || null;
			newData.gravity = data.gravity || null;
			newData.earthMasses = data.earthMasses || null;
			newData.radius = data.radius || null;
			newData.surfaceTemperature = data.surfaceTemperature || null;
			newData.surfacePressure = data.surfacePressure || null;
			newData.volcanismType = data.volcanismType || null;
			newData.atmosphereType = data.atmosphereType || null;
			newData.terraformingState = data.terraformingState || null;
			newData.orbitalPeriod = data.orbitalPeriod || null;
			newData.semiMajorAxis = data.semiMajorAxis || null;
			newData.orbitalEccentricity = data.orbitalEccentricity || null;
			newData.orbitalInclination = data.orbitalInclination || null;
			newData.argOfPeriapsis = data.argOfPeriapsis || null;
			newData.rotationalPeriod = data.rotationalPeriod || null;
			newData.rotationalPeriodTidallyLocked = data.rotationalPeriodTidallyLocked || false;
			newData.axialTilt = data.axialTilt || null;
			newData.solidComposition = data.solidComposition || {};
			newData.atmosphere = data.atmosphereComposition || {};
			newData.material = data.materials || {};
		}

		return newData;
	},

	haversine: async (p1, p2, radius) => {
		const phi_a = (p1.latitude * Math.PI) / 180;
		const lambda_a = (p1.longitude * Math.PI) / 180;

		const phi_b = (p2.latitude * Math.PI) / 180;
		const lambda_b = (p2.longitude * Math.PI) / 180;

		const radius_planet = radius;

		let d_lambda;
		let S_ab;
		let D_ab;

		if (phi_a != phi_b || lambda_b != lambda_a) {
			d_lambda = lambda_b - lambda_a;
			S_ab = Math.acos(
				Math.sin(phi_a) * Math.sin(phi_b) + Math.cos(phi_a) * Math.cos(phi_b) * Math.cos(d_lambda)
			);
			D_ab = S_ab * radius_planet;
		} else {
			D_ab = 0;
		}

		return D_ab;
	},

	regionMap: async (system) => {
		const regionMapScript = `./modules/utils/edRegionMap/RegionMap.py`
		const options = {
			args: [system.systemName]
		}
		PythonShell.run(regionMapScript, options, (err, results) => {
			console.log(err)
			console.log(JSON.parse(results[0]))
		});
	},
};
