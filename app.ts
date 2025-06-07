import express from "express";
import cors from "cors";
import { CORS_OPTIONS } from "./config/cors";
import { PORT } from "./config/env";
import connectToDatabase from "./database/mongodb";
import authRoute from "./routes/auth.route";
import tasksRoute from "./routes/tasks.route";


const app = express();

app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/api/v1/lilly/auth", authRoute);
app.use("/api/v1/lilly/tasks", tasksRoute);

app.listen(PORT, async () => {
    console.log(`Listening in PORT: ${PORT}`);
    await connectToDatabase();
});
