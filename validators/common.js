const { validationResult } = require("express-validator");
const logger = require("../log/logger");

exports.validateRequest = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}
	logger.warn(
		`Validation failed: ${req.method} ${req.originalUrl} ${JSON.stringify(
			errors.array(),
		)}`,
	);

	const error = new Error("Validation failed");
	error.statusCode = 422;
	error.details = errors.array();
	return next(error);
};
