import { model, Schema } from "mongoose";


const tasksSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    order: {
        type: Number,
        required: [true, "Order of item is requred"]
    },
    status: {
        type: String,
        enum: ["todo", "inProgress", "done"],
        default: "todo"
    },
    priority: {
        type: String,
        enum: ["high", "low", "medium"],
        default: "medium"
    },
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Tasks = model("Tasks", tasksSchema, "tasks");

export default Tasks;

