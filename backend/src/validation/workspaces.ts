import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../lib/error.js";

export function parseWorkspaceId(
    value: string | string[]
): number {
    const workspaceId = Number(value);

    if (
        !Number.isInteger(workspaceId) ||
        workspaceId <= 0
    ) {
        throw new ValidationError(
            "Invalid workspace ID."
        );
    }

    return workspaceId;
}

export function validateCreateWorkspace(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const { name } = req.body;

    if (!name) {
        throw new ValidationError(
            "Workspace name is required"
        );
    }

    if (typeof name !== "string") {
        throw new ValidationError(
            "Workspace name must be a string"
        );
    }

    if (name.trim().length === 0) {
        throw new ValidationError(
            "Workspace name cannot be empty"
        );
    }

    next();
}