const router = require("express").Router();
const { body } = require("express-validator");
const { validateRequest } = require("../validators/common");

const isAuth = require("../middlewares/is-auth");
const orderController = require("../controllers/order");
const isAdmin = require("../middlewares/is-admin");

router.post(
	"/",
	isAuth,
	body("promoCode")
		.optional({ nullable: true })
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Promo code must be between 1 and 50 characters"),
	validateRequest,
	orderController.addOrder,
);

router.get("/", isAuth, validateRequest, orderController.getOrders);

module.exports = router;
