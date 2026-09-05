const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
	try {
		const auth = req.get("Authorization");
		if (!auth) {
			const error = new Error("Not authenticated");
			error.statusCode = 401;
			throw error;
		}
		const [type, token] = auth.split(" ");
		if (type !== "Bearer" || !token) {
			const error = new Error("Invalid Authorization header");
			error.statusCode = 401;
			throw error;
		}
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decodedToken.id).select("passwordChangedAt");
		if (!user) {
			const error = new Error("User no longer exists");
			error.statusCode = 401;
			throw error;
		}
		if (
			user.passwordChangedAt &&
			decodedToken.iat * 1000 < user.passwordChangedAt.getTime()
		) {
			const error = new Error(
				"JWT token is no longer valid. Please log in again.",
			);
			error.statusCode = 401;
			throw error;
		}
		req.userId = decodedToken.id;
		req.userRole = decodedToken.role;
		next();
	} catch (err) {
		if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
			err.statusCode = 401;
		} else if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
