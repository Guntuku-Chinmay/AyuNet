'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Plus, Clock, User, Video, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useCalendarStore } from '../../../stores/use-calendar-store';
import { ROUTES } from '../../../constants/routes';

export function AppointmentCalendar() {
  const { viewMode, setViewMode, selectedDate, setSelectedDate } = useCalendarStore();

  const mockAppointments = [
    {
      id: 'apt-001',
      patientName: 'Rahul Sharma',
      uhid: 'UHID-2026-9918',
      doctorName: 'Dr. Priya Mehta',
      departmentName: 'Cardiology',
      appointmentDate: '2026-07-21',
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      type: 'IN_PERSON',
      status: 'CONFIRMED',
      chiefComplaint: 'Chest tightness, hypertension review',
    },
    {
      id: 'apt-002',
      patientName: 'Ananya Patel',
      uhid: 'UHID-2026-9919',
      doctorName: 'Dr. Rajesh Kumar',
      departmentName: 'General Surgery',
      appointmentDate: '2026-07-21',
      startTime: '11:00 AM',
      endTime: '11:30 AM',
      type: 'TELEHEALTH',
      status: 'SCHEDULED',
      chiefComplaint: 'Post-operative wound inspection',
    },
    {
      id: 'apt-003',
      patientName: 'Suresh Gupta',
      uhid: 'UHID-2026-9920',
      doctorName: 'Dr. Priya Mehta',
      departmentName: 'Cardiology',
      appointmentDate: '2026-07-21',
      startTime: '02:00 PM',
      endTime: '02:30 PM',
      type: 'IN_PERSON',
      status: 'COMPLETED',
      chiefComplaint: 'Routine ECG examination',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Clinical Appointment Calendar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Schedule visits, track doctor availability, and manage patient check-in timelines.
          </p>
        </div>
        <Link href="/doctor/appointments/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" /> Book New Appointment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">View Mode:</span>
              {(['DAY', 'WEEK', 'MONTH', 'TIMELINE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    viewMode === mode
                      ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      : 'border-slate-300 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white p-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time Slot</TableHead>
                <TableHead>Patient & UHID</TableHead>
                <TableHead>Practitioner</TableHead>
                <TableHead>Visit Type</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-teal-600" />
                      <span>{apt.startTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{apt.patientName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{apt.uhid}</p>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{apt.doctorName}</TableCell>
                  <TableCell>
                    {apt.type === 'IN_PERSON' ? (
                      <Badge variant="outline">
                        <Building2 className="mr-1 h-3 w-3 text-teal-600" /> In-Person
                      </Badge>
                    ) : (
                      <Badge variant="primary">
                        <Video className="mr-1 h-3 w-3 text-indigo-500" /> Telehealth
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">{apt.chiefComplaint}</TableCell>
                  <TableCell>
                    {apt.status === 'CONFIRMED' && <Badge variant="primary">CONFIRMED</Badge>}
                    {apt.status === 'SCHEDULED' && <Badge variant="default">SCHEDULED</Badge>}
                    {apt.status === 'COMPLETED' && <Badge variant="success">COMPLETED</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
