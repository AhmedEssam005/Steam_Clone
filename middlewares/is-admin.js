const User = require("../models/User");

module.exports = async (req, res, next) => {
	const user = await User.findById(req.userId);
	const role = user.role;
	if (role !== "Admin" && role !== "admin") {
		const error = new Error("Not privileged");
		error.statusCode = 403;
		next(error)
	}
	next();
};
