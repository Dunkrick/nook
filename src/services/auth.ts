import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { ValidationError } from "../lib/error.js";
import type { RegisterUserInput, AuthResponse, LoginUserInput } from "../types/auth.js";
import type { User } from "@prisma/client";

function createAuthResponse(user: User): AuthResponse {
    //get jwt secret
    const secret = process.env.JWT_SECRET;

    //check if jwt secret is configured
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    //Generate JWT 
    const token = jwt.sign(
        { userId: user.id },
        secret,
        {
            expiresIn: "7d",
        }
    );
    // return the authResponse
    return { token, user: { id: user.id, email: user.email } };
}

export async function registerUser(
    userData: RegisterUserInput
): Promise<AuthResponse> {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email: userData.email,
        },
    });

    if (existingUser) {
        throw new ValidationError("Email is already registered", 409); // 409 Conflict
    }

    // 2. Hash the password securely
    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // 3. Create the new user in the database
    const user = await prisma.user.create({
        data: {
            email: userData.email,
            passwordHash,
        },
    });

    return createAuthResponse(user);
}

export async function loginUser(userData: LoginUserInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
        where: {
            email: userData.email,
        },
    });

    if (!user) {
        throw new ValidationError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(
        userData.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new ValidationError("Invalid email or password", 401);
    }

    return createAuthResponse(user);
}