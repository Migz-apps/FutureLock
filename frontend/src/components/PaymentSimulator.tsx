import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PaymentSimulatorProps {
    onClose: () => void;
    onSuccess: () => void;
    priceUSD: string;
    itemTitle?: string;
}

const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({ onClose, onSuccess, priceUSD, itemTitle }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Status states: 'idle' | 'verifying' | 'decrypting' | 'success'
    const [status, setStatus] = useState<'idle' | 'verifying' | 'decrypting' | 'success'>('idle');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');

    const handleConfirm = () => {
        setStatus('verifying');
        // Simulate 2 second API call for "Verifying with Bank"
        setTimeout(() => {
            setStatus('decrypting');
            // Simulate 2 second client-side decryption "AES-256"
            setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }, 2000);
        }, 2000);
    };

    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            padding: '40px',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '550px',
            color: 'var(--text-primary)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid var(--border)'
        }}>
            {status === 'idle' ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Secure Checkout</h2>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#fff' : '#000', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                    </div>

                    {itemTitle && <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '15px' }}>Acquiring: {itemTitle}</p>}
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '18px' }}>Total Amount: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>${priceUSD}</span></p>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div
                            onClick={() => setPaymentMethod('card')}
                            style={{ flex: 1, padding: '15px', border: `2px solid ${paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--border)'}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', fontWeight: paymentMethod === 'card' ? 'bold' : 'normal' }}
                        >
                            Credit Card
                        </div>
                        <div
                            onClick={() => setPaymentMethod('mobile')}
                            style={{ flex: 1, padding: '15px', border: `2px solid ${paymentMethod === 'mobile' ? 'var(--accent-primary)' : 'var(--border)'}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', fontWeight: paymentMethod === 'mobile' ? 'bold' : 'normal' }}
                        >
                            Mobile Money
                        </div>
                    </div>

                    {paymentMethod === 'card' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                            <input type="text" placeholder="Card Number" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: isDark ? '#111' : '#fff', color: 'var(--text-primary)', fontSize: '16px' }} />
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input type="text" placeholder="MM/YY" style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: isDark ? '#111' : '#fff', color: 'var(--text-primary)', fontSize: '16px' }} />
                                <input type="text" placeholder="CVC" style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: isDark ? '#111' : '#fff', color: 'var(--text-primary)', fontSize: '16px' }} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                            <input type="text" placeholder="Mobile Number (e.g. MTN/Airtel)" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: isDark ? '#111' : '#fff', color: 'var(--text-primary)', fontSize: '16px' }} />
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        Confirm Payment
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '15px' }}>
                        Data is zero-knowledge encrypted. Platform has no access to content.
                    </p>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    {status === 'verifying' && (
                        <>
                            <div style={{ width: '50px', height: '50px', border: '4px solid var(--border)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>Verifying with Bank...</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we process your transaction.</p>
                        </>
                    )}
                    {status === 'decrypting' && (
                        <>
                            <div style={{ width: '50px', height: '50px', border: '4px solid var(--border)', borderTopColor: '#00e676', borderRadius: '50%', animation: 'spin 1.5s ease-in-out infinite', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#00e676' }}>Decrypting Intelligence Locally...</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Using local AES-256 vault key. Decryption happens strictly in-browser.</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(0, 230, 118, 0.1)', color: '#00e676', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>✓</div>
                            <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>Intelligence Unlocked</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Redirecting to secure payload...</p>
                        </>
                    )}

                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default PaymentSimulator;
