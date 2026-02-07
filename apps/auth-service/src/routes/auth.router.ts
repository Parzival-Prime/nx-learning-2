import { Router } from "express";
import { loginUser, userForgotPassword, userRegistration, verifyUserForgotPasswordOtp, verifyUser, userResetPassword, refreshToken, getUser, registerSeller, verifySeller, createShop, createStripeConnectLink, loginSeller, getSeller, addUserAddress, deleteUserAddress, getUserAddresses } from "@auth-service/src/controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated"
import { isSeller } from "@packages/middleware/authorizeRoles"

const router = Router()

// user routes
router.post('/user-registration', userRegistration)
router.post('/verify-user', verifyUser)
router.post('/login-user', loginUser)
router.post('/user-forgot-password', userForgotPassword)
router.post('/verify-forgot-password-otp',  verifyUserForgotPasswordOtp)
router.post('/user-reset-password', userResetPassword)
router.post('/refresh-token', refreshToken)
router.get('/logged-in-user', isAuthenticated, getUser)

// seller routes
router.post('/seller-registration', registerSeller)
router.post('/seller-verification', verifySeller)
router.post('/shop-registration', createShop)
router.post('/create-stripe-link', createStripeConnectLink)
router.post('/login-seller', loginSeller)
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller)

// address routes
router.get("/shipping-addresses", isAuthenticated, getUserAddresses)
router.post("/add-address", isAuthenticated, addUserAddress)
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress)

export default router

