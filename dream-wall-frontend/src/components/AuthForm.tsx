import { useState } from "react";

interface AuthFormProps {
    buttonText: string;
    loadingButtonText: string;
    onSubmit: (credentials: { email: string; password: string }) => Promise<any>;
    onSuccess: () => void;
    togglePrompt: string;
    onToggle: () => void;
}

export default function AuthForm({ 
    buttonText, 
    loadingButtonText, 
    onSubmit, 
    onSuccess, 
    togglePrompt, 
    onToggle 
}: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        if (email === "" || password === "") {
            setError("Email and password are required");
            return;
        }
        setError("");
        setLoading(true);

        try {
            await onSubmit({ email, password });
            onSuccess();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "An unexpected error occurred");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? loadingButtonText : buttonText}
            </button>
            <p>{togglePrompt}</p>
            <button type="button" onClick={onToggle}>
                {buttonText === "Login" ? "Register" : "Login"}
            </button>
        </form>
    );
}