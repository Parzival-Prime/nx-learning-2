import { Router } from "express";
import { loginUser, userForgotPassword, userRegistration, verifyUserForgotPasswordOtp, verifyUser, userResetPassword } from "@auth-service/src/controllers/auth.controller";

const router = Router()

router.post('/user-registration', userRegistration)
router.post('/verify-user', verifyUser)
router.post('/login-user', loginUser)
router.post('/user-forgot-password', userForgotPassword)
router.post('/verify-forgot-password-otp',  verifyUserForgotPasswordOtp)
router.post('/user-reset-password', userResetPassword)

export default router

