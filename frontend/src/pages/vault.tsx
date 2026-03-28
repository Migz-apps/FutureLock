import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface VaultItem {
    id: string;
    title: string;
    description: string;
    category: string;
    creator: string;
    userRating?: number;
    hasAccess: boolean;
}

const Vault = () => {
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [vaultList, setVaultList] = useState<VaultItem[]>([]);

    // Ratings state: map of itemId -> rating
    const [ratings, setRatings] = useState<Record<string, number>>({});

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const isDark = theme === 'dark';

    useEffect(() => {
        let isMounted = true;
        // Mock fetch GET /api/v1/intel/archive
        const fetchArchive = async () => {
            setLoading(true);
            try {
                // Simulate network latency for skeleton pulse
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (isMounted) {
                    setVaultList([
                        { id: '0x101', title: 'Q1 Defense Strategy Leak', description: 'Declassified documentation detailing Q1 autonomous drone defenses.', category: 'Security', creator: '0xsecops', hasAccess: true },
                        { id: '0x102', title: 'Silicon Supply Chain Analysis', description: 'Early semiconductor supply chain risk assessment for next year.', category: 'Tech', creator: 'siliconvalley', hasAccess: false },
                        { id: '0x103', title: 'DeFi Liquidations Data Dump', description: 'Raw historical data of cascading liquidations across lending protocols.', category: 'Finance', creator: 'quantalpha', hasAccess: true }
                    ]);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setLoading(false);
            }
        };

        fetchArchive();
        return () => { isMounted = false; };
    }, []);

    const handleRating = (itemId: string, rating: number) => {
        if (!isAuthenticated) {
            alert("Please log in to rate intelligence.");
            return;
        }
        setRatings(prev => ({ ...prev, [itemId]: rating }));
        // Mock backend call
        console.log(`Submitted rating ${rating} for item ${itemId}`);
    };

    const handleAccessContent = (item: VaultItem) => {
        if (!isAuthenticated) {
            alert("Please log in to view this content.");
            return;
        }
        if (!item.hasAccess) {
            alert("You do not have the decryption keys for this item. It was not purchased during the lock period.");
            return;
        }

        // Client-Side Decryption Notification Simulation
        alert(`Initiating Client-Side Decryption for CID: ${item.id}...\n\nDecrypted Successfully!`);
    };

    const filteredList = vaultList.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.creator.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', color: isDark ? '#fff' : '#000', minHeight: '100vh', backgroundColor: isDark ? '#000' : '#fff' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-1px' }}>The Vault</h1>
            <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px', fontSize: '18px' }}>Historical ledger of unlocked intelligence. Decrypt locally and verify community ratings.</p>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search Archive by Title or Creator..."
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
                    filteredList.map(item => (
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
                                    <div style={{ fontSize: '12px', color: isDark ? '#888' : '#aaa', marginTop: '4px' }}>@{item.creator}</div>
                                </div>
                                <span style={{ backgroundColor: isDark ? '#222' : '#eee', color: isDark ? '#bbb' : '#666', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                    Unlocked
                                </span>
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '10px', lineHeight: '1.4' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>{item.description}</p>

                            <div style={{ borderTop: `1px solid ${isDark ? '#333' : '#eee'}`, paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#aaa' : '#555' }}>Community Rating</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRating(item.id, star)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: (ratings[item.id] || item.userRating || 0) >= star ? '#FFD700' : (isDark ? '#444' : '#ccc'),
                                                    fontSize: '20px',
                                                    padding: 0,
                                                    transition: 'color 0.2s'
                                                }}
                                                title={`Rate ${star} stars`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAccessContent(item)}
                                    disabled={!item.hasAccess && isAuthenticated}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: (!isAuthenticated || item.hasAccess) ? 'var(--accent-primary)' : 'transparent',
                                        color: (!isAuthenticated || item.hasAccess) ? '#fff' : (isDark ? '#555' : '#aaa'),
                                        border: (!isAuthenticated || item.hasAccess) ? 'none' : `1px solid ${isDark ? '#333' : '#ddd'}`,
                                        borderRadius: '8px',
                                        cursor: (!isAuthenticated || item.hasAccess) ? 'pointer' : 'not-allowed',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s',
                                        fontSize: '15px',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}
                                >
                                    {isAuthenticated ? (item.hasAccess ? "Decrypt & Access" : "No Access Keys") : "Login to Access"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Vault;
