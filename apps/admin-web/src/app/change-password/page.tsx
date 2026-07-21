'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { AuthLayout } from '../../layouts/auth-layout';
import { changePasswordSchema, ChangePasswordSchemaInput } from '../../features/auth/schemas/auth-schemas';
import { useAuth } from '../../features/auth/hooks/use-auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function ChangePasswordPage() {
  const { changePassword, isChangingPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordSchemaInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordSchemaInput) => {
    try {
      await changePassword(data);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AuthLayout title="Update Your Password" subtitle="Security policy requires updating your password before continuing">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              type="password"
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              type="password"
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              type="password"
              className="pl-9 bg-slate-950 border-slate-800 text-slate-100"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </div>

        <Button type="submit" isLoading={isChangingPassword} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
          Update & Continue to Portal
        </Button>
      </form>
    </AuthLayout>
  );
}
