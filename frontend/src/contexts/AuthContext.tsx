import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';
import { apiFetch, parseApiResponse } from '../utils/errorHandler';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    role: string | null;
    identityType: 'email' | 'wallet' | null;
    identity: string | null;

    login: (
        role: string,
        type: 'email' | 'wallet',
        identityStr: string
    ) => void;

    logout: () => void;

    redirectUrl?: string;

    setRedirectUrl: (
        url: string
    ) => void;
}

const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );

export function AuthProvider({
    children
}: {
    children: React.ReactNode;
}) {

    const [
        isAuthenticated,
        setIsAuthenticated
    ] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [
        role,
        setRole
    ] = useState<string | null>(null);

    const [
        identityType,
        setIdentityType
    ] =
        useState<'email' | 'wallet' | null>(
            null
        );

    const [
        identity,
        setIdentity
    ] =
        useState<string | null>(
            null
        );

    const [
        redirectUrl,
        setRedirectState
    ] =
        useState<string | undefined>(
            undefined
        );

    useEffect(() => {

        const checkAuthentication =
            async () => {

                try {

                    const response = await apiFetch('/auth/me');

                    if (!response.ok) {

                        setIsAuthenticated(
                            false
                        );

                        setRole(null);
                        setIdentityType(null);
                        setIdentity(null);

                        return;
                    }

                    const data =
                        await parseApiResponse(response);

                    setIsAuthenticated(
                        true
                    );

                    setRole(
                        data.role ?? null
                    );

                    if (
                        data.identityType ===
                            'email' ||
                        data.identityType ===
                            'wallet'
                    ) {

                        setIdentityType(
                            data.identityType
                        );

                    } else {

                        setIdentityType(
                            null
                        );
                    }

                    setIdentity(
                        data.identity ?? null
                    );

                } catch {

                    setIsAuthenticated(
                        false
                    );

                    setRole(null);
                    setIdentityType(null);
                    setIdentity(null);
                } finally {
                    setIsLoading(false);
                }
            };

        checkAuthentication();

    }, []);

    const login = (
        userRole: string,
        type: 'email' | 'wallet',
        identityStr: string
    ) => {

        setIsAuthenticated(true);

        setRole(userRole);

        setIdentityType(type);

        setIdentity(identityStr);
    };

    const logout =
        async () => {

            try {

                await apiFetch('/auth/logout', { method: 'POST' });

            } finally {

                setIsAuthenticated(
                    false
                );

                setRole(null);

                setIdentityType(null);

                setIdentity(null);
            }
        };

    const setRedirectUrl =
        (url: string) => {

            setRedirectState(url);
        };

    return (

        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                role,
                identityType,
                identity,
                login,
                logout,
                redirectUrl,
                setRedirectUrl
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}

export function useAuth() {

    const context =
        useContext(AuthContext);

    if (
        context === undefined
    ) {

        throw new Error(
            'useAuth must be used within an AuthProvider'
        );
    }

    return context;
}
