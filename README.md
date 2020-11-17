# Canonn-Scripts

Collection of simple cron based scripts that Canonn uses for various things

## Requirements

There will be a few key requirements for certain scripts, most of which require an Admin or Operator level account on the Canonn API. These are typically only held by Canonn R&D members. If for some reason you would like to run these scripts for us, contact `DMehaffy#1337` on Discord.

Requirements:
`CAPI_USER` - Canonn Operator level Username
`CAPI_PASS` - Canonn Operator level Password
Node - v12+ LTS only (v12, v14, v16, ect)
Yarn - Recommended instead of NPM
PM2 - If you plan to run as a crontask

## Log files

By default most of the scripts use the `perfect-logger` and will dump detailed logs of actions into the [logs directory](./logs). There it will create a folder for each script ran, and dump the log files including an epoch unix time stamp.

## Settings

Included is a default `.env.example` simply copy this over to a `.env` file and the scripts will parse it automatically, you can also modify the [settings](./settings) manually.

## Script list

Details about each type of script, and each individual script

### Report Validation

These check various reports from the Canonn API, validates them and will create a site (system, body, cmdr, ect) if it's valid or update the report with any errors, issues, or a duplicate status.

#### baseReport

This script will process the following site types:

- Amphora Plants (AP)
- Bark Mounds (BM)
- Brain Trees (BT)
- Crystalline Shards (CS)
- Fungal Gourds (FG) - Also known as Anemones
- Fumaroles (FM)
- Gas Vents (GV
- Geysers (GY)
- Lava Spouts (LS)
- Tubeworms (TW)

To run the command you simply need to execute the node script via one of the following methods:

- `yarn baseReport`
- `npm run baseReport`
- `pm2 start npm --name="some-process-name-here" -- run baseReport`

There are also various flags that can be used based on needs:

- `--reset` => Will reset any reports with a reportStatus that is `issue` useful for "once in a blue moon" type manual requests where a CMDR doesn't send data to EDSM until they dock.
- `--novalidate` => Used to skip over the entire validation process, generally used in combination with `--reset` to only reset the reports and let the normal cron validate them later.
- `--now` => Will not start in cron mode and will execute immediately, dumping log output to stdout and the standard log file.

#### guardianReport

This script will process the following site types:

- Guardian Ruins (GR) => **Currently disabled**
- Guardian Structures (GS)

To run the command you simply need to execute the node script via one of the following methods:

- `yarn guardianReport`
- `npm run guardianReport`
- `pm2 start npm --name="some-process-name-here" -- run guardianReport`

There are also various flags that can be used based on needs:

- `--reset` => Will reset any reports with a reportStatus that is `issue` useful for "once in a blue moon" type manual requests where a CMDR doesn't send data to EDSM until they dock.
- `--novalidate` => Used to skip over the entire validation process, generally used in combination with `--reset` to only reset the reports and let the normal cron validate them later.
- `--now` => Will not start in cron mode and will execute immediately, dumping log output to stdout and the standard log file.

#### thargoidReport

This script will process the following site types:

- Thargoid Barnacles (TB)
- Thargoid Structures (TS) => **Currently disabled**

To run the command you simply need to execute the node script via one of the following methods:

- `yarn thargoidReport`
- `npm run thargoidReport`
- `pm2 start npm --name="some-process-name-here" -- run thargoidReport`

There are also various flags that can be used based on needs:

- `--reset` => Will reset any reports with a reportStatus that is `issue` useful for "once in a blue moon" type manual requests where a CMDR doesn't send data to EDSM until they dock.
- `--novalidate` => Used to skip over the entire validation process, generally used in combination with `--reset` to only reset the reports and let the normal cron validate them later.
- `--now` => Will not start in cron mode and will execute immediately, dumping log output to stdout and the standard log file.

#### orbitalReport

This script is currently planned but has not been implemented, it will eventually validate the following site types:

- Generation Ships (GEN)
- Guardian Beacons (GB)
- Lagrange Clouds (LC) => **Possible, but unlikely**

#### cmdrReport

This script is currently planned but has not been implemented, it will eventually validate the following report types:

- CMDR kills (Thargoid kills)
- Leaderboard generation (daily/weekly/monthly/yearly)

#### deleteMR

This script simply prunes our Material report data to keep only a certain number of months, typically only 1 month of material data is kept in order to decrease the size of the Canonn API database.

There is a single flag that can be used based on need:

- `--now` => Will not start in cron mode and will execute immediately, dumping log output to stdout and the standard log file.

### Update Scripts

These scripts do various maintenance syncing between the Canonn API and EDSM. It's generally used to try and keep our systems and bodies up to date with EDSM. There is also a WIP script that will populate systems with the new region system introduced in Elite: Dangerous.

#### systemUpdate

Used to keep the Canonn API systems database in sync with EDSM. The following filters are used to check for updates:

- `edsmCoordLocked=false` => If the X, Y, and Z GalCoords are not considered "locked" by EDSM.
- `missingSkipCount_lt=10` => Less than 10, note that missing skip count is an integer between 0 and 10 based on how many tries we have attempted to get valid data from EDSM. If this number meets or exceeds 10, we will no longer try to sync the data.

There are also various flags that can be used based on needs:

- `--force` => Skip the above listed filters and pull all systems from the Canonn API to forcefully sync with EDSM. **USE WITH CAUTION** as you will likely exceed the EDSM rate-limit if the delay is not set high enough. This will also take a large amount of time.
- `--start` => Custom offset, in case you had to interrupt the script, generally used while forcing an update.
- `--now` => Will not start in cron mode and will execute immediately, dumping log output to stdout and the standard log file.

#### bodyUpdate

Used to keep the Canonn API bodies database in sync with EDSM. The following filters are used to check for updates:

- `edsmID_null=true` => If we do not have a valid EDSM Body ID, basically checking if the body exists in EDSM. Typically these bodies were before we enforced the body data to be in EDSM before approving a site. New reports will be marked as `issue` if the body doesn't exist.
- `missingSkipCount_lt=10` => Less than 10, note that missing skip count is an integer between 0 and 10 based on how many tries we have attempted to get valid data from EDSM. If this number meets or exceeds 10, we will no longer try to sync the data.

There are also various flags that can be used based on needs:

- `--force` => Skip the above listed filters and pull all systems from the Canonn API to forcefully sync with EDSM. **USE WITH CAUTION** as you will likely exceed the EDSM rate-limit if the delay is not set high enough. This will also take a large amount of time.
- `--start` => Custom offset, in case you had to interrupt the script, generally used while forcing an update.
- `--now` => Will not start in cron mode and will execute immediately, dumping log output to stdout and the standard log file.

#### regionUpdate

Used to dynamically generate the Frontier region ID based on the ID64 of the system, currently this script is not working properly and we are working to refactor it. **Do not use it right now**

### Misc Scripts

These are just various helpful little scripts Canonn uses to perform some automated tasks, like alerting us to new Elite: Dangerous journal manuals.

#### journalUpdateCheck

This is used to check the Frontier URLs for new Journal Manuals. All previously known manuals are cached here and can be found in the [data directory](./scripts/journalUpdateCheck/data/).

This script is currently pending a massive refactoring and should not be used as is.
