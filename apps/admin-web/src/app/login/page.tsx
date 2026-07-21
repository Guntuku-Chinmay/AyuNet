'use client';

import React from 'react';
import { AuthLayout } from '../../layouts/auth-layout';
import { LoginForm } from '../../components/auth/login-form';
import { GuestRoute } from '../../components/guards/guest-route';

export default function LoginPage() {
  return (
    <GuestRoute>
      <AuthLayout title="Enterprise Portal Sign In" subtitle="Access your clinical, administrative, or patient portal">
        <LoginForm />
      </AuthLayout>
    </GuestRoute>
  );
}
