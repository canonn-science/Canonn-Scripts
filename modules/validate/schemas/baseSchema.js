const yup = require('yup');
const {
  scripts: { baseReport },
} = require('../../../settings');

const sites = baseReport.acceptedTypes;
let types = [];

for (let i = 0; i < sites.length; i++) {
  types.push(sites[i] + 'reports');
}

module.exports = {
  report: yup.object().shape({
    userType: yup.string().oneOf(['pc', 'console']).required(),
    reportType: yup.string().oneOf(['new', 'update', 'error']).required(),
    systemName: yup.string().required(),
    systemAddress: yup.string().nullable(),
    regionID: yup.number().integer().positive(),
    coordX: yup.number().nullable(),
    coordY: yup.number().nullable(),
    coordZ: yup.number().nullable(),
    bodyName: yup.string().required(),
    latitude: yup.number().max(90).min(-90).required(),
    longitude: yup.number().max(180).min(-180).required(),
    type: yup.string().required(),
    frontierID: yup.number().integer().positive(),
    cmdrName: yup.string().required(),
    cmdrComment: yup.string().nullable(),
    isBeta: yup.boolean().required(),
    reportStatus: yup
      .string()
      .required()
      .matches(/(pending)/),
  }),
  checklist: yup.object().shape({
    stopValidation: yup.boolean().required(),
    report: yup.object().shape({
      type: yup.string().required().oneOf(types),
      site: yup.string().required().oneOf(sites),
    }),
    checks: yup.object().shape({
      blacklists: yup.object().shape({
        cmdr: yup.object().shape({
          checked: yup.boolean().required(),
          blacklisted: yup.boolean().required(),
        }),
        client: yup.object().shape({
          checked: yup.boolean().required(),
          blacklisted: yup.boolean().required(),
        }),
      }),
      capiv2: yup.object().shape({
        system: yup.object().shape({
          add: yup.boolean().required(),
          checked: yup.boolean().required(),
          exists: yup.boolean().required(),
        }),
        body: yup.object().shape({
          add: yup.boolean().required(),
          checked: yup.boolean().required(),
          exists: yup.boolean().required(),
        }),
        type: yup.object().shape({
          checked: yup.boolean().required(),
          exists: yup.boolean().required(),
        }),
        cmdr: yup.object().shape({
          add: yup.boolean().required(),
          checked: yup.boolean().required(),
          exists: yup.boolean().required(),
        }),
        duplicate: yup.object().shape({
          createSite: yup.boolean().required(),
          updateSite: yup.boolean().required(),
          checkedHaversine: yup.boolean().required(),
          checkedFrontierID: yup.boolean().required(),
          isDuplicate: yup.boolean().required(),
          distance: yup.number().nullable(),
        }),
      }),
      edsm: yup.object().shape({
        system: yup.object().shape({
          checked: yup.boolean().required(),
          exists: yup.boolean().required(),
          hasCoords: yup.boolean().required(),
        }),
        body: yup.object().shape({
          checked: yup.boolean().required(),
          exists: yup.boolean().required(),
        }),
      }),
    }),
  }),
};
