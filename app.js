const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const logger = require("./log/logger");
const authRouter = require("./routes/auth");
const gamesRouter = require("./routes/admin");
const storeRouter = require("./routes/store");
const userRouter = require("./routes/user");
const promoRouter = require("./routes/promoCode");
const orderRouter = require("./routes/order");
const reviewRouter = require("./routes/review");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use((req, res, next) => {
	req.requestId = crypto.randomUUID();
	res.setHeader("X-Request-Id", req.requestId);
	const startedAt = Date.now();
	res.on("finish", () => {
		logger.info(
			`${req.requestId} ${req.method} ${req.originalUrl} ${res.statusCode} ${
				Date.now() - startedAt
			}ms`,
		);
	});
	next();
});

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(bodyParser.json());
app.use(
	morgan("combined", {
		stream: {
			write: (message) => logger.info(message.trim()),
		},
	}),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/auth", authRouter);
app.use("/admin", gamesRouter);
app.use("/store", storeRouter);
app.use("/user", userRouter);
app.use("/promo", promoRouter);
app.use("/order", orderRouter);
app.use("/review", reviewRouter);
app.use("/", (req, res) => {
	res.status(404).json({
		error: "This route does not exist",
	});
});

app.use((err, req, res, next) => {
	logger.error(
		`${req.requestId || "unknown"} ${req.method} ${req.originalUrl} ${
			err.statusCode || 500
		}: ${err.message || "Something went wrong"}`,
	);
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		message:
			statusCode >= 500
				? "Internal server error"
				: err.message || "Request failed",
		...(err.details ? { errors: err.details } : {}),
	});
});

const requiredEnvironment = [
	"DB_URL",
	"JWT_SECRET",
	"PORT",
	"FRONTEND_URL",
	"RESEND_API_KEY",
	"IGDB_ACCESS_TOKEN",
	"IGDB_CLIENT_ID",
];

const missingEnvironment = requiredEnvironment.filter(
	(key) => !process.env[key],
);

if (missingEnvironment.length) {
	logger.error(
		`Missing required environment variables: ${missingEnvironment.join(", ")}`,
	);
	process.exit(1);
} else {
	mongoose
		.connect(process.env.DB_URL)
		.then(() => {
			logger.info("Connected to MongoDB");
			app.listen(process.env.PORT, () => {
				logger.info(`Server listening on port ${process.env.PORT}`);
			});
		})
		.catch((error) => {
			logger.error(`MongoDB connection failed: ${error.message}`);
			process.exit(1);
		});
}
