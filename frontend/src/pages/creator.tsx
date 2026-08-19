import React, {
    useEffect,
    useState
  } from 'react';
  
  import Link from 'next/link';
  import { useRouter } from 'next/router';
  
  import {
    ArrowUpRight,
    Eye,
    EyeOff,
    Plus,
    ShieldCheck,
    LockKeyhole,
    TrendingUp
  } from 'lucide-react';
  
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
  } from 'recharts';
  
  import { useAuth } from '../contexts/AuthContext';
  
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
  
    chart_data: {
      date: string;
      volume: number;
    }[];
  
    active_locks: ActiveLock[];
  }
  
  const BACKEND_URL = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:8081'
  ).replace(/\/+$/, '');
  
  const CreatorPortal = () => {
    const {
      isAuthenticated,
      role
    } = useAuth();
  
    const router = useRouter();
  
    const [
      privacyMode,
      setPrivacyMode
    ] = useState(false);
  
    const [
      analytics,
      setAnalytics
    ] = useState<AnalyticsData | null>(
      null
    );
  
    useEffect(() => {
      if (!router.isReady) {
        return;
      }
  
      if (!isAuthenticated) {
        router.replace(
          '/login?redirect=/creator'
        );
  
        return;
      }
  
      if (role !== 'Creator') {
        router.replace('/dashboard');
  
        return;
      }
  
      const fetchAnalytics =
        async () => {
          const fallback: AnalyticsData = {
            total_earnings_eth: 4.52,
  
            total_earnings_usd:
              13560,
  
            total_intel_sold: 125,
  
            chart_data: [
              {
                date: '2026-03-21',
                volume: 0.5
              },
              {
                date: '2026-03-22',
                volume: 1.2
              },
              {
                date: '2026-03-23',
                volume: 0.8
              },
              {
                date: '2026-03-24',
                volume: 1.5
              },
              {
                date: '2026-03-25',
                volume: 0.52
              }
            ],
  
            active_locks: [
              {
                id: '1',
                title:
                  'Q1 Defense Strategy Leak',
                release_date:
                  '2026-04-10T12:00:00Z',
                escrow_eth: 2.5,
                dispute_status:
                  'Normal',
                volume: '42 Buyers'
              },
              {
                id: '2',
                title:
                  'DeFi Liquidations Data Dump',
                release_date:
                  '2026-04-15T00:00:00Z',
                escrow_eth: 1.2,
                dispute_status:
                  'High',
                volume: '6 Buyers'
              }
            ]
          };
  
          try {
            const response =
              await fetch(
                `${BACKEND_URL}/api/creator/analytics`,
                {
                  method: 'GET',
  
                  credentials:
                    'include',
  
                  headers: {
                    Accept:
                      'application/json'
                  }
                }
              );
  
            if (!response.ok) {
              throw new Error(
                `Analytics request failed with status ${response.status}`
              );
            }
  
            const data: AnalyticsData =
              await response.json();
  
            setAnalytics(data);
          } catch (error) {
            console.warn(
              'Creator analytics endpoint unavailable. Using fallback analytics.',
              error
            );
  
            setAnalytics(fallback);
          }
        };
  
      fetchAnalytics();
    }, [
      isAuthenticated,
      role,
      router
    ]);
  
    const handleWithdraw = () => {
      if (
        analytics?.active_locks.some(
          (lock) =>
            lock.dispute_status ===
            'High'
        )
      ) {
        alert(
          'Withdrawal paused due to high dispute rates.'
        );
  
        return;
      }
  
      alert(
        'Payout initiated. Funds will be transferred 24 hours post-reveal pending community verification.'
      );
    };
  
    if (
      !isAuthenticated ||
      role !== 'Creator'
    ) {
      return null;
    }
  
    if (!analytics) {
      return (
        <div className="creator-loading">
          <div className="creator-loading-spinner" />
  
          <span>
            Loading creator workspace...
          </span>
        </div>
      );
    }
  
    const privateValue = (
      value: React.ReactNode
    ) => (
      <span
        className={
          privacyMode
            ? 'creator-private-value'
            : ''
        }
      >
        {value}
      </span>
    );
  
    return (
      <div className="creator-page">
        <section className="creator-page-header">
          <div>
            <div className="creator-eyebrow">
              <ShieldCheck size={16} />
  
              Creator workspace
            </div>
  
            <h1>
              Intelligence Dashboard
            </h1>
  
            <p>
              Monitor your locked intelligence,
              revenue and marketplace performance.
            </p>
          </div>
  
          <div className="creator-header-actions">
            <button
              type="button"
              className="privacy-toggle"
              onClick={() =>
                setPrivacyMode(
                  (current) => !current
                )
              }
            >
              {privacyMode ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
  
              {privacyMode
                ? 'Reveal values'
                : 'Privacy mode'}
            </button>
  
            <Link
              href="/upload"
              className="create-intel-button"
            >
              <Plus size={19} />
  
              Create Intelligence
            </Link>
          </div>
        </section>
  
        <section className="creator-stats-grid">
          <article className="creator-stat-card creator-stat-primary">
            <div className="creator-stat-heading">
              <span>
                Total Earnings
              </span>
  
              <TrendingUp size={18} />
            </div>
  
            <strong>
              {privateValue(
                `${analytics.total_earnings_eth.toFixed(
                  3
                )} ETH`
              )}
            </strong>
  
            <small>
              {privateValue(
                `≈ $${analytics.total_earnings_usd.toLocaleString()} USD`
              )}
            </small>
          </article>
  
          <article className="creator-stat-card">
            <div className="creator-stat-heading">
              <span>
                Intelligence Sold
              </span>
  
              <ArrowUpRight size={18} />
            </div>
  
            <strong>
              {analytics.total_intel_sold}
            </strong>
  
            <small>
              Lifetime marketplace sales
            </small>
          </article>
  
          <article className="creator-stat-card">
            <div className="creator-stat-heading">
              <span>
                Active Locks
              </span>
  
              <LockKeyhole size={18} />
            </div>
  
            <strong>
              {analytics.active_locks.length}
            </strong>
  
            <small>
              Currently time-locked
            </small>
          </article>
        </section>
  
        <section className="creator-dashboard-grid">
          <article className="creator-panel creator-chart-panel">
            <div className="creator-panel-header">
              <div>
                <h2>
                  Revenue Analytics
                </h2>
  
                <p>
                  Earnings volume over time
                </p>
              </div>
            </div>
  
            <div className="creator-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    analytics.chart_data
                  }
                >
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        'var(--text-secondary)',
                      fontSize: 12
                    }}
                  />
  
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        'var(--text-secondary)',
                      fontSize: 12
                    }}
                  />
  
                  <Tooltip
                    contentStyle={{
                      background:
                        'var(--surface)',
                      border:
                        '1px solid var(--border)',
                      borderRadius:
                        '12px',
                      color:
                        'var(--text-primary)'
                    }}
                  />
  
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="var(--accent-primary)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill:
                        'var(--accent-primary)'
                    }}
                    activeDot={{
                      r: 6
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
  
          <article className="creator-panel creator-payout-panel">
            <div>
              <span className="creator-panel-icon">
                <ShieldCheck size={20} />
              </span>
  
              <h2>
                Secure Payout
              </h2>
  
              <p>
                Eligible funds are released
                after the reveal window and
                community verification period.
              </p>
            </div>
  
            <button
              type="button"
              onClick={handleWithdraw}
              className="creator-payout-button"
            >
              Trigger Payout
  
              <ArrowUpRight size={18} />
            </button>
          </article>
        </section>
  
        <section className="creator-panel creator-locks-panel">
          <div className="creator-panel-header">
            <div>
              <h2>
                Active Locks
              </h2>
  
              <p>
                Intelligence currently protected
                by FutureLock.
              </p>
            </div>
  
            <Link
              href="/upload"
              className="creator-secondary-action"
            >
              <Plus size={17} />
  
              New Intel
            </Link>
          </div>
  
          <div className="creator-table-wrapper">
            <table className="creator-table">
              <thead>
                <tr>
                  <th>
                    Intelligence
                  </th>
  
                  <th>
                    Release
                  </th>
  
                  <th>
                    Escrow
                  </th>
  
                  <th>
                    Buyers
                  </th>
  
                  <th>
                    Status
                  </th>
                </tr>
              </thead>
  
              <tbody>
                {analytics.active_locks.map(
                  (lock) => (
                    <tr key={lock.id}>
                      <td>
                        <strong>
                          {lock.title}
                        </strong>
                      </td>
  
                      <td>
                        {lock.release_date
                          ? new Date(
                              lock.release_date
                            ).toLocaleDateString()
                          : 'N/A'}
                      </td>
  
                      <td className="creator-eth-value">
                        {privateValue(
                          `${lock.escrow_eth.toFixed(
                            3
                          )} ETH`
                        )}
                      </td>
  
                      <td>
                        {lock.volume}
                      </td>
  
                      <td>
                        <span
                          className={`creator-status ${
                            lock.dispute_status ===
                            'High'
                              ? 'creator-status-danger'
                              : 'creator-status-normal'
                          }`}
                        >
                          {lock.dispute_status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
  
                {analytics.active_locks.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="creator-empty"
                    >
                      No active locked
                      intelligence found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };
  
  export default CreatorPortal;