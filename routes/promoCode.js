const router = require("express").Router();
const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");
const promoController = require("../controllers/promoCode");
const { validateRequest } = require("../validators/common");
const validator = require("../validators/promo");

router.post(
	"/check",
	isAuth,
	validator.checkPromoValidator,
	validateRequest,
	promoController.checkPromo,
);
router.post(
	"/add",
	isAuth,
	isAdmin,
	validator.addPromoValidator,
	validateRequest,
	promoController.addPromo,
);
router.get("/", isAuth, isAdmin, promoController.getAllPromos);
module.exports = router;
