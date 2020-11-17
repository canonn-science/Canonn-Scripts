async function guardianChecklist(reportType, reportData) {
  return {
    stopValidation: false,
    report: {
      type: reportType + 'reports',
      site: reportType,
      data: reportData,
    },
    valid: {
      isValid: false,
      reason: undefined,
      reportStatus: undefined,
    },
    checks: {
      blacklists: {
        cmdr: {
          checked: false,
          blacklisted: true,
        },
        client: {
          checked: false,
          blacklisted: true,
        },
      },
      capiv2: {
        system: {
          add: false,
          checked: false,
          exists: false,
          data: {},
        },
        body: {
          add: false,
          checked: false,
          exists: false,
          data: {},
        },
        type: {
          checked: false,
          exists: false,
          data: {},
        },
        cmdr: {
          add: false,
          checked: false,
          exists: false,
          data: {},
        },
        duplicate: {
          createSite: false,
          updateSite: false,
          checkedHaversine: false,
          checkedFrontierID: false,
          isDuplicate: true,
          distance: undefined,
          site: {},
        },
      },
      edsm: {
        system: {
          checked: false,
          exists: false,
          hasCoords: false,
          data: undefined,
        },
        body: {
          checked: false,
          exists: false,
          data: undefined,
        },
      },
    },
  };
}

module.exports = guardianChecklist;
