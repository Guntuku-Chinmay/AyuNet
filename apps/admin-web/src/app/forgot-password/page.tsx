'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../layouts/auth-layout';
import { forgotPasswordSchema, ForgotPasswordSchemaInput } from '../../features/auth/schemas/auth-schemas';
import { useAuth } from '../../features/auth/hooks/use-auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, isSubmittingForgot } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchemaInput) => {
    try {
      await forgotPassword(data);
      setIsSent(true);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AuthLayout title="Recover Account Password" subtitle="Enter your email address to receive password reset instructions">
      {isSent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-300">
            Password recovery email dispatched. Please check your inbox and follow the instructions.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-4 border-slate-800 text-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Registered Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                placeholder="user@ayunet.org"
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </div>

          <Button type="submit" isLoading={isSubmittingForgot} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center justify-center">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
