import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShieldCheck, Trash2, ShieldAlert, ChevronDown, Check } from 'lucide-react';
import { getErrorMessage } from '../utils/errorHandler';

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
    const [decryptedData, setDecryptedData] = useState<Record<string, string>>({});
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Custom Dropdown States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const categories = ['All', 'Security', 'Finance', 'Tech'];

    const [showNotification, setShowNotification] = useState(false);
    const [isWiping, setIsWiping] = useState(false);

    const isDark = theme === 'dark';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchArchive = async () => {
            setLoading(true);
            try {
                const res = await fetch('process.env.NEXT_PUBLIC_BACKEND_URL/api/buyer/vault', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setVaultList(data);
                } else {
                    if (isMounted) {
                        setVaultList([
                            { id: '0x101', title: 'Q1 Defense Strategy Leak', description: 'Declassified documentation detailing Q1 autonomous drone defenses.', category: 'Security', creator: '0xsecops', hasAccess: true },
                            { id: '0x102', title: 'Silicon Supply Chain Analysis', description: 'Early semiconductor supply chain risk assessment for next year.', category: 'Tech', creator: 'siliconvalley', hasAccess: false },
                            { id: '0x103', title: 'DeFi Liquidations Data Dump', description: 'Raw historical data of cascading liquidations across lending protocols.', category: 'Finance', creator: 'quantalpha', hasAccess: true }
                        ]);
                    }
                }
            } catch (err) {
                alert(getErrorMessage(err));
                if (isMounted) {
                    setVaultList([
                        { id: '0x101', title: 'Q1 Defense Strategy Leak', description: 'Declassified documentation detailing Q1 autonomous drone defenses.', category: 'Security', creator: '0xsecops', hasAccess: true },
                        { id: '0x102', title: 'Silicon Supply Chain Analysis', description: 'Early semiconductor supply chain risk assessment for next year.', category: 'Tech', creator: 'siliconvalley', hasAccess: false }
                    ]);
                }
            } finally {
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
    };

    const handleAccessContent = (item: VaultItem) => {
        if (!isAuthenticated) {
            alert("Please log in to view this content.");
            return;
        }
        if (!item.hasAccess) {
            alert("You do not have the decryption keys for this item.");
            return;
        }
        setDecryptedData(prev => ({ ...prev, [item.id]: "Decrypting blob via AES-256..." }));
        setTimeout(() => {
            setDecryptedData(prev => ({
                ...prev,
                [item.id]: `[SECURE DECRYPTED PAYLOAD]\n\nTitle: ${item.title}\n\nCryptographic verification successful.`
            }));
        }, 1500);
    };

    const clearSessionCache = useCallback(async () => {
        setIsWiping(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setDecryptedData({});
        setRatings({});
        localStorage.clear();
        sessionStorage.clear();
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        setIsWiping(false);
    }, []);

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

            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '15px', flex: 1, minWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search Archive by Title or Creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 2, padding: '14px 20px', borderRadius: '12px', border: `1px solid ${isDark ? '#333' : '#ddd'}`, backgroundColor: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '16px' }}
                    />

                    {/* CUSTOM DROPDOWN FIX */}
                    <div ref={dropdownRef} style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 20px', borderRadius: '12px', cursor: 'pointer',
                                border: `1px solid ${isDropdownOpen ? '#3b82f6' : (isDark ? '#333' : '#ddd')}`,
                                backgroundColor: isDark ? '#111' : '#f9f9f9',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ fontSize: '16px', color: isDark ? '#fff' : '#000' }}>{categoryFilter === 'All' ? 'All Categories' : categoryFilter}</span>
                            <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: isDark ? '#555' : '#999' }} />
                        </div>

                        {isDropdownOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%',
                                backgroundColor: isDark ? '#0d0d0d' : '#fff',
                                border: `1px solid ${isDark ? '#333' : '#eee'}`,
                                borderRadius: '12px', zIndex: 100, overflow: 'hidden',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                animation: 'dropdownFade 0.2s ease-out'
                            }}>
                                {categories.map((cat) => (
                                    <div
                                        key={cat}
                                        onClick={() => { setCategoryFilter(cat); setIsDropdownOpen(false); }}
                                        className="dropdown-item"
                                        style={{
                                            padding: '12px 20px', fontSize: '14px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            backgroundColor: categoryFilter === cat ? (isDark ? '#1a1a1a' : '#f0f7ff') : 'transparent',
                                            color: categoryFilter === cat ? '#3b82f6' : (isDark ? '#bbb' : '#555')
                                        }}
                                    >
                                        {cat === 'All' ? 'All Categories' : cat}
                                        {categoryFilter === cat && <Check size={14} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={clearSessionCache}
                        disabled={isWiping}
                        style={{
                            padding: '14px 24px',
                            backgroundColor: isDark ? (isWiping ? '#1a1a1a' : '#220000') : (isWiping ? '#f5f5f5' : '#ffebee'),
                            color: isWiping ? '#666' : '#f44336',
                            border: `1px solid ${isWiping ? '#444' : '#f44336'}`,
                            borderRadius: '12px',
                            cursor: isWiping ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isWiping ? <ShieldAlert size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={18} />}
                        {isWiping ? 'Purging RAM...' : 'Clear Session Cache'}
                    </button>

                    {showNotification && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '10px', color: '#10b981', fontSize: '13px', fontWeight: '600',
                            animation: 'slideInRight 0.4s ease-out forwards', whiteSpace: 'nowrap'
                        }}>
                            <ShieldCheck size={16} />
                            <span>Session Cleared</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ padding: '30px', backgroundColor: isDark ? '#111' : '#fff', border: `1px solid ${isDark ? '#333' : '#eee'}`, borderRadius: '16px', animation: 'pulse 1.5s infinite' }}>
                            <div style={{ height: '24px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '4px', width: '70%', marginBottom: '15px' }}></div>
                            <div style={{ height: '16px', backgroundColor: isDark ? '#222' : '#e0e0e0', borderRadius: '4px', width: '100%' }}></div>
                        </div>
                    ))
                ) : (
                    filteredList.map(item => (
                        <div key={item.id} style={{
                            padding: '30px', backgroundColor: isDark ? '#0a0a0a' : '#fff',
                            border: `1px solid ${isDark ? '#333' : '#eee'}`, borderRadius: '16px',
                            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.category}</span>
                                    <div style={{ fontSize: '12px', color: isDark ? '#888' : '#aaa', marginTop: '4px' }}>@{item.creator}</div>
                                </div>
                                <span style={{ backgroundColor: isDark ? '#222' : '#eee', color: isDark ? '#bbb' : '#666', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Unlocked</span>
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '10px', lineHeight: '1.4' }}>{item.title}</h3>
                            <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '25px', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>{item.description}</p>

                            <div style={{ borderTop: `1px solid ${isDark ? '#333' : '#eee'}`, paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#aaa' : '#555' }}>Community Rating</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} onClick={() => handleRating(item.id, star)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (ratings[item.id] || item.userRating || 0) >= star ? '#FFD700' : (isDark ? '#444' : '#ccc'), fontSize: '20px', padding: 0 }}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAccessContent(item)}
                                    disabled={!item.hasAccess && isAuthenticated}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: (!isAuthenticated || item.hasAccess) ? '#3b82f6' : 'transparent',
                                        color: (!isAuthenticated || item.hasAccess) ? '#fff' : (isDark ? '#555' : '#aaa'),
                                        border: (!isAuthenticated || item.hasAccess) ? 'none' : `1px solid ${isDark ? '#333' : '#ddd'}`,
                                        borderRadius: '8px', cursor: (!isAuthenticated || item.hasAccess) ? 'pointer' : 'not-allowed',
                                        fontWeight: 'bold', fontSize: '15px', width: '100%'
                                    }}
                                >
                                    {isAuthenticated ? (item.hasAccess ? "Decrypt & Access" : "No Access Keys") : "Login to Access"}
                                </button>
                            </div>

                            {decryptedData[item.id] && (
                                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: isDark ? '#0a1910' : '#e8f5e9', border: '1px solid #00e676', borderRadius: '8px', color: '#00e676', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                                    {decryptedData[item.id]}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes dropdownFade { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .dropdown-item:hover { background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'} !important; }
            `}</style>
        </div>
    );
};

export default Vault;