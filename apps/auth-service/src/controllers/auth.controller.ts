import { Request, Response, NextFunction } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "@auth-service/src/utils/auth.helper";
import prisma from "@packages/libs/prisma"
import bcrypt from "bcryptjs"
import { AuthError, ValidationError } from "@packages/error-handler/index";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "@auth-service/src/utils/cookies/setCookies";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover"
})

// User Controllers

export async function userRegistration(req: Request, res: Response, next: NextFunction) {
    try {
        validateRegistrationData(req.body, "user")
        const { name, email } = req.body

        const userExists = await prisma.user.findUnique({ where: { email } })

        if (userExists) {
            return next(new ValidationError("User with this email already exists!"))
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "user-activation-mail")

        res.status(200).json({
            message: "OTP sent to Email, Please verify your account."
        })
    } catch (error) {
        next(error)
    }
}


export async function verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password, otp } = req.body
        if (!name || !email || !password || !otp) {
            return next(new ValidationError("All fields required!"))
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"))
        }

        await verifyOtp(email, otp, next)
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        })

        return res.status(201).json({
            succes: true,
            message: "User created successfully!"
        })
    } catch (error) {
        return next(error)
    }
}


export async function loginUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new ValidationError("Email and Password are required!"))
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) return next(new AuthError("User doesn't exist!"))

        const isMatch = await bcrypt.compare(password, user.password!)

        if (!isMatch) {
            return next(new AuthError("Invalid emaail or password"))
        }

        res.clearCookie('seller_access_token')
        res.clearCookie('seller_refresh_token')

        const accessToken = jwt.sign({ id: user.id, role: "user" }, process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign({ id: user.id, role: "user" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        setCookie(res, "refresh_token", refreshToken)
        setCookie(res, "access_token", accessToken)

        return res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, email: user.email, name: user.name }
        })

    } catch (error) {
        return next(error)
    }
}


export async function userForgotPassword(req: Request, res: Response, next: NextFunction) {
    await handleForgotPassword(req, res, next, "user")
}


export async function verifyUserForgotPasswordOtp(req: Request, res: Response, next: NextFunction) {
    await verifyForgotPasswordOtp(req, res, next)
}


export async function userResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, newPassword } = req.body

        if (!email || !newPassword) {
            return next(new ValidationError("Email and new Password are required!"))
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) return next(new ValidationError("User not found!"))

        const isSamePassword = await bcrypt.compare(newPassword, user.password!)

        if (isSamePassword) {
            return next(new ValidationError("New password cannot be the same as old password!"))
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        })

        return res.status(200).json({
            message: "Password reset successfully!"
        })
    } catch (error) {
        return next(error)
    }
}


