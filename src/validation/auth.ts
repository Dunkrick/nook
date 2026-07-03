import { NextFunction, Request, Response } from "express";

export function validateAuthCredentials(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { email, password } = req.body;

    if (!email?.trim()) {
        return res.status(400).json({
            error: "Email is required",
        });
    }

    if (!password?.trim()) {
        return res.status(400).json({
            error: "Password is required",
        });
    }

    next();
}