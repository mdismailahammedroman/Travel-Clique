/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ZodObject, ZodRawShape } from "zod"; // ✅ use ZodObject

import { Request, Response, NextFunction } from "express";

// ZodObject<ZodRawShape, "strip" | "strict" | "passthrough", any>
const validateRequest = (schema: ZodObject<ZodRawShape>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: { ...req.query },
        params: req.params,
      });
      next();
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.errors || err.message,
      });
    }
  };
};

export default validateRequest;
