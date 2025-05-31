import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user.model";

interface CustomRequest extends Request {
    user?: any;
}

export default async function authorize(req: CustomRequest, res: Response, next: NextFunction) {

    try {
        
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

            token = req.headers.authorization.split(" ")[1];

            if(!token) return res.status(401).json({ success: false, message: "Unauthorized" });

            const decoded = jwt.verify(token, JWT_SECRET || "secret") as { userId: string, iat: number, exp: number };

            const user = await User.findById(decoded?.userId);
            
            if(!user) return res.status(401).json({ success: false, message: "Unauthorized" });

            req.user = user;

            next();

        }

    } catch (error) {
        res.status(401).json({ success: false, message: `Unauthorized: ${error}` });
    }

}