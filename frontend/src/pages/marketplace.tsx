import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFutureLock } from '../hooks/useFutureLock';
import { useRouter } from 'next/router';
import PaymentSimulator from '../components/PaymentSimulator';

// Mock Metadata shape
interface IntelMetadata {
    id: string;
    title: string;
    description: string;
    priceETH: string;
    priceUSD: string;
    category: string;
    creator: string;
    unlockDays: number;
    trustScore?: number;
    ratingsCount?: number;
}

const Marketplace = () => {
    const { isAuthenticated, identityType, setRedirectUrl } = useAuth();
    const { theme } = useTheme();
    const { purchaseInsight, isPending } = useFutureLock();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [intelList, setIntelList] = useState<IntelMetadata[]>([]);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IntelMetadata | null>(null);

    const isDark = theme === 'dark';

    useEffect(() => {
        let isMounted = true;
        // Mock fetch GET /api/v1/intel/public
        const fetchMetadata = async () => {
            setLoading(true);
            try {
                // Simulate network latency (1.5s)
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (isMounted) {
                    setIntelList([
                        { id: '0x123', title: 'Cybersecurity Threat Intel Q3', description: 'Advanced analysis on zero-day vulnerabilities in common infrastructure.', priceETH: '0.01', priceUSD: '30.00', category: 'Security', creator: '0xsecops', unlockDays: 0.5, trustScore: 4.8, ratingsCount: 112 },
                        { id: '0x124', title: 'Q4 Market Quantitative Model', description: 'Proprietary algorithmic model predicting asset volatility in tech sector.', priceETH: '0.05', priceUSD: '150.00', category: 'Finance', creator: 'quantalpha', unlockDays: 12, trustScore: 4.2, ratingsCount: 45 },
                        { id: '0x125', title: 'Next-Gen Battery Tech Patents Analysis', description: 'Deep dive into unreleased solid-state battery tech patents.', priceETH: '0.02', priceUSD: '60.00', category: 'Tech', creator: 'techinsider', unlockDays: 5, trustScore: 5.0, ratingsCount: 8 }
                    ]);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setLoading(false);
            }
        };

        fetchMetadata();
        return () => { isMounted = false; };
    }, []);

    // Also handle deep link logic if it was redirected here from a login (we check query)
    useEffect(() => {
        // e.g. path is /marketplace/0x123 (but here we are on /marketplace)
        // If we want to simulate auto checkout from deep link, we could check router.query.id
    }, []);

    const handleBuyClick = (item: IntelMetadata) => {
        if (!isAuthenticated) {
            setRedirectUrl(`/marketplace`); // Assuming deep link to marketplace for now, could be `/marketplace/${item.id}`
            router.push(`/login?redirect=/marketplace`);
            return;
        }

        if (identityType === 'wallet') {
            handleWeb3Buy(item.id, item.priceETH);
        } else {
            setSelectedItem(item);
            setShowPaymentSimulator(true);
        }
    };

    const handleWeb3Buy = async (id: string, price: string) => {
        try {
            await purchaseInsight(id, price);
            alert("Purchase transaction initiated in Wallet. Awaiting decryption...");
        } catch (err) {
            console.error(err);
        }
    };

    const handleSimulatedPaymentSuccess = () => {
        setShowPaymentSimulator(false);
        setSelectedItem(null);
    };

    const filteredList = intelList.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.creator.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const formatCountdown = (days: number) => {
        if (days > 10) {
            return { text: `Opens in ${Math.ceil(days)}d`, style: { backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' } };
        } else if (days >= 1 && days <= 10) {
            return { text: `Opens in ${Math.ceil(days)}d`, style: { backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' } };
        } else {
            // Under 1 day is red and urgent ticking format
            const hours = Math.floor(days * 24);
            const mins = Math.floor((days * 24 * 60) % 60);
            const secs = Math.floor((days * 24 * 60 * 60) % 60);
            return {
                text: `${hours.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`,
                style: { backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', animation: 'pulse-fast 1s infinite' }
            };
        }
    };

    return (
        <div style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', color: isDark ? '#fff' : '#000', minHeight: '100vh', backgroundColor: isDark ? '#000' : '#fff' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-1px' }}>Open Intelligence Market</h1>
            <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px', fontSize: '18px' }}>Search and acquire Time-Locked Intelligence securely via Zero-Knowledge protocols.</p>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search by Title or Creator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 2, padding: '14px 20px', borderRadius: '12px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '16px' }}
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ flex: 1, minWidth: '150px', padding: '14px 20px', borderRadius: '12px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '16px', cursor: 'pointer' }}
                >
                    <option value="All">All Categories</option>
                    <option value="Security">Security</option>
                    <option value="Finance">Finance</option>
                    <option value="Tech">Tech</option>
                </select>
            </div>

            {/* Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {loading ? (
                    // Skeleton Loading States
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ padding: '30px', backgroundColor: isDark ? '#111' : '#fff', border: `1px solid ${isDark ? '#333' : '#eee'}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px', animation: 'pulse 1.5s infinite' }}>
                            <div style={{ height: '24px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '4px', width: '70%' }}></div>
                            <div style={{ height: '16px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '4px', width: '100%' }}></div>
                            <div style={{ height: '16px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '4px', width: '90%' }}></div>
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px' }}>
                                <div style={{ height: '20px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '4px', width: '40%' }}></div>
                                <div style={{ height: '40px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '8px', width: '100px' }}></div>
                            </div>
                        </div>
                    ))
                ) : (
                    filteredList.map(item => {
                        const countdownBadge = formatCountdown(item.unlockDays);
                        return (
                            <div key={item.id} style={{
                                padding: '30px',
                                backgroundColor: 'var(--surface)',
                                border: `1px solid ${isDark ? '#333' : '#eee'}`,
                                borderRadius: '16px',
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.category}</span>
                                        <div style={{ fontSize: '12px', color: isDark ? '#888' : '#aaa', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>@{item.creator}</span>
                                            {item.trustScore !== undefined && (
                                                <span style={{ display: 'flex', alignItems: 'center', color: '#FFD700', opacity: 0.9 }}>
                                                    ★ {item.trustScore.toFixed(1)}
                                                    <span style={{ color: isDark ? '#666' : '#999', marginLeft: '4px', fontSize: '10px' }}>
                                                        ({item.ratingsCount})
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{ ...countdownBadge.style, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {countdownBadge.text}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '20px', marginBottom: '10px', lineHeight: '1.4' }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>{item.description}</p>

                                <div style={{ borderTop: `1px solid ${isDark ? '#333' : '#eee'}`, paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.priceETH} ETH</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>~${item.priceUSD}</div>
                                    </div>
                                    <button
                                        onClick={() => handleBuyClick(item)}
                                        disabled={isPending}
                                        style={{
                                            padding: '10px 24px',
                                            backgroundColor: isPending ? '#555' : 'var(--accent-primary)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: isPending ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s',
                                            fontSize: '15px'
                                        }}
                                    >
                                        View / Buy
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Embedded styles for pulse animation */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                @keyframes pulse-fast {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>

            {showPaymentSimulator && selectedItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <PaymentSimulator
                        onClose={() => setShowPaymentSimulator(false)}
                        onSuccess={handleSimulatedPaymentSuccess}
                        priceUSD={selectedItem.priceUSD}
                        itemTitle={selectedItem.title}
                    />
                </div>
            )}
        </div>
    );
};

export default Marketplace;
