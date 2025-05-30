import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV === "development" ? "local" : "production"}`});

export const {
    PORT,
    NODE_ENV,
    SERVER_URL
} = process.env;