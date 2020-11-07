const { env } = require('./modules/utils')

module.exports = {
	global: {
		url: {
			production: 'https://api.canonn.tech',
			staging: 'https://api.canonn.tech:2053',
			development: 'https://api.canonn.tech:2083',
			local: 'http://localhost:1337',
		},
		timezone: 'America/Phoenix',
		retryCount: 3,
		delay: 100,
		capiLimit: 500,
	},
	scripts: {
		journalManChkWebhook: {
			enabled: true,
			cron: ['0 */4 * * *'],
		},
		edsmSystemUpdate: {
			name: 'CAPIv2 Updater - Systems Update',
			version: '1.0.0',
			description: 'Used to update the Canonn API systems data with EDSM',
			enabled: true,
			cron: ['0 2 * * *'],
			edsmDelay: 1500,
		},
		edsmRegionUpdate: {
			name: 'CAPIv2 Updater - Region Update',
			version: '1.0.0',
			description: 'Used to update the Canonn API systems Region data',
			enabled: true,
			cron: ['0 2 * * *'],
			edsmDelay: 1500,
		},
		edsmBodyUpdate: {
			name: 'CAPIv2 Updater - Bodies Update',
			version: '1.0.0',
			description: 'Used to update the Canonn API bodies data with EDSM',
			enabled: true,
			cron: ['0 6 * * *'],
			edsmDelay: 1500,
		},
		deleteMaterialReports: {
			name: 'CAPIv2 Updater - Material Reports data purge',
			version: '1.0.0',
			description: 'Used to purge old and outdated material reports from the Canonn API',
			enabled: true,
			cron: ['*/30 * * * *'],
			keepMonthCount: 1,
		},
		baseReportValidation: {
			name: 'CAPIv2 Updater - Base Report Validator',
			version: '1.0.0',
			description: 'Used to process base reports',
			enabled: true,
			cron: ['0 */4 * * *'],
			settings: {
				duplicateRange: 5,
				cmdrBlacklist: true,
				clientBlacklist: true,
				delay: 500,
				edsmRetry: 5,
			},
			acceptedTypes: ['ap', 'bm', 'bt', 'cs', 'fg', 'fm', 'gv', 'gy', 'ls', 'tw'],
		},
		orbitalReportValidation: {
			name: 'CAPIv2 Updater - Orbital Report Validator',
			version: '1.0.0',
			description: 'Used to process orbital reports',
			enabled: true,
			cron: ['30 */4 * * *'],
			settings: {
				duplicateRange: 5,
				cmdrBlacklist: true,
				clientBlacklist: true,
				delay: 500,
				edsmRetry: 5,
			},
			acceptedTypes: ['gen', 'gb'],
		},
		thargoidReportValidation: {
			name: 'CAPIv2 Updater - Thargoid Report Validator',
			version: '1.0.0',
			description: 'Used to process thargoid reports',
			enabled: true,
			cron: ['30 */4 * * *'],
			settings: {
				duplicateRange: 5,
				cmdrBlacklist: true,
				clientBlacklist: true,
				delay: 500,
				edsmRetry: 5,
			},
			acceptedTypes: ['tb'],
		},
		guardianReportValidation: {
			name: 'CAPIv2 Updater - Guardian Report Validator',
			version: '1.0.0',
			description: 'Used to process guardian reports',
			enabled: true,
			cron: ['45 */4 * * *'],
			settings: {
				duplicateRange: 5,
				cmdrBlacklist: true,
				clientBlacklist: true,
				delay: 500,
				edsmRetry: 5,
			},
			acceptedTypes: ['gs'],
		},
	},
};
