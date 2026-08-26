import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import * as authService from "../services/auth";

export default function Login() {
    const navigate = useNavigate();

    const handleSubmit = async (credentials: {
        email: string;
        password: string;
    }) => {
        await authService.login(credentials);
    };

    return (
        <>
            <header className="auth-heading">
                <p className="auth-eyebrow">
                    Welcome back
                </p>

                <h1>
                    Back to your Nook.
                </h1>

                <p className="auth-description">
                    The things you left here are still waiting.
                </p>
            </header>

            <div className="auth-form-transition">
                <AuthForm
                    buttonText="Login"
                    loadingButtonText="Coming back..."
                    onSubmit={handleSubmit}
                    onSuccess={() => navigate("/home")}
                    togglePrompt="Don't have an account?"
                    toggleButtonText="Create one"
                    onToggle={() => navigate("/register")}
                    successTitle="You're back."
                    successMessage="Opening your Nook..."
                />
            </div>
        </>
    );
}