'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VerifyOtpPage } from '@/components/auth/verify-otp-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function VerifyOtpPageRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('pendingVerificationEmail');

    if (emailParam) {
      setEmail(emailParam);
      // Store for refresh persistence
      localStorage.setItem('pendingVerificationEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    setLoading(false);
  }, [searchParams]);

  const handleBack = () => {
    // Clear stored email and go back to registration
    localStorage.removeItem('pendingVerificationEmail');
    router.push('/register');
  };

  const handleSuccess = (data: any) => {
    // Clear stored email
    localStorage.removeItem('pendingVerificationEmail');
    
    // After OTP verification, redirect to login page
    // Backend only activates user, doesn't return token
    router.push('/login?verified=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-red-600">
              No Email Found
            </CardTitle>
            <CardDescription>
              No email address was provided for verification. Please register first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Registration
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <VerifyOtpPage
      email={email}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}