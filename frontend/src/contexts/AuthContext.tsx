import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
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

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:8081';

export function AuthProvider({
    children
}: {
    children: React.ReactNode;
}) {

    const [
        isAuthenticated,
        setIsAuthenticated
    ] = useState(false);

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

                    const response =
                        await fetch(
                            `${BACKEND_URL}/auth/me`,
                            {
                                method: 'GET',

                                credentials:
                                    'include',

                                headers: {
                                    Accept:
                                        'application/json'
                                }
                            }
                        );

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
                        await response.json();

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

                await fetch(
                    `${BACKEND_URL}/auth/logout`,
                    {
                        method: 'POST',

                        credentials:
                            'include'
                    }
                );

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