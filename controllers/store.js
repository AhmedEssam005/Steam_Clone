const Product = require("../models/Product");
exports.getProduct = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const product = await Product.findOne({
			_id: productId,
			isListed: true,
		}).populate("includes");
		if (!product) {
			const error = new Error("Product does not exist");
			error.statusCode = 404;
			throw error;
		}
		product.views += 1;
		await product.save();
		res.status(200).json(product);
	} catch (err) {
		next(err);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const {
			genres,
			developers,
			publishers,
			search,
			sort,
			minPrice,
			maxPrice,
			releaseDate,
			page = 1,
			limit = 10,
			deals,
		} = req.query;
		const filter = [
			{
				$match: {
					isListed: true,
				},
			},
		];
		if (deals === "true") {
			filter.push({ $match: { discount: { $gt: 0 } } });
		}
		if (minPrice || maxPrice) {
			const priceFilter = {};

			if (minPrice) {
				priceFilter.$gte = Number(minPrice);
			}

			if (maxPrice) {
				priceFilter.$lte = Number(maxPrice);
			}

			filter.push({
				$match: {
					price: priceFilter,
				},
			});
		}
		filter.push({
			$lookup: {
				from: "games",
				localField: "includes",
				foreignField: "_id",
				as: "games",
			},
		});

		if (genres) {
			filter.push({
				$match: {
					"games.genres": genres,
				},
			});
		}
		if (releaseDate) {
			const year = Number(releaseDate);
			const start = new Date(`${year}-01-1`);
			const end = new Date(`${year + 1}-01-1`);
			filter.push({
				$match: {
					"games.releaseDate": {
						$gte: start,
						$lt: end,
					},
				},
			});
		}
		if (developers) {
			filter.push({
				$match: {
					"games.developers": developers,
				},
			});
		}

		if (publishers) {
			filter.push({
				$match: {
					"games.publishers": publishers,
				},
			});
		}
		if (search) {
			filter.push({
				$match: {
					"games.title": {
						$regex: search,
						$options: "i",
					},
				},
			});
		}

		const allowedSorts = [
			"price",
			"-price",
			"views",
			"-views",
			"copiesSold",
			"-copiesSold",
			"createdAt",
			"-createdAt",
		];

		if (sort) {
			if (!allowedSorts.includes(sort)) {
				const error = new Error("Invalid sort option");
				error.statusCode = 400;
				throw error;
			}

			const field = sort.startsWith("-") ? sort.substring(1) : sort;

			const direction = sort.startsWith("-") ? -1 : 1;

			filter.push({
				$sort: {
					[field]: direction,
				},
			});
		} else {
			filter.push({
				$sort: {
					copiesSold: -1,
				},
			});
		}

		const skip = (Number(page) - 1) * Number(limit);

		filter.push({
			$facet: {
				products: [{ $skip: skip }, { $limit: Number(limit) }],

				total: [{ $count: "count" }],
			},
		});

		const result = await Product.aggregate(filter);
		const products = result[0].products;
		const count = result[0].total[0]?.count || 0;
		res.status(200).json({
			products,
			page,
			limit,
			total: count,
			totalPages: Math.ceil(count / limit),
		});
	} catch (err) {
		next(err);
	}
};
