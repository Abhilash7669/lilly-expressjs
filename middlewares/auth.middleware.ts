import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user/user.model";
import { AuthRequest } from "../config/interface";
import { ObjectId } from "mongodb";


export default async function authorize(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
        return;
      }
      const decoded = jwt.verify(token, JWT_SECRET || "secret") as {
        userId: string;
        iat: number;
        exp: number;
      };

      const user = await User.findById(decoded?.userId);

      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      req.userId = new ObjectId(user._id).toString();
      
      next();
    }
  } catch (error) {
    res.status(401).json({ success: false, message: `Unauthorized: ${error}` });
  }
}
