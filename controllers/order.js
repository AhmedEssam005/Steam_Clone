const Order = require("../models/Order");
const Promocode = require("../models/Promocode");
const User = require("../models/User");
const { checkPromo } = require("../services/promoService");
const Product = require("../models/Product");

const logger = require("../log/logger");
const mongoose = require("mongoose");

exports.addOrder = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { promoCode } = req.body;
		const user = await User.findById(req.userId).populate("cart.product");
		const cart = user.cart;
		if (!cart.length) {
			const error = new Error("Empty Cart");
			error.statusCode = 400;
			logger.warn("Empty Cart");
			throw error;
		}
		const products = [];
		for (const ele of cart) {
			const product = await Product.findById(ele.product._id);
			if (!product || !product.isListed) {
				const error = new Error(
					`Product ${ele.product.name} not found or not listed`,
				);
				error.statusCode = 404;
				logger.warn(`Product ${ele.product.name} not found or not listed`);
				throw error;
			}
			const itemPrice =
				ele.product.discount > 0
					? ele.product.price * ((100 - ele.product.discount) / 100)
					: ele.product.price;
			products.push({
				product: ele.product,
				price: itemPrice,
				quantity: ele.quantity,
			});
		}

		let subTotal = 0;
		products.forEach((ele) => {
			subTotal += ele.price * ele.quantity;
		});
		let totalPrice = subTotal;
		let promoDiscount = 0;

		if (promoCode) {
			const { promo, discount } = await checkPromo(promoCode, totalPrice);
			promoDiscount = discount;
			totalPrice = Number((subTotal - discount).toFixed(2));
			promo.usedCount += 1;
			await promo.save({ session });
		}
		const order = new Order({
			user: req.userId,
			products,
			totalPrice,
			subTotal,
			promoCode,
			promoDiscount,
			purchasedAt: Date.now(),
		});
		await order.save({ session });
		user.cart = [];
		await user.save({ session });
		await session.commitTransaction();
		res.status(201).json({ message: "Order created successfully", order });
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.getOrders = async (req, res, next) => {
	try {
		const orders = await Order.find({ user: req.userId }).populate({
			path: "products.product",
			populate: {
				path: "includes",
			},
		});
		res.status(200).json({ orders });
	} catch (err) {
		next(err);
	}
};
