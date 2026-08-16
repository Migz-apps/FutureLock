import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Eye,
    EyeOff,
    Mail,
    ShieldCheck
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import CreatorCovenantModal
    from '../components/CreatorCovenantModal';

import {
    apiFetch,
    getErrorMessage,
    handleAsyncError,
    parseApiResponse
} from '../utils/errorHandler';

type SignupData = {
    username: string;
    email: string;
    password: string;
    role: string;
};

const Signup = () => {
    const [activeTab, setActiveTab] =
        useState<'web3' | 'web2'>('web3');

    const [username, setUsername] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [role, setRole] =
        useState('Buyer');

    const [showCovenant, setShowCovenant] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [formError, setFormError] =
        useState('');

    const [fieldErrors, setFieldErrors] =
        useState<{
            username?: string;
            email?: string;
            password?: string;
        }>({});

    const [showVerification, setShowVerification] =
        useState(false);

    const [verificationCode, setVerificationCode] =
        useState('');

    const [verificationError, setVerificationError] =
        useState('');

    const [pendingSignup, setPendingSignup] =
        useState<SignupData | null>(null);

    const [verifying, setVerifying] =
        useState(false);

    const { login, redirectUrl, setRedirectUrl } =
        useAuth();

    const router = useRouter();

    const { theme } = useTheme();

    const isDark = theme === 'dark';

    const getRedirectRoute = (
        defaultRole: string
    ) => {
        const queryRedirect =
            router.query.redirect as
            string | undefined;

        if (queryRedirect) {
            return queryRedirect;
        }

        if (redirectUrl) {
            return redirectUrl;
        }

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

        const route =
            getRedirectRoute(
                resolvedRole
            );

        setRedirectUrl('');

        router.push(route);
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

    const handleEmailSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setFormError('');
        setFieldErrors({});

        const newFieldErrors:
            typeof fieldErrors = {};

        if (!username.trim()) {
            newFieldErrors.username =
                'Username is required';
        }

        if (!email.trim()) {
            newFieldErrors.email =
                'Email is required';
        }

        if (!password.trim()) {
            newFieldErrors.password =
                'Password is required';
        } else if (password.length < 8) {
            newFieldErrors.password =
                'Password must contain at least 8 characters';
        }

        if (
            Object.keys(
                newFieldErrors
            ).length > 0
        ) {
            setFieldErrors(
                newFieldErrors
            );

            return;
        }

        const normalizedData:
            SignupData = {

            username:
                username
                    .trim()
                    .toLowerCase(),

            email:
                email
                    .trim()
                    .toLowerCase(),

            password,

            role
        };

        const result =
            await handleAsyncError(
                async () => {
                    const response =
                        await apiFetch(
                            '/auth/request-verification',
                            {
                                method: 'POST',

                                body:
                                    JSON.stringify({
                                        email:
                                            normalizedData.email
                                    })
                            }
                        );

                    return parseApiResponse<{
                        message: string;
                    }>(response);
                }
            );

        if (result.error) {
            setFormError(
                result.error
            );

            return;
        }

        setPendingSignup(
            normalizedData
        );

        setVerificationCode('');

        setVerificationError('');

        setShowVerification(true);
    };

    const handleVerifyAndSignup =
        async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            if (!pendingSignup) {
                setVerificationError(
                    'Signup session expired. Please restart registration.'
                );

                return;
            }

            const code =
                verificationCode.trim();

            if (!/^\d{6}$/.test(code)) {
                setVerificationError(
                    'Enter the 6-digit verification code.'
                );

                return;
            }

            setVerificationError('');
            setVerifying(true);

            const result =
                await handleAsyncError(
                    async () => {
                        const verifyResponse =
                            await apiFetch(
                                '/auth/confirm-code',
                                {
                                    method: 'POST',

                                    body:
                                        JSON.stringify({
                                            email:
                                                pendingSignup.email,

                                            code
                                        })
                                }
                            );

                        await parseApiResponse(
                            verifyResponse
                        );

                        const signupResponse =
                            await apiFetch(
                                '/auth/signup',
                                {
                                    method: 'POST',

                                    body:
                                        JSON.stringify(
                                            pendingSignup
                                        )
                                }
                            );

                        return parseApiResponse<{
                            role: string;
                            identityType: string;
                            identity: string;
                        }>(
                            signupResponse
                        );
                    }
                );

            setVerifying(false);

            if (result.error) {
                setVerificationError(
                    result.error
                );

                return;
            }

            const data =
                result.data!;

            finishLogin(
                data.role ||
                    pendingSignup.role,

                data.identityType ||
                    'email',

                data.identity ||
                    pendingSignup.email
            );
        };

    const handleResendCode =
        async () => {
            if (!pendingSignup) {
                return;
            }

            setVerificationError('');

            const result =
                await handleAsyncError(
                    async () => {
                        const response =
                            await apiFetch(
                                '/auth/request-verification',
                                {
                                    method:
                                        'POST',

                                    body:
                                        JSON.stringify({
                                            email:
                                                pendingSignup.email
                                        })
                                }
                            );

                        return parseApiResponse(
                            response
                        );
                    }
                );

            if (result.error) {
                setVerificationError(
                    result.error
                );
            }
        };

    const handleWalletConnect =
        async () => {
            setFormError('');

            if (!username.trim()) {
                setFormError(
                    'Please choose a username first.'
                );

                return;
            }

            try {
                if (
                    !(window as any)
                        .ethereum
                ) {
                    setFormError(
                        'MetaMask or another compatible Web3 wallet is required.'
                    );

                    return;
                }

                const accounts =
                    await (
                        window as any
                    ).ethereum.request({
                        method:
                            'eth_requestAccounts'
                    });

                if (
                    !accounts ||
                    accounts.length === 0
                ) {
                    setFormError(
                        'No wallet account was selected.'
                    );

                    return;
                }

                const walletAddress =
                    String(
                        accounts[0]
                    ).toLowerCase();

                const result =
                    await handleAsyncError(
                        async () => {
                            const response =
                                await apiFetch(
                                    '/auth/wallet-login',
                                    {
                                        method:
                                            'POST',

                                        body:
                                            JSON.stringify({
                                                username:
                                                    username
                                                        .trim()
                                                        .toLowerCase(),

                                                walletAddress,

                                                role:
                                                    'Creator'
                                            })
                                    }
                                );

                            return parseApiResponse<{
                                role: string;
                                identityType: string;
                                identity: string;
                            }>(
                                response
                            );
                        }
                    );

                if (result.error) {
                    setFormError(
                        result.error
                    );

                    return;
                }

                const data =
                    result.data!;

                finishLogin(
                    data.role ||
                        'Creator',

                    data.identityType ||
                        'wallet',

                    data.identity ||
                        walletAddress
                );

            } catch (
                error: any
            ) {
                setFormError(
                    getErrorMessage(
                        error
                    )
                );
            }
        };

    const inputStyle = (
        hasError = false
    ): React.CSSProperties => ({
        width: '100%',

        padding:
            '14px 16px',

        borderRadius:
            '10px',

        border:
            `1px solid ${
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

        outline:
            'none',

        fontSize:
            '16px',

        transition:
            'border-color 0.2s ease, box-shadow 0.2s ease'
    });

    return (
        <div
            style={{
                display: 'flex',

                minHeight:
                    '100vh',

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
                        'linear-gradient(135deg, #001f3f 0%, #0070f3 100%)',

                    display:
                        'flex',

                    alignItems:
                        'center',

                    justifyContent:
                        'center',

                    minHeight:
                        '100vh'
                }}
            >
                <div
                    style={{
                        textAlign:
                            'center',

                        color:
                            '#fff'
                    }}
                >
                    <h1
                        style={{
                            fontSize:
                                '72px',

                            fontWeight:
                                '900',

                            letterSpacing:
                                '-3px',

                            lineHeight:
                                0.95,

                            margin:
                                0
                        }}
                    >
                        Unlock
                        <br />
                        Insights
                    </h1>

                    <p
                        style={{
                            fontSize:
                                '24px',

                            opacity:
                                0.8,

                            marginTop:
                                '24px'
                        }}
                    >
                        Join the community.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}

            <div
                style={{
                    flex:
                        '1.5',

                    display:
                        'flex',

                    flexDirection:
                        'column',

                    justifyContent:
                        'center',

                    padding:
                        '50px 8%',

                    minWidth:
                        0
                }}
            >
                <h1
                    style={{
                        fontSize:
                            '40px',

                        fontWeight:
                            'bold',

                        marginBottom:
                            '10px'
                    }}
                >
                    Create Account
                </h1>

                <p
                    style={{
                        color:
                            isDark
                                ? '#aaa'
                                : '#666',

                        marginBottom:
                            '30px'
                    }}
                >
                    Join the FutureLock protocol
                    to proceed.
                </p>

                {/* TABS */}

                <div
                    style={{
                        display:
                            'flex',

                        marginBottom:
                            '30px',

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
                            setActiveTab(
                                'web3'
                            )
                        }

                        style={{
                            flex:
                                1,

                            padding:
                                '12px',

                            border:
                                'none',

                            background:
                                'transparent',

                            color:
                                activeTab ===
                                'web3'
                                    ? '#0070f3'
                                    : isDark
                                        ? '#888'
                                        : '#777',

                            fontWeight:
                                activeTab ===
                                'web3'
                                    ? 'bold'
                                    : 'normal',

                            borderBottom:
                                activeTab ===
                                'web3'
                                    ? '2px solid #0070f3'
                                    : '2px solid transparent',

                            cursor:
                                'pointer',

                            fontSize:
                                '16px'
                        }}
                    >
                        Web3 Portal
                    </button>

                    <button
                        type="button"

                        onClick={() =>
                            setActiveTab(
                                'web2'
                            )
                        }

                        style={{
                            flex:
                                1,

                            padding:
                                '12px',

                            border:
                                'none',

                            background:
                                'transparent',

                            color:
                                activeTab ===
                                'web2'
                                    ? '#0070f3'
                                    : isDark
                                        ? '#888'
                                        : '#777',

                            fontWeight:
                                activeTab ===
                                'web2'
                                    ? 'bold'
                                    : 'normal',

                            borderBottom:
                                activeTab ===
                                'web2'
                                    ? '2px solid #0070f3'
                                    : '2px solid transparent',

                            cursor:
                                'pointer',

                            fontSize:
                                '16px'
                        }}
                    >
                        Standard Access
                    </button>
                </div>

                {activeTab ===
                'web3' ? (
                    <div
                        style={{
                            padding:
                                '35px 0'
                        }}
                    >
                        <div
                            style={{
                                marginBottom:
                                    '20px'
                            }}
                        >
                            <label
                                style={{
                                    display:
                                        'block',

                                    marginBottom:
                                        '8px',

                                    fontWeight:
                                        'bold'
                                }}
                            >
                                Choose Your Identity
                            </label>

                            <input
                                type="text"

                                value={
                                    username
                                }

                                onChange={(
                                    e
                                ) =>
                                    setUsername(
                                        e.target.value
                                            .toLowerCase()
                                    )
                                }

                                style={
                                    inputStyle(
                                        Boolean(
                                            formError
                                        )
                                    )
                                }

                                placeholder="e.g. shadowbroker"
                            />
                        </div>

                        {formError && (
                            <p
                                style={{
                                    color:
                                        '#ef4444',

                                    fontSize:
                                        '13px'
                                }}
                            >
                                {
                                    formError
                                }
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
                                    '#0070f3',

                                color:
                                    '#fff',

                                border:
                                    'none',

                                borderRadius:
                                    '10px',

                                fontWeight:
                                    'bold',

                                cursor:
                                    'pointer',

                                fontSize:
                                    '17px',

                                width:
                                    '100%'
                            }}
                        >
                            Connect Wallet
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={
                            handleEmailSubmit
                        }

                        noValidate

                        style={{
                            display:
                                'flex',

                            flexDirection:
                                'column',

                            gap:
                                '20px'
                        }}
                    >
                        {/* ROLE */}

                        <div
                            style={{
                                display:
                                    'flex',

                                gap:
                                    '20px'
                            }}
                        >
                            <div
                                onClick={() =>
                                    handleRoleSelect(
                                        'Creator'
                                    )
                                }

                                style={{
                                    flex:
                                        1,

                                    padding:
                                        '12px',

                                    textAlign:
                                        'center',

                                    border:
                                        `2px solid ${
                                            role ===
                                            'Creator'
                                                ? '#0070f3'
                                                : isDark
                                                    ? '#333'
                                                    : '#ccc'
                                        }`,

                                    borderRadius:
                                        '12px',

                                    cursor:
                                        'pointer',

                                    backgroundColor:
                                        role ===
                                        'Creator'
                                            ? 'rgba(0,112,243,0.10)'
                                            : 'transparent'
                                }}
                            >
                                Creator
                            </div>

                            <div
                                onClick={() =>
                                    handleRoleSelect(
                                        'Buyer'
                                    )
                                }

                                style={{
                                    flex:
                                        1,

                                    padding:
                                        '12px',

                                    textAlign:
                                        'center',

                                    border:
                                        `2px solid ${
                                            role ===
                                            'Buyer'
                                                ? '#0070f3'
                                                : isDark
                                                    ? '#333'
                                                    : '#ccc'
                                        }`,

                                    borderRadius:
                                        '12px',

                                    cursor:
                                        'pointer',

                                    backgroundColor:
                                        role ===
                                        'Buyer'
                                            ? 'rgba(0,112,243,0.10)'
                                            : 'transparent'
                                }}
                            >
                                Buyer
                            </div>
                        </div>

                        {/* USERNAME */}

                        <div>
                            <label
                                style={{
                                    display:
                                        'block',

                                    marginBottom:
                                        '8px',

                                    fontWeight:
                                        'bold'
                                }}
                            >
                                Username
                            </label>

                            <input
                                type="text"

                                value={
                                    username
                                }

                                onChange={(
                                    e
                                ) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }

                                placeholder="Choose your identity"

                                style={
                                    inputStyle(
                                        Boolean(
                                            fieldErrors.username
                                        )
                                    )
                                }
                            />

                            {fieldErrors.username &&
                                (
                                    <p
                                        style={{
                                            color:
                                                '#ef4444',

                                            fontSize:
                                                '12px',

                                            marginTop:
                                                '5px'
                                        }}
                                    >
                                        {
                                            fieldErrors.username
                                        }
                                    </p>
                                )}
                        </div>

                        {/* EMAIL */}

                        <div>
                            <label
                                style={{
                                    display:
                                        'block',

                                    marginBottom:
                                        '8px',

                                    fontWeight:
                                        'bold'
                                }}
                            >
                                Email
                            </label>

                            <input
                                type="email"

                                value={
                                    email
                                }

                                onChange={(
                                    e
                                ) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }

                                placeholder="you@example.com"

                                style={
                                    inputStyle(
                                        Boolean(
                                            fieldErrors.email
                                        )
                                    )
                                }
                            />

                            {fieldErrors.email &&
                                (
                                    <p
                                        style={{
                                            color:
                                                '#ef4444',

                                            fontSize:
                                                '12px',

                                            marginTop:
                                                '5px'
                                        }}
                                    >
                                        {
                                            fieldErrors.email
                                        }
                                    </p>
                                )}
                        </div>

                        {/* PASSWORD */}

                        <div>
                            <label
                                style={{
                                    display:
                                        'block',

                                    marginBottom:
                                        '8px',

                                    fontWeight:
                                        'bold'
                                }}
                            >
                                Password
                            </label>

                            <div
                                style={{
                                    position:
                                        'relative'
                                }}
                            >
                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }

                                    value={
                                        password
                                    }

                                    onChange={(
                                        e
                                    ) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }

                                    placeholder="••••••••"

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

                                        right:
                                            '14px',

                                        top:
                                            '50%',

                                        transform:
                                            'translateY(-50%)',

                                        background:
                                            'none',

                                        border:
                                            'none',

                                        cursor:
                                            'pointer',

                                        color:
                                            isDark
                                                ? '#777'
                                                : '#666',

                                        display:
                                            'flex'
                                    }}
                                >
                                    {
                                        showPassword
                                            ? (
                                                <EyeOff
                                                    size={
                                                        20
                                                    }
                                                />
                                            )
                                            : (
                                                <Eye
                                                    size={
                                                        20
                                                    }
                                                />
                                            )
                                    }
                                </button>
                            </div>

                            {fieldErrors.password &&
                                (
                                    <p
                                        style={{
                                            color:
                                                '#ef4444',

                                            fontSize:
                                                '12px',

                                            marginTop:
                                                '5px'
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
                                        '12px',

                                    borderRadius:
                                        '8px',

                                    color:
                                        '#ef4444',

                                    border:
                                        '1px solid rgba(239,68,68,0.35)',

                                    background:
                                        'rgba(239,68,68,0.08)',

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
                                padding:
                                    '15px',

                                backgroundColor:
                                    '#0070f3',

                                color:
                                    '#fff',

                                border:
                                    'none',

                                borderRadius:
                                    '10px',

                                fontWeight:
                                    'bold',

                                cursor:
                                    'pointer',

                                fontSize:
                                    '16px',

                                marginTop:
                                    '5px'
                            }}
                        >
                            Create Account
                        </button>
                    </form>
                )}

                <p
                    style={{
                        marginTop:
                            '30px',

                        textAlign:
                            'center',

                        color:
                            isDark
                                ? '#aaa'
                                : '#666'
                    }}
                >
                    Already have an account?{' '}

                    <Link
                        href="/login"

                        style={{
                            color:
                                '#0070f3',

                            fontWeight:
                                'bold',

                            textDecoration:
                                'none'
                        }}
                    >
                        Log in
                    </Link>
                </p>
            </div>

            {/* VERIFICATION MODAL */}

            {showVerification &&
                pendingSignup && (
                    <div
                        style={{
                            position:
                                'fixed',

                            inset:
                                0,

                            backgroundColor:
                                'rgba(0,0,0,0.82)',

                            backdropFilter:
                                'blur(8px)',

                            display:
                                'flex',

                            alignItems:
                                'center',

                            justifyContent:
                                'center',

                            zIndex:
                                1000,

                            padding:
                                '20px'
                        }}
                    >
                        <form
                            onSubmit={
                                handleVerifyAndSignup
                            }

                            style={{
                                width:
                                    '100%',

                                maxWidth:
                                    '430px',

                                backgroundColor:
                                    isDark
                                        ? '#090914'
                                        : '#ffffff',

                                border:
                                    `1px solid ${
                                        isDark
                                            ? '#29293a'
                                            : '#e5e7eb'
                                    }`,

                                borderRadius:
                                    '18px',

                                padding:
                                    '32px',

                                boxShadow:
                                    '0 30px 80px rgba(0,0,0,0.45)'
                            }}
                        >
                            <div
                                style={{
                                    width:
                                        '52px',

                                    height:
                                        '52px',

                                    borderRadius:
                                        '14px',

                                    background:
                                        'rgba(0,112,243,0.12)',

                                    color:
                                        '#0070f3',

                                    display:
                                        'flex',

                                    alignItems:
                                        'center',

                                    justifyContent:
                                        'center',

                                    marginBottom:
                                        '20px'
                                }}
                            >
                                <ShieldCheck
                                    size={
                                        28
                                    }
                                />
                            </div>

                            <h2
                                style={{
                                    margin:
                                        0,

                                    fontSize:
                                        '26px'
                                }}
                            >
                                Verify your email
                            </h2>

                            <p
                                style={{
                                    color:
                                        isDark
                                            ? '#aaa'
                                            : '#666',

                                    lineHeight:
                                        1.6,

                                    marginTop:
                                        '10px',

                                    marginBottom:
                                        '24px'
                                }}
                            >
                                We've sent a
                                six-digit security
                                code to{' '}

                                <strong
                                    style={{
                                        color:
                                            isDark
                                                ? '#fff'
                                                : '#111'
                                    }}
                                >
                                    {
                                        pendingSignup.email
                                    }
                                </strong>
                                .
                            </p>

                            <div
                                style={{
                                    position:
                                        'relative'
                                }}
                            >
                                <Mail
                                    size={
                                        19
                                    }

                                    style={{
                                        position:
                                            'absolute',

                                        left:
                                            '16px',

                                        top:
                                            '50%',

                                        transform:
                                            'translateY(-50%)',

                                        color:
                                            '#777'
                                    }}
                                />

                                <input
                                    value={
                                        verificationCode
                                    }

                                    inputMode="numeric"

                                    maxLength={
                                        6
                                    }

                                    onChange={(
                                        e
                                    ) =>
                                        setVerificationCode(
                                            e.target.value
                                                .replace(
                                                    /\D/g,
                                                    ''
                                                )
                                                .slice(
                                                    0,
                                                    6
                                                )
                                        )
                                    }

                                    placeholder="000000"

                                    autoFocus

                                    style={{
                                        ...inputStyle(
                                            Boolean(
                                                verificationError
                                            )
                                        ),

                                        paddingLeft:
                                            '48px',

                                        fontSize:
                                            '20px',

                                        letterSpacing:
                                            '8px',

                                        textAlign:
                                            'center',

                                        fontWeight:
                                            'bold'
                                    }}
                                />
                            </div>

                            {verificationError &&
                                (
                                    <p
                                        style={{
                                            color:
                                                '#ef4444',

                                            fontSize:
                                                '13px',

                                            marginTop:
                                                '10px'
                                        }}
                                    >
                                        {
                                            verificationError
                                        }
                                    </p>
                                )}

                            <button
                                type="submit"

                                disabled={
                                    verifying
                                }

                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '14px',

                                    marginTop:
                                        '22px',

                                    border:
                                        'none',

                                    borderRadius:
                                        '10px',

                                    backgroundColor:
                                        '#0070f3',

                                    color:
                                        '#fff',

                                    fontSize:
                                        '16px',

                                    fontWeight:
                                        'bold',

                                    cursor:
                                        verifying
                                            ? 'not-allowed'
                                            : 'pointer',

                                    opacity:
                                        verifying
                                            ? 0.65
                                            : 1
                                }}
                            >
                                {verifying
                                    ? 'Verifying...'
                                    : 'Verify & Create Account'}
                            </button>

                            <button
                                type="button"

                                onClick={
                                    handleResendCode
                                }

                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    marginTop:
                                        '10px',

                                    border:
                                        `1px solid ${
                                            isDark
                                                ? '#333'
                                                : '#ddd'
                                        }`,

                                    borderRadius:
                                        '10px',

                                    background:
                                        'transparent',

                                    color:
                                        isDark
                                            ? '#ddd'
                                            : '#333',

                                    fontWeight:
                                        '600',

                                    cursor:
                                        'pointer'
                                }}
                            >
                                Resend Code
                            </button>

                            <button
                                type="button"

                                onClick={() =>
                                    setShowVerification(
                                        false
                                    )
                                }

                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '10px',

                                    marginTop:
                                        '4px',

                                    border:
                                        'none',

                                    background:
                                        'transparent',

                                    color:
                                        '#888',

                                    cursor:
                                        'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

            <CreatorCovenantModal
                isOpen={
                    showCovenant
                }

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

export default Signup;