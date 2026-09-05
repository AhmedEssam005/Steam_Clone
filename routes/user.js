const userController = require("../controllers/user");
const isAuth = require("../middlewares/is-auth");
const Router = require("express").Router();
const multer = require("multer");
const upload = require("../services/mutlerService");
const { validateRequest } = require("../validators/common");
const validator = require("../validators/user");

const avatarUpload = (req, res, next) => {
	upload.single("avatar")(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE") {
				const error = new Error("File size exceeds the limit of 5MB");
				error.statusCode = 400;
				return next(error);
			}
			if (err.code === "LIMIT_UNEXPECTED_FILE") {
				const error = new Error(
					"Invalid file type. Only jpeg/png/webp/jpg are allowed.",
				);
				error.statusCode = 400;
				return next(error);
			}
			const error = new Error(err.message);
			error.statusCode = 400;
			return next(error);
		}
		if (err) {
			return next(err);
		}
		if (!req.file) {
			const error = new Error("A valid avatar image is required");
			error.statusCode = 400;
			return next(error);
		}
		next();
	});
};

Router.post(
	"/cart",
	isAuth,
	validator.cartValidator,
	validateRequest,
	userController.addToCart,
);
Router.patch(
	"/name",
	isAuth,
	validator.nameValidator,
	validateRequest,
	userController.updateName,
);
Router.patch(
	"/avatar",
	isAuth,
	avatarUpload,
	validateRequest,
	userController.updateAvatar,
);
Router.patch(
	"/bio",
	isAuth,
	validator.bioValidator,
	validateRequest,
	userController.updateBio,
);
Router.patch(
	"/quote",
	isAuth,
	validator.quoteValidator,
	validateRequest,
	userController.updateQuote,
);
Router.get("/cart", isAuth, validateRequest, userController.getCart);
Router.get("/library", isAuth, validateRequest, userController.getLibrary);
Router.get("/wishlist", isAuth, validateRequest, userController.getWishlist);
Router.patch(
	"/wishlist/:productId",
	isAuth,
	validator.productParamValidator,
	validateRequest,
	userController.addWishlist,
);
Router.delete(
	"/wishlist/:productId",
	isAuth,
	validator.productParamValidator,
	validateRequest,
	userController.removeWishlist,
);
Router.delete(
	"/cart/:productId",
	isAuth,
	validator.productParamValidator,
	validateRequest,
	userController.removeCart,
);
Router.get("/friends", isAuth, validateRequest, userController.getFriendsList);
Router.get(
	"/friends/requests",
	isAuth,
	validateRequest,
	userController.getPendingFriendRequests,
);
Router.get(
	"/friends/requests/sent",
	isAuth,
	validateRequest,
	userController.getSentFriendRequests,
);
Router.post(
	"/friends/request",
	isAuth,
	validator.targetUserValidator,
	validateRequest,
	userController.sendFriendRequest,
);
Router.post(
	"/friends/request/accept",
	isAuth,
	validator.targetUserValidator,
	validateRequest,
	userController.acceptFriendRequest,
);
Router.post(
	"/friends/request/cancel",
	isAuth,
	validator.targetUserValidator,
	validateRequest,
	userController.cancelSendingFriendRequests,
);
Router.post(
	"/friends/request/reject",
	isAuth,
	validator.targetUserValidator,
	validateRequest,
	userController.rejectFriendRequests,
);
Router.delete(
	"/friends",
	isAuth,
	validator.targetUserValidator,
	validateRequest,
	userController.removeFriend,
);
Router.get(
	"/profile/me",
	isAuth,
	validateRequest,
	userController.showMyProfile,
);
Router.get(
	"/profile/:userId",
	isAuth,
	validator.userParamValidator,
	validateRequest,
	userController.getProfile,
);
Router.get(
	"/search/:name",
	isAuth,
	validator.searchNameValidator,
	validateRequest,
	userController.searchFriend,
);

Router.post(
	"/gift",
	isAuth,
	validator.sendGiftValidator,
	validateRequest,
	userController.sendGift,
);
Router.patch(
	"/gift/:giftId/accept",
	isAuth,
	validator.giftParamValidator,
	validateRequest,
	userController.acceptGift,
);
Router.patch(
	"/gift/:giftId/reject",
	isAuth,
	validator.giftParamValidator,
	validateRequest,
	userController.rejectGift,
);

Router.get("/gift/received", isAuth, userController.getReceivedGifts);

module.exports = Router;
