import { CorsOptions } from "cors";
import { SERVER_URL } from "./env";

export const CORS_OPTIONS: CorsOptions = {
    // @ts-ignore
    origin: ["http://localhost:3000", SERVER_URL],
    optionsSuccessStatus: 201
};