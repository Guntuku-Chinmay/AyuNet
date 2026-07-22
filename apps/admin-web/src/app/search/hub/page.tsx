'use client';

import React from 'react';
import { Search, Command, ArrowRight, Star, History, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '../../../components/guards/protected-route';
import { AdminLayout } from '../../../layouts/admin-layout';
import { useGlobalSearchStore } from '../../../stores/use-global-search-store';
import { SmartSearchResults } from '../../../features/search/components/smart-search-results';
import { CommandPalette } from '../../../features/search/components/command-palette';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function SearchHubPage() {
  const { query, setQuery, setCommandPaletteOpen, recentSearches } = useGlobalSearchStore();

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
      <AdminLayout>
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Universal Search & Command Hub
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Instantly search clinical patients, appointments, medical records, and execute workspace workflows.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setCommandPaletteOpen(true)} className="bg-teal-600 hover:bg-teal-700">
                <Command className="mr-2 h-4 w-4" /> Open Command Palette
              </Button>
            </div>
          </div>

          {/* Search Input Bar with hotkey badge */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients, medical records, or enter command..."
              className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <kbd className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Recent Searches */}
          {!query && (
            <div className="max-w-3xl mx-auto space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <History className="mr-1.5 h-4 w-4" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-teal-500 hover:text-teal-700 transition-colors text-xs font-medium dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results / Empty State */}
          <div className="mt-8">
            <SmartSearchResults />
          </div>

          {/* Mount the Cmd+K Command Palette Dialog */}
          <CommandPalette />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
