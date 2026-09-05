const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const logger = require("../log/logger");
const verifyEmailTemplate = require("../templates/verficationEmail");
const changePasswordTemplate = require("../templates/changePassword");

exports.login = async (req, res, next) => {
	try {
		const { email, name, password } = req.body;
		if (!name && !email) {
			const error = new Error("Must provide email or name");
			error.statusCode = 422;
			logger.error(`Missing name and email for login`);
			throw error;
		}
		const user = await User.findOne({ $or: [{ email }, { name }] });
		if (!user) {
			logger.warn(`Login failed: user not found for email ${email || name}`);
			const error = new Error("Email or password is incorrect");
			error.statusCode = 401;
			throw error;
		}
		const check = await bcrypt.compare(password, user.password);
		if (!check) {
			logger.warn(`Login failed: invalid password for ${email || name}`);
			const error = new Error("Email or password is incorrect");
			error.statusCode = 401;
			throw error;
		}
		if (!user.isEmailVerified) {
			logger.warn(`Login failed: unverified email for ${email || name}`);
			const error = new Error("Email not verified");
			error.statusCode = 403;
			throw error;
		}
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});
		logger.info(`User: ${user.email} logged in successfully`);
		res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				name: user.name,
				role: user.role,
				avatar: user.avatar,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.signup = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		const user = await User.findOne({ $or: [{ email }, { name }] });
		if (user) {
			logger.warn(`Signup failed: user already exists for ${email}`);
			const error = new Error("User already exists");
			error.statusCode = 409;
			throw error;
		}
		const hashedPassword = await bcrypt.hash(password, 12);
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			cart: [],
			wishlist: [],
			library: [],
		});
		const verifyToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = crypto
			.createHash("sha256")
			.update(verifyToken)
			.digest("hex");
		newUser.verificationToken = hashedToken;
		newUser.verficationTokenExpires = Date.now() + 3600000;
		await newUser.save();
		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: newUser.email,
			subject: "Verify your email",
			html: verifyEmailTemplate(
				`${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?token=${verifyToken}`,
				newUser.name,
			),
		});

		logger.info(`User created: ${newUser.email}`);
		logger.info(`Verification email sent to ${newUser.email}`);
		res.status(201).json({
			message: "User created successfully",
			user: {
				id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
				avatar: newUser.avatar,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.resendVerificationEmail = async (req, res, next) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			logger.warn(
				`Resend verification failed: user not found for email ${email}`,
			);
			const error = new Error("User with this email address was not found");
			error.statusCode = 404;
			throw error;
		}
		if (user.isEmailVerified) {
			const error = new Error("Email already verified");
			error.statusCode = 400;
			throw error;
		}
		const verifyToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = crypto
			.createHash("sha256")
			.update(verifyToken)
			.digest("hex");
		user.verificationToken = hashedToken;
		user.verficationTokenExpires = Date.now() + 3600000;
		await user.save();
		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: user.email,
			subject: "Verify your email",
			html: verifyEmailTemplate(
				`${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?token=${verifyToken}`,
				user.name,
			),
		});
		logger.info(`Verification email resent to ${user.email}`);
		res.status(200).json({
			message: "Verification email resent successfully",
		});
	} catch (err) {
		next(err);
	}
};
exports.verifyEmail = async (req, res, next) => {
	try {
		const { token } = req.body;
		if (!token) {
			const error = new Error("Token is required");
			error.statusCode = 400;
			throw error;
		}
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		const user = await User.findOne({
			verificationToken: hashedToken,
			verficationTokenExpires: { $gt: Date.now() },
		});
		if (!user) {
			logger.warn(`Email verification failed: invalid token`);
			const error = new Error("Invalid token");
			error.statusCode = 401;
			throw error;
		}
		user.isEmailVerified = true;
		user.verificationToken = null;
		user.verficationTokenExpires = null;
		await user.save();
		res.status(200).json({
			message: "Email verified successfully",
		});
	} catch (err) {
		next(err);
	}
};

exports.sendPasswordResetEmail = async (req, res, next) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			const error = new Error("User not found");
			error.statusCode = 404;
			throw error;
		}
		const token = crypto.randomBytes(32).toString("hex");
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		user.passwordResetToken = hashedToken;
		user.passwordResetTokenExpires = Date.now() + 3600000;
		await user.save();
		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: user.email,
			subject: "Reset your password",
			html: changePasswordTemplate(
				`${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/reset-password?token=${token}`,
				user.name,
			),
		});
		logger.info(`Password reset email sent to ${user.email}`);
		res.status(200).json({
			message: "Password reset email sent successfully",
		});
	} catch (err) {
		next(err);
	}
};

exports.changePassword = async (req, res, next) => {
	try {
		const { token, password } = req.body;
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetTokenExpires: { $gt: Date.now() },
		});
		if (!user) {
			logger.warn(`Password change failed: invalid token`);
			const error = new Error("Invalid token");
			error.statusCode = 401;
			throw error;
		}
		const hashedPassword = await bcrypt.hash(password, 12);
		user.password = hashedPassword;
		user.passwordResetToken = null;
		user.passwordResetTokenExpires = null;
		user.passwordChangedAt = Date.now();
		await user.save();
		logger.info(`Password changed successfully for ${user.email}`);
		res.status(200).json({
			message: "Password changed successfully",
		});
	} catch (err) {
		next(err);
	}
};
