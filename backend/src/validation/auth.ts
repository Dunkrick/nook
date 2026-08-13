import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../lib/error.js";

export function validateAuthCredentials(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { email, password } = req.body;

    if (!email?.trim()) {
        throw new ValidationError("Email is required");
    }

    if (!password?.trim()) {
        throw new ValidationError("Password is required");
    }

    next();
}