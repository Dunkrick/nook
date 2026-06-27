import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../lib/error.js";

export function validateDream(req: Request, res: Response, next: NextFunction) {
    const dream = req.body.dream?.trim();

    if (!dream) {
        throw new ValidationError("Dream cannot be empty");
    }

    // Clean up the body so the route gets the trimmed version
    req.body.dream = dream;
    
    next();
}