const winston = require("winston");

const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		winston.format.printf(
			(info) => `${info.timestamp} ${info.level}: ${info.message}`,
		),
	),
	transports: [
		new winston.transports.File({
			filename: "log/server.log",
			maxsize: 5 * 1024 * 1024,
			maxFiles: 5,
			tailable: true,
		}),
		new winston.transports.Console(),
	],
});

module.exports = logger;
