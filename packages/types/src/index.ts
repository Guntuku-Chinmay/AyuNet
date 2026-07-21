export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'LAB_TECHNICIAN'
  | 'PHARMACIST'
  | 'PATIENT';

export type Permission =
  | 'read:patients'
  | 'write:patients'
  | 'read:appointments'
  | 'write:appointments'
  | 'read:emr'
  | 'write:emr'
  | 'read:prescriptions'
  | 'write:prescriptions'
  | 'read:lab'
  | 'write:lab'
  | 'read:pharmacy'
  | 'write:pharmacy'
  | 'read:billing'
  | 'write:billing'
  | 'read:reports'
  | 'access:ai'
  | 'manage:users'
  | 'manage:tenant'
  | 'manage:system';

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface UserProfile extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  preferredLanguage: string;
  timezone: string;
  profilePhotoUrl?: string | null;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  isActive: boolean;
  tenantId?: string;
  userProfile?: UserProfile;
}

export interface Patient extends BaseEntity {
  userProfileId: string;
  dateOfBirth: string | Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  userProfile?: UserProfile;
}

export interface Doctor extends BaseEntity {
  userProfileId: string;
  licenseNumber: string;
  qualification: string;
  yearsOfExperience: number;
  consultationFee: number;
  userProfile?: UserProfile;
}

export interface Appointment extends BaseEntity {
  patientId: string;
  doctorId: string;
  branchId: string;
  appointmentDate: string | Date;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  type: 'IN_PERSON' | 'TELEHEALTH';
  chiefComplaint?: string | null;
  patient?: Patient;
  doctor?: Doctor;
}

export interface MedicalRecord extends BaseEntity {
  patientId: string;
  doctorId: string;
  visitId?: string | null;
  chiefComplaint: string;
  diagnosis: string;
  clinicalNotes: string;
  isFinalized: boolean;
}

export interface Prescription extends BaseEntity {
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  status: 'ACTIVE' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED';
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface LabOrder extends BaseEntity {
  patientId: string;
  doctorId: string;
  testName: string;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  patientId: string;
  total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'VOID' | 'OVERDUE';
  currency: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  adminEmail: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
