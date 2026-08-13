//middleware owns authentication
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ValidationError } from "../lib/error.js";

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    //Read the Header and validate the format
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new ValidationError(
            "Authentication required",
            401
        );
    }
    //Extract the token
    const token = authHeader.split(" ")[1];
    //Read the secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    //verify the token
    const payload = jwt.verify(token, secret) as {
        userId: number;
    };

    //attach user payload to request
    req.user = {
        id: payload.userId,
    };

    //continue
    next();
}