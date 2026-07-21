'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle } from 'lucide-react';
import { loginSchema, LoginSchemaInput } from '../../features/auth/schemas/auth-schemas';
import { useAuth } from '../../features/auth/hooks/use-auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      tenantId: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginSchemaInput) => {
    try {
      await login(data);
    } catch {
      // Error handled by loginError mutation state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {loginError && (
        <div className="flex items-center space-x-2 rounded-lg border border-red-800 bg-red-950/50 p-3 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{loginError.response?.data?.message || 'Invalid login credentials. Please try again.'}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">Hospital Subdomain / Tenant ID (Optional)</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="e.g. apollo-central"
            className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
            {...register('tenantId')}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            type="email"
            placeholder="doctor@ayunet.org"
            className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">Password</label>
          <Link href="/forgot-password" className="text-xs font-medium text-teal-400 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-9 pr-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <input
          type="checkbox"
          id="rememberMe"
          className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
          {...register('rememberMe')}
        />
        <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer">
          Remember session on this device
        </label>
      </div>

      <Button type="submit" isLoading={isLoggingIn} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5">
        Sign In to Portal
      </Button>
    </form>
  );
}
