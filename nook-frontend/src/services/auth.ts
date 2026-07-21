import * as api from "./api";
import { setToken, removeToken, getToken } from "../lib/storage";
import type { AuthCredentials, AuthResponse } from "../types/auth";

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = (await api.post("/auth/login", credentials)) as AuthResponse;
    // Save token to localStorage for subsequent authenticated requests
    setToken(data.token);
    return data;
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = (await api.post("/auth/register", credentials)) as AuthResponse;
    setToken(data.token);
    return data;
}

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    removeToken();
}