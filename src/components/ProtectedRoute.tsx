import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute — wraps admin pages.
 * - If loading: shows a full-screen spinner while validating session
 * - If not authenticated: redirects to /login
 * - If authenticated: renders children via Outlet
 */
export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-500 text-white shadow-xl shadow-primary/40">
                        <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400 tracking-wide">
                        Verifying Administrator Session...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}