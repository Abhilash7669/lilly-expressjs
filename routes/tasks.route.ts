import { Router } from "express";
import authorize from "../middlewares/auth.middleware";
import { tasksController } from "../controller/tasks.controller";


const tasksRoute = Router();


tasksRoute.get("/:id", authorize, tasksController.getTasks);

tasksRoute.post("/:id/add", authorize, tasksController.postTask);

tasksRoute.post("/:id/add-all", authorize, tasksController.postTasks);


export default tasksRoute;