import React from 'react';

import { useAuth } from '../contexts/AuthContext';

import BuyerSidebar from './BuyerSidebar';
import CreatorSidebar from './CreatorSidebar';

export default function PortalSidebar() {
  const {
    isAuthenticated,
    role
  } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (role === 'Creator') {
    return <CreatorSidebar />;
  }

  if (role === 'Buyer') {
    return <BuyerSidebar />;
  }

  return null;
}