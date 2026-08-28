import type { User } from "../types/auth";

const TOKEN_KEY: string = "nook-token";
const ACTIVE_WORKSPACE_KEY = "nook_active_workspace";
const USER_KEY = "nook-user";

export function getUser(): User | null {
    const value = localStorage.getItem(USER_KEY);

    if (!value) return null;

    try {
        return JSON.parse(value) as User;
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
}

export function setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser() {
    localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function getActiveWorkspaceId(): number | null {
    const value = localStorage.getItem(ACTIVE_WORKSPACE_KEY);

    if (!value) return null;

    const id = Number(value);

    return Number.isInteger(id) ? id : null;
}

export function setActiveWorkspaceId(id: number) {
    localStorage.setItem(
        ACTIVE_WORKSPACE_KEY,
        String(id)
    );
}