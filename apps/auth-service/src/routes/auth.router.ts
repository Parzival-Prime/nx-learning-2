import { Router } from "express";
import { loginUser, userForgotPassword, userRegistration, verifyUserForgotPasswordOtp, verifyUser, userResetPassword, refreshToken, getUser } from "@auth-service/src/controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated"

const router = Router()

router.post('/user-registration', userRegistration)
router.post('/verify-user', verifyUser)
router.post('/login-user', loginUser)
router.post('/user-forgot-password', userForgotPassword)
router.post('/verify-forgot-password-otp',  verifyUserForgotPasswordOtp)
router.post('/user-reset-password', userResetPassword)
router.post('/refresh-token-user', refreshToken)
router.get('/logged-in-user', isAuthenticated, getUser)

export default router

