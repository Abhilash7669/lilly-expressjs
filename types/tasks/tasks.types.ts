export type RequestBodyTask = {
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
};
