'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VerifyOtpPage } from '@/components/auth/verify-otp-page';
import { useAuth } from '@/lib/auth-context';

export default function VerifyOtpPageRoute() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    // Guard: localStorage is the sole source of truth.
    // URL params can be crafted by anyone, so we never trust them as a gate.
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    const storedMessage = localStorage.getItem('pendingVerificationMessage');

    if (!storedEmail) {
      // No genuine pending OTP — redirect away immediately
      router.replace('/register');
      return;
    }

    setEmail(storedEmail);
    if (storedMessage) setCustomMessage(storedMessage);
    setLoading(false);
  }, [router]);

  const handleBack = () => {
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.removeItem('pendingVerificationMessage');
    router.push('/register');
  };

  const handleSuccess = (data: any) => {
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.removeItem('pendingVerificationMessage');
    router.push('/login?verified=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <VerifyOtpPage
      email={email}
      customMessage={customMessage}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}