'use client';

import React from 'react';
import { FileEdit, Pill, TestTube, Sparkles, CheckCircle2, FileText, Stethoscope } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function DoctorQuickActions() {
  return (
    <div className="space-y-4">
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <Stethoscope className="h-4 w-4 text-teal-600" />
            <span>Clinical Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <Button variant="default" className="w-full justify-start bg-teal-600 hover:bg-teal-700">
            <FileEdit className="mr-2 h-4 w-4" /> Open EMR & SOAP Note
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Pill className="mr-2 h-4 w-4 text-emerald-600" /> Issue Prescription
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <TestTube className="mr-2 h-4 w-4 text-indigo-600" /> Order Lab Tests
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4 text-amber-600" /> Generate Discharge Summary
          </Button>
        </CardContent>
      </Card>

      {/* Clinical AI Assistant Card */}
      <Card className="border-teal-300 bg-teal-50/50 dark:border-teal-900 dark:bg-teal-950/20">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2 text-teal-900 dark:text-teal-200">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span>Clinical AI Decision Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            AI Assistant suggests checking <span className="font-semibold text-teal-700 dark:text-teal-300">Serum Potassium</span> before renewing ACE inhibitors due to recorded stage 2 hypertension.
          </p>
          <Button size="sm" variant="outline" className="w-full text-xs">
            Review Drug Interaction Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
