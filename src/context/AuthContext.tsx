import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ──────────────────────── Types ────────────────────────

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: "Admin";
    status: "Active" | "Blocked";
    walletBalance: number;
    kycStatus: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AuthContextType {
    admin: AdminUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loginError: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// ──────────────────────── Config ────────────────────────

// Uses Vite proxy in dev — relative URLs go through the proxy to localhost:5000
// In production, set VITE_API_URL to the absolute backend URL
const API_BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_user";

// ──────────────────────── Helpers ────────────────────────

function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function getStoredAdmin(): AdminUser | null {
    try {
        const raw = localStorage.getItem(ADMIN_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persistSession(token: string, admin: AdminUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
}

// ──────────────────────── Context ────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(getStoredAdmin);
    const [token, setToken] = useState<string | null>(getStoredToken);
    const [isLoading, setIsLoading] = useState(true);
    const [loginError, setLoginError] = useState<string | null>(null);

    // ── Validate existing session on mount ──
    useEffect(() => {
        const validateSession = async () => {
            const storedToken = getStoredToken();
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/admin/me`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!res.ok) {
                    // Session expired or invalid
                    clearSession();
                    setAdmin(null);
                    setToken(null);
                } else {
                    const json = await res.json();
                    if (json.status === "success" && json.data?.user) {
                        setAdmin(json.data.user);
                        setToken(storedToken);
                        persistSession(storedToken, json.data.user);
                    } else {
                        clearSession();
                        setAdmin(null);
                        setToken(null);
                    }
                }
            } catch {
                // Network error — keep existing session, don't invalidate
                console.warn("Could not validate admin session. Keeping cached session.");
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
    }, []);

    // ── Login ──
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setLoginError(null);
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();

            if (!res.ok || json.status !== "success") {
                setLoginError(json.message || "Login failed. Please check your credentials.");
                setIsLoading(false);
                return false;
            }

            const adminUser: AdminUser = json.data.user;
            const authToken: string = json.token;

            setAdmin(adminUser);
            setToken(authToken);
            persistSession(authToken, adminUser);
            setIsLoading(false);
            return true;
        } catch (err: any) {
            setLoginError(err.message || "Network error. Could not reach the server.");
            setIsLoading(false);
            return false;
        }
    }, []);

    // ── Logout ──
    const logout = useCallback(async () => {
        try {
            const storedToken = getStoredToken();
            if (storedToken) {
                await fetch(`${API_BASE}/api/admin/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
            }
        } catch {
            // Swallow network errors during logout
        } finally {
            clearSession();
            setAdmin(null);
            setToken(null);
        }
    }, []);

    const clearError = useCallback(() => setLoginError(null), []);

    const value: AuthContextType = {
        admin,
        token,
        isAuthenticated: !!admin && !!token,
        isLoading,
        loginError,
        login,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}