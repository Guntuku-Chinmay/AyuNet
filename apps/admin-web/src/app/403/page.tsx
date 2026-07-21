'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
      <div className="rounded-full bg-rose-950/50 p-6 text-rose-500 border border-rose-800">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">403 - Access Forbidden</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        You do not possess the required RBAC role or privilege permissions to view this resource. Contact your hospital administrator.
      </p>
      <Link href="/login">
        <Button variant="outline" className="mt-8 border-slate-800 text-slate-200">
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Login
        </Button>
      </Link>
    </div>
  );
}
