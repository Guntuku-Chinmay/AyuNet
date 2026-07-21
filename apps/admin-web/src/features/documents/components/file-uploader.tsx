'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function FileUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleSimulateUpload = () => {
    setUploaded(true);
    setTimeout(() => setUploaded(false), 2500);
  };

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UploadCloud className="h-5 w-5 text-teal-600" />
          <span>Resumable File Upload Center</span>
        </CardTitle>
        <CardDescription>Drag and drop clinical documents, DICOM radiology studies, or pathology PDFs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleSimulateUpload(); }}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/60'
              : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/40'
          }`}
        >
          <UploadCloud className="mx-auto h-10 w-10 text-teal-600 mb-2" />
          <p className="font-bold text-slate-800 dark:text-slate-200">Drag & Drop Files Here or Click to Browse</p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Supported: PDF, DICOM (.dcm), PNG, JPG, DOCX (Max 250MB)</p>
        </div>

        {uploaded && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/40 space-y-1">
            <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
            <p className="font-bold text-emerald-900 dark:text-emerald-100">Upload Completed & Metadata Indexed!</p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSimulateUpload} className="bg-teal-600 hover:bg-teal-700">
            <UploadCloud className="mr-1.5 h-4 w-4" /> Start Upload Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
