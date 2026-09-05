const authController = require("../controllers/auth");
const router = require("express").Router();
const validators = require("../validators/auth");
const { validateRequest } = require("../validators/common");

router.post("/login", validators.loginValidator, validateRequest, authController.login);
router.post("/signup", validators.signupValidator, validateRequest, authController.signup);
router.post(
	"/verify-email",
	validators.verifyEmailValidator,
	validateRequest,
	authController.verifyEmail,
);
router.post(
	"/resend-verification-email",
	validators.emailValidator,
	validateRequest,
	authController.resendVerificationEmail,
);
router.post(
	"/send-password-reset",
	validators.emailValidator,
	validateRequest,
	authController.sendPasswordResetEmail,
);
router.post(
	"/change-password",
	validators.changePasswordValidator,
	validateRequest,
	authController.changePassword,
);
module.exports = router;
