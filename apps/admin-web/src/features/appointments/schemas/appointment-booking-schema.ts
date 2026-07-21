import { z } from 'zod';

export const appointmentBookingSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  branchId: z.string().min(1, 'Hospital branch selection is required'),
  departmentId: z.string().min(1, 'Department selection is required'),
  doctorId: z.string().min(1, 'Doctor selection is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  startTime: z.string().min(1, 'Time slot selection is required'),
  endTime: z.string().min(1, 'End time is required'),
  type: z.enum(['IN_PERSON', 'TELEHEALTH']).default('IN_PERSON'),
  chiefComplaint: z.string().min(1, 'Reason for visit / Chief complaint is required'),
});

export type AppointmentBookingInputs = z.infer<typeof appointmentBookingSchema>;
