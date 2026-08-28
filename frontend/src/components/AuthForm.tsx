import { useEffect, useState } from "react";

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

            /*
             * We intentionally keep the loading state visible for a
             * short moment even if the backend responds immediately.
             *
             * This prevents:
             *
             * click → instant success → instant navigation
             *
             * from making the product feel mechanical.
             */
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
            /*
             * Errors should not feel artificially delayed.
             *
             * If the backend fails, tell the user immediately.
             */
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
                />
            </div>

            <div className="auth-field">
                <label htmlFor="password">
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="Your password"
                    disabled={loading}
                    required
                />
            </div>

            {error && (
                <p
                    className="auth-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

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

                        <span>{loadingButtonText}</span>
                    </span>
                ) : (
                    buttonText
                )}
            </button>

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