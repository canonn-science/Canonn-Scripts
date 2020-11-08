const schema = require('./modules/validate/schemas/baseSchema');

let report = {
  userType: 'pc',
  reportType: 'new',
  systemName: 'HIP 36601',
  systemAddress: null,
  regionID: 34,
  coordX: 337.8125,
  coordY: 562.96875,
  coordZ: -1457.84375,
  bodyName: 'HIP 36601 C 1 d',
  latitude: 19.639076,
  longitude: -135.547379,
  type: 'Sulphur Dioxide Fumarole',
  frontierID: 1,
  cmdrName: 'ImpeccablePenguin',
  cmdrComment: null,
  isBeta: false,
  clientVersion: 'EDMC-Canonn.5.22.0',
  reportStatus: 'pending',
};

console.log(schema);

async function testSchema() {
  schema.report
    .validate(report, { abortEarly: false })
    .then((valid) => {
      let data = {
        isValid: true,
        valid,
      };

      console.log(data);
      return data;
    })
    .catch((err) => {
      let data = {
        isValid: false,
        errors: err.errors,
      };

      console.log(data);
      return data;
    });
}

testSchema();
