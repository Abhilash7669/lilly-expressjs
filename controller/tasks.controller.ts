import { Response } from "express";
import Tasks from "../models/tasks/tasks.model";
import { BasicResponse } from "../config/basic-res";
import { AuthRequest } from "../config/interface";
import { Types } from "mongoose";

type TaskStatus = "todo" | "inProgress" | "done";
type Priority = "high" | "medium" | "low";
type Task = {
    userId: Types.ObjectId | string;
    order: number;
    content: string;
    status: TaskStatus;
    priority: Priority;
    tags: Array<string>;
  }

export const tasksController = {

  getTasks: async function (req: AuthRequest, res: Response) {

    const userId = req.userId;
    let response: BasicResponse | null = null;

    if (!userId) {
      response = {
        success: false,
        title: "Error",
        message: "Unauthorized",
      };
      res.json(response).status(401);
      return;
    }
    
    const userTasks = await Tasks.find({ 
      userId: userId
    })

    if (!userTasks) {
      response = {
        success: false,
        title: "Error",
        message: "No tasks found"
      }
      res.json(response).status(404);
      return;
    };

    if(userTasks.length === 0) {

      response = {
        success: true,
        title: "Welcome",
        message: "Add your first task",
      };

      res.json(response).status(200);
      return;
      
    }

    response = {
      success: true,
      title: "Success",
      message: "Fetched tasks",
      data: {
        tasks: userTasks
      }
    }

    res.json(response).status(200);
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
      res.json(response).status(401);
      return;
    }

    const userTask: {
      status: string;
      content: string;
      order: number;
      priority: string;
      tags: Array<string>;
    } = await req.body.task;

    if (!userTask) {
      response = {
        success: false,
        title: "Error",
        message: "No task found",
      };

      res.json(response).status(404);
      return;
    }

    const invalidTasks = !userTask.status || userTask.status.trim() === "" ;
    const invalidPriorityStatus = !userTask.priority || userTask.priority.trim() === "" ;
    const validTags = userTask.tags && userTask.tags.length > 0;

    const taskItem = await Tasks.insertOne({
      userId,
      order: userTask.order,
      content: userTask.content,
      status: invalidTasks ? "todo" : userTask.status ,
      priority: invalidPriorityStatus ?  "medium" : userTask.priority,
      tags: validTags ? userTask.tags : []
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

    res.json(response).status(200);
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
      res.json(response).status(401);
      return;
    }

    const userTask: {
      status: string;
      content: string;
      order: number;
      priority: string;
      tags: Array<string>;
    }[] = await req.body.task;

    if (!userTask) {
      response = {
        success: false,
        title: "Error",
        message: "No task found",
      };

      res.json(response).status(404);
      return;
    };

    const allTasks: Task[] = userTask.map(task => {

    const invalidTasks = !task.status || task.status.trim() === "" ;
    const invalidPriorityStatus = !task.priority || task.priority.trim() === "" ;
    const validTags = task.tags && task.tags.length > 0;

      return {
        userId,
        content: task.content,
        order: task.order,
        status: invalidTasks ? "todo" : task.status as TaskStatus,
        priority: invalidPriorityStatus ? "medium" : task.priority as Priority,
        tags: validTags ? task.tags : []
      };

    });

    const createdTasks = await Tasks.insertMany(allTasks);

    response = {
      success: true,
      title: "Success",
      message: "Added all items",
      data: {
        tasks: createdTasks
      }
    };

    res.json(response).status(200);

  }


};
