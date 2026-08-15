import type { ReactNode } from "react";

interface ViewportProps {
    children: ReactNode;
}

export default function Viewport({
    children,
}: ViewportProps) {
    return (
        <section className="nook-viewport">
            {children}
        </section>
    );
}