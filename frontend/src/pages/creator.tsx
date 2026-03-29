import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ActiveLock {
    id: string;
    title: string;
    release_date: string | null;
    escrow_eth: number;
    dispute_status: string;
    volume: string;
}

interface AnalyticsData {
    total_earnings_eth: number;
    total_earnings_usd: number;
    total_intel_sold: number;
    chart_data: { date: string, volume: number }[];
    active_locks: ActiveLock[];
}

const CreatorPortal = () => {
    const { isAuthenticated, role } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    const [privacyMode, setPrivacyMode] = useState(false);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    const isDark = theme === 'dark';

    useEffect(() => {
        if (!isAuthenticated || role !== 'Creator') {
            if (typeof window !== 'undefined') router.push('/');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                // Mock endpoint or use standard fetch if credentials allowed
                // We're mocking the response payload for UI demonstration if backend isn't running yet
                const data: AnalyticsData = {
                    total_earnings_eth: 4.52,
                    total_earnings_usd: 13560.00,
                    total_intel_sold: 125,
                    chart_data: [
                        { date: '2026-03-21', volume: 0.5 },
                        { date: '2026-03-22', volume: 1.2 },
                        { date: '2026-03-23', volume: 0.8 },
                        { date: '2026-03-24', volume: 1.5 },
                        { date: '2026-03-25', volume: 0.52 }
                    ],
                    active_locks: [
                        {
                            id: "1",
                            title: "Q1 Defense Strategy Leak",
                            release_date: "2026-04-10T12:00:00Z",
                            escrow_eth: 2.5,
                            dispute_status: "Normal",
                            volume: "42 Buyers"
                        },
                        {
                            id: "2",
                            title: "DeFi Liquidations Data Dump",
                            release_date: "2026-04-15T00:00:00Z",
                            escrow_eth: 1.2,
                            dispute_status: "High",
                            volume: "6 Buyers"
                        }
                    ]
                };
                setAnalytics(data);

                // Actual connection fetch:
                const res = await fetch('/api/creator/analytics');
                if (res.ok) {
                    const realData = await res.json();
                    setAnalytics(realData);
                }
            } catch (err) {
                console.error("Using fallback analytics data.", err);
            }
        };

        fetchAnalytics();
    }, [isAuthenticated, role]);

    const handleWithdraw = () => {
        if (analytics?.active_locks.some(lock => lock.dispute_status === 'High')) {
            alert("Withdrawal paused due to high dispute rates.");
            return;
        }
        alert("Payout initiated. Funds will be transferred 24 hours post-reveal pending community verification.");
    };

    if (!analytics) return <div style={{ color: isDark ? '#fff' : '#000', padding: '40px', textAlign: 'center' }}>Loading Analytics...</div>;

    const blurStyle = (text: string) => ({
        filter: privacyMode ? 'blur(5px)' : 'none',
        transition: 'filter 0.3s ease',
        cursor: privacyMode ? 'pointer' : 'default',
        color: isDark ? '#fff' : '#000'
    });

    const removeBlur = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (privacyMode) {
            e.currentTarget.style.filter = 'none';
        }
    };

    const applyBlur = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (privacyMode) {
            e.currentTarget.style.filter = 'blur(5px)';
        }
    };

    return (
        <div style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', color: isDark ? '#fff' : '#000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Privacy-Shielded Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: isDark ? '#111' : '#f9f9f9', padding: '10px 20px', borderRadius: '12px', border: `1px solid ${isDark ? '#333' : '#ddd'}` }}>
                    <label style={{ fontWeight: 'bold', cursor: 'pointer' }} htmlFor="privacyToggle">Privacy Mode</label>
                    <input
                        id="privacyToggle"
                        type="checkbox"
                        checked={privacyMode}
                        onChange={(e) => setPrivacyMode(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ padding: '25px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '8px', fontWeight: 'bold' }}>Total Earnings (ETH)</div>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-primary)' }}>{analytics.total_earnings_eth.toFixed(3)}</div>
                    <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '5px' }}>~${analytics.total_earnings_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
                </div>
                <div style={{ padding: '25px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '8px', fontWeight: 'bold' }}>Total Intelligence Sold</div>
                    <div style={{ fontSize: '36px', fontWeight: '900' }}>{analytics.total_intel_sold}</div>
                </div>
                <div style={{ padding: '25px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <button
                        onClick={handleWithdraw}
                        style={{ padding: '16px', backgroundColor: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0, 112, 243, 0.4)' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Trigger Payout
                    </button>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', textAlign: 'center', lineHeight: '1.4' }}>
                        Payouts are processed 24 hours after the reveal date to ensure community verification.
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '16px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, marginBottom: '40px', boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '22px', marginBottom: '25px', fontWeight: 'bold' }}>Revenue Analytics</h2>
                <div style={{ height: '350px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.chart_data}>
                            <XAxis dataKey="date" stroke={isDark ? '#888' : '#666'} axisLine={false} tickLine={false} />
                            <YAxis stroke={isDark ? '#888' : '#666'} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? '#222' : '#fff', borderColor: isDark ? '#444' : '#eee', borderRadius: '8px', color: isDark ? '#fff' : '#000', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="volume" stroke="var(--accent-primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: isDark ? '#000' : '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '16px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '22px', marginBottom: '25px', fontWeight: 'bold' }}>Active Locks</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${isDark ? '#333' : '#eee'}` }}>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Intelligence Title</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Release Date</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Current Escrow (ETH)</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Volume</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Dispute Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.active_locks.map((lock) => (
                                <tr key={lock.id} style={{ borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#f5f5f5'}`, transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '18px' }}>
                                        <span style={{ ...blurStyle(lock.title), fontWeight: 'bold' }} onMouseEnter={removeBlur} onMouseLeave={applyBlur}>
                                            {lock.title}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px', color: 'var(--text-secondary)' }}>{lock.release_date ? new Date(lock.release_date).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ padding: '18px', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '16px' }}>{lock.escrow_eth.toFixed(3)}</td>
                                    <td style={{ padding: '18px' }}>
                                        <span style={{ backgroundColor: isDark ? '#222' : '#eee', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                            {lock.volume}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            backgroundColor: lock.dispute_status === 'High' ? 'rgba(255, 68, 68, 0.1)' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                                            color: lock.dispute_status === 'High' ? '#ff4444' : 'var(--text-secondary)'
                                        }}>
                                            {lock.dispute_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {analytics.active_locks.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '16px' }}>No active locked intelligence found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreatorPortal;
