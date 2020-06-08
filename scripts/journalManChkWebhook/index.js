'use strict';

const cron = require('node-cron');
const fetch = require('fetch-retry');
const fs = require('fs');
const hookcord = require('hookcord');
const path = require('path');
require('dotenv').config({ path: require('find-config')('.env') });

const latestPath = path.join(__dirname, 'data', 'latest.json');
const examplePath = path.join(__dirname, 'data', 'example.json');
let latestVersion = {};

const currentVersion = async () => {
	// Get current version or create the latest.json file
	try {
		if (fs.existsSync(latestPath)) {
			let rawFile = fs.readFileSync(latestPath);
			latestVersion = JSON.parse(rawFile);
		} else {
			let exampleRawFile = fs.readFileSync(examplePath);
			fs.writeFileSync(latestPath, exampleRawFile);
			latestVersion = JSON.parse(exampleRawFile);
		}
	} catch (err) {
		console.log(err);
	}
}

const fireWebhook = async (link, userIDs, version) => {

}

const downloadJournal = async version => {

	// Construct paths (will override fdev naming for older files)
	let journalPath = path.join(__dirname, 'data', `Journal-Manual-v${version}.pdf`);
	let journalURL = process.env.FDEV_JNL_URL + `/v${version}/Journal-Manual-v${version}.pdf`;

	const res = await fetch(journalURL);
	if (res.status === 200) {
		console.log(`New Version v${version} is available, downloading...`);
		const fileStream = fs.createWriteStream(journalPath);
		await new Promise((resolve, reject) => {
			res.body.pipe(fileStream);
			res.body.on('error', err => {
				console.log('An error occured downloading the new version');
				console.log('== End FDev Journal Checker ==');
				reject(err);
			});
			fileStream.on('finish', function() {
				console.log(`New Journal v${version} saved to data directory`);

				// Update latest.json with new version number
				latestVersion.journalVersion = latestVersion.journalVersion + 1;
				fs.writeFileSync(latestPath, JSON.stringify(latestVersion));
				console.log(`Updated latest file with v${version + 1}`);

				// Fire Discord Webhook Alerts
				if (process.env.WEBHOOK_RD !== '') {
					new hookcord.Hook()
						.setLink(process.env.WEBHOOK_RD)
						.setPayload({
							content: `<@${process.env.USER_DMID}>/<@${process.env.USER_LCUID}> New Journal Found at: ${journalURL}`,
						})
						.fire()
						.then(function(response) {
							console.log('Fired webhook to Canonn R&D channel');
						})
						.catch(function(e) {
							console.log(e);
						});
				}

				if (process.env.WEBHOOK_KZ !== '') {
					new hookcord.Hook()
						.setLink(process.env.WEBHOOK_KZ)
						.setPayload({
							content: `<@${process.env.USER_KZID}> New Journal Found at: ${journalURL}`,
						})
						.fire()
						.then(function(response) {
							console.log('Fired webhook to Kazakov');
						})
						.catch(function(e) {
							console.log(e);
						});
				}

				console.log('== End FDev Journal Checker ==');
				resolve();
			});
		});
	} else {
		console.log('New Journal version is not available, current is v' + (version - 1));
    console.log('== End FDev Journal Checker ==');
	}
};

if (latestVersion) {
	console.log('== Starting FDev Journal Checker ==');
	if (process.env.START_NOW === "true") {
    console.log('== Checking for new Journal ==');
    downloadJournal(latestVersion.journalVersion);
	} else {
		cron.schedule(process.env.CRON_JNL, () => {
			console.log('== Checking for new Journal ==');
			downloadJournal(latestVersion.journalVersion);
		});
	}
} else {
  console.log('Error No latest version file');
}