export async function refreshToken(req: any, res: Response, next: NextFunction) {
    try {
            const refreshToken =
              req.cookies.refresh_token ||
              req.cookies.seller_refresh_token ||
              req.headers.authorization?.split(" ")[1]; 

        if (!refreshToken) {
            return res.status(401).json({ message: "Account not found!" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { id: string; role: "user" | "seller" }

        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Invalid Refresh Token")
        }

        let account;
        if(decoded.role === "user"){
            account = await prisma.user.findUnique({ where: { id: decoded.id } })
        } else if(decoded.role === "seller") {
            account = await prisma.seller.findUnique({ where: { id: decoded.id }, include: { shop: true } })
        }


        if (!account) {
            return new AuthError("Forbidden! User not found.")
        }

        const newAccessToken = jwt.sign({
            id: decoded.id, role: decoded.role
        }, process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        if(decoded.role === "user") {
            setCookie(res, "access_token", newAccessToken)
        } else if(decoded.role === "seller") {
            setCookie(res, "seller_access_token", newAccessToken)
        }

        req.role = decoded.role

        return res.status(200).json({ success: true })
    } catch (error) {
        return next(error)
    }
}


export async function getUser(req: any, res: Response, next: NextFunction) {
    try {
        const user = req.user
        return res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        next(error)
    }
}




// Seller Controllers
export async function registerSeller(req: Request, res: Response, next: NextFunction) {
    try {
        validateRegistrationData(req.body, "seller")
        const { name, email } = req.body

        const existingSeller = await prisma.seller.findUnique({
            where: { email }
        })

        if (existingSeller) {
            return new ValidationError("Seller already exists with this email!")
        }

        await checkOtpRestrictions(email, next)
        await trackOtpRequests(email, next)
        await sendOtp(name, email, "seller-activation-mail")

        res.status(200).json({
            message: "OTP sent to Email, Please verify your account."
        })
    } catch (error) {
        next(error)
    }
}

// verify seller OTP
export async function verifySeller(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, otp, password, phone_number, country } = req.body

        if (!name || !email || !otp || !password) {
            return next(new ValidationError("All fields are required!"))
        }

        const existingSeller = await prisma.seller.findUnique({ where: { email } })

        if (existingSeller) {
            return next(new ValidationError("Seller already exists with this email"))
        }

        await verifyOtp(email, otp, next)
        const hashedPassword = await bcrypt.hash(password, 10)

        const seller = await prisma.seller.create({
            data: {
                name,
                email,
                password: hashedPassword,
                country,
                phone_number
            }
        })

        res.status(201).json({
            seller, message: "Seller registered successfully!"
        })
    } catch (error) {
        next(error)
    }
}

export async function loginSeller(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new ValidationError("Email and Password are required!"))
        }

        const seller = await prisma.seller.findUnique({
            where: { email }
        })

        if (!seller) return next(new ValidationError("Invalid email or Password!"))

        const isMatch = await bcrypt.compare(password, seller.password)

        if (!isMatch) {
            return next(new ValidationError("Invalid Email or Password!"))
        }

        res.clearCookie('access_token')
        res.clearCookie('refresh_token')

        const accessToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        setCookie(res, "seller_refresh_token", refreshToken)
        setCookie(res, "seller_access_token", accessToken)

        res.status(200).json({
            message: "Login successful!",
            seller: { id: seller.id, email: seller.email, name: seller.name }
        })
    } catch (error) {
        next(error)
    }
}

export async function getSeller(req: any, res: Response, next: NextFunction) {
    try {
        const seller = req.seller
        res.status(201).json({
            success: true,
            seller
        })
    } catch (error) {
        next(error)
    }
}

export async function createShop(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.body)
        const { name, address, description, openingHours, website, category, sellerId } = req.body


        if (!name || !description || !address || !sellerId || !openingHours || !category) {
            return next(new ValidationError('All fields are required!'))
        }

        const shopData = {
            name, address, description, openingHours, website, category, sellerId
        }

        if (website && website.trim() === "") {
            shopData.website = website
        }

        const shop = await prisma.shop.create({
            data: {
                name,
                address,
                description,
                openingHours,
                website,
                category,
            }
        })

        await prisma.seller.update({
            where: { id: sellerId },
            data: {
                shop: {
                    connect: { id: shop.id }
                }
            }
        })

        res.status(201).json({
            success: true,
            shop
        })

    } catch (error) {
        next(error)
    }
}

// create stripe account link  
export async function createStripeConnectLink(req: Request, res: Response, next: NextFunction) {
    try {
        const { sellerId } = req.body
        if (!sellerId) return next(new ValidationError("Seller ID is required!"))

        const seller = await prisma.seller.findUnique({
            where: {
                id: sellerId
            }
        })

        if (!seller) {
            return next(new ValidationError("Seller is not available with this Id!"))
        }

        const account = await stripe.accounts.create({
            type: "express",
            email: seller?.email,
            country: "US",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            }
        })

        await prisma.seller.update({
            where: {
                id: sellerId,
            },
            data: {
                stripeId: account.id
            }
        })

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/pending`,
            return_url: `http://localhost:3000/success`,
            type: "account_onboarding"
        })

        res.json({ url: accountLink.url })
    } catch (error) {
        return next(error)
    }
}