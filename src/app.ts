import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import connectDB from './utils/db';
import todoRoutes from './routes/todoRoutes';
import MongoStore from 'connect-mongo';
import assignUserId from './middleware/assignUserId';
import validateToken from './middleware/validateToken';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
  secret: process.env.SECRET_KEY || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/todoApp' }),
  cookie: { secure: false } // set secure: true in production if using HTTPS
}));

// Connect to DB
connectDB();

// Assign User ID Middleware
app.use(assignUserId);

// Endpoint to get a token
app.get('/api/get-token', (req: Request, res: Response) => {
  if (req.session.userId) {
    const token = jwt.sign({ userId: req.session.userId }, process.env.JWT_SECRET || 'default-secret-key');
    return res.status(200).json({ token });
  }
  return res.status(500).json({ message: 'Failed to generate token' });
});

// Protect To-Do Routes
app.use('/api/todos', validateToken, todoRoutes);

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
