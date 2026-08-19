import React, {
    useEffect
  } from 'react';
  
  import Link from 'next/link';
  import { useRouter } from 'next/router';
  
  import {
    ArrowRight,
    Store,
    LockKeyhole,
    History,
    ShieldCheck,
    Search,
    Clock3
  } from 'lucide-react';
  
  import { useAuth } from '../contexts/AuthContext';
  
  export default function BuyerDashboard() {
    const router = useRouter();
  
    const {
      isAuthenticated,
      role,
      identity
    } = useAuth();
  
    useEffect(() => {
      if (!router.isReady) {
        return;
      }
  
      if (!isAuthenticated) {
        router.replace(
          '/login?redirect=/dashboard'
        );
  
        return;
      }
  
      if (role === 'Creator') {
        router.replace('/creator');
      }
    }, [
      isAuthenticated,
      role,
      router
    ]);
  
    if (
      !isAuthenticated ||
      role !== 'Buyer'
    ) {
      return null;
    }
  
    return (
      <div className="buyer-dashboard">
  
        <section className="buyer-dashboard-header">
  
          <div>
  
            <div className="portal-eyebrow">
              <ShieldCheck size={16} />
  
              Buyer workspace
            </div>
  
            <h1>
              Intelligence Dashboard
            </h1>
  
            <p>
              Discover intelligence, monitor your
              purchases and access secured content
              from your vault.
            </p>
  
          </div>
  
          {identity && (
            <div className="buyer-identity">
              <span>Signed in as</span>
  
              <strong>
                {identity}
              </strong>
            </div>
          )}
  
        </section>
  
        <section className="buyer-quick-grid">
  
          <Link
            href="/marketplace"
            className="buyer-action-card"
          >
            <div className="buyer-action-icon">
              <Search size={22} />
            </div>
  
            <div>
              <h2>
                Explore Marketplace
              </h2>
  
              <p>
                Discover intelligence available
                across FutureLock.
              </p>
            </div>
  
            <ArrowRight
              className="buyer-card-arrow"
              size={20}
            />
          </Link>
  
          <Link
            href="/vault"
            className="buyer-action-card"
          >
            <div className="buyer-action-icon">
              <LockKeyhole size={22} />
            </div>
  
            <div>
              <h2>
                Open My Vault
              </h2>
  
              <p>
                Access intelligence you have
                purchased and unlocked.
              </p>
            </div>
  
            <ArrowRight
              className="buyer-card-arrow"
              size={20}
            />
          </Link>
  
        </section>
  
        <section className="buyer-dashboard-section">
  
          <div className="buyer-section-header">
  
            <div>
              <span className="portal-eyebrow">
                Marketplace
              </span>
  
              <h2>
                Intelligence Discovery
              </h2>
  
              <p>
                Browse intelligence listings and
                secure access through FutureLock.
              </p>
            </div>
  
            <Link
              href="/marketplace"
              className="buyer-section-link"
            >
              View marketplace
  
              <ArrowRight size={17} />
            </Link>
  
          </div>
  
          <div className="buyer-feature-grid">
  
            <article className="buyer-feature-card">
  
              <Store size={24} />
  
              <h3>
                Intelligence Marketplace
              </h3>
  
              <p>
                Browse intelligence by category,
                creator, trust score and price.
              </p>
  
              <Link href="/marketplace">
                Browse marketplace
              </Link>
  
            </article>
  
            <article className="buyer-feature-card">
  
              <LockKeyhole size={24} />
  
              <h3>
                Secure Vault
              </h3>
  
              <p>
                Purchased intelligence remains
                protected until its configured
                unlock conditions are satisfied.
              </p>
  
              <Link href="/vault">
                Enter vault
              </Link>
  
            </article>
  
            <article className="buyer-feature-card">
  
              <Clock3 size={24} />
  
              <h3>
                Time-Locked Access
              </h3>
  
              <p>
                Track intelligence awaiting its
                release window from one workspace.
              </p>
  
            </article>
  
          </div>
  
        </section>
  
        <section className="buyer-dashboard-section">
  
          <div className="buyer-section-header">
  
            <div>
              <span className="portal-eyebrow">
                Activity
              </span>
  
              <h2>
                Purchase Activity
              </h2>
  
              <p>
                Your purchased intelligence and
                transaction history will appear
                here.
              </p>
            </div>
  
          </div>
  
          <div className="buyer-empty-state">
  
            <div className="buyer-empty-icon">
              <History size={25} />
            </div>
  
            <h3>
              Your intelligence activity
            </h3>
  
            <p>
              Purchase intelligence from the
              marketplace and it will become
              available through your Buyer portal.
            </p>
  
            <Link
              href="/marketplace"
              className="buyer-primary-button"
            >
              Explore Marketplace
  
              <ArrowRight size={17} />
            </Link>
  
          </div>
  
        </section>
  
      </div>
    );
  }