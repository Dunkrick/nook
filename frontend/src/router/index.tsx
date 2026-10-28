import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import AuthCallback from "../pages/AuthCallback";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthLayout />,
    },
    {
        path: "/register",
        element: <AuthLayout />,
    },
    {
        path: "/auth/callback",
        element: <AuthCallback />,
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
    },
]);