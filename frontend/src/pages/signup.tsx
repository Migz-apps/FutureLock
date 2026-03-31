import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';
import CreatorCovenantModal from '../components/CreatorCovenantModal';
import VerificationModal from '../components/VerificationModal';
import { Eye, EyeOff } from 'lucide-react';
import { getErrorMessage, handleAsyncError } from '../utils/errorHandler';

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

    // State for Verification
    const [signupData, setSignupData] = useState<any>(null); 
    const [verificationError, setVerificationError] = useState('');
    const [showVerification, setShowVerification] = useState(false);

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Error handling for Standard Access (Web2)
    const [formError, setFormError] = useState('');

    const getRedirectRoute = (defaultRole: string) => {
        const queryRedirect = router.query.redirect as string;
        if (queryRedirect) return queryRedirect;
        if (redirectUrl) return redirectUrl;
        return defaultRole === 'Creator' ? '/creator' : '/marketplace';
    };

    // Step 1: Request verification code (Standard Access only)
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');   // clear previous error

        const result = await handleAsyncError(async () => {
            const res = await fetch('process.env.NEXT_PUBLIC_BACKEND_URL/auth/request-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw { ...errorData, status: res.status };
            }
            return res;
        });

        if (result.error) {
            setFormError(result.error);
        } else {
            const formData = { username, email, password, role };
            setSignupData(formData);
            setShowVerification(true);
        }
    };

    // Step 2: Final signup after verification
    const handleFinalSignup = async (verifiedData: any) => {
        const result = await handleAsyncError(async () => {
            const res = await fetch('process.env.NEXT_PUBLIC_BACKEND_URL/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verifiedData)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw { ...errorData, status: res.status };
            }
            return await res.json();
        });

        if (result.error) {
            setVerificationError(result.error);
        } else {
            const data = result.data;
            login(data.role || role, 'email', email);
            const nextRoute = getRedirectRoute(data.role || role);
            setRedirectUrl('');
            router.push(nextRoute);
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
        setFormError('');
        if (!username.trim()) {
            setFormError(getErrorMessage({ message: 'Please choose a username first.' }));
            return;
        }
        try {
            if (!(window as any).ethereum) {
                setFormError(getErrorMessage({ message: 'MetaMask or a Web3 wallet is required.' }));
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
        } catch (err: any) {
            setFormError(getErrorMessage(err));
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000' }}>
            {/* Left side: 60% Logo Area */}
            <div style={{
                flex: '3.5',
                background: 'linear-gradient(135deg, #001f3f 0%, #0070f3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            } as React.CSSProperties}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3px' }}>Unlock<br />Insights</h1>
                    <p style={{ fontSize: '24px', opacity: 0.8, marginTop: '20px' }}>Join the community.</p>
                </div>
            </div>

            {/* Right side: 40% Form Area */}
            <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>Create Account</h1>
                <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '30px' }}>Join the FutureLock protocol to proceed.</p>

                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: '30px', borderBottom: `2px solid ${isDark ? '#333' : '#eee'}` }}>
                    <button onClick={() => setActiveTab('web3')} style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: activeTab === 'web3' ? '#0070f3' : (isDark ? '#888' : '#aaa'), fontWeight: activeTab === 'web3' ? 'bold' : 'normal', borderBottom: activeTab === 'web3' ? '2px solid #0070f3' : 'none', cursor: 'pointer', fontSize: '16px' }}>
                        Web3 Portal
                    </button>
                    <button onClick={() => setActiveTab('web2')} style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: activeTab === 'web2' ? '#0070f3' : (isDark ? '#888' : '#aaa'), fontWeight: activeTab === 'web2' ? 'bold' : 'normal', borderBottom: activeTab === 'web2' ? '2px solid #0070f3' : 'none', cursor: 'pointer', fontSize: '16px' }}>
                        Standard Access
                    </button>
                </div>

                {activeTab === 'web3' ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Choose Your Identity</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value.toLowerCase())} 
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000' }} 
                                placeholder="e.g. shadowbroker" 
                            />
                        </div>
                        {formError && activeTab === 'web3' ? (
                            <div style={{ backgroundColor: isDark ? '#450a0a' : '#fee2e2', color: isDark ? '#f87171' : '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}` }}>
                                {formError}
                            </div>
                        ):null }
                        <button onClick={handleWalletConnect} style={{ padding: '16px 32px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                            Connect Wallet
                        </button>
                    </div>
                ) : (
                    <form 
                        onSubmit={handleEmailSubmit} 
                        noValidate
                        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                    >
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div onClick={() => handleRoleSelect('Creator')} style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Creator' ? '#0070f3' : '#333'}`, borderRadius: '12px', cursor: 'pointer' }}>Creator</div>
                            <div onClick={() => handleRoleSelect('Buyer')} style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Buyer' ? '#0070f3' : '#333'}`, borderRadius: '12px', cursor: 'pointer' }}>Buyer</div>
                        </div>

                        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#000' }} required />
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#000' }} required />

                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px 45px 12px 12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#000' }}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#555' : '#999' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#555' : '#999'}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {formError && activeTab === 'web2' && (
                            <div style={{
                                backgroundColor: isDark ? '#450a0a' : '#fee2e2',
                                color: isDark ? '#f87171' : '#ef4444',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`
                            }}>
                                {formError}
                            </div>
                        )}

                        <button type="submit" style={{ padding: '14px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Create Account
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '30px', textAlign: 'center' }}>
                    Already have an account? <Link href="/login" style={{ color: '#0070f3', fontWeight: 'bold' }}>Log in</Link>
                </p>
            </div>

            {showVerification && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <VerificationModal 
                        email={email}
                        signupData={signupData}
                        completeActualRegistration={handleFinalSignup}
                        onVerify={(code) => console.log("Verifying code:", code)}
                        onResend={() => handleEmailSubmit({ preventDefault: () => {} } as any)}
                        error={verificationError}
                    />
                </div>
            )}

            <CreatorCovenantModal isOpen={showCovenant} onAccept={handleAcceptCovenant} onDecline={handleDeclineCovenant} />
        </div>
    );
};

export default Signup;