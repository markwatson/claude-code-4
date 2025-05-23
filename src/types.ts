export interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  createdAt: Date;
  completed: boolean;
}