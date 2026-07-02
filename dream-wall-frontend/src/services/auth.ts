import * as api from "./api";

interface AuthCredentials {
    email: string;
    password: string;
}

interface User {
    id: number;
    email: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

const TOKEN_KEY: string = "dream-wall-token";

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = (await api.post("/auth/login", credentials)) as AuthResponse;
    // Save token to localStorage for subsequent authenticated requests
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = (await api.post("/auth/register", credentials)) as AuthResponse;
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}