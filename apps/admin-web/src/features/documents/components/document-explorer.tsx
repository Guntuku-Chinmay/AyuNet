'use client';

import React from 'react';
import { FileText, Image, LayoutGrid, List, Download, Eye, Lock, ShieldAlert, FileCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useDocumentStore } from '../../../stores/use-document-store';

export function DocumentExplorer() {
  const { documents, selectedDocument, setSelectedDocument, viewMode, setViewMode } = useDocumentStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Global Enterprise Document Explorer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Metadata-driven file repository across EMRs, Radiology DICOM, Pathology, and Financial records.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'GRID' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('GRID')}
          >
            <LayoutGrid className="mr-1 h-3.5 w-3.5" /> Grid View
          </Button>
          <Button
            variant={viewMode === 'LIST' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('LIST')}
          >
            <List className="mr-1 h-3.5 w-3.5" /> List View
          </Button>
        </div>
      </div>

      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className={`cursor-pointer transition-all border ${
                selectedDocument?.id === doc.id
                  ? 'border-teal-600 ring-2 ring-teal-500/20 dark:border-teal-500'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {doc.fileType === 'DICOM' ? (
                      <Image className="h-6 w-6 text-indigo-600" />
                    ) : (
                      <FileText className="h-6 w-6 text-teal-600" />
                    )}
                    <span className="font-mono text-xs font-semibold text-slate-500">{doc.fileType}</span>
                  </div>
                  <Badge variant={doc.confidentiality === 'CONFIDENTIAL' ? 'error' : 'warning'} className="text-[9px]">
                    {doc.confidentiality}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{doc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.size} | {doc.category}</p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                  <span>By {doc.uploadedBy}</span>
                  <span className="font-mono">{doc.version}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100">{doc.name}</TableCell>
                    <TableCell className="text-xs">{doc.category}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{doc.size}</TableCell>
                    <TableCell className="text-xs text-slate-500">{doc.uploadedBy}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{doc.version}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedDocument(doc)}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Selected Document Preview Panel */}
      {selectedDocument && (
        <Card className="border-teal-300 bg-teal-50/40 p-4 dark:border-teal-900 dark:bg-teal-950/20 space-y-3">
          <div className="flex items-center justify-between border-b border-teal-200 pb-2 dark:border-teal-900">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedDocument.name}</p>
              <p className="font-mono text-xs text-teal-700 dark:text-teal-300">
                Presigned Preview URL generated by backend token
              </p>
            </div>
            <Badge variant="primary" className="font-mono">{selectedDocument.version}</Badge>
          </div>
          <div className="flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={() => alert(`Launching secure presigned URL for ${selectedDocument.name}...`)}>
              <Eye className="mr-1 h-3.5 w-3.5" /> Launch Presigned Viewer
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => alert(`Downloading ${selectedDocument.name}...`)}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Secure Download
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
