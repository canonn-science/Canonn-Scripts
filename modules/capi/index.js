const capiURL = require('./api');
const login = require('./auth');
const checkBlacklist = require('./blacklist');
const { getSystem, getSystems, createSystem, updateSystem } = require('./system');
const { getBody, getBodies, createBody, updateBody } = require('./body');
const { getRegion, getRegions } = require('./region');
const { getCMDR, createCMDR } = require('./cmdr');
const {
  getReportCount,
  getReports,
  updateReport,
  getMaterialReports,
  countMaterialReport,
  deleteMaterialReports,
  reportStatus,
} = require('./report');
const { getSites, createSite, updateSite } = require('./site');
const { getType, getTypes } = require('./type');
const { getSubtype, getSubtypes } = require('./subtype');
const { getCycle, getCycles } = require('./cycle');

module.exports = {
  capiURL,
  login,
  checkBlacklist,
  getSystem,
  getSystems,
  createSystem,
  updateSystem,
  getBody,
  getBodies,
  createBody,
  updateBody,
  getRegion,
  getRegions,
  getCMDR,
  createCMDR,
  getReportCount,
  getReports,
  updateReport,
  getMaterialReports,
  countMaterialReport,
  deleteMaterialReports,
  reportStatus,
  getSites,
  createSite,
  updateSite,
  getType,
  getTypes,
  getSubtype,
  getSubtypes,
  getCycle,
  getCycles,
};
