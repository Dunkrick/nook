import { getToken } from "../lib/storage";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

interface RequestOptions {
    body?: unknown;
    params?: Record<string, string>;
}

//private helper function to process the enpoint requests
async function request(method: string, endpoint: string, options?: RequestOptions) {
    const token = getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (options?.params) {
        endpoint += `?${new URLSearchParams(options?.params)}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        ...(options?.body && {
            body: JSON.stringify(options.body),
        }),
    });

    const contentType =
        response.headers.get("content-type");

    const data =
        contentType?.includes("application/json")
            ? await response.json()
            : await response.text();

    if (!response.ok) {
        if (
            typeof data === "object" &&
            data !== null &&
            "error" in data
        ) {
            throw new Error(
                (data as any).error.message
            );
        }

        throw new Error(
            typeof data === "string"
                ? data
                : response.statusText
        );
    }

    return data;
}


export async function post(endpoint: string, body = {}) {
    return request("POST", endpoint, { body });
}

export async function get(endpoint: string, params?: Record<string, string>) {
    return request("GET", endpoint, { params });
}

export async function patch(endpoint: string, body = {}) {
    return request("PATCH", endpoint, { body });
}

export async function del(endpoint: string) {
    return request("DELETE", endpoint);
}