import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "./AuthForm";
import * as authService from "../services/auth";

type AuthMode = "login" | "register";

const AUTH_CONTENT = {
    login: {
        eyebrow: "Welcome back",
        title: "Back to your Nook.",
        description: "The things you left here are still waiting.",
        buttonText: "Login",
        loadingButtonText: "Coming back...",
        togglePrompt: "Don't have an account?",
        toggleButtonText: "Create one",
        successTitle: "You're back.",
        successMessage: "Opening your Nook...",
    },
    register: {
        eyebrow: "Make a little room",
        title: "Create your Nook.",
        description: "A quiet place for the things worth keeping.",
        buttonText: "Create Nook",
        loadingButtonText: "Making your Nook...",
        togglePrompt: "Already have an account?",
        toggleButtonText: "Come back in",
        successTitle: "Your Nook is ready.",
        successMessage: "Let's put something in it.",
    },
} as const;

export default function AuthLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const mode: AuthMode =
        location.pathname === "/register"
            ? "register"
            : "login";

    const content = AUTH_CONTENT[mode];

    /*
     * This key changes only when the authentication mode changes.
     * It is intentionally NOT applied to the shell or heading.
     */
    const [formKey, setFormKey] = useState(mode);

    if (formKey !== mode) {
        setFormKey(mode);
    }

    const handleSubmit = async (credentials: {
        email: string;
        password: string;
    }) => {
        if (mode === "login") {
            await authService.login(credentials);
        } else {
            await authService.register(credentials);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell">

                {/* ==================================================
                    LEFT - THE NOOK WORLD
                   ================================================== */}

                <aside
                    className="auth-scene"
                    aria-hidden="true"
                >
                    <div className="auth-scene__brand">
                        <div className="auth-brand">
                            <img
                                src="/favicon.svg"
                                alt=""
                                className="auth-brand__mark"
                            />

                            <span className="auth-brand__name">
                                Nook
                            </span>
                        </div>
                    </div>

                    <div className="auth-scene__content">
                        <div className="auth-block auth-block--iris">
                            <span className="auth-block__number">
                                01
                            </span>

                            <strong>Thoughts</strong>

                            <span>
                                before they disappear.
                            </span>
                        </div>

                        <div className="auth-block auth-block--coral">
                            <span className="auth-block__number">
                                02
                            </span>

                            <strong>Things</strong>

                            <span>
                                worth keeping close.
                            </span>
                        </div>

                        <div className="auth-block auth-block--gold">
                            <span className="auth-block__number">
                                03
                            </span>

                            <strong>Ideas</strong>

                            <span>
                                ready when you are.
                            </span>
                        </div>
                    </div>

                    <div className="auth-scene__footer">
                        <span className="auth-scene__line" />

                        <span>
                            Your space, your way.
                        </span>
                    </div>
                </aside>

                {/* ==================================================
                    RIGHT - AUTH INTERACTION
                   ================================================== */}

                <section className="auth-panel">
                    <div className="auth-panel__content">

                        <div className="auth-mobile-brand">
                            <div className="auth-brand">
                                <img
                                    src="/favicon.svg"
                                    alt="Nook"
                                    className="auth-brand__mark"
                                />

                                <span className="auth-brand__name">
                                    Nook
                                </span>
                            </div>
                        </div>

                        {/* ==========================================
                            HEADING - STABLE REGION
                           ========================================== */}

                        <header className="auth-heading">
                            <p className="auth-eyebrow">
                                {content.eyebrow}
                            </p>

                            <h1>
                                {content.title}
                            </h1>

                            <p className="auth-description">
                                {content.description}
                            </p>
                        </header>

                        {/* ==========================================
                            FORM - ONLY REGION THAT TRANSITIONS
                           ========================================== */}

                        <div
                            key={mode}
                            className="auth-form-transition"
                        >
                            <AuthForm
                                buttonText={content.buttonText}
                                loadingButtonText={
                                    content.loadingButtonText
                                }
                                onSubmit={handleSubmit}
                                onSuccess={() =>
                                    navigate("/home")
                                }
                                togglePrompt={content.togglePrompt}
                                toggleButtonText={
                                    content.toggleButtonText
                                }
                                onToggle={() =>
                                    navigate(
                                        mode === "login"
                                            ? "/register"
                                            : "/",
                                    )
                                }
                                successTitle={content.successTitle}
                                successMessage={
                                    content.successMessage
                                }
                            />
                        </div>
                    </div>

                    <footer className="auth-footer">
                        <span>
                            Your quiet place to think.
                        </span>
                    </footer>
                </section>
            </section>
        </main>
    );
}