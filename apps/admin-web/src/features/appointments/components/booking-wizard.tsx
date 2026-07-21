'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, User, CheckCircle2, ArrowRight, ArrowLeft, Video, Building2 } from 'lucide-react';
import { appointmentBookingSchema, AppointmentBookingInputs } from '../schemas/appointment-booking-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { ROUTES } from '../../../constants/routes';

export function BookingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentBookingInputs>({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      patientId: 'pat-9918',
      branchId: 'branch-001',
      departmentId: 'dept-cardio',
      doctorId: 'doc-001',
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      type: 'IN_PERSON',
      chiefComplaint: '',
    },
  });

  const selectedDate = watch('appointmentDate');
  const selectedTime = watch('startTime');
  const visitType = watch('type');

  const availableSlots = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: false },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '11:30 AM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
  ];

  const onSubmit = async (data: AppointmentBookingInputs) => {
    setIsSuccess(true);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <span>Multi-Step Appointment Booking Wizard</span>
            </CardTitle>
            <CardDescription>Schedule clinical appointments, telehealth visits, and OPD slots.</CardDescription>
          </div>
          <Badge variant="primary">Step {step} of 3</Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        {isSuccess ? (
          <div className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Appointment Confirmed!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Booking ID: <span className="font-mono font-bold text-teal-700 dark:text-teal-300">APT-2026-88192</span>
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <Button onClick={() => router.push(ROUTES.DOCTOR.APPOINTMENTS)}>View Calendar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-0">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center">
                  <User className="mr-2 h-4 w-4 text-teal-600" /> 1. Select Patient & Practitioner
                </h3>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Target Patient *</label>
                  <select
                    {...register('patientId')}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <option value="pat-9918">Rahul Sharma (UHID-2026-9918)</option>
                    <option value="pat-9919">Ananya Patel (UHID-2026-9919)</option>
                    <option value="pat-9920">Suresh Gupta (UHID-2026-9920)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Hospital Branch *</label>
                    <select
                      {...register('branchId')}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <option value="branch-001">Apollo Central Campus</option>
                      <option value="branch-002">Apollo West Medical Center</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Practitioner Doctor *</label>
                    <select
                      {...register('doctorId')}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <option value="doc-001">Dr. Priya Mehta (Cardiology)</option>
                      <option value="doc-002">Dr. Rajesh Kumar (General Surgery)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-0">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-teal-600" /> 2. Choose Date & Available Slot
                </h3>
                <Input type="date" label="Appointment Date *" value={selectedDate} onChange={(e) => setValue('appointmentDate', e.target.value)} />

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Select Available Slot *</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          setValue('startTime', slot.time);
                          setValue('endTime', '30 mins');
                        }}
                        className={`rounded-lg p-2.5 text-xs font-mono font-semibold border transition-all ${
                          selectedTime === slot.time
                            ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                            : slot.available
                            ? 'border-slate-300 bg-white text-slate-800 hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                            : 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed dark:border-slate-800 dark:bg-slate-950'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-0">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center">
                  <Building2 className="mr-2 h-4 w-4 text-teal-600" /> 3. Visit Type & Chief Complaint
                </h3>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Consultation Type *</label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setValue('type', 'IN_PERSON')}
                      className={`flex flex-1 items-center justify-center space-x-2 rounded-xl p-3 border font-semibold ${
                        visitType === 'IN_PERSON' ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : 'border-slate-300'
                      }`}
                    >
                      <Building2 className="h-4 w-4" /> <span>In-Person Clinic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('type', 'TELEHEALTH')}
                      className={`flex flex-1 items-center justify-center space-x-2 rounded-xl p-3 border font-semibold ${
                        visitType === 'TELEHEALTH' ? 'border-indigo-600 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'border-slate-300'
                      }`}
                    >
                      <Video className="h-4 w-4" /> <span>Telehealth Video</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Reason for Visit / Chief Complaint *</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Annual cardiac follow-up, palpitations..."
                    {...register('chiefComplaint')}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                  {errors.chiefComplaint && <p className="text-xs text-red-500 font-medium">{errors.chiefComplaint.message}</p>}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              {step > 1 ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              ) : <div />}

              {step < 3 ? (
                <Button type="button" size="sm" onClick={() => setStep(step + 1)}>
                  Next Step <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="sm" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                  Confirm Appointment Booking
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
