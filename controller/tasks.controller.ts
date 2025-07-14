import { Response } from "express";
import Tasks from "../models/tasks/tasks.model";
import { BasicResponse } from "../config/basic-res";
import { AuthRequest } from "../config/interface";
import { Types } from "mongoose";
import { BulkWriteResult } from "mongodb";
import { UpdateWriteOpResult } from "mongoose";
import { CreateTaskPayload, TaskColumns } from "../types/tasks/tasks.types";
import { validateUserTask } from "../utils/tasks.utils";

type TaskStatus = "todo" | "inProgress" | "done";
type Priority = "high" | "medium" | "low";
type Task = {
  userId: Types.ObjectId | string;
  order: number;
  summary: string;
  status: TaskStatus;
  priority: Priority;
  tags: Array<string>;
};

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
      userId: userId,
      isArchived: false
    });

    if (!userTasks) {
      response = {
        success: false,
        title: "Error",
        message: "No tasks found",
      };
      res.json(response).status(404);
      return;
    }

    if (userTasks.length === 0) {
      response = {
        success: true,
        title: "Welcome",
        message: "Add your first task",
      };

      res.json(response).status(200);
      return;
    }

    const columns: Array<TaskColumns> = [
      {
        status: "todo",
        items: [],
      },
      {
        status: "inProgress",
        items: [],
      },
      {
        status: "done",
        items: [],
      },
    ];

    userTasks.forEach((item) => {
      const column = columns.find((c) => c.status === item.status);
      if (column) column.items.push(item);
    });

    const orderedColumns = columns.map((item) => {
      if (item.items.length === 0) return item;

      return {
        status: item.status,
        items: item.items.sort((a, b) => a.order - b.order),
      };
    });

    response = {
      success: true,
      title: "Success",
      message: "Fetched tasks",
      data: {
        tasks: orderedColumns,
      },
    };

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

    const userTask: CreateTaskPayload = await req.body.task;

    if (!userTask) {
      response = {
        success: false,
        title: "Error",
        message: "No task found",
      };

      res.json(response).status(404);
      return;
    }

    const {
      invalidTasks,
      hasSubTasks,
      invalidDate,
      invalidName,
      invalidPriorityStatus,
      validTags,
    } = validateUserTask(userTask);

    if (invalidName || invalidDate) {
      response = {
        success: false,
        title: "Error",
        message: "Invalid data",
      };
      res.json(response).status(400);
      return;
    }

    const date = new Date();
    const today = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );

    const invalidStartDate = new Date(userTask.date.startDate) < today;

    if (invalidStartDate) {
      response = {
        success: false,
        title: "Error",
        message: "Invalid start date",
      };
      res.json(response).status(400);
      return;
    }

    const taskItem = await Tasks.insertOne({
      userId,
      order: userTask.order,
      summary: userTask.summary,
      status: invalidTasks ? "todo" : userTask.status,
      priority: invalidPriorityStatus ? "medium" : userTask.priority,
      tags: validTags ? userTask.tags : [],
      name: userTask.name,
      startDate: userTask.date.startDate,
      dueDate: userTask.date.dueDate,
      subTasks: hasSubTasks ? userTask.subTasks : [],
      completedAt: userTask.completedAt || "",
      deletedAt: userTask.deletedAt || "",
      isArchived: userTask.isArchived || false,
    });

    response = {
      success: true,
      title: "Success",
      message: "Added Successfully",
      data: {
        task: {
          taskItem,
        },
      },
    };

    res.json(response).status(200);
  },

  deleteTask: async function (req: AuthRequest, res: Response) {
    const userId = req.userId;
    const taskId = req.params.id;
    const status = req.query.status;

    let response: BasicResponse | null;

    if (!taskId) {
      response = {
        success: false,
        title: "Error",
        message: "No id found in params",
      };
      res.json(response).status(404);
      return;
    }
    if (!userId) {
      response = {
        success: false,
        title: "Error",
        message: "Unauthorized user detected",
      };
      res.status(401).json(response);
      return;
    }

    const highestOrderTask = await Tasks.findOne({
      userId: { $eq: userId },
      status: status,
    }).sort({ order: -1 });
    const deletedTask = await Tasks.findOneAndDelete({ _id: taskId });

    let updatedOrder: UpdateWriteOpResult | null = null;

    if (!deletedTask || !highestOrderTask) {
      response = {
        success: false,
        title: "Not found",
        message: "Task not found or already deleted",
      };
      res.status(404).json(response);
      return;
    }

    if (deletedTask.order === 0) {
      // decrement all
      updatedOrder = await Tasks.updateMany(
        { $and: [{ status: status }, { order: { $gt: deletedTask.order } }] },
        { $inc: { order: -1 } }
      );
    }

    if (deletedTask.order > 0 && deletedTask.order < highestOrderTask?.order) {
      // decrement above the deletedTask
      updatedOrder = await Tasks.updateMany(
        { $and: [{ status: status }, { order: { $gt: deletedTask.order } }] },
        { $inc: { order: -1 } }
      );
    }

    if (deletedTask.order === highestOrderTask?.order) {
      // decrement everything except 0
      updatedOrder = await Tasks.updateMany(
        { $and: [{ status: status }, { order: { $gt: 0 } }] },
        { $inc: { order: -1 } }
      );
    }

    if (!updatedOrder) {
      response = {
        success: false,
        title: "Error",
        message: "Could not delete item",
      };
      res.status(404).json(response);
      return;
    }

    response = {
      success: true,
      title: "Success",
      message: "Your item has been deleted",
    };
    res.status(200).json(response);
  },

  postTasks: async function (req: AuthRequest, res: Response) {
    // todo: need to re-think

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
      summary: string;
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
    }

    const allTasks: Task[] = userTask.map((task) => {
      const invalidTasks = !task.status || task.status.trim() === "";
      const invalidPriorityStatus =
        !task.priority || task.priority.trim() === "";
      const validTags = task.tags && task.tags.length > 0;

      return {
        userId,
        summary: task.summary,
        order: task.order,
        status: invalidTasks ? "todo" : (task.status as TaskStatus),
        priority: invalidPriorityStatus
          ? "medium"
          : (task.priority as Priority),
        tags: validTags ? task.tags : [],
      };
    });

    const createdTasks = await Tasks.insertMany(allTasks);

    response = {
      success: true,
      title: "Success",
      message: "Added all items",
      data: {
        tasks: createdTasks,
      },
    };

    res.json(response).status(200);
  },
};
