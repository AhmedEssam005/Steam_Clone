const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/profile");
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const fname = `${req.userId}-${Date.now()}.${ext}`;
		cb(null, fname);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else
		cb(new Error("Only JPEG, PNG, JPG, and WebP images are allowed"), false);
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});

module.exports = upload;
