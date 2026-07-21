'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { UserRole } from '@ayunet/types';

const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role selection is required'),
  branchId: z.string().optional(),
});

type UserFormInputs = z.infer<typeof userFormSchema>;

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormInputs) => Promise<void>;
  initialValues?: Partial<UserFormInputs>;
}

export function UserFormModal({ isOpen, onClose, onSubmit, initialValues }: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialValues || {
      firstName: '',
      lastName: '',
      email: '',
      role: 'DOCTOR',
      branchId: '',
    },
  });

  const handleFormSubmit = async (data: UserFormInputs) => {
    await onSubmit(data);
    onClose();
  };

  const roles: UserRole[] = [
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'RECEPTIONIST',
    'NURSE',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'PATIENT',
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={initialValues ? 'Edit User Credentials' : 'Provision New System User'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
        </div>

        <Input type="email" label="Work Email Address" error={errors.email?.message} {...register('email')} />

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Assign System Role</label>
          <select
            {...register('role')}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Save User Account
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
