import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    role: string | null;
    identityType: 'email' | 'wallet' | null;
    identity: string | null;
    login: (role: string, type: 'email' | 'wallet', identityStr: string) => void;
    logout: () => void;
    redirectUrl?: string;
    setRedirectUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [identityType, setIdentityType] = useState<'email' | 'wallet' | null>(null);
    const [identity, setIdentity] = useState<string | null>(null);
    const [redirectUrl, setRedirectState] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Check auth status from backend
        fetch('http://127.0.0.1:8080/auth/me', { credentials: 'include' })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Not authenticated');
            })
            .then(data => {
                setIsAuthenticated(true);
                setRole(data.role);
                setIdentityType(data.identityType || 'email');
                setIdentity(data.identity || '');
            })
            .catch(() => {
                setIsAuthenticated(false);
                setRole(null);
                setIdentityType(null);
                setIdentity(null);
            });
    }, []);

    const login = (role: string, type: 'email' | 'wallet', identityStr: string) => {
        setIsAuthenticated(true);
        setRole(role);
        setIdentityType(type);
        setIdentity(identityStr);
    };

    const logout = () => {
        fetch('http://127.0.0.1:8080/auth/logout', { credentials: 'include' }).finally(() => {
            setIsAuthenticated(false);
            setRole(null);
            setIdentityType(null);
            setIdentity(null);
        });
    };

    const setRedirectUrl = (url: string) => {
        setRedirectState(url);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, identityType, identity, login, logout, redirectUrl, setRedirectUrl }}>
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
