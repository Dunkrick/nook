import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import * as authService from "../services/auth";
import "../App.css";

export default function Login() {
    const navigate = useNavigate();

    const handleSubmit = async (credentials: { email: string; password: string }) => {
        await authService.login(credentials);
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h1 className="nook-logo">Nook<span className="nook-logo__spark"></span></h1>
                <p className="auth-tagline">Turning thoughts into momentum.</p>
            </div>
            <div className="auth-card">
                <AuthForm
                    buttonText="Login"
                    loadingButtonText="Logging in..."
                    onSubmit={handleSubmit}
                    onSuccess={() => navigate("/home")}
                    togglePrompt="Don't have an account?"
                    toggleButtonText="Register"
                    onToggle={() => navigate("/register")}
                />
            </div>
        </div>
    );
}
