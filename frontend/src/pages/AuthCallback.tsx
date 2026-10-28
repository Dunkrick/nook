import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken, setUser } from "../lib/storage";
import type { User } from "../types/auth";

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const errorParam = searchParams.get("error");
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    const error =
        errorParam ||
        (!token ? "No authentication token received." : null);

    useEffect(() => {
        if (!token || errorParam) {
            return;
        }

        setToken(token);

        if (userParam) {
            try {
                const user = JSON.parse(userParam) as User;
                setUser(user);
            } catch {
                // If user serialization fails, session remains authenticated via token
            }
        }

        navigate("/home", { replace: true });
    }, [token, errorParam, userParam, navigate]);

    if (error) {
        return (
            <div className="auth-page">
                <div className="auth-callback-shell">
                    <h2 className="auth-title">
                        Sign in failed
                    </h2>
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                    <button
                        type="button"
                        className="auth-submit"
                        onClick={() => navigate("/", { replace: true })}
                    >
                        Back to sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-callback-shell">
                <h2 className="auth-title">
                    Opening your Nook...
                </h2>
                <p className="auth-description">
                    Confirming your identity.
                </p>
            </div>
        </div>
    );
}
