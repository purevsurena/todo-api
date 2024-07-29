import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const assignUserId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    req.session.userId = uuidv4(); // uuidv4 generates a string
  }
  next();
};

export default assignUserId;
