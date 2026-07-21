import { createBrowserRouter} from 'react-router-dom';
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login"
import Register from "../pages/Register"
import Home from "../pages/Home"

export const router = createBrowserRouter([
    {
        path:"/",
        element: <Login />
    },
    {
        path:"/register",
        element: <Register />
    },
    {
        path:"/home",
        element: <ProtectedRoute><Home /></ProtectedRoute>
    }
]);