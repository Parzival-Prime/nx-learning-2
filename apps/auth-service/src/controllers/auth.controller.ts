import { Request, Response, NextFunction } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "@auth-service/src/utils/auth.helper";
import prisma from "@packages/libs/prisma"
import bcrypt from "bcryptjs"
import { AuthError, ValidationError } from "@packages/error-handler/index";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "@auth-service/src/utils/cookies/setCookies";

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


export async function refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies.refresh_token

        if (!refreshToken) {
            return res.status(401).json({ message: "Account not found!" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { id: string; role: "user" | "string" }
 
        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Invalid Refresh Token")
        }

        // let account;
        // if(decoded.role === "user"){
        const user = await prisma.user.findUnique({ where: { id: decoded.id } })
        // }
        if (!user) {
            return new AuthError("Forbidden! User not found.")
        }

        const newAccessToken = jwt.sign({
            id: decoded.id, role: decoded.role
        }, process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        )

        setCookie(res, "access_token", newAccessToken)
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