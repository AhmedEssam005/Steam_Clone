const { body, param } = require("express-validator");

exports.cartValidator = [
	body("productId").isMongoId().withMessage("Invalid product ID"),
	body("quantity")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Quantity must be between 1 and 100"),
];

exports.nameValidator = [
	body("name")
		.trim()
		.matches(/^[a-zA-Z0-9_]+$/)
		.isLength({ min: 3, max: 30 })
		.withMessage(
			"Name must be between 3 and 30 characters and contain only letters, numbers, or underscores",
		),
];

exports.bioValidator = [
	body("bio")
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage("Bio must not exceed 500 characters"),
];

exports.quoteValidator = [
	body("quote")
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage("Quote must not exceed 500 characters"),
	body("author")
		.isString()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Author must not exceed 100 characters"),
];

exports.productParamValidator = [
	param("productId").isMongoId().withMessage("Invalid product ID"),
];

exports.targetUserValidator = [
	body("targetId").isMongoId().withMessage("Invalid target user ID"),
];

exports.userParamValidator = [
	param("userId").isMongoId().withMessage("Invalid user ID"),
];

exports.searchNameValidator = [
	param("name")
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Name must be between 1 and 50 characters"),
];

exports.sendGiftValidator = [
	body("productId").isMongoId().withMessage("Invalid product ID"),
	body("friendId").isMongoId().withMessage("Invalid receiver user ID"),
	body("message")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 300 })
		.withMessage("Message must not exceed 300 characters"),
	body("promoCode")
		.optional()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Promo code must be between 1 and 50 characters"),
];

exports.giftParamValidator = [
	param("giftId").isMongoId().withMessage("Invalid gift ID"),
];
