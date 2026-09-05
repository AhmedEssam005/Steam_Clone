const mongoose = require("mongoose");
const schema = mongoose.Schema;

const friendRequestSchema = new schema(
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
	},
	{
		timestamps: true,
	},
);
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
module.exports = mongoose.model("friendRequest", friendRequestSchema);
