'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OtpInput } from '@/components/auth/otp-input';
import { OtpStatus } from '@/components/auth/otp-status';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { getClientIp } from '@/lib/ip-service';

interface VerifyOtpPageProps {
  email: string;
  onBack?: () => void;
  onSuccess?: (user: any) => void;
}

type OtpStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error';

export function VerifyOtpPage({ email, onBack, onSuccess }: VerifyOtpPageProps) {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [error, setError] = useState<string>('');
  const [resendTimeLeft, setResendTimeLeft] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimeLeft > 0) {
      const timer = setTimeout(() => {
        setResendTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeLeft]);

  const verifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter a complete 6-digit code');
      setStatus('error');
      return;
    }

    setStatus('verifying');
    setError('');

    try {
      // Get client IP (same as Vietguard)
      const ipData = await getClientIp();
      console.log('Client IP data in OTP verify:', ipData);

      const response = await authApi.verifyOtp({
        email,
        otp: otpCode,
        ipv4: ipData.ipv4,
        ipv6: ipData.ipv6,
      });

      setStatus('success');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response);
      } else {
        // Default redirect to login page after verification
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 1500);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid verification code');
      setStatus('error');
      
      // Clear OTP on error
      setOtpCode('');
    }
  };

  const resendOtp = async () => {
    if (resendTimeLeft > 0) return;

    setStatus('sending');
    setError('');

    try {
      await authApi.resendOtp({ email });

      setStatus('sent');
      setResendTimeLeft(30); // 30 second cooldown
      setOtpCode(''); // Clear current input
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend code');
      setStatus('error');
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpCode(value);
    setError('');
    if (status === 'error') {
      setStatus('idle');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp();
  };

  const canResend = resendTimeLeft <= 0 && status !== 'sending' && status !== 'verifying';
  const isLoading = status === 'verifying' || status === 'sending';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-between">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
              </div>
            </div>
            <CardDescription className="text-center">
              Enter the 6-digit verification code sent to
              <br />
              <span className="font-medium text-gray-900">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-4">
                <OtpInput
                  value={otpCode}
                  onChange={handleOtpChange}
                  disabled={isLoading}
                  className="justify-center"
                />
                
                {/* Instructions */}
                <p className="text-sm text-gray-600 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Status Messages */}
              <OtpStatus
                status={status}
                error={error}
                email={email}
                resendTimeLeft={resendTimeLeft}
              />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otpCode.length !== 6 || isLoading}
                >
                  {status === 'verifying' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={resendOtp}
                    disabled={!canResend}
                    className="p-0 h-auto font-medium"
                  >
                    {status === 'sending'
                      ? 'Sending...'
                      : resendTimeLeft > 0
                      ? `Resend in ${resendTimeLeft}s`
                      : 'Resend code'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 text-center">
                🔒 This code expires in 10 minutes. Don't share it with anyone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}