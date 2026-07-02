import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import * as authService from "../services/auth";

export default function Login() {
    const navigate = useNavigate();

    const handleSubmit = async (credentials: { email: string; password: string }) => {
        return await authService.login(credentials);
    };

    return (
        <AuthForm
            buttonText="Login"
            loadingButtonText="Logging in..."
            onSubmit={handleSubmit}
            onSuccess={() => navigate("/home")}
            togglePrompt="Don't have an account?"
            onToggle={() => navigate("/register")}
        />
    );
}
