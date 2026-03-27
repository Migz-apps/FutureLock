import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/router';

const CreatorPortal = () => {
    const { isAuthenticated, role } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [price, setPrice] = useState('0.01');
    const [isLocking, setIsLocking] = useState(false);

    const isDark = theme === 'dark';

    if (!isAuthenticated || role !== 'Creator') {
        if (typeof window !== 'undefined') router.push('/');
        return null;
    }

    const handleLockInsight = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLocking(true);

        try {
            // Mock create mechanism mapped to the backend
            const res = await fetch(`http://127.0.0.1:8000/insights/create?title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&unlockDate=${encodeURIComponent(unlockDate)}&creator=CreatorUser`);
            if (res.ok) {
                alert("Insight Encrypted and Locked successfully!");
                setTitle('');
                setDescription('');
                setContent('');
                setUnlockDate('');
                setPrice('0.01');
            } else {
                alert("Failed to lock insight.");
            }
        } catch (err) {
            console.error(err);
            alert("Error occurred.");
        } finally {
            setIsLocking(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: isDark ? '#fff' : '#000' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Creator Portal</h1>
            <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px' }}>Encrypt and monetize your future insights.</p>

            <form onSubmit={handleLockInsight} style={{
                display: 'flex', flexDirection: 'column', gap: '20px',
                backgroundColor: isDark ? '#111' : '#fff', padding: '30px',
                borderRadius: '16px', border: `1px solid ${isDark ? '#333' : '#ddd'}`
            }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Title</label>
                    <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#000' : '#f9f9f9', color: isDark ? '#fff' : '#000' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Description (Public Preview)</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#000' : '#f9f9f9', color: isDark ? '#fff' : '#000', minHeight: '80px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Full Content (Hidden)</label>
                    <textarea required value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#000' : '#f9f9f9', color: isDark ? '#fff' : '#000', minHeight: '150px' }} />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Unlock Date</label>
                        <input required type="datetime-local" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#000' : '#f9f9f9', color: isDark ? '#fff' : '#000' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Price (ETH)</label>
                        <input required type="number" step="0.001" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}`, backgroundColor: isDark ? '#000' : '#f9f9f9', color: isDark ? '#fff' : '#000' }} />
                    </div>
                </div>
                <button disabled={isLocking} type="submit" style={{ padding: '16px', backgroundColor: isLocking ? '#555' : '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: isLocking ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
                    {isLocking ? 'Encrypting & Locking...' : '🔐 Lock Insight'}
                </button>
            </form>
        </div>
    );
};

export default CreatorPortal;
