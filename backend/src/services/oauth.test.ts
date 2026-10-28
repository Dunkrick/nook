import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueOAuth, findUniqueUser, createOAuth, createUser } = vi.hoisted(
    () => ({
        findUniqueOAuth: vi.fn(),
        findUniqueUser: vi.fn(),
        createOAuth: vi.fn(),
        createUser: vi.fn(),
    })
);

vi.mock("../prisma.js", () => ({
    default: {
        oAuthAccount: {
            findUnique: findUniqueOAuth,
            create: createOAuth,
        },
        user: {
            findUnique: findUniqueUser,
            create: createUser,
        },
    },
}));

import { authenticateOAuthUser } from "./oauth.js";
import { loginUser } from "./auth.js";

describe("authenticateOAuthUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects authentication if email is not verified by provider", async () => {
        await expect(
            authenticateOAuthUser({
                provider: "google",
                providerUserId: "google-123",
                email: "test@example.com",
                name: "Test",
                emailVerified: false,
            })
        ).rejects.toThrow("Email must be verified");
    });

    it("logs in immediately if OAuth account is already linked", async () => {
        findUniqueOAuth.mockResolvedValue({
            id: 1,
            userId: 42,
            provider: "google",
            providerUserId: "google-123",
            user: {
                id: 42,
                name: "Existing Person",
                email: "test@example.com",
            },
        });

        const result = await authenticateOAuthUser({
            provider: "google",
            providerUserId: "google-123",
            email: "test@example.com",
            name: "Existing Person",
            emailVerified: true,
        });

        expect(result.user).toEqual({
            id: 42,
            name: "Existing Person",
            email: "test@example.com",
        });
        expect(result.token).toBeDefined();
        expect(findUniqueUser).not.toHaveBeenCalled();
    });

    it("links provider to existing user when email matches", async () => {
        findUniqueOAuth.mockResolvedValue(null);
        findUniqueUser.mockResolvedValue({
            id: 10,
            name: "Email User",
            email: "match@example.com",
            passwordHash: "hash123",
        });
        createOAuth.mockResolvedValue({
            id: 2,
            userId: 10,
            provider: "github",
            providerUserId: "gh-999",
        });

        const result = await authenticateOAuthUser({
            provider: "github",
            providerUserId: "gh-999",
            email: "match@example.com",
            name: "GH Name",
            emailVerified: true,
        });

        expect(createOAuth).toHaveBeenCalledWith({
            data: {
                userId: 10,
                provider: "github",
                providerUserId: "gh-999",
            },
        });
        expect(result.user.id).toBe(10);
    });

    it("creates new user and links provider if account does not exist", async () => {
        findUniqueOAuth.mockResolvedValue(null);
        findUniqueUser.mockResolvedValue(null);
        createUser.mockResolvedValue({
            id: 99,
            name: "Brand New",
            email: "brandnew@example.com",
        });

        const result = await authenticateOAuthUser({
            provider: "google",
            providerUserId: "g-new-1",
            email: "brandnew@example.com",
            name: "Brand New",
            emailVerified: true,
        });

        expect(createUser).toHaveBeenCalledWith({
            data: {
                email: "brandnew@example.com",
                name: "Brand New",
                passwordHash: null,
                oauthAccounts: {
                    create: {
                        provider: "google",
                        providerUserId: "g-new-1",
                    },
                },
            },
        });
        expect(result.user.id).toBe(99);
    });
});

describe("loginUser password guard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects password login when account has no passwordHash (social-only)", async () => {
        findUniqueUser.mockResolvedValue({
            id: 50,
            email: "social@example.com",
            name: "Social User",
            passwordHash: null,
        });

        await expect(
            loginUser({
                email: "social@example.com",
                password: "anypassword",
            })
        ).rejects.toThrow("This account uses social sign-in");
    });
});
