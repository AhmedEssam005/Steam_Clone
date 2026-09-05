const User = require("../models/User");
const logger = require("../log/logger");
const Product = require("../models/Product");
const Gift = require("../models/Gift");
const friendRequest = require("../models/friendRequest");
const fs = require("fs").promises;
const mongoose = require("mongoose");
const { checkPromo } = require("../services/promoService");
const crypto = require("crypto");
const Review = require("../models/Review");

exports.addToCart = async (req, res, next) => {
	try {
		const { quantity = 1, productId } = req.body;
		const product = await Product.findOne({ _id: productId, isListed: true });
		if (!product) {
			const error = new Error("Product is not available");
			error.statusCode = 404;
			throw error;
		}
		const user = await User.findById(req.userId);
		const cartItem = user.cart.find(
			(ele) => ele.product.toString() === productId,
		);

		if (cartItem) {
			cartItem.quantity += quantity;
		} else {
			user.cart.push({
				product: productId,
				quantity,
			});
		}
		await user.save();
		res.status(201).json({ message: "Added products to cart successfully" });
	} catch (err) {
		next(err);
	}
};

exports.getCart = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).populate({
			path: "cart.product",
			populate: {
				path: "includes",
			},
		});
		const cart = user.cart;
		res.status(200).json(cart);
	} catch (err) {
		next(err);
	}
};

exports.addWishlist = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const product = await Product.findById(productId);
		if (!product) {
			const error = new Error("Product does not exist");
			error.statusCode = 404;
			logger.warn("Invalid productId");
			throw error;
		}
		const user = await User.findById(req.userId);
		const owned = user.library.find(
			(ele) => ele.product.toString() === productId,
		);

		if (owned) {
			const error = new Error("Product already exists in your library");
			error.statusCode = 400;
			throw error;
		}

		const item = user.wishlist.find((ele) => ele.toString() === productId);
		if (!item) {
			user.wishlist.push(productId);
			await user.save();
		}
		res.status(202).json({ message: "Added to wishlist successfully" });
	} catch (err) {
		next(err);
	}
};

exports.getWishlist = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).populate({
			path: "wishlist",
			populate: {
				path: "includes",
			},
		});
		res.status(200).json({ wishlist: user.wishlist });
	} catch (err) {
		next(err);
	}
};

exports.removeWishlist = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const user = await User.findById(req.userId);
		const updatedWishlist = user.wishlist.filter(
			(ele) => ele.toString() !== productId,
		);
		user.wishlist = updatedWishlist;
		await user.save();
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

exports.removeCart = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const user = await User.findById(req.userId);
		const updatedCart = user.cart.filter(
			(ele) => ele.product.toString() !== productId,
		);
		user.cart = updatedCart;
		await user.save();
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

exports.getLibrary = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).populate({
			path: "library.product",
			populate: {
				path: "includes",
			},
		});
		res.status(200).json({ library: user.library });
	} catch (err) {
		next(err);
	}
};

exports.updateAvatar = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId);
		const oldAvatar = user.avatar;
		user.avatar = req.file.path;
		await user.save();
		if (oldAvatar)
			await fs.unlink(oldAvatar).catch((err) => {
				if (err.code !== "ENOENT") throw err;
			});
		res.status(200).send();
	} catch (err) {
		next(err);
	}
};

exports.updateBio = async (req, res, next) => {
	try {
		const { bio } = req.body;
		const user = await User.findById(req.userId);
		user.bio = bio;
		await user.save();
		res.status(200).send();
	} catch (err) {
		next(err);
	}
};

exports.updateQuote = async (req, res, next) => {
	try {
		const { quote, author } = req.body;
		const user = await User.findById(req.userId);
		user.favQuote = { quote, author };
		await user.save();
		res.status(200).send();
	} catch (err) {
		next(err);
	}
};

