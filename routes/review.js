const reviewController = require("../controllers/review");
const isAuth = require("../middlewares/is-auth");
const { validateRequest } = require("../validators/common");
const validators = require("../validators/review");
const Router = require("express").Router();

Router.post(
	"/",
	isAuth,
	validators.addReviewValidator,
	validateRequest,
	reviewController.addReview,
);
Router.get(
	"/product/:productId",
	validators.getReviewsByProductValidator,
	validateRequest,
	reviewController.getReviewsByProduct,
);
Router.delete(
	"/:reviewId",
	isAuth,
	validators.deleteReviewValidator,
	validateRequest,
	reviewController.deleteReview,
);
Router.put(
	"/:reviewId",
	isAuth,
	validators.updateReviewValidator,
	validateRequest,
	reviewController.updateReview,
);
Router.get("/user/:userId", isAuth, reviewController.getReviewsByUser);
Router.get("/friends", isAuth, reviewController.getMyFriendsReviews);

module.exports = Router;
