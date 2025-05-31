import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";
import { encryptPassword } from "../utils/encrypt-password";
import { verifyPassword } from "../utils/verify-password";

export const authController = {
  
  signUp: async function (req: Request, res: Response, next: NextFunction) {

    try {
      const { userName, email, password } = await req.body;

      const emailExists = await User.findOne({ email: email });

      if (emailExists) {
        res.json({ success: false, message: "Email already in use" });
        return;
      }

      const userNameExists = await User.findOne({ userName });

      if(userNameExists) {
        res.json({ success: false, message: "Username is already taken" });
        return;
      }

      const hashedPassword = await encryptPassword(password);

      if(!hashedPassword) throw new Error("Could not generate hashed password");

      const newUser = await User.insertOne({ userName, email, password: hashedPassword });

      // @ts-ignore
      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET , {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.status(201).json({
        success: true,
        message: "Created account successfully!",
        data: {
          token: token,
          user: newUser
        }
      });

    } catch (error) {
      next(error);
    }
  },

  login: async function(req: Request, res: Response, next: NextFunction) {

    try {

      const { email, password } = await req.body;

      const userExists = await User.findOne({ email });

      if(!userExists) {
        res.status(401).json({ success: false, message: "No user found" });
        return;
      };

      const isVerifiedPassword = await verifyPassword(password, userExists.password);

      if(!isVerifiedPassword) {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
        return;
      };

      // @ts-ignore
      const token = jwt.sign({ userId: userExists._id }, JWT_SECRET || "secret", { expiresIn: JWT_EXPIRES_IN });
    
      res.status(201).json({
        success: true,
        message: "Welcome",
        data: {
          token
        }
      }); 

    } catch (error) {
      next(error); 
    }

  }

};
