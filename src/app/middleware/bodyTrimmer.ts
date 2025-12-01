import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to trim and clean string values from request body
 * Removes surrounding quotes if present
 */
export const bodyTrimmer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Trim whitespace and remove surrounding quotes
        req.body[key] = req.body[key]
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    });
  }
  next();
};
