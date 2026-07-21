'use client';

import React, { useState } from 'react';
import { Users, UserPlus, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { usePatientPortalStore } from '../../../stores/use-patient-portal-store';

export function CaregiverManager() {
  const { familyMembers, activeMember, setActiveMember, caregivers } = usePatientPortalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="space-y-6">
      {/* Family Member Switcher Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Family & Dependent Profiles</span>
          </CardTitle>
          <CardDescription>Select family profile to view medical records and manage appointments.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setActiveMember(member)}
              className={`flex items-center space-x-3 rounded-xl p-3 border transition-all ${
                activeMember.id === member.id
                  ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-sm dark:bg-teal-950/60 dark:text-teal-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold text-xs text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {member.name[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-xs">{member.name}</p>
                <p className="font-mono text-[10px] text-slate-400">{member.relationship} ({member.uhid})</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Authorized Caregiver Proxy List */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Authorized Proxy Caregivers</span>
            </CardTitle>
            <CardDescription>Grant trusted family members proxy access to your medical records.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Invite Caregiver
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {caregivers.map((cg) => (
            <div
              key={cg.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{cg.caregiverName} ({cg.relationship})</p>
                <p className="text-slate-500 font-mono">{cg.email}</p>
                <div className="flex space-x-1 pt-1">
                  {cg.permissions.map((p) => (
                    <Badge key={p} variant="primary" className="text-[9px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-rose-500">
                <Trash2 className="h-4 w-4" /> Revoke Access
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Caregiver Proxy"
        description="Grant a family member proxy access to view records and schedule visits"
      >
        <div className="space-y-4 text-xs">
          <Input label="Caregiver Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="pt-2 flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(false)} className="bg-teal-600 hover:bg-teal-700">
              Send Proxy Invitation
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
