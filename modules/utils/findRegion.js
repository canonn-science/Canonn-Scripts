const regionmapdata = require('./RegionMapData.json');

async function findRegion(system) {
	const regions = regionmapdata.regions;
	const regionmap = regionmapdata.regionmap;
	const x0 = -49985;
	const y0 = -40985;
	const z0 = -24105;

	let systemData = {
		name: system.systemName,
		id64: system.id64,
	};

	const findByCoords = async (x, y, z) => {
		let px = Math.floor(((x - x0) * 83) / 4096);
		let pz = Math.floor(((z - z0) * 83) / 4096);

		if (px < 0 || pz < 0 || pz > regionmap.length) {
			return null;
		} else {
			let row = regionmap[pz];
			let rx = 0;
			let pv = 0;

			for (var v of row) {
				let rl = v[0];
				if (px < rx + rl) {
					pv = v[1];
					break;
				} else {
					rx += rl;
				}
			}

			if (pv == 0) {
				return {
					id: 0,
					name: null,
				};
			} else {
				return {
					id: pv,
					name: regions[pv],
				};
			}
		}
	};

	const findRegionForBoxel = async (id64) => {
		let masscode = id64 & 7;

		let xdiv = 1 << (30 - masscode * 2);
		let ydiv = 1 << (17 - masscode);
		let zdiv = 1 << 3;

		let x = ((Math.floor(id64 / xdiv) & (0x3fff >> masscode)) << masscode) * 10 + x0;
		let y = ((Math.floor(id64 / ydiv) & (0x1fff >> masscode)) << masscode) * 10 + y0;
		let z = ((Math.floor(id64 / zdiv) & (0x3fff >> masscode)) << masscode) * 10 + z0;

		return {
			x: x,
			y: y,
			z: z,
			region: await findByCoords(x, y, z),
		};
	};

	if (system.edsmCoordX && system.edsmCoordY && system.edsmCoordZ) {
		systemData.x = system.edsmCoordX;
		systemData.y = system.edsmCoordY;
		systemData.z = system.edsmCoordZ;

		systemData.region = await findByCoords(systemData.x, systemData.y, systemData.z);
	}

	if (system.id64) {
		systemData.boxel = await findRegionForBoxel(system.id64);
	}

	let newSystemData = {
		name: system.systemName,
		id64: system.id64,
	};

	if (
		(systemData.region && systemData.region.id === systemData.boxel.region.id) ||
		systemData.boxel.region.id === 0
	) {
		newSystemData.region = systemData.region;
	} else {
		newSystemData.region = systemData.boxel.region;
	}

	return newSystemData;
}

module.exports = findRegion;
