import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    return isAuthenticated()
    ? children
    : <Navigate to="/" replace />;
}
