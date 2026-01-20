import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";

export default async function isAuthenticated(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies.access_token ||
      req.cookies.seller_access_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { id: string; role: "user" | "seller" };

    let account
    if(decoded.role === "user"){
      account = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if(decoded.role === "seller") {
      account = await prisma.seller.findUnique({
        where: { id: decoded.id },
        include: { shop: true }
      });
      req.seller = account;
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }

    req.role = decoded.role
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Access token expired" });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
}
