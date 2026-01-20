import { AuthError } from "@packages/error-handler";
import { Response, NextFunction } from "express";

export function isSeller (req: any, res: Response, next: NextFunction){
    if(req.role !== "seller"){
        return next(new AuthError("Access denied: Seller Only"))
    }
    next()
}

export function isUser (req: any, res: Response, next: NextFunction){
    if(req.role !== "user"){
        return next(new AuthError("Access denied: User Only"))
    }
    next()
}