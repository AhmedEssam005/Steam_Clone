const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				activationCodes: [
					{
						type: String,
						lowercase: true,
						trim: true,
						required: true,
						default: [],
					},
				],
			},
		],
		subTotal: {
			type: Number,
			required: true,
		},

		promoCode: {
			type: String,
			trim: true,
		},

		promoDiscount: {
			type: Number,
			default: 0,
			min: 0,
		},

		totalPrice: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "succeed", "failed"],
			default: "pending",
		},
		note: { type: String },
		purchasedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
