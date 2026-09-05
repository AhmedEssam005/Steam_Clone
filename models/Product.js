const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},

		type: {
			type: String,
			required: true,
		},

		includes: [
			{
				type: Schema.Types.ObjectId,
				ref: "Game",
				required: true,
			},
		],

		price: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		userRating: {
			rating: {
				type: Number,
				min: 0,
				max: 10,
				default: 0,
				required: true,
			},
			count: {
				type: Number,
				default: 0,
				required: true,
			},
		},
		views: {
			type: Number,
			default: 0,
			required: true,
		},
		isListed: {
			type: Boolean,
			default: true,
		},
		copiesSold: {
			type: Number,
			default: 0,
			required: true,
		},
		discount: {
			type: Number,
			required: true,
			min: 0,
			max: 100,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Product", productSchema);
