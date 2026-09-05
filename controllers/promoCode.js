const PromoCode = require("../models/Promocode");
const { checkPromo } = require("../services/promoService");
const logger = require("../log/logger");

exports.checkPromo = async (req, res, next) => {
	try {
		const { promoCode, subTotal } = req.body;
		const result = await checkPromo(promoCode, Number(subTotal));
		res.status(200).json({
			promoCode: result.promo.code,
			discount: result.discount,
			totalPrice: (Number(subTotal) - result.discount).toFixed(2),
		});
	} catch (err) {
		next(err);
	}
};

exports.getAllPromos = async (req, res, next) => {
	try {
		const promos = await PromoCode.find();
		res.status(200).json({ promos });
	} catch (err) {
		next(err);
	}
};

exports.addPromo = async (req, res, next) => {
	try {
		const { code, percentage, minPurchase, maxDiscount, usageLimit, lifetime } =
			req.body;
		const promo = new PromoCode({
			code,
			percentage,
			minPurchase,
			maxDiscount,
			usageLimit,
			expiresAt: new Date(Date.now() + lifetime * 24 * 60 * 60 * 1000),
		});
		await promo.save();
		res.status(201).json({ message: "Promo code created successfully", promo });
	} catch (err) {
		next(err);
	}
};
