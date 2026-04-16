'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('pettypet_token');
    
    // Redirect based on authentication status
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-neutral to-neutral flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🐾</div>
        <p className="text-text-primary font-medium text-lg">Redirecting...</p>
      </div>
    </div>
  );
}
