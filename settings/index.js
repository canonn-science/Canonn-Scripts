// Global Settings
const global = require('./global');

// Report Validation Settings
const baseReport = require('./reportValidation/baseReport');
const guardianReport = require('./reportValidation/guardianReport');
const orbitalReport = require('./reportValidation/orbitalReport');
const thargoidReport = require('./reportValidation/thargoidReport');

// API Update/Sync Settings
const bodyUpdate = require('./apiUpdate/bodyUpdate');
const regionUpdate = require('./apiUpdate/regionUpdate');
const systemUpdate = require('./apiUpdate/systemUpdate');

// Misc Script settings
const deleteMR = require('./misc/deleteMR');
const journalUpdateCheck = require('./misc/journalUpdateCheck');

module.exports = {
	global,
	scripts: {
		baseReport,
		guardianReport,
		orbitalReport,
		thargoidReport,
		bodyUpdate,
		regionUpdate,
		systemUpdate,
		deleteMR,
		journalUpdateCheck,
	},
};
