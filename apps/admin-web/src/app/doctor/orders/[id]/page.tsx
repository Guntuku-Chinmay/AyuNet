'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/guards/protected-route';
import { DoctorLayout } from '../../../../layouts/doctor-layout';
import { MedicationBuilder } from '../../../../features/orders/components/medication-builder';
import { LabImagingOrders } from '../../../../features/orders/components/lab-imaging-orders';
import { ReferralFollowup } from '../../../../features/orders/components/referral-followup';
import { OrderSummarySignature } from '../../../../features/orders/components/order-summary-signature';

export default function ClinicalOrdersWorkspacePage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
      <DoctorLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Clinical Orders & e-Prescribing Workspace
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure prescriptions, lab requisitions, imaging studies, and specialist referrals.
            </p>
          </div>

          <MedicationBuilder />
          <LabImagingOrders />
          <ReferralFollowup />
          <OrderSummarySignature />
        </div>
      </DoctorLayout>
    </ProtectedRoute>
  );
}
