'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors?: Array<{
    row: number;
    title: string;
    error: string;
  }>;
  skippedItems?: Array<{
    row: number;
    title: string;
    reason: string;
  }>;
  imported?: Array<{
    tcId?: string;
    defectId?: string;
    title: string;
  }>;
}

export interface FileImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  importEndpoint: string;
  templateEndpoint: string;
  itemName: string; // e.g., "test cases", "defects"
  onImportComplete: () => void;
}

export function FileImportDialog({
  open,
  onOpenChange,
  title,
  description,
  importEndpoint,
  templateEndpoint,
  itemName,
  onImportComplete,
}: FileImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setResult(null);
      setError(null);
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase();
      if (fileType.endsWith('.csv') || fileType.endsWith('.xlsx') || fileType.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
        setFile(null);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(templateEndpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }

      const data = await response.json();
      
      // Create CSV template
      interface Column { name: string; }
      const headers = data.data.columns.map((col: Column) => col.name).join(',');
      
      // Include all examples if available, otherwise just the single example
      const examples = data.data.examples || [data.data.example];
      
      const exampleRows = examples.map((example: Record<string, string>) => {
        // Skip description field if present (it's not a column)
        return data.data.columns.map((col: Column) => {
          const value = example[col.name] || '';
          // Properly escape CSV: replace double quotes with double double quotes, then wrap in quotes
          const escapedValue = String(value).replace(/"/g, '""');
          return `"${escapedValue}"`;
        }).join(',');
      });
      
      const csv = `${headers}\n${exampleRows.join('\n')}`;
      
      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${itemName.replace(/\s+/g, '-')}-import-template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(importEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }

      // The response structure is: { message: "...", data: { success, failed, skipped, ... } }
      const resultData = data.data;
      
      if (!resultData || typeof resultData !== 'object') {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response format from server');
      }
      
      // Ensure all required fields exist with defaults
      const finalResult: ImportResult = {
        success: Number(resultData.success) || 0,
        failed: Number(resultData.failed) || 0,
        skipped: Number(resultData.skipped) || 0,
        errors: Array.isArray(resultData.errors) ? resultData.errors : [],
        skippedItems: Array.isArray(resultData.skippedItems) ? resultData.skippedItems : [],
        imported: Array.isArray(resultData.imported) ? resultData.imported : [],
      };
      
      setResult(finalResult);
      
      // Auto-refresh only if all items imported successfully (no failures or skips)
      if (Number(resultData.success) > 0 && Number(resultData.failed) === 0 && Number(resultData.skipped) === 0) {
        setTimeout(() => {
          onImportComplete();
          // Reset state before closing
          setFile(null);
          setResult(null);
          setError(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      // Refresh data if there were successful imports
      if (result && Number(result.success) > 0) {
        onImportComplete();
      }
      setFile(null);
      setResult(null);
      setError(null);
      onOpenChange(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileType = droppedFile.name.toLowerCase();
      if (fileType.endsWith('.csv') || fileType.endsWith('.xlsx') || fileType.endsWith('.xls')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
      }
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

            <div className="space-y-5">{/* Download Template */}
          <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-[#0f172a]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
                <FileSpreadsheet className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Download Template</p>
                <p className="text-xs text-white/50">
                  Get a template file with the correct format
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={uploading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all bg-[#0f172a]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-white/40" />
            {file ? (
              <div>
                <p className="text-sm font-medium text-white/90">{file.name}</p>
                <p className="text-xs text-white/50 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-white/90">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-white/50 mt-1">
                  CSV or Excel files (.csv, .xlsx, .xls)
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}


          {/* Import Result */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border border-green-500/30 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-white/90">Success</p>
                    <p className="text-2xl font-bold text-green-500">
                      {Number(result.success) || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-white/90">Skipped</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {Number(result.skipped) || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-red-500/30 rounded-lg bg-red-500/10">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-white/90">Failed</p>
                    <p className="text-2xl font-bold text-red-500">
                      {Number(result.failed) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {result.skippedItems && result.skippedItems.length > 0 && (
                <div className="border border-yellow-500/30 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar bg-yellow-500/5">
                  <h4 className="text-sm font-medium mb-2 text-yellow-400">
                    Skipped Items ({result.skippedItems.length}):
                  </h4>
                  <ul className="space-y-2">
                    {result.skippedItems.map((item, index) => (
                      <li key={index} className="text-sm text-yellow-300">
                        <span className="font-medium text-white/70">Row {item.row}:</span>{' '}
                        <span className="text-white/60">{item.title}</span> - {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="border border-red-500/30 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar bg-red-500/5">
                  <h4 className="text-sm font-medium mb-2 text-red-400">
                    Import Errors ({result.errors.length}):
                  </h4>
                  <ul className="space-y-2">
                    {result.errors.map((err, index) => (
                      <li key={index} className="text-sm text-red-400">
                        <span className="font-medium text-white/70">Row {err.row}:</span>{' '}
                        <span className="text-white/60">{err.title}</span> - {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Number(result.success) > 0 && Number(result.failed) === 0 && Number(result.skipped) === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {Number(result.success) || 0} {itemName}. Refreshing...
                  </AlertDescription>
                </Alert>
              )}
              {Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Partially imported: {Number(result.success) || 0} succeeded
                    {Number(result.skipped) > 0 && `, ${Number(result.skipped) || 0} skipped`}
                    {Number(result.failed) > 0 && `, ${Number(result.failed) || 0} failed`}.
                    Click Close & Refresh to see the imported items.
                  </AlertDescription>
                </Alert>
              )}
              {Number(result.success) === 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import completed with issues:
                    {Number(result.skipped) > 0 && ` ${Number(result.skipped) || 0} skipped`}
                    {Number(result.failed) > 0 && ` ${Number(result.failed) || 0} failed`}.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f172a] px-6 py-4 flex gap-3 justify-end">
          <Button
            type="button"
            variant="glass"
            onClick={handleClose}
            disabled={uploading}
            className="cursor-pointer"
          >
            {result && Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) ? 'Close & Refresh' : result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <ButtonPrimary
              type="button"
              onClick={handleImport}
              disabled={!file || uploading}
              className="cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Importing...' : 'Import'}
            </ButtonPrimary>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
