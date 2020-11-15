const yup = require('yup');

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
  checklist: {},
};
