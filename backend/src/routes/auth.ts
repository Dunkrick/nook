import express from "express";
import { registerUser, loginUser } from "../services/auth.js";
import { validateRegisterCredentials, validateLoginCredentials } from "../validation/auth.js";

const router = express.Router();

router.post(
    "/register",
    validateRegisterCredentials,
    async (req, res) => {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    }
);

router.post(
    "/login",
    validateLoginCredentials,
    async (req, res) => {
        const result = await loginUser(req.body);
        res.status(200).json(result);
    }
);

export default router;