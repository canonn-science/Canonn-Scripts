let logger = require('perfect-logger');
let settings = require('../../settings.json');

module.exports = loginit = (script) => {
  // Set log info
  logger.setLogDirectory('./logs/' + script);
  logger.setLogFileName(script);

  // Set timezone
  logger.setTimeZone(settings.global.timezone);

  // Set application info
  logger.setApplicationInfo({
    name: settings.scripts[script].name,
    version: settings.scripts[script].version,
    banner: settings.scripts[script].description
  });

  // Define custom loglevels
  logger.addStatusCode("start", "STRT", false, "cyan")

  // Start the logger
  logger.initialize();
  logger.start(`Staring Script: ${script}`)
}