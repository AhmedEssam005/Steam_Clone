const fs = require("fs").promises;
const path = require("path");

const Game = require("../models/Game");
const Product = require("../models/Product");
const Order = require("../models/Order");
const logger = require("../log/logger");
const igdb = require("../services/igdbServices");
const imageServices = require("../services/imageServices");
const crypto = require("crypto");
const { Resend } = require("resend");
const User = require("../models/User");
const resend = new Resend(process.env.RESEND_API_KEY);
const mongoose = require("mongoose");

exports.searchByName = async (req, res, next) => {
	try {
		const { name } = req.query;
		if (!name) {
			const error = new Error("Missing Game Name");
			error.statusCode = 400;
			logger.error(`Missing GameName Param`);
			throw error;
		}
		logger.info(`Admin game search requested: ${name}`);
		const igdbGame = await igdb.searchByName(name);
		res.status(200).json(igdbGame);
	} catch (err) {
		next(err);
	}
};

exports.addBaseGame = async (req, res, next) => {
	try {
		const { gameExtId } = req.body;
		const isGameExist = await Game.findOne({ externalId: gameExtId });
		if (isGameExist) {
			const error = new Error("Game Already Exists");
			error.statusCode = 409;
			logger.warn(`${isGameExist.title} Already Exists in DB`);
			throw error;
		}
		const igdbGame = await igdb.searchByID(gameExtId);
		const { cover, screenshots } =
			await imageServices.downloadGameImages(igdbGame);
		const savedGame = new Game({
			externalId: igdbGame.id,
			title: igdbGame.name,
			description: igdbGame.summary,
			cover,
			screenshots,
			genres: igdbGame.genres?.map((genre) => genre.name) || [],
			developers:
				igdbGame.involved_companies
					?.filter((company) => company.developer)
					.map((company) => company.company.name) || [],
			publishers:
				igdbGame.involved_companies
					?.filter((company) => company.publisher)
					.map((company) => company.company.name) || [],
			releaseDate: igdbGame.first_release_date
				? new Date(igdbGame.first_release_date * 1000)
				: undefined,
			externalRating: {
				rating: igdbGame.rating || 0,
				count: igdbGame.total_rating_count || 0,
			},
			userRating: {
				rating: 0,
				count: 0,
			},
			supportedLanguages:
				igdbGame.language_supports?.map((lang) => lang.language.name) || [],
			dlcs: [],
			type: "Base Game",
		});
		await savedGame.save();
		res.status(201).json({
			message: "Game Added Successfully",
			_id: savedGame._id,
			externalId: savedGame.externalId,
		});
	} catch (err) {
		next(err);
	}
};

exports.getDlcs = async (req, res, next) => {
	try {
		const { gameId } = req.params;
		const dlcs = await igdb.getDlcs(gameId);
		if (!dlcs) {
			return res.status(200).json({ message: "No dlcs found" });
		}
		return res
			.status(200)
			.json({ message: "Successfully retrieve dlcs", dlcs });
	} catch (err) {
		next(err);
	}
};

exports.addDlcs = async (req, res, next) => {
	try {
		const { parentGameId, dlcs } = req.body;
		const parentGame = await Game.findById(parentGameId);

		if (!parentGame) {
			const error = new Error("Parent game does not exist");
			error.statusCode = 404;
			throw error;
		}
		if (parentGame.type !== "Base Game") {
			const error = new Error("Parent must be a base game");
			error.statusCode = 400;
			throw error;
		}
		const savedDlcs = [];
		if (!dlcs.length) {
			const error = new Error("No dlcs given");
			error.statusCode = 400;
			throw error;
		}
		for (const dlcExtId of dlcs) {
			const existingDlc = await Game.findOne({
				externalId: dlcExtId,
			});

			if (existingDlc) {
				savedDlcs.push(existingDlc._id);
				continue;
			}
			const igdbGame = await igdb.searchByID(dlcExtId);
			const { cover, screenshots } =
				await imageServices.downloadGameImages(igdbGame);
			const savedDlc = new Game({
				externalId: dlcExtId,
				title: igdbGame.name,
				description: igdbGame.summary,
				cover,
				screenshots,
				parentGame: parentGameId,
				type: "DLC",
				genres: igdbGame.genres?.map((genre) => genre.name) || [],
				developers:
					igdbGame.involved_companies
						?.filter((company) => company.developer)
						.map((company) => company.company.name) || [],
				publishers:
					igdbGame.involved_companies
						?.filter((company) => company.publisher)
						.map((company) => company.company.name) || [],
				releaseDate: igdbGame.first_release_date
					? new Date(igdbGame.first_release_date * 1000)
					: undefined,
				externalRating: {
					rating: igdbGame.rating || 0,
					count: igdbGame.total_rating_count || 0,
				},
				userRating: {
					rating: 0,
					count: 0,
				},
				supportedLanguages:
					igdbGame.language_supports?.map((lang) => lang.language.name) || [],
				dlcs: [],
			});
			await savedDlc.save();
			savedDlcs.push(savedDlc._id);
		}
		await Game.findByIdAndUpdate(parentGameId, { dlcs: savedDlcs });
		res.status(201).json({ message: "Successfully added dlcs" });
	} catch (err) {
		next(err);
	}
};

