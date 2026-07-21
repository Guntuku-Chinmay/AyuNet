'use client';

import React from 'react';
import { ProtectedRoute } from '../../../../components/guards/protected-route';
import { DoctorLayout } from '../../../../layouts/doctor-layout';
import { PatientSummaryPanel } from '../../../../features/doctor/components/patient-summary-panel';
import { VitalsRecorder } from '../../../../features/emr/components/vitals-recorder';
import { SoapNoteEditor } from '../../../../features/emr/components/soap-note-editor';
import { DiagnosisPicker } from '../../../../features/emr/components/diagnosis-picker';
import { AiAssistantPanel } from '../../../../features/emr/components/ai-assistant-panel';
import { ClinicalTimeline } from '../../../../features/doctor/components/clinical-timeline';

export default function EmrConsultationPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
      <DoctorLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Panel: Patient Summary */}
            <div className="lg:col-span-3">
              <PatientSummaryPanel />
            </div>

            {/* Center Panel: Vitals & SOAP Editor */}
            <div className="space-y-6 lg:col-span-6">
              <VitalsRecorder />
              <SoapNoteEditor />
              <ClinicalTimeline />
            </div>

            {/* Right Panel: ICD-10 Diagnosis Picker & AI Assistant */}
            <div className="space-y-6 lg:col-span-3">
              <DiagnosisPicker />
              <AiAssistantPanel />
            </div>
          </div>
        </div>
      </DoctorLayout>
    </ProtectedRoute>
  );
}
