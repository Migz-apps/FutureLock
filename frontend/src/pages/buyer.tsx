import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFutureLock } from '../hooks/useFutureLock';
import { useRouter } from 'next/router';
import { getErrorMessage } from '../utils/errorHandler';

const BuyerPortal = () => {
    const { isAuthenticated, role } = useAuth();
    const { theme } = useTheme();
    const { purchaseInsight, isPending } = useFutureLock();
    const router = useRouter();

    const isDark = theme === 'dark';

    if (!isAuthenticated || role !== 'Buyer') {
        if (typeof window !== 'undefined') router.push('/');
        return null;
    }

    const handleBuy = async (id: string, price: string) => {
        try {
            await purchaseInsight(id, price);
            alert("Transaction initiated");
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: isDark ? '#fff' : '#000' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Data Marketplace</h1>
            <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px' }}>Browse and purchase time-locked intelligence.</p>

            {/* Mocking a listing */}
            <div style={{
                padding: '30px',
                backgroundColor: isDark ? '#111' : '#fff',
                border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                borderRadius: '12px',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Cybersecurity Threat Intel Q3</h3>
                        <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '20px' }}>Advanced analysis on zero-day vulnerabilities in common infrastructure.</p>
                    </div>
                    <span style={{ backgroundColor: '#0070f3', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        NEW
                    </span>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? '#333' : '#eee'}`, paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ fontSize: '14px', color: isDark ? '#888' : '#aaa' }}>PRICE</span>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>0.01 ETH</div>
                        <div style={{ fontSize: '12px', color: '#ffb347', marginTop: '4px' }}>Unlocks in 3 Days</div>
                    </div>

                    <button
                        onClick={() => handleBuy("1", "0.01")}
                        disabled={isPending}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: isPending ? '#555' : '#0070f3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            fontSize: '16px'
                        }}
                    >
                        {isPending ? "Connecting Wallet..." : "Buy & Unlock"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyerPortal;
