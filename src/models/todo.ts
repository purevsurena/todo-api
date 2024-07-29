import { Schema, model, Document } from 'mongoose';

interface ITodo extends Document {
  title: string;
  category: string;
  dueDate?: Date;
  completed: boolean;
  userId: string;
}

const todoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  dueDate: { type: Date, default: null },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
});

const Todo = model<ITodo>('Todo', todoSchema);

export default Todo;
