import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../lib/error.js";

export function validateCreateArtifact(req: Request, _res: Response, next: NextFunction) {
    const { type, text, url, x, y } = req.body;

    if (type !== "TEXT" && type !== "LINK") {
        throw new ValidationError("Invalid artifact type.");
    }

    if(type === "TEXT"){
        if(typeof text !== "string" || text.trim() === ""){
            throw new ValidationError("Text artifact requires valid text.");
        }
        req.body.text = text.trim();
    }

    if(type === "LINK"){
        if(typeof url !== "string" || url.trim() === ""){
            throw new ValidationError("Link artifact requires a valid URL.");
        }

        req.body.url = url.trim();
    }

    req.body.x = Number.isFinite(Number(x)) ? Number(x) : 0;
    req.body.y = Number.isFinite(Number(y)) ? Number(y) : 0;

    next();
}

export function validateUpdateArtifact(req: Request, res: Response, next: NextFunction) {
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