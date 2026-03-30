import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';
import CreatorCovenantModal from '../components/CreatorCovenantModal';

const Signup = () => {
    const [activeTab, setActiveTab] = useState<'web3' | 'web2'>('web3');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Buyer');
    const [showCovenant, setShowCovenant] = useState(false);
    const { login, redirectUrl, setRedirectUrl } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    const [isVerifying, setIsVerifying] = useState(false);
    const [signupData, setSignupData] = useState(null); // Temporarily hold data
    const [verificationError, setVerificationError] = useState('');

    const getRedirectRoute = (defaultRole: string) => {
        const queryRedirect = router.query.redirect as string;
        if (queryRedirect) return queryRedirect;
        if (redirectUrl) return redirectUrl;
        return defaultRole === 'Creator' ? '/creator' : '/marketplace';
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://127.0.0.1:8081/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            if (res.ok) {
                const data = await res.json();
                login(data.role || role, 'email', email);
                const nextRoute = getRedirectRoute(data.role || role);
                setRedirectUrl('');
                router.push(nextRoute);
            } else {
                alert("Failed to signup.");
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
        if (!username.trim()) {
            alert('Please choose a username first.');
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

    const handleInitialSignup = async (formData) => {
        // 1. Call /request-verification
        // 2. If success:
        setSignupData(formData);
        setIsVerifying(true);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000' }}>
            {/* Left side: Image Cover (Flipped Layout) */}
            <div style={{
                flex: '1',
                background: 'linear-gradient(135deg, #001f3f 0%, #0070f3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '@media (max-width: 768px)': { display: 'none' }
            } as React.CSSProperties}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3px' }}>Unlock<br />Insights</h1>
                    <p style={{ fontSize: '24px', opacity: 0.8, marginTop: '20px' }}>Join the community.</p>
                </div>
            </div>

            {/* Right side: Form (Flipped Layout) */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>Create Account</h1>
                <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '30px' }}>Join the FutureLock protocol to proceed.</p>

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
                        <p style={{ marginBottom: '20px', color: isDark ? '#ccc' : '#444' }}>Connect your cryptographic wallet to register securely.</p>
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Choose Your Identity (Username)</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value.toLowerCase())}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none' }}
                                required
                                placeholder="e.g. shadowbroker"
                            />
                        </div>
                        <button
                            onClick={handleWalletConnect}
                            style={{ padding: '16px 32px', backgroundColor: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', width: '100%', transition: 'all 0.2s' }}
                        >
                            Connect Wallet
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                            <div
                                onClick={() => handleRoleSelect('Creator')}
                                style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Creator' ? 'var(--accent-primary)' : (isDark ? '#333' : '#ccc')}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: role === 'Creator' ? 'rgba(0,112,243,0.1)' : 'transparent', transition: 'all 0.2s' }}
                            >
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Creator</h3>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: isDark ? '#aaa' : '#666' }}>Sell intel</p>
                            </div>
                            <div
                                onClick={() => handleRoleSelect('Buyer')}
                                style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Buyer' ? 'var(--accent-primary)' : (isDark ? '#333' : '#ccc')}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: role === 'Buyer' ? 'rgba(0,112,243,0.1)' : 'transparent', transition: 'all 0.2s' }}
                            >
                                <h3 style={{ margin: 0, fontSize: '18px' }}>Buyer</h3>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: isDark ? '#aaa' : '#666' }}>Buy intel</p>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value.toLowerCase())}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none' }}
                                required
                                placeholder="e.g. phantom"
                            />
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
                            Create Account
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '30px', textAlign: 'center', color: isDark ? '#aaa' : '#666' }}>
                    Already have an account? <Link href={`/login${router.query.redirect ? `?redirect=${router.query.redirect}` : ''}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
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

export default Signup;
