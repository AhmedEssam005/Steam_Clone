const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		name: {
			type: String,
			unique: true,
			lowercase: true,
			required: true,
			trim: true,
		},
		nameChangedAt: {
			type: Date,
			default: Date.now(),
		},
		email: {
			type: String,
			unique: true,
			required: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		passwordChangedAt: {
			type: Date,
			default: null,
		},
		passwordResetToken: {
			type: String,
			default: null,
		},
		passwordResetTokenExpires: {
			type: Date,
			default: null,
		},
		avatar: {
			type: String,
			default: "",
		},
		role: {
			type: String,
			required: true,
			default: "User",
			enum: ["User", "Admin", "user", "admin"],
		},
		verificationToken: {
			type: String,
			default: null,
		},
		verficationTokenExpires: {
			type: Date,
			default: null,
		},
		isEmailVerified: {
			type: Boolean,
			required: true,
			default: false,
		},
		bio: {
			type: String,
			default: "",
		},
		favQuote: {
			quote: { type: String, default: "" },
			author: {
				type: String,
				default: "",
			},
		},

		cart: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					default: 1,
					min: 1,
					required: true,
				},
			},
		],
		wishlist: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		library: [
			{
				product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
				activationCodes: [{ type: String, lowercase: true, trim: true }],
			},
		],
		friends: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
