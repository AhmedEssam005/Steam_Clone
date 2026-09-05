const Review = require("../models/Review");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.addReview = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { productId, rating, comment } = req.body;
		const userId = req.user._id;
		const existingReview = await Review.findOne({
			user: userId,
			product: productId,
		});
		if (existingReview) {
			const error = new Error("You have already reviewed this product.");
			error.statusCode = 400;
			throw error;
		}
		const product = await Product.findById(productId);
		if (!product) {
			const error = new Error("Product not found.");
			error.statusCode = 404;
			throw error;
		}
		product.userRating.rating =
			(product.userRating.rating * product.userRating.count + rating) /
			(product.userRating.count + 1);
		product.userRating.count += 1;
		const review = new Review({
			user: userId,
			product: productId,
			rating,
			comment,
		});
		await review.save({ session });
		await product.save({ session });
		await session.commitTransaction();
		res.status(201).json({ review });
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.getReviewsByProduct = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const reviews = await Review.find({ product: productId }).populate(
			"user",
			"name avatar",
		);
		res.status(200).json({ reviews });
	} catch (err) {
		next(err);
	}
};

exports.getReviewsByUser = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const reviews = await Review.find({ user: userId }).populate({
			path: "product",
			select: "name",
			populate: { path: "includes", select: "cover title" },
		});
		res.status(200).json({ reviews });
	} catch (err) {
		next(err);
	}
};

exports.deleteReview = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { reviewId } = req.params;
		const review = await Review.findOne({
			_id: reviewId,
			user: req.user._id,
		});
		if (!review) {
			const error = new Error(
				"Cannot delete review. Review not found or you are not authorized to delete it.",
			);
			error.statusCode = 404;
			throw error;
		}
		const product = await Product.findById(review.product);
		product.userRating.rating =
			(product.userRating.rating * product.userRating.count - review.rating) /
			(product.userRating.count - 1);
		product.userRating.count -= 1;
		await review.deleteOne({ session });
		await product.save({ session });
		await session.commitTransaction();
		res.status(204).send();
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.updateReview = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { reviewId } = req.params;
		const { rating, comment } = req.body;
		const review = await Review.findOne({ _id: reviewId, user: req.user._id });
		if (!review) {
			const error = new Error(
				"Cannot update review. Review not found or you are not authorized to update it.",
			);
			error.statusCode = 404;
			throw error;
		}
		const product = await Product.findById(review.product);
		product.userRating.rating =
			(product.userRating.rating * product.userRating.count -
				review.rating +
				rating) /
			product.userRating.count;
		review.rating = rating;
		review.comment = comment;
		await review.save({ session });
		await product.save({ session });
		await session.commitTransaction();
		res.status(200).json({ review });
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.getMyFriendsReviews = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId);
		const friends = user.friends;
		const reviews = await Review.find({
			user: { $in: friends },
		}).populate("user", "name avatar");
		res.status(200).json({ reviews });
	} catch (err) {
		next(err);
	}
};
