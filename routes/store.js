const router = require("express").Router();
const storeController = require("../controllers/store");
const isAuth = require("../middlewares/is-auth");
const validators = require("../validators/store");
const { validateRequest } = require("../validators/common");

router.get(
	"/products",
	validators.productsQueryValidator,
	validateRequest,
	storeController.getProducts,
);
router.get(
	"/products/:productId",
	validators.productIdValidator,
	validateRequest,
	storeController.getProduct,
);

module.exports = router;
