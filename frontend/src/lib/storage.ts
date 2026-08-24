const TOKEN_KEY: string = "nook-token";
const ACTIVE_WORKSPACE_KEY = "nook_active_workspace";

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