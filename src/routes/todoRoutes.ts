import { Router } from 'express';
import { createTodo, deleteTodo, updateTodoStatus, getTodoCounts, getTodosByCategory, getAllTodos } from '../controllers/todoController';

const router = Router();

router.post('/', createTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id/status', updateTodoStatus);
router.get('/counts', getTodoCounts);
router.get('/category/:category', getTodosByCategory);
router.get('/all', getAllTodos);

export default router;
