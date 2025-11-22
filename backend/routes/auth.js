import express from 'express';
import {
    signup,
    verifyEmail,
    resendOTP,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    updateProfile,
    changePassword,
    logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
    validate,
    signupValidation,
    loginValidation,
    otpValidation,
    emailValidation,
    resetPasswordValidation,
    changePasswordValidation,
} from '../middleware/validator.js';


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
router.post('/logout', protect, logout);

export default router;
