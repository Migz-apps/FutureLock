import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CreatorCovenantModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

const CreatorCovenantModal: React.FC<CreatorCovenantModalProps> = ({ isOpen, onAccept, onDecline }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: isDark ? '#111' : '#fff',
                padding: '40px',
                borderRadius: '16px',
                border: `1px solid ${isDark ? '#333' : '#eee'}`,
                maxWidth: '500px',
                width: '90%',
                boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.1)',
                color: isDark ? '#fff' : '#000',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px', color: 'var(--accent-primary)' }}>
                    Creator Covenant
                </h2>

                <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px', color: isDark ? '#ccc' : '#444' }}>
                    <strong>Scam-Killer Protocol Active:</strong><br /><br />
                    Funds are held in escrow for 24 hours post-reveal for community verification. High dispute rates lead to permanent account slashing.
                </p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button
                        onClick={onDecline}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'transparent',
                            color: isDark ? '#aaa' : '#666',
                            border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#666' }}
                        onMouseOut={(e) => { e.currentTarget.style.color = isDark ? '#aaa' : '#666'; e.currentTarget.style.borderColor = isDark ? '#333' : '#ddd' }}
                    >
                        Decline
                    </button>
                    <button
                        onClick={onAccept}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            boxShadow: '0 4px 15px rgba(0, 112, 243, 0.4)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        I Accept the Covenant
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatorCovenantModal;
