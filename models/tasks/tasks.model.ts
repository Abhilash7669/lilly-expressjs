import { model, Schema } from "mongoose";

const tasksSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Task name is required"],
    },
    summary: {
      type: String,
      required: [true, "Content is required"],
    },
    order: {
      type: Number,
      required: [true, "Order of item is requred"],
    },
    status: {
      type: String,
      enum: ["todo", "inProgress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["high", "low", "medium"],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    subTasks: {
      type: [
        {
          subTask: {
            type: String,
            required: true,
          },
          status: {
            type: Boolean,
            required: true
          },
        },
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    completedAt: {
      type: Date,
      default: ""
      // required: [true, "completedAt is required"]
    },
    deletedAt: {
      type: Date,
      default: ""
      // required: [true, "deletedAt is required"]
    },
    isArchived: {
      type: Boolean,
      required: [true, "Is Archived is required"]
    }
  },
  { timestamps: true }
);

const Tasks = model("Tasks", tasksSchema, "tasks");

export default Tasks;
