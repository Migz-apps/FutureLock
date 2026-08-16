import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import CreatorCovenantModal from '../components/CreatorCovenantModal';

import {
    apiFetch,
    getErrorMessage,
    handleAsyncError,
    parseApiResponse
} from '../utils/errorHandler';

const Login = () => {
    const [activeTab, setActiveTab] = useState<'web3' | 'web2'>('web3');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Buyer');

    const [showCovenant, setShowCovenant] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formError, setFormError] = useState('');

    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const { login, redirectUrl, setRedirectUrl } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    const getRedirectRoute = (defaultRole: string) => {
        const queryRedirect = router.query.redirect as string | undefined;

        if (queryRedirect) return queryRedirect;
        if (redirectUrl) return redirectUrl;

        return defaultRole === 'Creator'
            ? '/creator'
            : '/marketplace';
    };

    const finishLogin = (
        resolvedRole: string,
        identityType: string,
        identity: string
    ) => {
        login(
            resolvedRole,
            identityType,
            identity
        );

        const nextRoute = getRedirectRoute(resolvedRole);

        setRedirectUrl('');
        router.push(nextRoute);
    };

    const handleEmailSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setFormError('');
        setFieldErrors({});

        const newFieldErrors: typeof fieldErrors = {};

        if (!email.trim()) {
            newFieldErrors.email = 'Email is required';
        }

        if (!password.trim()) {
            newFieldErrors.password = 'Password is required';
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        const result = await handleAsyncError(async () => {
            const response = await apiFetch(
                '/auth/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        password,
                        role
                    })
                }
            );

            return parseApiResponse<{
                message: string;
                role: string;
                username?: string;
                identityType: string;
                identity: string;
            }>(response);
        });

        if (result.error) {
            setFormError(result.error);
            return;
        }

        const data = result.data!;

        finishLogin(
            data.role || role,
            data.identityType || 'email',
            data.identity || email.trim().toLowerCase()
        );
    };

    const handleRoleSelect = (
        selectedRole: string
    ) => {
        if (selectedRole === 'Creator') {
            setShowCovenant(true);
        } else {
            setRole('Buyer');
        }
    };

    const handleAcceptCovenant = () => {
        setRole('Creator');
        setShowCovenant(false);
    };

    const handleDeclineCovenant = () => {
        setRole('Buyer');
        setShowCovenant(false);
    };

    const handleWalletConnect = async () => {
        setFormError('');

        if (!username.trim()) {
            setFormError(
                'Please choose a username first.'
            );
            return;
        }

        try {
            if (!(window as any).ethereum) {
                setFormError(
                    'MetaMask or another compatible Web3 wallet is required.'
                );
                return;
            }

            const accounts =
                await (window as any).ethereum.request({
                    method: 'eth_requestAccounts'
                });

            if (!accounts || accounts.length === 0) {
                setFormError(
                    'No wallet account was selected.'
                );
                return;
            }

            const walletAddress =
                String(accounts[0]).toLowerCase();

            const result = await handleAsyncError(
                async () => {
                    const response = await apiFetch(
                        '/auth/wallet-login',
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                username:
                                    username
                                        .trim()
                                        .toLowerCase(),
                                walletAddress,
                                role: 'Creator'
                            })
                        }
                    );

                    return parseApiResponse<{
                        role: string;
                        identityType: string;
                        identity: string;
                    }>(response);
                }
            );

            if (result.error) {
                setFormError(result.error);
                return;
            }

            const data = result.data!;

            finishLogin(
                data.role || 'Creator',
                data.identityType || 'wallet',
                data.identity || walletAddress
            );

        } catch (error: any) {
            setFormError(
                getErrorMessage(error)
            );
        }
    };

    const inputStyle = (
        hasError = false
    ): React.CSSProperties => ({
        width: '100%',
        padding: '14px 16px',
        borderRadius: '10px',

        border: `1px solid ${
            hasError
                ? '#ef4444'
                : isDark
                    ? '#333'
                    : '#d1d5db'
        }`,

        backgroundColor:
            isDark
                ? '#0c0c18'
                : '#f9fafb',

        color:
            isDark
                ? '#fff'
                : '#111827',

        outline: 'none',
        fontSize: '16px',

        transition:
            'border-color 0.2s ease, box-shadow 0.2s ease'
    });

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',

                backgroundColor:
                    isDark
                        ? '#000'
                        : '#fff',

                color:
                    isDark
                        ? '#fff'
                        : '#000'
            }}
        >
            {/* LEFT SIDE */}

            <div
                style={{
                    flex: '3.5',

                    background:
                        'linear-gradient(135deg, #0070f3 0%, #000000 100%)',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    minHeight: '100vh'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        color: '#fff'
                    }}
                >
                    <h1
                        style={{
                            fontSize: '72px',
                            fontWeight: '900',
                            letterSpacing: '-3px',
                            lineHeight: 0.9,
                            margin: 0
                        }}
                    >
                        FUTURE
                        <br />
                        LOCK
                    </h1>

                    <p
                        style={{
                            fontSize: '24px',
                            opacity: 0.8,
                            marginTop: '28px'
                        }}
                    >
                        The decentralized future market.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}

            <div
                style={{
                    flex: '1.5',

                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',

                    padding: '50px 8%',

                    minWidth: 0
                }}
            >
                <h1
                    style={{
                        fontSize: '40px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}
                >
                    Welcome Back
                </h1>

                <p
                    style={{
                        color:
                            isDark
                                ? '#aaa'
                                : '#666',

                        marginBottom: '30px'
                    }}
                >
                    Select an authentication pathway.
                </p>

                {/* TABS */}

                <div
                    style={{
                        display: 'flex',

                        marginBottom: '30px',

                        borderBottom:
                            `2px solid ${
                                isDark
                                    ? '#333'
                                    : '#eee'
                            }`
                    }}
                >
                    <button
                        type="button"

                        onClick={() =>
                            setActiveTab('web3')
                        }

                        style={{
                            flex: 1,
                            padding: '12px',

                            border: 'none',

                            background:
                                'transparent',

                            color:
                                activeTab === 'web3'
                                    ? 'var(--accent-primary)'
                                    : isDark
                                        ? '#888'
                                        : '#777',

                            fontWeight:
                                activeTab === 'web3'
                                    ? 'bold'
                                    : 'normal',

                            borderBottom:
                                activeTab === 'web3'
                                    ? '2px solid var(--accent-primary)'
                                    : '2px solid transparent',

                            cursor: 'pointer',

                            fontSize: '16px',

                            transition: 'all 0.2s'
                        }}
                    >
                        Web3 Portal (Wallet)
                    </button>

                    <button
                        type="button"

                        onClick={() =>
                            setActiveTab('web2')
                        }

                        style={{
                            flex: 1,
                            padding: '12px',

                            border: 'none',

                            background:
                                'transparent',

                            color:
                                activeTab === 'web2'
                                    ? 'var(--accent-primary)'
                                    : isDark
                                        ? '#888'
                                        : '#777',

                            fontWeight:
                                activeTab === 'web2'
                                    ? 'bold'
                                    : 'normal',

                            borderBottom:
                                activeTab === 'web2'
                                    ? '2px solid var(--accent-primary)'
                                    : '2px solid transparent',

                            cursor: 'pointer',

                            fontSize: '16px',

                            transition: 'all 0.2s'
                        }}
                    >
                        Standard Access
                    </button>
                </div>

                {activeTab === 'web3' ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '35px 0'
                        }}
                    >
                        <p
                            style={{
                                marginBottom: '22px',

                                color:
                                    isDark
                                        ? '#ccc'
                                        : '#444'
                            }}
                        >
                            Connect your cryptographic wallet
                            to sign in securely.
                        </p>

                        <div
                            style={{
                                marginBottom: '20px',
                                textAlign: 'left'
                            }}
                        >
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Choose Your Identity
                            </label>

                            <input
                                type="text"

                                value={username}

                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                            .toLowerCase()
                                    )
                                }

                                style={inputStyle(
                                    Boolean(formError)
                                )}

                                placeholder="e.g. shadowbroker"
                            />
                        </div>

                        {formError && (
                            <p
                                style={{
                                    color: '#ef4444',
                                    fontSize: '13px',
                                    textAlign: 'left',
                                    marginBottom: '16px'
                                }}
                            >
                                {formError}
                            </p>
                        )}

                        <button
                            type="button"

                            onClick={
                                handleWalletConnect
                            }

                            style={{
                                padding:
                                    '16px 32px',

                                backgroundColor:
                                    'var(--accent-primary)',

                                color: '#fff',

                                border: 'none',

                                borderRadius: '10px',

                                fontWeight: 'bold',

                                cursor: 'pointer',

                                fontSize: '17px',

                                width: '100%',

                                transition:
                                    'transform 0.15s ease, opacity 0.2s'
                            }}
                        >
                            Connect & Sign
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={
                            handleEmailSubmit
                        }

                        noValidate

                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}
                    >
                        {/* ROLE */}

                        <div
                            style={{
                                display: 'flex',
                                gap: '20px',
                                marginBottom: '5px'
                            }}
                        >
                            <div
                                onClick={() =>
                                    handleRoleSelect(
                                        'Creator'
                                    )
                                }

                                style={{
                                    flex: 1,

                                    padding: '12px',

                                    textAlign: 'center',

                                    border:
                                        `2px solid ${
                                            role === 'Creator'
                                                ? 'var(--accent-primary)'
                                                : isDark
                                                    ? '#333'
                                                    : '#ccc'
                                        }`,

                                    borderRadius:
                                        '12px',

                                    cursor: 'pointer',

                                    backgroundColor:
                                        role === 'Creator'
                                            ? 'rgba(0,112,243,0.10)'
                                            : 'transparent',

                                    transition:
                                        'all 0.2s'
                                }}
                            >
                                <h4
                                    style={{
                                        margin: 0
                                    }}
                                >
                                    Creator
                                </h4>
                            </div>

                            <div
                                onClick={() =>
                                    handleRoleSelect(
                                        'Buyer'
                                    )
                                }

                                style={{
                                    flex: 1,

                                    padding: '12px',

                                    textAlign: 'center',

                                    border:
                                        `2px solid ${
                                            role === 'Buyer'
                                                ? 'var(--accent-primary)'
                                                : isDark
                                                    ? '#333'
                                                    : '#ccc'
                                        }`,

                                    borderRadius:
                                        '12px',

                                    cursor: 'pointer',

                                    backgroundColor:
                                        role === 'Buyer'
                                            ? 'rgba(0,112,243,0.10)'
                                            : 'transparent',

                                    transition:
                                        'all 0.2s'
                                }}
                            >
                                <h4
                                    style={{
                                        margin: 0
                                    }}
                                >
                                    Buyer
                                </h4>
                            </div>
                        </div>

                        {/* EMAIL */}

                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Email
                            </label>

                            <input
                                type="email"

                                value={email}

                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }

                                style={inputStyle(
                                    Boolean(
                                        fieldErrors.email
                                    )
                                )}

                                placeholder="you@example.com"

                                autoComplete="email"
                            />

                            {fieldErrors.email && (
                                <p
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        marginTop: '5px',
                                        marginBottom: 0
                                    }}
                                >
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* PASSWORD */}

                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Password
                            </label>

                            <div
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }

                                    value={password}

                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }

                                    placeholder="••••••••"

                                    autoComplete="current-password"

                                    style={{
                                        ...inputStyle(
                                            Boolean(
                                                fieldErrors.password
                                            )
                                        ),

                                        paddingRight:
                                            '48px'
                                    }}
                                />

                                <button
                                    type="button"

                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }

                                    style={{
                                        position:
                                            'absolute',

                                        right: '14px',

                                        background:
                                            'none',

                                        border: 'none',

                                        cursor:
                                            'pointer',

                                        padding: '4px',

                                        display: 'flex',

                                        alignItems:
                                            'center',

                                        justifyContent:
                                            'center',

                                        color:
                                            isDark
                                                ? '#777'
                                                : '#666'
                                    }}
                                >
                                    {showPassword
                                        ? (
                                            <EyeOff
                                                size={20}
                                            />
                                        )
                                        : (
                                            <Eye
                                                size={20}
                                            />
                                        )}
                                </button>
                            </div>

                            {fieldErrors.password && (
                                <p
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        marginTop: '5px',
                                        marginBottom: 0
                                    }}
                                >
                                    {
                                        fieldErrors.password
                                    }
                                </p>
                            )}
                        </div>

                        {formError && (
                            <div
                                style={{
                                    padding:
                                        '12px 14px',

                                    borderRadius:
                                        '8px',

                                    background:
                                        'rgba(239,68,68,0.08)',

                                    border:
                                        '1px solid rgba(239,68,68,0.35)',

                                    color:
                                        '#ef4444',

                                    fontSize:
                                        '14px',

                                    textAlign:
                                        'center'
                                }}
                            >
                                {formError}
                            </div>
                        )}

                        <button
                            type="submit"

                            style={{
                                padding: '15px',

                                backgroundColor:
                                    'var(--accent-primary)',

                                color: '#fff',

                                border: 'none',

                                borderRadius: '10px',

                                fontWeight: 'bold',

                                cursor: 'pointer',

                                marginTop: '5px',

                                fontSize: '16px',

                                transition:
                                    'all 0.2s'
                            }}
                        >
                            Sign In
                        </button>
                    </form>
                )}

                <p
                    style={{
                        marginTop: '30px',
                        textAlign: 'center',

                        color:
                            isDark
                                ? '#aaa'
                                : '#666'
                    }}
                >
                    Don't have an account?{' '}

                    <Link
                        href={
                            `/signup${
                                router.query.redirect
                                    ? `?redirect=${router.query.redirect}`
                                    : ''
                            }`
                        }

                        style={{
                            color:
                                'var(--accent-primary)',

                            textDecoration:
                                'none',

                            fontWeight:
                                'bold'
                        }}
                    >
                        Sign up
                    </Link>
                </p>
            </div>

            <CreatorCovenantModal
                isOpen={showCovenant}
                onAccept={
                    handleAcceptCovenant
                }
                onDecline={
                    handleDeclineCovenant
                }
            />
        </div>
    );
};

export default Login;