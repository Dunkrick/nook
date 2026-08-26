import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import * as authService from "../services/auth";

export default function Register() {
    const navigate = useNavigate();

    const handleSubmit = async (credentials: {
        email: string;
        password: string;
    }) => {
        await authService.register(credentials);
    };

    return (
        <>
            <header className="auth-heading">
                <p className="auth-eyebrow">
                    Make a little room
                </p>

                <h1>
                    Create your Nook.
                </h1>

                <p className="auth-description">
                    A quiet place for the things worth keeping.
                </p>
            </header>

            <div className="auth-form-transition">
                <AuthForm
                    buttonText="Create Nook"
                    loadingButtonText="Making your Nook..."
                    onSubmit={handleSubmit}
                    onSuccess={() => navigate("/home")}
                    togglePrompt="Already have an account?"
                    toggleButtonText="Come back in"
                    onToggle={() => navigate("/")}
                    successTitle="Your Nook is ready."
                    successMessage="Let's put something in it."
                />
            </div>
        </>
    );
}