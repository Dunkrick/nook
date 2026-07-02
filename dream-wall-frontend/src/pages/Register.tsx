import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import * as authService from "../services/auth";

export default function Register() {
    const navigate = useNavigate();

    const handleSubmit = async (credentials: { email: string; password: string }) => {
        return await authService.register(credentials);
    };

    return (
        <AuthForm
            buttonText="Register"
            loadingButtonText="Registering..."
            onSubmit={handleSubmit}
            onSuccess={() => navigate("/home")}
            togglePrompt="Already have an account?"
            onToggle={() => navigate("/")}
        />
    );
}
