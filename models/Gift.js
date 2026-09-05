const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const giftSchema = new Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		promo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Promocode",
			default: null,
		},

		totalPrice: {
			type: Number,
			required: true,
		},

		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
		},
		message: { type: String, default: "" },
		sentAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Gift", giftSchema);
