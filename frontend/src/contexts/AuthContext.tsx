import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    role: string | null;
    login: (role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        // Check auth status from backend (using HttpOnly cookies)
        fetch('http://127.0.0.1:8000/auth/me', { credentials: 'include' })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Not authenticated');
            })
            .then(data => {
                setIsAuthenticated(true);
                setRole(data.role);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setRole(null);
            });
    }, []);

    const login = (role: string) => {
        setIsAuthenticated(true);
        setRole(role);
    };

    const logout = () => {
        fetch('http://127.0.0.1:8000/auth/logout', { credentials: 'include' }).finally(() => {
            setIsAuthenticated(false);
            setRole(null);
        });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}
