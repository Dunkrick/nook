import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../lib/error.js";

export function validateCreateCard(req: Request, res: Response, next: NextFunction) {
    const { text, x, y } = req.body;

    if (!text?.trim()) {
        throw new ValidationError("Invalid Card data, card requires valid text.");
    }

    // Clean up the body so the route gets the trimmed version
    req.body.text = text.trim();
    req.body.x = Number.isFinite(Number(x)) ? Number(x) : 0;
    req.body.y = Number.isFinite(Number(y)) ? Number(y) : 0;

    next();
}

export function validateUpdateCard(req: Request, res: Response, next: NextFunction) {
    const { text, x, y } = req.body;
    const parsedX = Number(x);
    const parsedY = Number(y);

    // Nothing to update
    if (
        text === undefined &&
        x === undefined &&
        y === undefined
    ) {
        throw new ValidationError(
            "At least one field must be provided."
        );
    }

    if (text !== undefined) {
        if (typeof text !== "string" || text.trim() === "") {
            throw new ValidationError(
                "Text cannot be empty."
            );
        }

        req.body.text = text.trim();
    }

    if (x !== undefined) {
        const parsedX = Number(x);

        if (!Number.isFinite(parsedX)) {
            throw new ValidationError(
                "Invalid x coordinate."
            );
        }

        req.body.x = parsedX;
    }

    if (y !== undefined) {
        const parsedY = Number(y);

        if (!Number.isFinite(parsedY)) {
            throw new ValidationError(
                "Invalid y coordinate."
            );
        }

        req.body.y = parsedY;
    }

    next();
}