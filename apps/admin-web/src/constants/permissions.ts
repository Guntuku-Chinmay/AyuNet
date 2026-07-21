import { UserRole, Permission } from '@ayunet/types';
import { ROUTES } from './routes';

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'read:patients', 'write:patients', 'read:appointments', 'write:appointments',
    'read:emr', 'write:emr', 'read:prescriptions', 'write:prescriptions',
    'read:lab', 'write:lab', 'read:pharmacy', 'write:pharmacy',
    'read:billing', 'write:billing', 'read:reports', 'access:ai',
    'manage:users', 'manage:tenant', 'manage:system',
  ],
  HOSPITAL_ADMIN: [
    'read:patients', 'write:patients', 'read:appointments', 'write:appointments',
    'read:emr', 'read:prescriptions', 'read:lab', 'read:pharmacy',
    'read:billing', 'write:billing', 'read:reports', 'access:ai',
    'manage:users', 'manage:tenant',
  ],
  DOCTOR: [
    'read:patients', 'write:patients', 'read:appointments', 'write:appointments',
    'read:emr', 'write:emr', 'read:prescriptions', 'write:prescriptions',
    'read:lab', 'write:lab', 'read:reports', 'access:ai',
  ],
  RECEPTIONIST: [
    'read:patients', 'write:patients', 'read:appointments', 'write:appointments',
    'read:billing', 'write:billing',
  ],
  NURSE: [
    'read:patients', 'read:appointments', 'read:emr', 'write:emr',
    'read:prescriptions', 'read:lab',
  ],
  LAB_TECHNICIAN: [
    'read:patients', 'read:lab', 'write:lab',
  ],
  PHARMACIST: [
    'read:patients', 'read:prescriptions', 'read:pharmacy', 'write:pharmacy',
  ],
  PATIENT: [
    'read:patients', 'read:appointments', 'read:emr', 'read:prescriptions',
    'read:lab', 'read:billing', 'access:ai',
  ],
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: ROUTES.ADMIN.DASHBOARD,
  HOSPITAL_ADMIN: ROUTES.ADMIN.DASHBOARD,
  DOCTOR: ROUTES.DOCTOR.DASHBOARD,
  RECEPTIONIST: ROUTES.RECEPTION.DASHBOARD,
  NURSE: ROUTES.RECEPTION.DASHBOARD,
  LAB_TECHNICIAN: ROUTES.LABORATORY.DASHBOARD,
  PHARMACIST: ROUTES.PHARMACY.DASHBOARD,
  PATIENT: ROUTES.PATIENT.DASHBOARD,
};
