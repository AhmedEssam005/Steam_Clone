const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const promoSchema = new Schema(
	{
		code: {
			type: String,
			unique: true,
			uppercase: true,
			trim: true,
			required: true,
		},
		percentage: {
			type: Number,
			min: 0,
			max: 100,
			required: true,
		},
		minPurchase: {
			type: Number,
			min: 0,
			required: true,
		},
		maxDiscount: {
			type: Number,
			min: 0,
			required: true,
		},
		usageLimit: {
			type: Number,
			min: 1,
			required: true,
		},
		usedCount: {
			type: Number,
			required: true,
			default: 0,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
);
module.exports = mongoose.model("Promocode", promoSchema);
