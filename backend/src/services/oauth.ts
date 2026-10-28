import prisma from "../prisma.js";
import { ValidationError } from "../lib/error.js";
import { env } from "../config/env.js";
import { createAuthResponse } from "./auth.js";
import type { AuthResponse } from "../types/auth.js";

export interface OAuthUserProfile {
    provider: "google" | "github";
    providerUserId: string;
    email: string;
    name?: string;
    emailVerified: boolean;
}

export function getGoogleAuthUrl(state?: string): string {
    if (!env.GOOGLE_CLIENT_ID) {
        throw new ValidationError("Google OAuth is not configured.", 500);
    }

    const redirectUri = `${env.BACKEND_URL}/api/auth/google/callback`;
    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
    });

    if (state) {
        params.set("state", state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGithubAuthUrl(state?: string): string {
    if (!env.GITHUB_CLIENT_ID) {
        throw new ValidationError("GitHub OAuth is not configured.", 500);
    }

    const redirectUri = `${env.BACKEND_URL}/api/auth/github/callback`;
    const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: "read:user user:email",
    });

    if (state) {
        params.set("state", state);
    }

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function authenticateOAuthUser(
    profile: OAuthUserProfile
): Promise<AuthResponse> {
    if (!profile.emailVerified) {
        throw new ValidationError(
            "Email must be verified by the OAuth provider.",
            400
        );
    }

    // 1. Check if OAuth account is already linked
    const existingOAuth = await prisma.oAuthAccount.findUnique({
        where: {
            provider_providerUserId: {
                provider: profile.provider,
                providerUserId: profile.providerUserId,
            },
        },
        include: { user: true },
    });

    if (existingOAuth) {
        return createAuthResponse(existingOAuth.user);
    }

    // 2. Check if a user with this verified email already exists
    let user = await prisma.user.findUnique({
        where: { email: profile.email },
    });

    if (user) {
        // Link this OAuth account to the existing user
        await prisma.oAuthAccount.create({
            data: {
                userId: user.id,
                provider: profile.provider,
                providerUserId: profile.providerUserId,
            },
        });
        return createAuthResponse(user);
    }

    // 3. Create a brand new user and link the OAuth account
    user = await prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name?.trim() || "Friend",
            passwordHash: null,
            oauthAccounts: {
                create: {
                    provider: profile.provider,
                    providerUserId: profile.providerUserId,
                },
            },
        },
    });

    return createAuthResponse(user);
}

export async function handleGoogleCallback(code: string): Promise<AuthResponse> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new ValidationError("Google OAuth is not configured.", 500);
    }

    const redirectUri = `${env.BACKEND_URL}/api/auth/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new ValidationError(
            `Failed to exchange Google authorization code: ${errorText}`,
            400
        );
    }

    const tokenData = (await tokenResponse.json()) as {
        access_token: string;
    };

    const profileResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        }
    );

    if (!profileResponse.ok) {
        throw new ValidationError("Failed to fetch Google user profile.", 400);
    }

    const profile = (await profileResponse.json()) as {
        sub: string;
        email: string;
        email_verified?: boolean;
        name?: string;
    };

    return authenticateOAuthUser({
        provider: "google",
        providerUserId: profile.sub,
        email: profile.email,
        name: profile.name,
        emailVerified: Boolean(profile.email_verified),
    });
}

export async function handleGithubCallback(code: string): Promise<AuthResponse> {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        throw new ValidationError("GitHub OAuth is not configured.", 500);
    }

    const redirectUri = `${env.BACKEND_URL}/api/auth/github/callback`;

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: redirectUri,
        }),
    });

    if (!tokenResponse.ok) {
        throw new ValidationError(
            "Failed to exchange GitHub authorization code.",
            400
        );
    }

    const tokenData = (await tokenResponse.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
    };

    if (!tokenData.access_token) {
        throw new ValidationError(
            tokenData.error_description || "GitHub authentication failed.",
            400
        );
    }

    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "nook-app",
        },
    });

    if (!userResponse.ok) {
        throw new ValidationError("Failed to fetch GitHub user profile.", 400);
    }

    const userData = (await userResponse.json()) as {
        id: number;
        login: string;
        name?: string;
    };

    const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "nook-app",
        },
    });

    if (!emailsResponse.ok) {
        throw new ValidationError("Failed to fetch GitHub user emails.", 400);
    }

    const emails = (await emailsResponse.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
    }>;

    const primaryEmail =
        emails.find((e) => e.primary && e.verified) ??
        emails.find((e) => e.verified);

    if (!primaryEmail) {
        throw new ValidationError(
            "No verified email found on GitHub account. Verify your email on GitHub first.",
            400
        );
    }

    return authenticateOAuthUser({
        provider: "github",
        providerUserId: String(userData.id),
        email: primaryEmail.email,
        name: userData.name || userData.login,
        emailVerified: true,
    });
}
