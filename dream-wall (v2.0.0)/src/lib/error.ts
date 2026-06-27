import type { NextFunction, Request, Response } from "express";

export class ValidationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = "ValidationError";
        this.statusCode = statusCode;
    }
}

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(error);

    if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
            },
        });
    }

    res.status(500).json({
        success: false,
        error: {
            message: "Internal Server Error",
        },
    });
}