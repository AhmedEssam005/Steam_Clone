const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema(
	{
		externalId: {
			type: Number,
			required: true,
			unique: true,
		},

		title: {
			type: String,
			required: true,
			trim: true,
		},

		description: {
			type: String,
			required: true,
		},

		type: {
			type: String,
			required: true,
			trim: true,
		},
		parentGame: { type: Schema.Types.ObjectId, ref: "Game" },
		cover: {
			type: String,
			required: true,
		},

		screenshots: [
			{
				type: String,
			},
		],

		genres: [
			{
				type: String,
			},
		],

		developers: [
			{
				type: String,
			},
		],

		publishers: [
			{
				type: String,
			},
		],

		releaseDate: {
			type: Date,
		},

		dlcs: [
			{
				type: Schema.Types.ObjectId,
				ref: "Game",
			},
		],

		externalRating: {
			rating: {
				type: Number,
				min: 0,
				max: 100,
				required: true,
			},
			count: {
				type: Number,
				required: true,
			},
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

		supportedLanguages: [{ type: String }],
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Game", gameSchema);
