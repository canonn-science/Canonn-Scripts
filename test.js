const crossfetch = require('cross-fetch');
const regionmapdata = require('./modules/utils/RegionMapData.json');
const regions = regionmapdata.regions;
const regionmap = regionmapdata.regionmap;

let systemName = process.argv.slice(2)[0]

const x0 = -49985;
const y0 = -40985;
const z0 = -24105;

function findRegion(x, y, z){
  let px = Math.floor((x - x0) * 83 / 4096);
  let pz = Math.floor((z - z0) * 83 / 4096);

  if (px < 0 || pz < 0 || pz > regionmap.length){
      return null;
  } else {
      let row = regionmap[pz];
      let rx = 0;
      let pv = 0;

      for (var v of row) {
          let rl = v[0];
          if (px < rx + rl){
              pv = v[1];
              break;
          } else {
              rx += rl;
          }
      }

      if (pv == 0){
          return { id: 0, name: null };
      } else {
          return { id: pv, name: regions[pv] };
      }
  }
}

async function findRegionForBoxel(id64){
  let masscode = id64 & 7;

  let xdiv = 1 << (30 - masscode * 2);
  let ydiv = 1 << (17 - masscode)
  let zdiv = 1 << 3

  let x = ((Math.floor(id64 / xdiv) & (0x3FFF >> masscode)) << masscode) * 10 + x0;
  let y = ((Math.floor(id64 / ydiv) & (0x1FFF >> masscode)) << masscode) * 10 + y0;
  let z = ((Math.floor(id64 / zdiv) & (0x3FFF >> masscode)) << masscode) * 10 + z0;

  return {
      x: x,
      y: y,
      z: z,
      region: await findRegion(x, y, z)
  }
}

let run = async () => {
  const response = await crossfetch.fetch('https://api.canonn.tech/systems?systemName=' + encodeURIComponent(systemName))
  const system = await response.json();
  let {x, y, z, region} = await findRegionForBoxel(system[0].id64);
  let coordRegion = await findRegion(system[0].edsmCoordX, system[0].edsmCoordY, system[0].edsmCoordZ)

  console.log(`Boxel Region: ${region.name} => ${x}, ${y}, ${z}`)
  console.log(`Region: ${coordRegion.name} => ${system[0].edsmCoordX}, ${system[0].edsmCoordY}, ${system[0].edsmCoordZ}`)
}

run()