// Checks
const blacklist = require('./checks/blacklist');
const body = require('./checks/body');
const cmdr = require('./checks/cmdr');
const duplicate = require('./checks/duplicate');
const system = require('./checks/system');
const type = require('./checks/type');
const update = require('./checks/update');

// Script Validation
const baseReport = require('./scripts/baseReport');
const guardianReport = require('./scripts/guardianReport');
const orbitalReport = require('./scripts/orbitalReport');
const thargoidReport = require('./scripts/thargoidReport');

module.exports = {
  checks: {
    blacklist,
    body,
    cmdr,
    duplicate,
    system,
    type,
    update,
  },
  baseReport,
  guardianReport,
  orbitalReport,
  thargoidReport,
};
