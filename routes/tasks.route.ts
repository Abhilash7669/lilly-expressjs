import { Router } from "express";
import authorize from "../middlewares/auth.middleware";
import { tasksController } from "../controller/tasks.controller";


const tasksRoute = Router();


tasksRoute.get("/", authorize, tasksController.getTasks);

tasksRoute.post("/add", authorize, tasksController.postTask);

tasksRoute.post("/add-all", authorize, tasksController.postTasks);

tasksRoute.put("/update/:id", authorize, tasksController.updateTasks);

tasksRoute.put("/edit/:id", authorize, tasksController.editTask);

tasksRoute.delete("/delete/:id", authorize, tasksController.deleteTask);

export default tasksRoute;