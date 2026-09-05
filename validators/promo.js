const { body } = require("express-validator");

exports.checkPromoValidator = [
	body("promoCode")
		.trim()
		.matches(/^[a-zA-Z0-9_-]+$/)
		.isLength({ min: 1, max: 50 })
		.withMessage("Promo code must contain 1 to 50 letters, numbers, _ or -"),
	body("subTotal")
		.isFloat({ min: 0 })
		.withMessage("Subtotal must be a non-negative number"),
];

exports.addPromoValidator = [
	body("code")
		.trim()
		.notEmpty()
		.isLength({ min: 1, max: 50 })
		.withMessage("Promo code must contain 1 to 50 letters, numbers, _ or -"),
	body("percentage")
		.notEmpty()
		.isFloat({ min: 0 })
		.withMessage("Discount must be a non-negative number"),
	body("minPurchase")
		.notEmpty()
		.isFloat({ min: 0 })
		.withMessage("Minimum purchase must be a non-negative number"),
	body("maxDiscount")
		.notEmpty()
		.isFloat({ min: 0 })
		.withMessage("Maximum discount must be a non-negative number"),
	body("usageLimit")
		.notEmpty()
		.isInt({ min: 0 })
		.withMessage("Usage limit must be a non-negative integer"),
	body("lifetime")
		.notEmpty()
		.isInt({ min: 0 })
		.withMessage("Lifetime must be a non-negative integer"),
];
