const Promocode = require("../models/Promocode");
const logger = require("../log/logger");

exports.checkPromo = async (promocode, subTotal) => {
	const promo = await Promocode.findOne({
		code: promocode.toUpperCase(),
		expiresAt: { $gt: Date.now() },
	});
	if (!promo) {
		const error = new Error("Invalid promocode");
		error.statusCode = 404;
		logger.warn("Invalid Promocode");
		throw error;
	}
	if (promo.usedCount >= promo.usageLimit) {
		const error = new Error("Promocode limit reached");
		error.statusCode = 400;
		logger.warn("Promocode Limit Reached");
		throw error;
	}
	if (subTotal < promo.minPurchase) {
		const error = new Error(
			`Add more products ,min purchase:${promo.minPurchase}`,
		);
		error.statusCode = 400;
		logger.warn(`Add more products ,min purchase:${promo.minPurchase}`);
		throw error;
	}
	const discount = Math.min(
		Number(promo.maxDiscount),
		(promo.percentage / 100) * subTotal,
	);
	return {
		promo,
		discount,
	};
};
