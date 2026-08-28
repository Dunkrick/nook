import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../lib/error.js";

export function validateLoginCredentials(
    req: Request,
    _res: Response,
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

export function validateRegisterCredentials(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const { name, email, password } = req.body;

    if (!name?.trim()) {
        throw new ValidationError("Name is required");
    }

    if (!email?.trim()) {
        throw new ValidationError("Email is required");
    }

    if (!password?.trim()) {
        throw new ValidationError("Password is required");
    }

    next();
}