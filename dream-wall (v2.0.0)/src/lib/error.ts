import { Response } from "express";

export function handleServerError(res: Response, error: unknown) {
    if (error instanceof Error) {
        return res.status(500).json({
            error: error.message,
        });
    }

    return res.status(500).json({
        error: "Unknown error",
    });
}