'use strict';

const cron = require('node-cron');
const fetchRetry = require('fetch-retry');
const env = require('../../modules/utils/env-helper');
const fs = require('fs');
const hookcord = require('hookcord');
const path = require('path');

// REMOVE after migration to core script
require('dotenv').config({ path: require('find-config')('.env') });

const latestPath = path.join(__dirname, 'data', 'latest.json');
let latestVersion = require('./data/latest.json');

const fireWebhook = async (journalURL) => {
  if (env('WEBHOOK_RD') !== '') {
    new hookcord.Hook()
      .setLink(env('WEBHOOK_RD'))
      .setPayload({
        content: `<@${env('USER_DMID')}>/<@${env(
          'USER_LCUID'
        )}> New Journal Found at: ${journalURL}`,
      })
      .fire()
      .then(function (response) {
        console.log('Fired webhook to Canonn R&D channel');
      })
      .catch(function (e) {
        console.log(e);
      });
  }

  if (env('WEBHOOK_KZ') !== '') {
    new hookcord.Hook()
      .setLink(env('WEBHOOK_KZ'))
      .setPayload({
        content: `<@${env('USER_KZID')}> New Journal Found at: ${journalURL}`,
      })
      .fire()
      .then(function (response) {
        console.log('Fired webhook to Kazakov');
      })
      .catch(function (e) {
        console.log(e);
      });
  }
};

const downloadJournal = async (version) => {
  // Construct paths (will override fdev naming for older files)
  let journalPath = path.join(__dirname, 'data', `Journal-Manual-v${version}.pdf`);
  let journalURL = env('FDEV_JNL_URL') + `/v${version}/Journal-Manual-v${version}.pdf`;
  let altJournalURL = env('FDEV_JNL_URL') + `/v${version}/Journal_Manual_v${version}.pdf`;

  const res = await fetchRetry(journalURL);
  console.log(res.url);
  console.log(res.status);
  if (res.status === 200) {
    console.log(`New Version v${version} is available, downloading...`);
    const fileStream = fs.createWriteStream(journalPath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on('error', (err) => {
        console.log('An error occured downloading the new version');
        console.log('== End FDev Journal Checker ==');
        reject(err);
      });
      fileStream.on('finish', async function () {
        console.log(`New Journal v${version} saved to data directory`);

        // Update latest.json with new version number
        latestVersion.journalVersion = latestVersion.journalVersion + 1;
        fs.writeFileSync(latestPath, JSON.stringify(latestVersion));
        console.log(`Updated latest file with v${version + 1}`);

        // Fire Discord Webhook Alerts
        //await fireWebhook(journalURL);

        console.log('== End FDev Journal Checker ==');
        resolve();
      });
    });
  } else if (res.status === 404) {
    const altRes = await fetchRetry(altJournalURL);
    console.log(altRes.url);
    console.log(altRes.status);
    if (altRes.status === 200) {
      console.log(`New Version v${version} is available, downloading...`);
      const fileStream = fs.createWriteStream(journalPath);
      await new Promise((resolve, reject) => {
        altRes.body.pipe(fileStream);
        altRes.body.on('error', (err) => {
          console.log('An error occured downloading the new version');
          console.log('== End FDev Journal Checker ==');
          reject(err);
        });
        fileStream.on('finish', async function () {
          console.log(`New Journal v${version} saved to data directory`);

          // Update latest.json with new version number
          latestVersion.journalVersion = latestVersion.journalVersion + 1;
          fs.writeFileSync(latestPath, JSON.stringify(latestVersion));
          console.log(`Updated latest file with v${version + 1}`);

          // Fire Discord Webhook Alerts
          //await fireWebhook(journalURL);

          console.log('== End FDev Journal Checker ==');
          resolve();
        });
      });
    } else {
      console.log('New Journal version is not available, current is v' + (version - 1));
      console.log('== End FDev Journal Checker ==');
    }
  } else {
    console.log('New Journal version is not available, current is v' + (version - 1));
    console.log('== End FDev Journal Checker ==');
  }
};

if (latestVersion) {
  console.log('== Starting FDev Journal Checker ==');
  if (process.env.START_NOW === 'true') {
    console.log('== Checking for new Journal ==');
    downloadJournal(latestVersion.journalVersion);
  } else {
    cron.schedule(env('CRON_JNL'), () => {
      console.log('== Checking for new Journal ==');
      downloadJournal(latestVersion.journalVersion);
    });
  }
} else {
  console.log('Error No latest version file');
}
