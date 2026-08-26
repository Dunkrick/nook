import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <main className="auth-page">
            <section className="auth-shell">
                {/* ======================================================
                    LEFT — THE NOOK WORLD
                   ====================================================== */}
                <aside className="auth-scene" aria-hidden="true">
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

                {/* ======================================================
                    RIGHT — AUTH INTERACTION
                   ====================================================== */}
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

                        {/* Login / Register render their heading + form here */}
                        <div className="auth-form-viewport">
                            <Outlet />
                        </div>
                    </div>

                    <footer className="auth-footer">
                        <span>Your quiet place to think.</span>
                    </footer>
                </section>
            </section>
        </main>
    );
}