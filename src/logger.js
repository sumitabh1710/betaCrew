const { createLogger, format, transports } = require("winston");
const { LOG_FILE } = require("../config/config");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: LOG_FILE }),
  ],
});

module.exports = logger;
