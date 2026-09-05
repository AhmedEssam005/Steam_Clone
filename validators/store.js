const { param, query } = require("express-validator");

exports.productIdValidator = [
	param("productId").isMongoId().withMessage("Invalid product ID"),
];

exports.productsQueryValidator = [
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
	query("minPrice")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Minimum price must be non-negative"),
	query("maxPrice")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Maximum price must be non-negative"),
	query("maxPrice").custom((value, { req }) => {
		if (value !== undefined && req.query.minPrice !== undefined) {
			if (Number(value) < Number(req.query.minPrice)) {
				throw new Error("Maximum price must be greater than minimum price");
			}
		}
		return true;
	}),
	query("releaseDate")
		.optional()
		.isInt({ min: 1970, max: 2200 })
		.withMessage("Release year is invalid"),
	query("deals")
		.optional()
		.isBoolean()
		.withMessage("Deals must be true or false"),
	query("sort")
		.optional()
		.isIn([
			"price",
			"-price",
			"views",
			"-views",
			"copiesSold",
			"-copiesSold",
			"createdAt",
			"-createdAt",
		])
		.withMessage("Invalid sort option"),
	query("search")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Search must not exceed 100 characters"),
	query("genres")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Genres filter must not exceed 100 characters"),
	query("developers")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Developers filter must not exceed 100 characters"),
	query("publishers")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Publishers filter must not exceed 100 characters"),
];
