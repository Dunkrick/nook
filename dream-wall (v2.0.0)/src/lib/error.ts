import type { NextFunction, Request, Response } from "express";

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(error);

    res.status(500).json({
        success: false,
        error: {
            message: "Internal Server Error",
        },
    });
}