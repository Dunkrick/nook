const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "dream-wall-token";

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

//private helper function to process the enpoint requests
async function request(method: string, endpoint: string, options?: any) {
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

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            method: method,
            headers,
            ...(options?.body ? { body: JSON.stringify(options?.body) } : {}),
        }
    );

    const data = await response.json();

    if (!response.ok || data.success === false) {
        const errorMessage = data.error?.message || "Something went wrong";
        throw new Error(errorMessage);
    }

    return data;
}


export async function post(endpoint: string, body = {}) {
    console.log(import.meta.env.VITE_API_URL);
    return request("POST", endpoint, { body });
}

export async function get(endpoint: string, params?: any) {
    return request("GET", endpoint, { params });
}

export async function patch(endpoint: string, body = {}) {
    return request("PATCH", endpoint, { body });
}

export async function del(endpoint: string) {
    return request("DELETE", endpoint);
}