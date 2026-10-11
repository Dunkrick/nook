import type { NextFunction, Request, Response } from "express";
import multer from "multer";

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

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            success: false,
            error: {
                message: "Photo must be 10 MB or smaller.",
                code: "FILE_TOO_LARGE",
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