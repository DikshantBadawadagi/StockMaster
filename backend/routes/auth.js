const express = require('express');
const {
    signup,
    verifyEmail,
    resendOTP,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
    validate,
    signupValidation,
    loginValidation,
    otpValidation,
    emailValidation,
    resetPasswordValidation,
    changePasswordValidation,
} = require('../middleware/validator');

const router = express.Router();

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/verify-email', otpValidation, validate, verifyEmail);
router.post('/resend-otp', emailValidation, validate, resendOTP);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', emailValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

module.exports = router;