exports.addProduct = async (req, res, next) => {
	try {
		const { type, gameId, includes, price, discount } = req.body;

		let productIncludes = [];
		let name;

		if (type === "Base Game" || type === "DLC") {
			if (!gameId) {
				const error = new Error("Game ID is required");
				error.statusCode = 400;
				throw error;
			}

			const game = await Game.findById(gameId);

			if (!game) {
				const error = new Error("Game does not exist");
				error.statusCode = 404;
				throw error;
			}

			if (game.type !== type) {
				const error = new Error(`Selected game is not a ${type}`);
				error.statusCode = 400;
				throw error;
			}

			productIncludes = [game._id];
			name = game.title;
		} else if (type === "Bundle") {
			if (!Array.isArray(includes) || includes.length === 0) {
				const error = new Error("Bundle must contain at least one game");
				error.statusCode = 400;
				throw error;
			}

			const games = await Game.find({
				_id: { $in: includes },
			});

			if (games.length !== includes.length) {
				const error = new Error("One or more included games do not exist");
				error.statusCode = 400;
				throw error;
			}

			productIncludes = games.map((game) => game._id);

			name = req.body.name;
		} else {
			const error = new Error("Invalid product type");
			error.statusCode = 400;
			throw error;
		}

		const product = new Product({
			name,
			type,
			includes: productIncludes,
			price,
			discount: discount || 0,
		});

		await product.save();

		res.status(201).json({
			message: "Product created successfully",
			product,
		});
	} catch (err) {
		next(err);
	}
};

exports.getGames = async (req, res, next) => {
	try {
		const games = await Game.find();
		res.status(200).json(games);
	} catch (err) {
		next(err);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find().populate("includes");
		res.status(200).json(products);
	} catch (err) {
		next(err);
	}
};

exports.unlistProduct = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const product = await Product.findById(productId);
		if (!product) {
			const error = new Error("Product does not exist");
			error.statusCode = 404;
			throw error;
		}
		product.isListed = false;
		await product.save();
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

exports.editProduct = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const { name, price, discount, isListed } = req.body;
		const product = await Product.findByIdAndUpdate(
			productId,
			{ name, price, discount, isListed },
			{ new: true },
		);
		if (!product) {
			const error = new Error("Product does not exist");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json(product);
	} catch (err) {
		next(err);
	}
};

exports.confirmOrder = async (req, res, next) => {
	const session = await mongoose.startSession();
	try {
		await session.startTransaction();
		const { orderId } = req.params;
		const order = await Order.findById(orderId).populate("products.product");

		if (!order) {
			const error = new Error("Order does not exist");
			error.statusCode = 404;
			logger.warn("Invalid orderId");
			throw error;
		}

		if (order.status === "succeed") {
			const error = new Error("Order already confirmed");
			error.statusCode = 400;
			logger.warn("Order already confirmed");
			throw error;
		}

		for (const item of order.products) {
			item.activationCodes = [];
			await Product.findByIdAndUpdate(item.product, {
				$inc: { copiesSold: item.quantity },
			});
			for (let i = 0; i < item.quantity; i++) {
				const token = crypto
					.randomBytes(12)
					.toString("hex")
					.toUpperCase()
					.match(/.{1,4}/g)
					.join("-");

				item.activationCodes.push(token);
			}
		}

		order.status = "succeed";
		const user = await User.findById(order.user);
		order.products.forEach((ele) => {
			const item = user.library.find(
				(p) => p.product.toString() === ele.product._id.toString(),
			);

			if (!item) {
				user.library.push({
					product: ele.product._id,
					activationCodes: ele.activationCodes,
				});
			} else {
				item.activationCodes.push(...ele.activationCodes);
			}
		});

		await order.save({ session });
		await user.save({ session });

		const productsHtml = order.products
			.map(
				(product) => `
                    <div>
                        <h3>${product.product.name}</h3>
                        <p>Quantity: ${product.quantity}</p>
                        <p><strong>Activation Codes:</strong></p>
                        <ul>
                            ${product.activationCodes
															.map((code) => `<li>${code}</li>`)
															.join("")}
                        </ul>
                    </div>
                `,
			)
			.join("");

		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: user.email,
			subject: "Your order has been confirmed",
			html: `
                <h2>Order Confirmed</h2>

                <p>
                    Your order <strong>${order._id}</strong>
                    has been confirmed successfully.
                </p>

                ${productsHtml}

                <p>
                    You can also find your games and activation
                    codes in your library.
                </p>
            `,
		});

		await session.commitTransaction();
		res.status(202).json({
			message: "Order confirmed successfully and email has been sent",
		});
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

exports.getOrderDetails = async (req, res, next) => {
	try {
		const { orderId } = req.params;
		const order = await Order.findById(orderId).populate("products.product");
		if (!order) {
			const error = new Error("Invalid Order");
			error.statusCode = 404;
			logger.warn("Invalid OrderID");
			throw error;
		}
		res.status(200).json({ order });
	} catch (err) {
		next(err);
	}
};
exports.getPendingOrders = async (req, res, next) => {
	try {
		const orders = await Order.find({ status: "pending" }).populate(
			"products.product",
		);
		res.status(200).json({ orders });
	} catch (err) {
		next(err);
	}
};
