import type { ReactNode } from "react";

interface WorldProps {
    children: ReactNode;
}

export default function World({
    children,
}: WorldProps) {
    return (
        <div className="nook-world">
            {children}
        </div>
    );
}