import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';
import CreatorCovenantModal from '../components/CreatorCovenantModal';
import { Eye, EyeOff, Lock } from 'lucide-react';

const passwordInput = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const isDark = true;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#aaa' : '#666' }}>
                Secure Key / Password
            </label>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {/* Optional: Lock Icon on the left for aesthetics */}
                <Lock
                    size={18}
                    style={{
                        position: 'absolute',
                        left: '15px',
                        color: isDark ? '#444' : '#999'
                    }}
                />

                <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                        width: '100%',
                        padding: '14px 45px 14px 45px', // Extra padding on right for the eye
                        borderRadius: '12px',
                        border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                        backgroundColor: isDark ? '#080818' : '#f9f9f9',
                        color: isDark ? '#fff' : '#000',
                        outline: 'none',
                        fontSize: '16px',
                        transition: 'border-color 0.2s'
                    }}
                />

                {/* THE EYE ICON TRIGGER */}
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                        position: 'absolute',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDark ? '#555' : '#999',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#555' : '#999')}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
};

const Login = () => {
    const [activeTab, setActiveTab] = useState<'web3' | 'web2'>('web3');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Buyer');
    const [showCovenant, setShowCovenant] = useState(false);
    const { login, redirectUrl, setRedirectUrl } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);



    const isDark = theme === 'dark';

    const getRedirectRoute = (defaultRole: string) => {
        // Prefer explicit router query over context if both exist, but query is more direct from deep linking
        const queryRedirect = router.query.redirect as string;
        if (queryRedirect) return queryRedirect;
        if (redirectUrl) return redirectUrl;
        return defaultRole === 'Creator' ? '/creator' : '/marketplace';
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://127.0.0.1:8081/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            if (res.ok) {
                const data = await res.json();
                login(data.role || role, 'email', email);
                const nextRoute = getRedirectRoute(data.role || role);
                setRedirectUrl(''); // clear state
                router.push(nextRoute);
            } else {
                alert("Failed to login.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRoleSelect = (selectedRole: string) => {
        if (selectedRole === 'Creator') {
            setShowCovenant(true);
        } else {
            setRole(selectedRole);
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
        if (role === 'Creator' && !username.trim() && activeTab === 'web3') {
            alert('Please complete your profile by providing a username.');
            return;
        }
        try {
            if (!(window as any).ethereum) {
                alert('MetaMask or a Web3 wallet is required.');
                return;
            }
            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                const walletAddress = accounts[0];
                login('Creator', 'wallet', walletAddress);
                const nextRoute = getRedirectRoute('Creator');
                setRedirectUrl('');
                router.push(nextRoute);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000' }}>
            {/* Left side: Image Cover (Flipped Layout) */}
            <div style={{
                flex: '1',
                background: 'linear-gradient(135deg, #0070f3 0%, #000000 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '@media (max-width: 768px)': { display: 'none' }
            } as React.CSSProperties}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3px' }}>FUTURE<br />LOCK</h1>
                    <p style={{ fontSize: '24px', opacity: 0.8, marginTop: '20px' }}>The decentralized future market.</p>
                </div>
            </div>

            {/* Right side: Form (Flipped Layout) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>Welcome Back</h1>
                <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '30px' }}>Select an authentication pathway.</p>

                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: '30px', borderBottom: `2px solid ${isDark ? '#333' : '#eee'}` }}>
                    <button
                        onClick={() => setActiveTab('web3')}
                        style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: activeTab === 'web3' ? 'var(--accent-primary)' : (isDark ? '#888' : '#aaa'), fontWeight: activeTab === 'web3' ? 'bold' : 'normal', borderBottom: activeTab === 'web3' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s' }}
                    >
                        Web3 Portal (Wallet)
                    </button>
                    <button
                        onClick={() => setActiveTab('web2')}
                        style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: activeTab === 'web2' ? 'var(--accent-primary)' : (isDark ? '#888' : '#aaa'), fontWeight: activeTab === 'web2' ? 'bold' : 'normal', borderBottom: activeTab === 'web2' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s' }}
                    >
                        Standard Access
                    </button>
                </div>

                {activeTab === 'web3' ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ marginBottom: '20px', color: isDark ? '#ccc' : '#444' }}>Connect your cryptographic wallet to sign in securely.</p>
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Optional: Choose Your Identity (Username)</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value.toLowerCase())}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none' }}
                                placeholder="To claim if no identity exists"
                            />
                        </div>
                        <button
                            onClick={handleWalletConnect}
                            style={{ padding: '16px 32px', backgroundColor: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', width: '100%', transition: 'all 0.2s' }}
                        >
                            Connect & Sign
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                            <div
                                onClick={() => handleRoleSelect('Creator')}
                                style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Creator' ? 'var(--accent-primary)' : (isDark ? '#333' : '#ccc')}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: role === 'Creator' ? 'rgba(0,112,243,0.1)' : 'transparent', transition: 'all 0.2s' }}
                            >
                                <h4 style={{ margin: 0 }}>Creator</h4>
                            </div>
                            <div
                                onClick={() => handleRoleSelect('Buyer')}
                                style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Buyer' ? 'var(--accent-primary)' : (isDark ? '#333' : '#ccc')}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: role === 'Buyer' ? 'rgba(0,112,243,0.1)' : 'transparent', transition: 'all 0.2s' }}
                            >
                                <h4 style={{ margin: 0 }}>Buyer</h4>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none' }}
                                required
                            />
                        </div>

                        <button type="submit" style={{ padding: '14px', backgroundColor: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '16px', transition: 'all 0.2s' }}>
                            Sign In
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '30px', textAlign: 'center', color: isDark ? '#aaa' : '#666' }}>
                    Don't have an account? <Link href={`/signup${router.query.redirect ? `?redirect=${router.query.redirect}` : ''}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </div>
            <CreatorCovenantModal
                isOpen={showCovenant}
                onAccept={handleAcceptCovenant}
                onDecline={handleDeclineCovenant}
            />
        </div>
    );
};

export default Login;
