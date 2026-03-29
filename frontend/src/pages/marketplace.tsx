import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFutureLock } from '../hooks/useFutureLock';
import { useRouter } from 'next/router';
import { ChevronDown, Search, Filter, Check } from 'lucide-react';
import PaymentSimulator from '../components/PaymentSimulator';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // CUSTOM DROPDOWN STATES
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IntelMetadata | null>(null);

    const isDark = theme === 'dark';
    const categories = ['All', 'Security', 'Finance', 'Tech'];

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
        const fetchMetadata = async () => {
            setLoading(true);
            try {
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

    const handleBuyClick = (item: IntelMetadata) => {
        if (!isAuthenticated) {
            setRedirectUrl(`/marketplace`); 
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
        if (days > 10) return { text: `Opens in ${Math.ceil(days)}d`, style: { backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' } };
        if (days >= 1 && days <= 10) return { text: `Opens in ${Math.ceil(days)}d`, style: { backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' } };
        const hours = Math.floor(days * 24);
        const mins = Math.floor((days * 24 * 60) % 60);
        return {
            text: `${hours.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m`,
            style: { backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }
        };
    };

    return (
        <div style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', color: isDark ? '#fff' : '#000', minHeight: '100vh', backgroundColor: isDark ? '#000' : '#fff' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-1px' }}>Open Intelligence Market</h1>
            <p style={{ color: isDark ? '#aaa' : '#666', marginBottom: '40px', fontSize: '18px' }}>Search and acquire Time-Locked Intelligence securely via Zero-Knowledge protocols.</p>

            {/* SEARCH & CUSTOM DROPDOWN CONTAINER */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap', position: 'relative' }}>
                <div style={{ flex: 2, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#555' : '#999' }} />
                    <input
                        type="text"
                        placeholder="Search by Title or Creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: `1px solid ${isDark ? '#222' : '#ddd'}`, backgroundColor: isDark ? '#080808' : '#f9f9f9', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '16px' }}
                    />
                </div>

                {/* THE CUSTOM BEAUTIFIED DROPDOWN */}
                <div ref={dropdownRef} style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                    <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px', borderRadius: '12px', cursor: 'pointer',
                            border: `1px solid ${isDropdownOpen ? '#3b82f6' : (isDark ? '#222' : '#ddd')}`,
                            backgroundColor: isDark ? '#080808' : '#f9f9f9',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '16px', color: isDark ? '#eee' : '#333' }}>{categoryFilter === 'All' ? 'All Categories' : categoryFilter}</span>
                        <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: isDark ? '#555' : '#999' }} />
                    </div>

                    {isDropdownOpen && (
                        <div style={{ 
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', 
                            backgroundColor: isDark ? '#0d0d0d' : '#fff', 
                            border: `1px solid ${isDark ? '#222' : '#eee'}`, 
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

            {/* DATA GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ padding: '30px', backgroundColor: isDark ? '#080808' : '#fff', border: `1px solid ${isDark ? '#1a1a1a' : '#eee'}`, borderRadius: '16px', animation: 'pulse 1.5s infinite' }}>
                            <div style={{ height: '20px', backgroundColor: isDark ? '#1a1a1a' : '#eee', borderRadius: '4px', width: '60%', marginBottom: '15px' }}></div>
                            <div style={{ height: '14px', backgroundColor: isDark ? '#1a1a1a' : '#eee', borderRadius: '4px', width: '100%', marginBottom: '8px' }}></div>
                            <div style={{ height: '14px', backgroundColor: isDark ? '#1a1a1a' : '#eee', borderRadius: '4px', width: '80%' }}></div>
                        </div>
                    ))
                ) : (
                    filteredList.map(item => {
                        const countdown = formatCountdown(item.unlockDays);
                        return (
                            <div key={item.id} style={{
                                padding: '30px', backgroundColor: isDark ? '#080808' : '#fff',
                                border: `1px solid ${isDark ? '#1a1a1a' : '#eee'}`, borderRadius: '16px',
                                display: 'flex', flexDirection: 'column', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} className="intel-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '1px' }}>{item.category}</span>
                                    <span style={{ ...countdown.style, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{countdown.text}</span>
                                </div>
                                <h3 style={{ fontSize: '19px', fontWeight: '700', marginBottom: '10px' }}>{item.title}</h3>
                                <p style={{ fontSize: '14px', color: isDark ? '#777' : '#666', lineHeight: '1.6', marginBottom: '25px', flex: 1 }}>{item.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${isDark ? '#1a1a1a' : '#eee'}`, paddingTop: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: '900' }}>{item.priceETH} ETH</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>~${item.priceUSD}</div>
                                    </div>
                                    <button onClick={() => handleBuyClick(item)} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>View / Buy</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; }
                }
                .dropdown-item:hover {
                    background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'} !important;
                }
                .intel-card:hover {
                    transform: translateY(-5px);
                    border-color: #3b82f6 !important;
                    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
                }
            `}</style>

            {showPaymentSimulator && selectedItem && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <PaymentSimulator onClose={() => setShowPaymentSimulator(false)} onSuccess={handleSimulatedPaymentSuccess} priceUSD={selectedItem.priceUSD} itemTitle={selectedItem.title} />
                </div>
            )}
        </div>
    );
};

export default Marketplace;