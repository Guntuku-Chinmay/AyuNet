'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { patientRegistrationSchema, PatientRegistrationInputs } from '../schemas/patient-registration-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export function PatientRegistrationForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedUhid, setGeneratedUhid] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegistrationInputs>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '1995-01-01',
      gender: 'MALE',
      phone: '',
      email: '',
      bloodGroup: 'O+',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: 'Family',
      isEmergency: false,
      chiefComplaint: '',
    },
  });

  const isEmergency = watch('isEmergency');

  const onSubmit = async (data: PatientRegistrationInputs) => {
    const uhid = `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedUhid(uhid);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    reset();
  };

  return (
    <Card className={isEmergency ? 'border-red-500/50 bg-red-950/10' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              <span>Fast-Track Patient Intake & Admission</span>
            </CardTitle>
            <CardDescription>Rapid patient intake for front-desk reception staff.</CardDescription>
          </div>

          {/* Emergency STAT Toggle */}
          <button
            type="button"
            onClick={() => setValue('isEmergency', !isEmergency)}
            className={`flex items-center space-x-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
              isEmergency
                ? 'border-red-600 bg-red-600 text-white shadow-lg animate-pulse'
                : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{isEmergency ? 'STAT EMERGENCY MODE ACTIVE' : 'Toggle Emergency Mode'}</span>
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {isSuccess ? (
          <div className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Patient Intake Complete!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">Auto-generated Universal Health ID (UHID):</p>
            <Badge variant="primary" className="font-mono text-base px-4 py-1">
              {generatedUhid}
            </Badge>
            <div className="pt-2">
              <Button onClick={handleReset} variant="outline" size="sm">
                Register Next Patient
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="First Name *" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name *" error={errors.lastName?.message} {...register('lastName')} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input type="date" label="Date of Birth *" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Gender *</label>
                <select
                  {...register('gender')}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
                <select
                  {...register('bloodGroup')}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Mobile Phone Number *" error={errors.phone?.message} {...register('phone')} />
              <Input type="email" label="Email Address (Optional)" error={errors.email?.message} {...register('email')} />
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Emergency Contact Name *" error={errors.emergencyContactName?.message} {...register('emergencyContactName')} />
              <Input label="Emergency Contact Phone *" error={errors.emergencyContactPhone?.message} {...register('emergencyContactPhone')} />
            </div>

            {isEmergency && (
              <div className="space-y-1 border-t border-red-300 pt-3 dark:border-red-900">
                <label className="font-semibold text-red-600 dark:text-red-400 flex items-center">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Emergency Triage Chief Complaint *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chest pain, acute trauma, dyspnea..."
                  {...register('chiefComplaint')}
                  className="w-full rounded-lg border border-red-300 bg-white p-2 text-xs text-slate-900 dark:border-red-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-2">
              <Button type="submit" isLoading={isSubmitting} className={isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}>
                {isEmergency ? 'Admit STAT Emergency Patient' : 'Complete Intake & Assign Token'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
