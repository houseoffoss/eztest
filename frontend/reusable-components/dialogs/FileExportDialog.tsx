'use client';

import { useState } from 'react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { Alert, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';
import { FileSpreadsheet, FileText, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { exportData, ExportOptions } from '@/frontend/lib/export-utils';

export interface FileExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  exportOptions: Omit<ExportOptions, 'format'>;
  itemName: string; // e.g., "test cases", "defects"
}

export function FileExportDialog({
  open,
  onOpenChange,
  title,
  description,
  exportOptions,
  itemName,
}: FileExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!selectedFormat) {
      setError('Please select an export format');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      await exportData({
        ...exportOptions,
        format: selectedFormat,
      });
      
      // Close dialog after successful export
      setTimeout(() => {
        onOpenChange(false);
        setSelectedFormat(null);
        setExporting(false);
      }, 500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Export failed');
      setExporting(false);
    }
  };

  const handleClose = () => {
    if (!exporting) {
      setSelectedFormat(null);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[570px] flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
          <div className="pt-6 pb-6">
            <DialogHeader className="mb-6">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-2">{description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Format Selection */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-white/90">Select Export Format</p>
                
                {/* CSV Option */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all bg-[#0f172a] ${
                    selectedFormat === 'csv'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                  }`}
                  onClick={() => !exporting && setSelectedFormat('csv')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      selectedFormat === 'csv' ? 'bg-primary/20' : 'bg-white/10'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        selectedFormat === 'csv' ? 'text-primary' : 'text-white/70'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90">CSV Format</p>
                      <p className="text-xs text-white/50 mt-1">
                        Comma-separated values file (.csv)
                      </p>
                    </div>
                    {selectedFormat === 'csv' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Excel Option */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all bg-[#0f172a] ${
                    selectedFormat === 'excel'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                  }`}
                  onClick={() => !exporting && setSelectedFormat('excel')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      selectedFormat === 'excel' ? 'bg-primary/20' : 'bg-white/10'
                    }`}>
                      <FileSpreadsheet className={`h-5 w-5 ${
                        selectedFormat === 'excel' ? 'text-primary' : 'text-white/70'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90">Excel Format</p>
                      <p className="text-xs text-white/50 mt-1">
                        Microsoft Excel spreadsheet (.xlsx)
                      </p>
                    </div>
                    {selectedFormat === 'excel' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f172a] px-6 py-4 flex gap-3 justify-end">
          <Button
            type="button"
            variant="glass"
            onClick={handleClose}
            disabled={exporting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <ButtonPrimary
            type="button"
            onClick={handleExport}
            disabled={!selectedFormat || exporting}
            className="cursor-pointer"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {exporting ? 'Exporting...' : 'Export'}
          </ButtonPrimary>
        </div>
      </DialogContent>
    </Dialog>
  );
}

