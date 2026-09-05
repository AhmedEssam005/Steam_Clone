const { body, param, query } = require("express-validator");

exports.addBaseGameValidator = [
	body("gameExtId")
		.isInt({ min: 1 })
		.withMessage("Game external ID must be a positive integer"),
];
exports.addDlcsValidator = [
	body("parentGameId").isMongoId().withMessage("Invalid parent game ID"),
	body("dlcs")
		.isArray({ min: 1, max: 50 })
		.withMessage("DLCs must contain between 1 and 50 items"),
	body("dlcs.*")
		.isInt({ min: 1 })
		.withMessage("DLC external IDs must be positive integers"),
];
exports.addProductValidator = [
	body("type")
		.isIn(["Base Game", "DLC", "Bundle"])
		.withMessage("Invalid product type"),
	body("gameId")
		.optional()
		.isMongoId()
		.withMessage("Invalid game ID"),
	body("includes")
		.optional()
		.isArray({ min: 1, max: 100 })
		.withMessage("Includes must contain between 1 and 100 game IDs"),
	body("includes.*")
		.optional()
		.isMongoId()
		.withMessage("Invalid included game ID"),
	body("price")
		.isFloat({ min: 0 })
		.withMessage("Price must be a non-negative number"),
	body("discount")
		.optional()
		.isFloat({ min: 0, max: 100 })
		.withMessage("Discount must be between 0 and 100"),
];

exports.gameIdValidator = [
	param("gameId").isMongoId().withMessage("Invalid game ID"),
];

exports.productIdValidator = [
	param("productId").isMongoId().withMessage("Invalid product ID"),
];

exports.orderIdValidator = [
	param("orderId").isMongoId().withMessage("Invalid order ID"),
];

exports.gameSearchValidator = [
	query("name")
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage("Game name must be between 1 and 100 characters"),
];

exports.igdbIdValidator = [
	param("gameId").isInt({ min: 1 }).withMessage("Invalid IGDB game ID"),
];

exports.editProductValidator = [
	param("productId").isMongoId().withMessage("Invalid product ID"),
	body("name")
		.trim()
		.isLength({ min: 1, max: 200 })
		.withMessage("Product name must be between 1 and 200 characters"),
	body("price")
		.isFloat({ min: 0 })
		.withMessage("Price must be a non-negative number"),
	body("discount")
		.isFloat({ min: 0, max: 100 })
		.withMessage("Discount must be between 0 and 100"),
	body("isListed").isBoolean().withMessage("isListed must be boolean"),
];
