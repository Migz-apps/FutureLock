import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const isDark = theme === 'dark';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                const data = await res.json();
                login(data.role);
                router.push(data.role === 'Creator' ? '/creator' : '/buyer');
            } else {
                alert("Failed to login.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: isDark ? '#000' : '#fff', color: isDark ? '#fff' : '#000' }}>
            {/* Left side: Form */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>Welcome Back</h1>
                <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px' }}>Enter your details to access your account.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        Sign In
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', color: isDark ? '#aaa' : '#666' }}>
                    Don't have an account? <Link href="/signup" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </div>

            {/* Right side: Image Cover */}
            <div style={{
                flex: '1',
                background: 'linear-gradient(135deg, #0070f3 0%, #000000 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '@media (max-width: 768px)': { display: 'none' } // Simple responsive handling via inline isn't perfect, but we assume wider screens for demo
            } as React.CSSProperties}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3px' }}>FUTURE<br />LOCK</h1>
                    <p style={{ fontSize: '24px', opacity: 0.8, marginTop: '20px' }}>The decentralized future market.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
