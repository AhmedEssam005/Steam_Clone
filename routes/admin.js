const router = require("express").Router();
const validator = require("../validators/admin");
const adminController = require("../controllers/admin");
const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");
const { validateRequest } = require("../validators/common");

router.get(
	"/game/search",
	isAuth,
	isAdmin,
	validator.gameSearchValidator,
	validateRequest,
	adminController.searchByName,
);
router.post(
	"/game/add",
	isAuth,
	isAdmin,
	validator.addBaseGameValidator,
	validateRequest,
	adminController.addBaseGame,
);

router.get(
	"/game/dlcs/:gameId",
	isAuth,
	isAdmin,
	validator.igdbIdValidator,
	validateRequest,
	adminController.getDlcs,
);
router.post(
	"/game/add/dlcs",
	isAuth,
	isAdmin,
	validator.addDlcsValidator,
	validateRequest,
	adminController.addDlcs,
);
router.post(
	"/product/add",
	isAuth,
	isAdmin,
	validator.addProductValidator,
	validateRequest,
	adminController.addProduct,
);
router.get(
	"/games",
	isAuth,
	isAdmin,
	validateRequest,
	adminController.getGames,
);
router.get(
	"/products",
	isAuth,
	isAdmin,
	validateRequest,
	adminController.getProducts,
);
router.patch(
	"/order/:orderId/confirm",
	isAuth,
	isAdmin,
	validator.orderIdValidator,
	validateRequest,
	adminController.confirmOrder,
);
router.get(
	"/order/details/:orderId",
	isAuth,
	isAdmin,
	validator.orderIdValidator,
	validateRequest,
	adminController.getOrderDetails,
);
router.get(
	"/order/pending",
	isAuth,
	isAdmin,
	validateRequest,
	adminController.getPendingOrders,
);
router.delete(
	"/product/:productId",
	isAuth,
	isAdmin,
	validator.productIdValidator,
	validateRequest,
	adminController.unlistProduct,
);
router.patch(
	"/product/:productId",
	isAuth,
	isAdmin,
	validator.editProductValidator,
	validateRequest,
	adminController.editProduct,
);

module.exports = router;
