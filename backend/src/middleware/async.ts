import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * A wrapper for async route handlers. 
 * It catches any rejected promises and forwards them to the Express error handler.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
