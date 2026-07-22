'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, CornerDownLeft, Sparkles, UserPlus, Calendar, PlusCircle, LayoutDashboard, Settings, FileText, Bell, LogOut, Check } from 'lucide-react';
import { useGlobalSearchStore } from '../../../stores/use-global-search-store';
import { Dialog } from '../../../components/ui/dialog';
import { cn } from '../../../utils/cn';

interface CommandItem {
  id: string;
  name: string;
  category: 'Actions' | 'Navigation' | 'System';
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, query, setQuery, results, recentSearches, addRecentSearch } = useGlobalSearchStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands list
  const commands: CommandItem[] = [
    { id: 'c-1', name: 'Create Patient', category: 'Actions', icon: <UserPlus className="h-4 w-4 text-teal-500" />, action: () => { router.push('/reception/patient-registration'); setCommandPaletteOpen(false); }, shortcut: '⌘P' },
    { id: 'c-2', name: 'Book Appointment', category: 'Actions', icon: <Calendar className="h-4 w-4 text-emerald-500" />, action: () => { router.push('/doctor/appointments/new'); setCommandPaletteOpen(false); }, shortcut: '⌘B' },
    { id: 'c-3', name: 'Register Walk-in', category: 'Actions', icon: <PlusCircle className="h-4 w-4 text-indigo-500" />, action: () => { router.push('/reception/patient-registration'); setCommandPaletteOpen(false); } },
    { id: 'c-4', name: 'Open Dashboard', category: 'Navigation', icon: <LayoutDashboard className="h-4 w-4 text-blue-500" />, action: () => { router.push('/analytics/executive'); setCommandPaletteOpen(false); }, shortcut: '⌘D' },
    { id: 'c-5', name: 'Open Settings', category: 'System', icon: <Settings className="h-4 w-4 text-slate-500" />, action: () => { router.push('/settings/dashboard'); setCommandPaletteOpen(false); }, shortcut: '⌘S' },
    { id: 'c-6', name: 'Create Prescription', category: 'Actions', icon: <FileText className="h-4 w-4 text-amber-500" />, action: () => { router.push('/doctor/orders/new'); setCommandPaletteOpen(false); } },
    { id: 'c-7', name: 'Open AI Assistant', category: 'System', icon: <Sparkles className="h-4 w-4 text-purple-500" />, action: () => { router.push('/ai/copilot'); setCommandPaletteOpen(false); }, shortcut: '⌘A' },
    { id: 'c-8', name: 'Upload Document', category: 'Actions', icon: <FileText className="h-4 w-4 text-sky-500" />, action: () => { router.push('/documents/upload'); setCommandPaletteOpen(false); } },
    { id: 'c-9', name: 'Open Notifications', category: 'System', icon: <Bell className="h-4 w-4 text-orange-500" />, action: () => { router.push('/communications/inbox'); setCommandPaletteOpen(false); }, shortcut: '⌘N' },
    { id: 'c-10', name: 'Logout', category: 'System', icon: <LogOut className="h-4 w-4 text-rose-500" />, action: () => { router.push('/auth/login'); setCommandPaletteOpen(false); } },
  ];

  // Global hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen, setQuery]);

  // Filter commands and search entities
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEntities = results.filter((res) =>
    res.title.toLowerCase().includes(query.toLowerCase()) ||
    res.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const totalItemsCount = filteredCommands.length + filteredEntities.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItemsCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItemsCount) % totalItemsCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelectedItem();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Autocomplete query if a command is highlighted
      if (selectedIndex < filteredCommands.length) {
        setQuery(filteredCommands[selectedIndex].name);
      }
    }
  };

  const executeSelectedItem = () => {
    if (selectedIndex < filteredCommands.length) {
      addRecentSearch(query || filteredCommands[selectedIndex].name);
      filteredCommands[selectedIndex].action();
    } else {
      const entityIndex = selectedIndex - filteredCommands.length;
      const entity = filteredEntities[entityIndex];
      addRecentSearch(query || entity.title);
      router.push(entity.route);
      setCommandPaletteOpen(false);
    }
  };

  return (
    <Dialog
      isOpen={isCommandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      className="max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl rounded-2xl"
    >
      <div className="flex items-center border-b border-slate-800 px-4 py-3 bg-slate-950/40">
        <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0 animate-pulse" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search patients, EMRs, reports, settings, or execute commands..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0"
        />
        <Badge variant="outline" className="text-[10px] font-mono text-slate-500 border-slate-800">
          ESC
        </Badge>
      </div>

      <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
        {/* Commands list */}
        {filteredCommands.length > 0 && (
          <div className="space-y-1">
            <h3 className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Commands & Workflows
            </h3>
            {filteredCommands.map((cmd, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    cmd.action();
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs",
                    isSelected
                      ? "bg-teal-600/20 text-teal-300 border-l-4 border-teal-500"
                      : "text-slate-300 hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {cmd.icon}
                    <span className="font-medium">{cmd.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-teal-400 animate-bounce" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Entities matched */}
        {filteredEntities.length > 0 && (
          <div className="space-y-1">
            <h3 className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Records & Matches
            </h3>
            {filteredEntities.map((entity, idx) => {
              const overallIdx = filteredCommands.length + idx;
              const isSelected = selectedIndex === overallIdx;
              return (
                <div
                  key={entity.id}
                  onClick={() => {
                    setSelectedIndex(overallIdx);
                    router.push(entity.route);
                    setCommandPaletteOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs",
                    isSelected
                      ? "bg-teal-600/20 text-teal-300 border-l-4 border-teal-500"
                      : "text-slate-300 hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{entity.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{entity.subtitle}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-[9px] font-mono border-slate-700 text-slate-400 uppercase">
                      {entity.type}
                    </Badge>
                    {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-teal-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalItemsCount === 0 && (
          <div className="py-12 text-center space-y-2">
            <Command className="mx-auto h-8 w-8 text-slate-600 animate-spin" />
            <h3 className="text-sm font-bold text-slate-400">No command or record matches found</h3>
            <p className="text-xs text-slate-500">Try adjusting your keywords or type a shortcut command.</p>
          </div>
        )}
      </div>

      {/* Footer info bar */}
      <div className="border-t border-slate-800 px-4 py-2 bg-slate-950/40 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span>↑↓ Navigate</span>
          <span>↵ Execute</span>
          <span>⇥ Autocomplete</span>
        </div>
        <div>
          <span>Recent Searches: {recentSearches.slice(0, 3).join(', ')}</span>
        </div>
      </div>
    </Dialog>
  );
}
