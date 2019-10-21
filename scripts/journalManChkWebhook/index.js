'use strict';

const fetch = require('fetch-retry');
const webhook = require('webhook-discord');
const fs = require('fs');
const path = require('path');

// Check if latest file exists else create it from example
const latestPath = path.join(__dirname, 'data', 'latest.json');
const examplePath = path.join(__dirname, 'data', 'example.json');
let latestVersion = {};

try {
  if (fs.existsSync(latestPath)) {
    let rawFile = fs.readFileSync(latestPath);
    latestVersion = JSON.parse(rawFile);
  } else {
    let exampleRawFile = fs.readFileSync(examplePath);
    fs.writeFileSync(latestPath, exampleRawFile);
    latestVersion = JSON.parse(exampleRawFile);
  }
} catch(err) {
  console.log(err)
};

