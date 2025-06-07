import { Response } from "express";
import Tasks from "../models/tasks/tasks.model";
import { BasicResponse } from "../config/basic-res";
import { AuthRequest } from "../config/interface";
import { Types } from "mongoose";

type TaskStatus = "todo" | "inProgress" | "done";
type Task = {
    userId: Types.ObjectId | string,
    order: number,
    content: string,
    status: TaskStatus,
  }

export const tasksController = {

  getTasks: async function (req: AuthRequest, res: Response) {
    const userId = req.userId;

    const userTasks = await Tasks.find({ userId });

    let response: BasicResponse | null = null;

    if (!userTasks) {
      response = {
        success: false,
        title: "Error",
        message: "No tasks found"
      }
      res.json(response);
      return;
    };

    response = {
      success: true,
      title: "Success",
      message: "Fetched tasks",
      data: {
        tasks: userTasks
      }
    }

    res.json(response);
  },

  postTask: async function (req: AuthRequest, res: Response) {
    const userId = req.userId;

    let response: BasicResponse | null = null;

    if (!userId) {
      response = {
        success: false,
        title: "Error",
        message: "Unauthorized",
      };
      res.json(response);
      return;
    }

    if(!req.params.id) {
      throw new Error("No params id found");
    };

    if(req.params.id !== userId) {
      response = {
        success: false,
        title: "Error",
        message: "Unauthorized",
      };
      res.json(response);
      return;
    }

    const userTask: {
      status: string;
      content: string;
      order: number;
    } = await req.body.task;

    if (!userTask) {
      response = {
        success: false,
        title: "Error",
        message: "No task found",
      };

      res.json(response);
      return;
    }

    const taskStatus = userTask.status.trim() === "" || !userTask.status;

    const taskItem = await Tasks.insertOne({
      userId,
      order: userTask.order,
      content: userTask.content,
      status: taskStatus ? userTask.status : "todo",
    });

    response = {
      success: true,
      title: "Success",
      message: "Added Successfully",
      data: {
        task: {
          taskItem,
          taskId: taskItem._id
        },
      },
    };

    res.json(response);
  },

  postTasks: async function(req: AuthRequest, res: Response) {
    
    const userId = req.userId;

    let response: BasicResponse | null = null;

    if (!userId) {
      response = {
        success: false,
        title: "Error",
        message: "Unauthorized",
      };
      res.json(response);
      return;
    }

    const userTask: {
      status: string;
      content: string;
      order: number;
    }[] = await req.body.task;

    if (!userTask) {
      response = {
        success: false,
        title: "Error",
        message: "No task found",
      };

      res.json(response);
      return;
    };

    const allTasks: Task[] = userTask.map(task => {

      if(task.status.trim() === "" || !task.status) {
        return {
          userId,
          content: task.content,
          order: task.order,
          status: "todo"
        };
      }

      return {
        userId,
        content: task.content,
        order: task.order,
        status: task.status as TaskStatus
      };

    });

    const addTasks = await Tasks.insertMany(allTasks);

    response = {
      success: true,
      title: "Success",
      message: "Added all items",
      data: {
        tasks: addTasks
      }
    };

    res.json(response);

  }


};