exports.updateName = async (req, res, next) => {
	try {
		const { name } = req.body;
		const isExist = await User.findOne({ name });
		if (isExist) {
			const error = new Error("Name already exits");
			error.statusCode = 400;
			throw error;
		}
		const user = await User.findById(req.userId);
		const expiresAt = new Date(user.nameChangedAt);
		expiresAt.setDate(expiresAt.getDate() + 90);
		if (Date.now() < expiresAt) {
			const remainingDays = Math.ceil(
				(expiresAt.getTime() - Date.now()) / 86400000,
			);
			const error = new Error(
				`Wait ${remainingDays} to be able to change name again`,
			);
			error.statusCode = 400;
			throw error;
		}
		user.name = name;
		user.nameChangedAt = Date.now();
		await user.save();
		res.status(200).send();
	} catch (err) {
		next(err);
	}
};

exports.getFriendsList = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).populate(
			"friends",
			"name avatar",
		);
		res.status(200).json({ friendsList: user.friends });
	} catch (err) {
		next(err);
	}
};
exports.sendFriendRequest = async (req, res, next) => {
	try {
		const { targetId } = req.body;
		const senderId = req.userId;
		if (senderId === targetId) {
			const error = new Error("Cannot send friend request to yourself");
			error.statusCode = 400;
			throw error;
		}
		const targetUser = await User.exists({
			_id: targetId,
		});

		if (!targetUser) {
			const error = new Error("User does not exist");
			error.statusCode = 404;
			throw error;
		}
		const request = await friendRequest.findOne({
			$or: [
				{ sender: senderId, receiver: targetId },
				{ sender: targetId, receiver: senderId },
			],
		});
		const isFriend = await User.exists({ _id: senderId, friends: targetId });
		if (request || isFriend) {
			const error = new Error("Request already exists or already Friends");
			error.statusCode = 400;
			throw error;
		}
		const newRequest = new friendRequest({
			sender: senderId,
			receiver: targetId,
		});
		await newRequest.save();
		res.status(201).send();
	} catch (err) {
		next(err);
	}
};
exports.acceptFriendRequest = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		session.startTransaction();
		const { targetId } = req.body;
		const request = await friendRequest.findOne(
			{
				sender: targetId,
				receiver: req.userId,
			},
			null,
			{ session },
		);

		if (!request) {
			const error = new Error("Request does not exist");
			error.statusCode = 404;
			throw error;
		}
		await User.findByIdAndUpdate(
			req.userId,
			{
				$addToSet: { friends: targetId },
			},
			{ session },
		);

		await User.findByIdAndUpdate(
			targetId,
			{
				$addToSet: { friends: req.userId },
			},
			{ session },
		);
		await request.deleteOne({ session });
		await session.commitTransaction();
		res.status(204).send();
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};
exports.getPendingFriendRequests = async (req, res, next) => {
	try {
		const pendingRequests = await friendRequest
			.find({ receiver: req.userId })
			.populate("sender", "name avatar");
		res.status(200).json({ pendingRequests });
	} catch (err) {
		next(err);
	}
};

exports.cancelSendingFriendRequests = async (req, res, next) => {
	try {
		const { targetId } = req.body;
		const request = await friendRequest.findOne({
			sender: req.userId,
			receiver: targetId,
		});

		if (!request) {
			const error = new Error("Request does not exist");
			error.statusCode = 404;
			throw error;
		}
		await request.deleteOne();
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

exports.rejectFriendRequests = async (req, res, next) => {
	try {
		const { targetId } = req.body;
		const request = await friendRequest.findOne({
			sender: targetId,
			receiver: req.userId,
		});

		if (!request) {
			const error = new Error("Request does not exist");
			error.statusCode = 404;
			throw error;
		}
		await request.deleteOne();
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

exports.removeFriend = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		session.startTransaction();
		const { targetId } = req.body;
		const targetResult = await User.updateOne(
			{ _id: targetId, friends: req.userId },
			{
				$pull: { friends: req.userId },
			},
			{ session },
		);
		const userResult = await User.updateOne(
			{ _id: req.userId, friends: targetId },
			{
				$pull: { friends: targetId },
			},
			{ session },
		);
		if (targetResult.matchedCount === 0 || userResult.matchedCount === 0) {
			const error = new Error("User does not exist or they are not friends");
			error.statusCode = 404;
			throw error;
		}
		await session.commitTransaction();
		res.status(204).send();
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.searchFriend = async (req, res, next) => {
	try {
		const { name } = req.params;
		const usersList = await User.find({
			name: { $regex: name, $options: "i" },
		}).select("name avatar");
		res.status(200).json({ usersList });
	} catch (err) {
		next(err);
	}
};
exports.getProfile = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId)
			.select("name avatar role bio favQuote wishlist")
			.populate({
				path: "wishlist",
				populate: {
					path: "includes",
				},
			});
		if (!user) {
			const error = new Error("User does not exist");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ user });
	} catch (err) {
		next(err);
	}
};
exports.showMyProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId)
			.select("name avatar role bio quote favQuote wishlist")
			.populate({
				path: "wishlist",
				populate: {
					path: "includes",
				},
			});
		res.status(200).json({ user });
	} catch (err) {
		next(err);
	}
};

