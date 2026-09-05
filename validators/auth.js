const { body } = require("express-validator");

exports.loginValidator = [
	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.optional()
		.withMessage("Invalid email address"),
	body("name")
		.trim()
		.toLowerCase()
		.isLength({ min: 3, max: 30 })
		.optional()
		.withMessage("Name must be between 3 and 30 characters long"),
	body("password").trim().notEmpty().withMessage("Password is required"),
];

exports.signupValidator = [
	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Invalid email address"),
	body("password")
		.trim()
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
	body("name")
		.trim()
		.isLength({ min: 3, max: 30 })
		.withMessage("Name must be between 3 and 30 characters long"),
];

exports.changePasswordValidator = [
	body("token").trim().notEmpty().withMessage("Reset token is required"),
	body("password")
		.trim()
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
];

exports.emailValidator = [
	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Invalid email address"),
];

exports.verifyEmailValidator = [
	body("token").trim().notEmpty().withMessage("Verification token is required"),
];
