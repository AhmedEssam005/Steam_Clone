const { body, param } = require("express-validator");

exports.addReviewValidator = [
	body("productId").isMongoId().withMessage("Invalid product ID."),

	body("rating")
		.isInt({ min: 1, max: 5 })
		.withMessage("Rating must be an integer between 1 and 5."),

	body("comment")
		.optional()
		.isString()
		.withMessage("Comment must be a string.")
		.trim()
		.isLength({ max: 1000 })
		.withMessage("Comment cannot exceed 1000 characters."),
];

exports.getReviewsByProductValidator = [
	param("productId").isMongoId().withMessage("Invalid product ID."),
];

exports.deleteReviewValidator = [
	param("reviewId").isMongoId().withMessage("Invalid review ID."),
];

exports.updateReviewValidator = [
	param("reviewId").isMongoId().withMessage("Invalid review ID."),

	body("rating")
		.isInt({ min: 1, max: 5 })
		.withMessage("Rating must be an integer between 1 and 5."),

	body("comment")
		.optional()
		.isString()
		.withMessage("Comment must be a string.")
		.trim()
		.isLength({ max: 1000 })
		.withMessage("Comment cannot exceed 1000 characters."),
];
