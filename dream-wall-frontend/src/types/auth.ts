export interface AuthCredentials {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
