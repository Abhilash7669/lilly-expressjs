import express from "express";
import cors from "cors";
import { CORS_OPTIONS } from "./config/cors";
import { PORT } from "./config/env";


const app = express();

app.use(cors(CORS_OPTIONS));

app.get("/", (req, res) => {
    res.send("HELLO THERE");
});

app.listen(PORT, () => console.log(`Listening to PORT: ${PORT}`));
