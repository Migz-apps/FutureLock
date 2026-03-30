import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';
import CreatorCovenantModal from '../components/CreatorCovenantModal';
import VerificationModal from '../components/VerificationModal';

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

    const getRedirectRoute = (defaultRole: string) => {
        const queryRedirect = router.query.redirect as string;
        if (queryRedirect) return queryRedirect;
        if (redirectUrl) return redirectUrl;
        return defaultRole === 'Creator' ? '/creator' : '/marketplace';
    };

    // Step 1: Request verification code
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerificationError('');
        
        const formData = { username, email, password, role };
        
        try {
            // Note: Update this URL to your actual 'request-code' endpoint if different
            const res = await fetch('http://127.0.0.1:8081/auth/request-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setSignupData(formData);
                setShowVerification(true);
            } else {
                alert("Failed to send verification code. Please try again.");
            }
        } catch (err) {
            console.error("Verification Request Error:", err);
            alert("Connection error. Is the backend running?");
        }
    };

    // Step 2: This is called by the Modal AFTER the code is verified successfully
    const handleFinalSignup = async (verifiedData: any) => {
        try {
            const res = await fetch('http://127.0.0.1:8081/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verifiedData)
            });

            if (res.ok) {
                const data = await res.json();
                login(data.role || role, 'email', email);
                const nextRoute = getRedirectRoute(data.role || role);
                setRedirectUrl('');
                router.push(nextRoute);
            } else {
                setVerificationError("Account creation failed after verification.");
            }
        } catch (err) {
            console.error("Final Signup Error:", err);
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

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000' }}>
            {/* Left side: Image Cover */}
            <div style={{
                flex: '1',
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

            {/* Right side: Form */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>Create Account</h1>
                <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '30px' }}>Join the FutureLock protocol to proceed.</p>

                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: '30px', borderBottom: `2px solid ${isDark ? '#333' : '#eee'}` }}>
                    <button
                        onClick={() => setActiveTab('web3')}
                        style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: activeTab === 'web3' ? '#0070f3' : (isDark ? '#888' : '#aaa'), fontWeight: activeTab === 'web3' ? 'bold' : 'normal', borderBottom: activeTab === 'web3' ? '2px solid #0070f3' : 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                        Web3 Portal
                    </button>
                    <button
                        onClick={() => setActiveTab('web2')}
                        style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', color: activeTab === 'web2' ? '#0070f3' : (isDark ? '#888' : '#aaa'), fontWeight: activeTab === 'web2' ? 'bold' : 'normal', borderBottom: activeTab === 'web2' ? '2px solid #0070f3' : 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
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
                        <button onClick={handleWalletConnect} style={{ padding: '16px 32px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                            Connect Wallet
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div onClick={() => handleRoleSelect('Creator')} style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Creator' ? '#0070f3' : '#333'}`, borderRadius: '12px', cursor: 'pointer' }}>
                                Creator
                            </div>
                            <div onClick={() => handleRoleSelect('Buyer')} style={{ flex: 1, padding: '10px', textAlign: 'center', border: `2px solid ${role === 'Buyer' ? '#0070f3' : '#333'}`, borderRadius: '12px', cursor: 'pointer' }}>
                                Buyer
                            </div>
                        </div>

                        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#000' }} required />
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#000' }} required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: isDark ? '#111' : '#fff', color: isDark ? '#fff' : '#000' }} required />

                        <button type="submit" style={{ padding: '14px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Create Account
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '30px', textAlign: 'center' }}>
                    Already have an account? <Link href="/login" style={{ color: '#0070f3', fontWeight: 'bold' }}>Log in</Link>
                </p>
            </div>

            {/* Verification Modal logic */}
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

            <CreatorCovenantModal
                isOpen={showCovenant}
                onAccept={handleAcceptCovenant}
                onDecline={handleDeclineCovenant}
            />
        </div>
    );
};

export default Signup;