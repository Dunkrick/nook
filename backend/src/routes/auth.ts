import express from "express";
import { registerUser, loginUser } from "../services/auth.js";
import {
    getGoogleAuthUrl,
    getGithubAuthUrl,
    handleGoogleCallback,
    handleGithubCallback,
} from "../services/oauth.js";
import { validateRegisterCredentials, validateLoginCredentials } from "../validation/auth.js";
import { env } from "../config/env.js";

const router = express.Router();

router.post(
    "/register",
    validateRegisterCredentials,
    async (req, res) => {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    }
);

router.post(
    "/login",
    validateLoginCredentials,
    async (req, res) => {
        const result = await loginUser(req.body);
        res.status(200).json(result);
    }
);

function getTargetFrontendUrl(stateParam?: unknown): string {
    const allowedOrigins = [
        env.FRONTEND_URL.replace(/\/$/, ""),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ];

    if (typeof stateParam === "string" && stateParam.trim()) {
        try {
            const parsed = JSON.parse(
                Buffer.from(stateParam, "base64url").toString("utf-8")
            ) as { origin?: string };

            if (
                parsed.origin &&
                allowedOrigins.includes(parsed.origin.replace(/\/$/, ""))
            ) {
                return parsed.origin.replace(/\/$/, "");
            }
        } catch {
            // Ignore malformed state and fallback
        }
    }

    return env.FRONTEND_URL.replace(/\/$/, "");
}

function createOAuthState(req: express.Request): string | undefined {
    const rawOrigin =
        req.headers.origin ||
        (req.headers.referer ? new URL(req.headers.referer).origin : undefined);

    const allowedOrigins = [
        env.FRONTEND_URL.replace(/\/$/, ""),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ];

    if (rawOrigin && allowedOrigins.includes(rawOrigin.replace(/\/$/, ""))) {
        return Buffer.from(
            JSON.stringify({ origin: rawOrigin.replace(/\/$/, "") })
        ).toString("base64url");
    }

    return undefined;
}

router.get("/google", (req, res) => {
    const state = createOAuthState(req);
    const url = getGoogleAuthUrl(state);
    res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
    const { code, error, state } = req.query;
    const frontendUrl = getTargetFrontendUrl(state);

    if (error || !code || typeof code !== "string") {
        const errorMsg =
            typeof error === "string"
                ? error
                : "Google authentication was cancelled or failed.";
        return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMsg)}`
        );
    }

    try {
        const result = await handleGoogleCallback(code);
        const userParam = encodeURIComponent(JSON.stringify(result.user));
        return res.redirect(
            `${frontendUrl}/auth/callback?token=${encodeURIComponent(result.token)}&user=${userParam}`
        );
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Authentication failed.";
        return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(message)}`
        );
    }
});

router.get("/github", (req, res) => {
    const state = createOAuthState(req);
    const url = getGithubAuthUrl(state);
    res.redirect(url);
});

router.get("/github/callback", async (req, res) => {
    const { code, error, state } = req.query;
    const frontendUrl = getTargetFrontendUrl(state);

    if (error || !code || typeof code !== "string") {
        const errorMsg =
            typeof error === "string"
                ? error
                : "GitHub authentication was cancelled or failed.";
        return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMsg)}`
        );
    }

    try {
        const result = await handleGithubCallback(code);
        const userParam = encodeURIComponent(JSON.stringify(result.user));
        return res.redirect(
            `${frontendUrl}/auth/callback?token=${encodeURIComponent(result.token)}&user=${userParam}`
        );
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Authentication failed.";
        return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(message)}`
        );
    }
});

export default router;