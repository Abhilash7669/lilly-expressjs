export type CreateTaskPayload = {
  name: string;
  status: string;
  summary: string;
  order: number;
  priority: string;
  tags: Array<string>;
  date: {
    startDate: string;
    dueDate: string;
  };
  subTasks: Array<{
    subTask: string;
    status: boolean;
  }>;
  completedAt: string;
  deletedAt: string;
  isArchived: boolean;
};

export type TaskColumns = {
  status: string;
  items: TaskDTO[];
};

export type TaskDTO = {
  name: string;
  summary: string;
  order: number;
  status: string;
  priority: string;
  tags?: Array<string>;
  subTasks?: Array<{
    subTask: string;
    status: boolean;
  }>;
  startDate: Date;
  dueDate: Date;
  completedAt: Date;
  deletedAt: Date;
  isArchived: boolean;
};
