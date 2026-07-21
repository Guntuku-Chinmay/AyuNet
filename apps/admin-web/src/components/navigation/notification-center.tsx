'use client';

import React, { useState } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/use-notification-store';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in-0 slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={markAllAsRead} title="Mark all read" className="h-8 px-2 text-xs">
                <Check className="mr-1 h-3.5 w-3.5" /> Read All
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} title="Clear all" className="h-8 px-2 text-xs text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No notifications at this time.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    'flex items-start space-x-3 rounded-lg p-3 text-xs transition-colors cursor-pointer',
                    item.read
                      ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      : 'bg-teal-50/70 dark:bg-teal-950/40 text-slate-900 dark:text-slate-100 border-l-2 border-teal-500'
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {item.type === 'WARNING' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    {item.type === 'INFO' && <Info className="h-4 w-4 text-teal-500" />}
                    {item.type === 'ERROR' && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
