import express from "express";
import { registerUser, loginUser } from "../services/auth.js";
import { validateAuthCredentials } from "../validation/auth.js";

const router = express.Router();

router.post(
    "/register",
    validateAuthCredentials,
    async (req, res) => {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    }
);

router.post(
    "/login",
    validateAuthCredentials,
    async (req, res) => {
        const result = await loginUser(req.body);
        res.status(200).json(result);
    }
);

export default router;