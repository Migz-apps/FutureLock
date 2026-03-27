import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Buyer');
    const { login } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://127.0.0.1:8000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            if (res.ok) {
                const data = await res.json();
                login(data.role);
                router.push(data.role === 'Creator' ? '/creator' : '/buyer');
            } else {
                alert("Failed to signup.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000' }}>
            {/* Left side: Form */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>Create Account</h1>
                <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px' }}>Select your role and create an account to get started.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                        <div
                            onClick={() => setRole('Creator')}
                            style={{ flex: 1, padding: '15px', textAlign: 'center', border: `2px solid ${role === 'Creator' ? '#0070f3' : (isDark ? '#333' : '#ccc')}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: role === 'Creator' ? 'rgba(0,112,243,0.1)' : 'transparent' }}
                        >
                            <h3 style={{ margin: 0 }}>Creator</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: isDark ? '#aaa' : '#666' }}>Sell intel</p>
                        </div>
                        <div
                            onClick={() => setRole('Buyer')}
                            style={{ flex: 1, padding: '15px', textAlign: 'center', border: `2px solid ${role === 'Buyer' ? '#0070f3' : (isDark ? '#333' : '#ccc')}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: role === 'Buyer' ? 'rgba(0,112,243,0.1)' : 'transparent' }}
                        >
                            <h3 style={{ margin: 0 }}>Buyer</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: isDark ? '#aaa' : '#666' }}>Buy intel</p>
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

                    <button type="submit" style={{ padding: '14px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '16px' }}>
                        Create Account
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', color: isDark ? '#aaa' : '#666' }}>
                    Already have an account? <Link href="/login" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
                </p>
            </div>

            {/* Right side: Image Cover */}
            <div style={{
                flex: '1',
                background: 'linear-gradient(135deg, #001f3f 0%, #0070f3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3px' }}>Unlock<br />Insights</h1>
                    <p style={{ fontSize: '24px', opacity: 0.8, marginTop: '20px' }}>Join the community.</p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