exports.getSentFriendRequests = async (req, res, next) => {
	try {
		const sentRequests = await friendRequest
			.find({ sender: req.userId })
			.populate("receiver", "name avatar");
		res.status(200).json({ sentRequests });
	} catch (err) {
		next(err);
	}
};

exports.sendGift = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { productId, promoCode, friendId, message } = req.body;
		const product = await Product.findOne({ _id: productId, isListed: true });
		if (!product) {
			const error = new Error("Product is not available");
			error.statusCode = 404;
			throw error;
		}
		const friend = await User.findOne({
			_id: friendId,
			friends: req.userId,
		});
		if (!friend) {
			const error = new Error("Friend not found");
			error.statusCode = 404;
			throw error;
		}
		const subTotal =
			product.discount > 0
				? (1 - product.discount / 100) * product.price
				: product.price;
		let discount = 0;
		let promo = null;
		if (promoCode) {
			const promoResult = await checkPromo(promoCode, subTotal);
			promo = promoResult.promo;
			discount = promoResult.discount;
			promo.usedCount += 1;
			await promo.save({ session });
		}
		const totalPrice = subTotal - discount;
		const gift = new Gift({
			sender: req.userId,
			receiver: friendId,
			product: productId,
			promo: promo._id || "",
			totalPrice,
			message: message || "",
		});
		await gift.save({ session });
		await session.commitTransaction();
		res.status(201).json({ gift });
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.getReceivedGifts = async (req, res, next) => {
	try {
		const gifts = await Gift.find({ receiver: req.userId })
			.populate("sender", "name avatar")
			.populate({
				path: "product",
				populate: {
					path: "includes",
				},
			});
		res.status(200).json({ gifts });
	} catch (err) {
		next(err);
	}
};

exports.acceptGift = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { giftId } = req.params;
		const gift = await Gift.findOne({ _id: giftId, receiver: req.userId });
		if (!gift) {
			const error = new Error("Gift not found");
			error.statusCode = 404;
			throw error;
		}
		if (gift.status !== "pending") {
			const error = new Error("Gift has already been accepted or rejected");
			error.statusCode = 400;
			throw error;
		}
		const user = await User.findById(req.userId);
		const token = crypto
			.randomBytes(12)
			.toString("hex")
			.toUpperCase()
			.match(/.{1,4}/g)
			.join("-");
		const owned = user.library.find(
			(ele) => ele.product.toString() === gift.product.toString(),
		);
		if (owned) owned.activationCodes.push(token);
		else user.library.push({ product: gift.product, activationCodes: [token] });
		gift.status = "accepted";
		await user.save({ session });
		await gift.save({ session });
		res.status(200).json({ message: "Gift accepted successfully" });
		await session.commitTransaction();
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.rejectGift = async (req, res, next) => {
	try {
		const { giftId } = req.params;
		const gift = await Gift.findOne({ _id: giftId, receiver: req.userId });
		if (!gift) {
			const error = new Error("Gift not found");
			error.statusCode = 404;
			throw error;
		}
		if (gift.status !== "pending") {
			const error = new Error("Gift has already been accepted or rejected");
			error.statusCode = 400;
			throw error;
		}
		gift.status = "rejected";
		await gift.save();
		res.status(200).json({ message: "Gift rejected successfully" });
	} catch (err) {
		next(err);
	}
};


