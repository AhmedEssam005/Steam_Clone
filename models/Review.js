const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},

	rating: {
		type: Number,
		min: 0,
		max: 10,
		default: 0,
		required: true,
	},

	comment: {
		type: String,
		default: "",
		required: false,
	},
});
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
