'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Permission, UserRole } from '@ayunet/types';
import { useAuthStore } from '../../stores/use-auth-store';
import { cn } from '../../utils/cn';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission?: Permission;
  roles?: UserRole[];
}

export interface RbacNavProps {
  items: NavItem[];
}

export function RbacNav({ items }: RbacNavProps) {
  const pathname = usePathname();
  const { hasPermission, hasRole } = useAuthStore();

  const filteredItems = items.filter((item) => {
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.roles && !hasRole(item.roles)) return false;
    return true;
  });

  return (
    <nav className="space-y-1 px-2 py-4">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-semibold'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            <span className="mr-3 h-5 w-5">{item.icon}</span>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
