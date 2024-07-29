import { Request, Response } from 'express';
import Todo from '../models/todo';

const defaultCategories = ['today', 'tomorrow', 'archive', 'wishlist', 'quick_notes'];

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, category, dueDate } = req.body;
    
    if (!defaultCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let finalDueDate = dueDate ? new Date(dueDate) : null;

    if (category === defaultCategories[1]) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      finalDueDate = tomorrow;
    }

    const newTodo = new Todo({
      title,
      category,
      dueDate: finalDueDate,
      userId: req.session.userId,
    });
    
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.session.userId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const updateTodoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { completed },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getTodoCounts = async (req: Request, res: Response) => {
  try {
    const counts = await Todo.aggregate([
      { $match: { userId: req.session.userId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = counts.reduce((acc: any, count: any) => {
      acc[count._id] = count.count;
      return acc;
    }, {});

    const results = defaultCategories.map(category => ({
      id: category,
      category: category,
      count: countMap[category] || 0
    }));

    const totalCount = results.reduce((acc, result) => acc + result.count, 0);
    results.push({
      id: 'all',
      category: 'all',
      count: totalCount
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getTodosByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    if (!defaultCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const todos = await Todo.find({ category, userId: req.session.userId })
      .skip(skip)
      .limit(limit);
    
    const total = await Todo.countDocuments({ category, userId: req.session.userId });

    res.status(200).json({ todos, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const todos = await Todo.find({ userId: req.session.userId })
      .skip(skip)
      .limit(limit);

    const total = await Todo.countDocuments({ userId: req.session.userId });

    res.status(200).json({ todos, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
