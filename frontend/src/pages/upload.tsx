import { useEffect } from 'react';
import { useRouter } from 'next/router';
import CreateLock from '../components/CreateLock';
import { useAuth } from '../contexts/AuthContext';

export default function UploadPage() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/login?redirect=/upload');
    else if (role !== 'Creator') router.replace('/dashboard');
  }, [isAuthenticated, isLoading, role, router]);

  if (isLoading || !isAuthenticated || role !== 'Creator') return null;
  return <div className="creator-page"><CreateLock /></div>;
}
