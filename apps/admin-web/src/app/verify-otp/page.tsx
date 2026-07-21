'use client';

import React from 'react';
import { AuthLayout } from '../../layouts/auth-layout';
import { OtpInput } from '../../components/auth/otp-input';
import { useAuth } from '../../features/auth/hooks/use-auth';
import { ShieldCheck } from 'lucide-react';

export default function VerifyOtpPage() {
  const { verifyOtp, isVerifyingOtp } = useAuth();

  const handleComplete = async (code: string) => {
    try {
      await verifyOtp({ code });
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AuthLayout title="Two-Factor Authentication" subtitle="Enter the 6-digit verification code sent to your authentication device">
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-950 text-teal-400 border border-teal-800">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <OtpInput onComplete={handleComplete} disabled={isVerifyingOtp} />
        <p className="text-xs text-slate-400">
          Didn&apos;t receive code?{' '}
          <button type="button" className="text-teal-400 underline font-medium hover:text-teal-300">
            Resend Verification Code
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
