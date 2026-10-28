import { useEffect, useId, useState } from "react";
import { API_URL } from "../services/api";

interface AuthFormProps {
    isRegisterMode: boolean;
    buttonText: string;
    loadingButtonText: string;
    successTitle: string;
    successMessage: string;
    onSubmit: (credentials: {
        name?: string;
        email: string;
        password: string;
    }) => Promise<void>;
    onSuccess: () => void;
    togglePrompt: string;
    toggleButtonText: string;
    onToggle: () => void;
}

const MIN_LOADING_TIME = 900;
const SUCCESS_DISPLAY_TIME = 1000;

const wait = (milliseconds: number) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });

export default function AuthForm({
    isRegisterMode,
    buttonText,
    loadingButtonText,
    successTitle,
    successMessage,
    onSubmit,
    onSuccess,
    togglePrompt,
    toggleButtonText,
    onToggle,
}: AuthFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const errorId = useId();

    useEffect(() => {
        if (!success) {
            return;
        }

        const timeout = window.setTimeout(() => {
            onSuccess();
        }, SUCCESS_DISPLAY_TIME);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [success, onSuccess]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (email.trim() === "" || password === "") {
            setError("Email and password are required.");
            return;
        }

        if (isRegisterMode && name.trim() === "") {
            setError("Name is required.");
            return;
        }

        setError("");
        setLoading(true);

        const startedAt = performance.now();

        try {
            await onSubmit({
                ...(isRegisterMode ? { name: name.trim() } : {}),
                email: email.trim(),
                password,
            });

            const elapsed = performance.now() - startedAt;

            const remaining = Math.max(
                0,
                MIN_LOADING_TIME - elapsed,
            );

            if (remaining > 0) {
                await wait(remaining);
            }

            setLoading(false);
            setSuccess(true);
        } catch (err) {
            setLoading(false);

            if (err instanceof Error) {
                setError(
                    err.message ||
                        "Something went wrong. Please try again.",
                );
            } else {
                setError(
                    "Something went wrong. Please try again.",
                );
            }
        }
    };

    if (success) {
        return (
            <div
                className="auth-success"
                role="status"
                aria-live="polite"
            >
                <div className="auth-success__mark">
                    <span />
                </div>

                <div className="auth-success__copy">
                    <p className="auth-success__title">
                        {successTitle}
                    </p>

                    <p className="auth-success__message">
                        {successMessage}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form
            className={`auth-form ${
                loading ? "auth-form--loading" : ""
            }`}
            onSubmit={handleSubmit}
        >
            {isRegisterMode && (
                <div className="auth-field">
                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Rick"
                        disabled={loading}
                        required
                    />
                </div>
            )}

            <div className="auth-field">
                <label htmlFor="email">
                    Email
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? errorId : undefined}
                />
            </div>

            <div className="auth-field">
                <label htmlFor="password">
                    Password
                </label>

                <div className="auth-password-input">
                    <input
                        id="password"
                        name="password"
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete={
                            isRegisterMode
                                ? "new-password"
                                : "current-password"
                        }
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="Your password"
                        disabled={loading}
                        required
                        aria-invalid={error ? "true" : undefined}
                        aria-describedby={error ? errorId : undefined}
                    />

                    {/*
                     * aria-label stays constant so SR reads "Show password"
                     * always. aria-pressed communicates the toggle state
                     * without double-signalling a label flip.
                     */}
                    <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() =>
                            setShowPassword(
                                (current) => !current,
                            )
                        }
                        disabled={loading}
                        aria-label="Show password"
                        aria-pressed={showPassword}
                    >
                        {showPassword ? (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M3 3l18 18" />
                                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a18.6 18.6 0 0 1-3.1 4.2" />
                                <path d="M6.2 6.2A18.7 18.7 0 0 0 2 12s3 8 10 8a10.8 10.8 0 0 0 3.5-.6" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/*
             * Always rendered so React doesn't remove/re-add the node
             * (which can swallow the alert in some SR implementations).
             * role="alert" fires on content change, not on mount.
             */}
            <p
                id={errorId}
                className="auth-error"
                role="alert"
                aria-atomic="true"
            >
                {error}
            </p>

            <button
                className="auth-submit"
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <span className="auth-submit__loading">
                        <span className="auth-loading-dots">
                            <span />
                            <span />
                            <span />
                        </span>

                        <span>
                            {loadingButtonText}
                        </span>
                    </span>
                ) : (
                    buttonText
                )}
            </button>

            <div className="auth-divider">
                <span>or</span>
            </div>

            <div className="auth-oauth-group">
                <a
                    href={`${API_URL}/auth/google`}
                    className="auth-oauth-btn"
                >
                    <svg
                        className="auth-oauth-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                </a>

                <a
                    href={`${API_URL}/auth/github`}
                    className="auth-oauth-btn"
                >
                    <svg
                        className="auth-oauth-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                    </svg>
                    <span>Continue with GitHub</span>
                </a>
            </div>

            <div className="auth-toggle-container">
                <p>{togglePrompt}</p>

                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={onToggle}
                    disabled={loading}
                >
                    {toggleButtonText}
                </button>
            </div>
        </form>
    );
}