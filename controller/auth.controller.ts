import { Request, Response, NextFunction } from "express";
import User from "../models/user/user.model";
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
        res.json({ success: false, title: "Error", message: "Email already in use" });
        return;
      }

      const userNameExists = await User.findOne({ userName });

      if (userNameExists) {
        res.json({ success: false, title: "Error", message: "Username is already taken" });
        return;
      }

      const hashedPassword = await encryptPassword(password);

      if (!hashedPassword)
        throw new Error("Could not generate hashed password");

      const newUser = await User.insertOne({
        userName,
        email,
        password: hashedPassword,
      });

      // @ts-ignore
      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.status(201).json({
        success: true,
        title: "Success",
        message: "Created account successfully!",
        data: {
          token: token,
          user: newUser,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  login: async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = await req.body;

      const userExists = await User.findOne({ email });

      if (!userExists) {
        res.status(400).json({ success: false, title: "Error", message: "No user found", status_code: 401 });
        return;
      }

      const isVerifiedPassword = await verifyPassword(
        password,
        userExists.password
      );

      if (!isVerifiedPassword) {
        res.status(401)
          .json({ success: false, title: "Error", message: "Invalid Credentials", status_code: 401 });
        return;
      }

      // @ts-ignore
      const token = jwt.sign(
        { userId: userExists._id },
        JWT_SECRET || "secret",
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        title: "Success",
        message: `Welcome ${userExists.userName}`,
        data: {
          token,
          userId: userExists._id
        },
      });
    } catch (error) {
      next(error);
    }
  },

  verify: async function (req: Request, res: Response) {
    const { token } = await req.body;

    if (!token) {
      res.json({ success: false, title: "Error", message: "Bad request" });
      return;
    }

    // @ts-ignore
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      iat: number;
      exp: number;
    };

    const user = await User.findById(decoded?.userId);

    if (!user) {
      res.json({ success: false, title: "Error", message: "Unauthorized" });
      return;
    }

    res.json({ success: true, title: "Success", message: "Authorized" });
  },
};
