const moment = require('moment');
const logger = require('perfect-logger');
const global = require('../../settings/global');
const fetchRetry = require('../utils/fetchRetry');

let dateNow = moment().utc().format('YYYY-MM-DD hh:mm:ss');

module.exports = {
  // Fetch total count of all reports
  getReportCount: async (url) => {
    let reportCountURL = url + '/totalcount';
    let reportCountData;

    try {
      reportCountData = await fetchRetry(reportCountURL, global.retryCount, global.delay, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logger.warn('getReportCount - Request failed');
    }
    return await reportCountData;
  },

  //Fetch an array of Reports
  getReports: async (reportType, reportStatus, start, url, noUnknown = false, limit = global.capiLimit) => {
    let reportsURL =
      url + `/${reportType}reports?reportStatus=${reportStatus}&_start=${start}&_limit=${limit}`;

    if (noUnknown === true) {
      reportsURL = reportsURL + '&type_ne=unknown'
    }

    let reportData = [];
    try {
      reportData = await fetchRetry(reportsURL, global.retryCount, global.delay, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logger.warn('getReports - Request failed');
    }
    return await reportData;
  },

  // Update report based on type and ID
  updateReport: async (reportType, reportID, reportData, jwt, url) => {
    let reportURL = url + `/${reportType}reports/${reportID}`;

    try {
      let updatedReportData = await fetchRetry(reportURL, global.retryCount, global.delay, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(reportData),
      });
      return await updatedReportData;
    } catch (error) {
      logger.warn('updateReport - Request failed');
    }
  },

  //Fetch an array of all Material Reports matching the filter
  getMaterialReports: async (lengthFilter, start, url, limit = global.capiLimit) => {
    let mrData = [];
    let keepDate = moment().subtract(lengthFilter, 'months').utc().format();

    let mrURL =
      url +
      '/materialreports' +
      '?created_at_lte=' +
      keepDate +
      '&_limit=' +
      limit +
      '&_start=' +
      start;

    mrData = await fetchRetry(mrURL, global.retryCount, global.delay, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return mrData;
  },

  //Get a count of material reports based on a filter
  countMaterialReport: async (lengthFilter, url) => {
    let keepDate = moment().subtract(lengthFilter, 'months').utc().format();

    let mrURL = url + '/materialreports/count' + '?created_at_lte=' + keepDate;

    let mrCount = await fetchRetry(mrURL, global.retryCount, global.delay, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return parseInt(mrCount);
  },

  //Delete a material report
  deleteMaterialReports: async (month, jwt, url) => {
    let mrURL = url + '/materialreports/oldbulk?month=' + month;

    let mrData = await fetchRetry(mrURL, global.retryCount, global.delay, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return mrData;
  },

  // Provide list of report checklist valid data
  reportStatus: () => {
    return {
      beta: {
        isValid: false,
        reason: `[${dateNow}] - [DECLINED] - Report was made with a beta client`,
        reportStatus: 'declined',
      },
      blacklisted: {
        isValid: false,
        reason: `[${dateNow}] - [DECLINED] - Client or CMDR is on the blacklist`,
        reportStatus: 'declined',
      },
      network: {
        isValid: false,
        reason: `[${dateNow}] - [ISSUE] - Report processing encountered a network issue`,
        reportStatus: 'issue',
      },
      capiv2Type: {
        isValid: false,
        reason: `[${dateNow}] - [ISSUE] - Type is not valid, or type is not mapped`,
        reportStatus: 'issue',
      },
      duplicate: {
        isValid: false,
        reason: `[${dateNow}] - [DUPLICATE] - Site is a duplicate`,
        reportStatus: 'duplicate',
      },
      missingData: {
        isValid: false,
        reason: `[${dateNow}] - [DECLINED] - Report is required data, see errors:`,
        reportStatus: 'declined',
      },
      edsmSystem: {
        isValid: false,
        reason: `[${dateNow}] - [ISSUE] - System does not exist in EDSM`,
        reportStatus: 'issue',
      },
      edsmCoords: {
        isValid: false,
        reason: `[${dateNow}] - [ISSUE] - System missing Coords in EDSM`,
        reportStatus: 'issue',
      },
      edsmBody: {
        isValid: false,
        reason: `[${dateNow}] - [ISSUE] - Body does not exist in EDSM`,
        reportStatus: 'issue',
      },
      updated: {
        isValid: true,
        reason: `[${dateNow}] - [UPDATED] - Report has updated an existing site`,
        reportStatus: 'updated',
      },
      accepted: {
        isValid: true,
        reason: `[${dateNow}] - [ACCEPTED] - Report has been accepted`,
        reportStatus: 'accepted',
      },
    };
  },
};
