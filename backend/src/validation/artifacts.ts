import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../lib/error.js";

export const CAPTION_MAX_LENGTH = 48;

/**
 * Trims a polaroid caption and checks the film-strip rules: one line, and at
 * most CAPTION_MAX_LENGTH characters. An absent or blank caption returns an
 * empty string, which means "no caption".
 */
function normalizeCaption(caption: unknown): string {
    if (caption === undefined) {
        return "";
    }

    if (typeof caption !== "string") {
        throw new ValidationError("Caption must be text.");
    }

    if (/[\r\n]/.test(caption)) {
        throw new ValidationError("Caption must be on one line.");
    }

    const trimmed = caption.trim();

    if (trimmed.length > CAPTION_MAX_LENGTH) {
        throw new ValidationError(
            `Caption must be ${CAPTION_MAX_LENGTH} characters or fewer.`
        );
    }

    return trimmed;
}

export function validateCreateArtifact(req: Request, _res: Response, next: NextFunction) {
    const { type, text, url, imageKey, x, y } = req.body;

    if (type !== "TEXT" && type !== "LINK" && type !== "POLAROID") {
        throw new ValidationError("Invalid artifact type.");
    }

    if (req.body.caption !== undefined && type !== "POLAROID") {
        throw new ValidationError(
            "Only polaroid artifacts can have a caption."
        );
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

    if (type === "POLAROID") {
        if (typeof imageKey !== "string" || imageKey.trim() === "") {
            throw new ValidationError(
                "Polaroid artifact requires a valid imageKey."
            );
        }

        req.body.imageKey = imageKey.trim();
        req.body.caption = normalizeCaption(req.body.caption);
    }

    req.body.x = Number.isFinite(Number(x)) ? Number(x) : 0;
    req.body.y = Number.isFinite(Number(y)) ? Number(y) : 0;

    next();
}

export function validateUpdateArtifact(req: Request, res: Response, next: NextFunction) {
    const { text, caption, x, y } = req.body;
    const parsedX = Number(x);
    const parsedY = Number(y);

    // Nothing to update
    if (
        text === undefined &&
        caption === undefined &&
        x === undefined &&
        y === undefined
    ) {
        throw new ValidationError(
            "At least one field must be provided."
        );
    }

    if (caption !== undefined) {
        // An empty string is valid: it clears the caption.
        req.body.caption = normalizeCaption(caption);
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