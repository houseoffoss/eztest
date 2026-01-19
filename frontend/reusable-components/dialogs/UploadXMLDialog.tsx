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
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/reusable-elements/selects/Select';
import { Upload, FileCode, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors?: Array<{
    testMethodName: string;
    error: string;
  }>;
  skippedItems?: Array<{
    testMethodName: string;
    reason: string;
  }>;
  imported?: Array<{
    testCaseId: string;
    testCaseTcId: string;
    testMethodName: string;
    status: string;
  }>;
}

export interface UploadXMLDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Configuration
  title: string;
  description: string;
  acceptedFileTypes?: string[]; // e.g., ['.xml', '.json']
  acceptedFileExtensions?: string[]; // e.g., ['xml', 'json']
  // API endpoints
  checkEndpoint: string; // Endpoint to check if file matches before import
  createEndpoint?: string; // Endpoint to create parent resource (optional)
  uploadEndpoint: string; // Endpoint to upload the file
  // Name generation
  generateName?: (filename: string) => string; // Function to generate resource name from filename
  showNamePreview?: boolean; // Whether to show name preview
  namePreviewLabel?: string; // Label for name preview section
  // Callbacks
  onImportComplete: () => void;
  // Custom validation
  validateFile?: (file: File) => { valid: boolean; error?: string };
  // Custom request options
  createRequestBody?: (filename: string, generatedName: string, environment?: string) => Record<string, unknown>;
  uploadRequestOptions?: (file: File) => { body: FormData; [key: string]: unknown };
  // Environment options (optional)
  environmentOptions?: Array<{ value: string; label: string }>;
  showEnvironmentField?: boolean;
  environmentRequired?: boolean;
}

export function UploadXMLDialog({
  open,
  onOpenChange,
  title,
  description,
  acceptedFileTypes = ['.xml'],
  acceptedFileExtensions = ['xml'],
  checkEndpoint,
  createEndpoint,
  uploadEndpoint,
  generateName,
  showNamePreview = true,
  namePreviewLabel = 'New Resource Name',
  onImportComplete,
  validateFile,
  createRequestBody,
  uploadRequestOptions,
  environmentOptions = [],
  showEnvironmentField = false,
  environmentRequired = false,
}: UploadXMLDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default name generation function
  const defaultGenerateName = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.(xml|json)$/i, '');
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    return `${nameWithoutExt}_${dateStr}`;
  };

  const nameGenerator = generateName || defaultGenerateName;
  const generatedName = file ? nameGenerator(file.name) : '';

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setResult(null);
      setError(null);
      setUploading(false);
      setEnvironment('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Use custom validation if provided
      if (validateFile) {
        const validation = validateFile(selectedFile);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          setFile(null);
          return;
        }
      } else {
        // Default validation by extension
        const fileType = selectedFile.name.toLowerCase();
        const isValid = acceptedFileExtensions.some(ext => fileType.endsWith(`.${ext}`));
        if (!isValid) {
          setError(`Please select a file with one of the following extensions: ${acceptedFileExtensions.map(e => `.${e}`).join(', ')}`);
          setFile(null);
          return;
        }
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (showEnvironmentField && environmentRequired && !environment) {
      setError('Please select an environment');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Check file (if check endpoint provided)
      if (checkEndpoint) {
        const checkFormData = new FormData();
        checkFormData.append('file', file);

        const checkResponse = await fetch(checkEndpoint, {
          method: 'POST',
          body: checkFormData,
        });

        const checkData = await checkResponse.json();

        if (!checkResponse.ok) {
          throw new Error(checkData.error || checkData.message || 'Failed to check file');
        }

        const { matchCount, totalTestMethods } = checkData.data || { matchCount: 0, totalTestMethods: 0 };

        if (matchCount === 0) {
          setError(
            `No matching items found. The file contains ${totalTestMethods} item(s), but none match existing records.`
          );
          setUploading(false);
          return;
        }
      }

      // Step 2: Create parent resource (if create endpoint provided)
      let resourceId: string | undefined;
      if (createEndpoint && showNamePreview && generatedName) {
        try {
          const requestBody = createRequestBody 
            ? createRequestBody(file.name, generatedName, environment || undefined)
            : {
                name: generatedName,
                description: `Created from file: ${file.name}`,
                ...(environment && { environment }),
              };

          const createResponse = await fetch(createEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          const createData = await createResponse.json();

          if (!createResponse.ok) {
            throw new Error(createData.error || createData.message || 'Failed to create resource');
          }

          resourceId = createData.data.id;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create resource');
          setUploading(false);
          return;
        }
      }

      setResult(null);

      // Step 3: Upload the file
      const requestOptions = uploadRequestOptions 
        ? uploadRequestOptions(file)
        : {
            body: (() => {
              const formData = new FormData();
              formData.append('file', file);
              return formData;
            })(),
          };

      const uploadEndpointWithId = resourceId 
        ? uploadEndpoint.replace('[id]', resourceId)
        : uploadEndpoint;

      const response = await fetch(uploadEndpointWithId, {
        method: 'POST',
        ...requestOptions,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Import failed');
      }

      const resultData = data.data;
      
      if (!resultData || typeof resultData !== 'object') {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response format from server');
      }
      
      const finalResult: ImportResult = {
        success: Number(resultData.success) || 0,
        failed: Number(resultData.failed) || 0,
        skipped: Number(resultData.skipped) || 0,
        errors: Array.isArray(resultData.errors) ? resultData.errors : [],
        skippedItems: Array.isArray(resultData.skippedItems) ? resultData.skippedItems : [],
        imported: Array.isArray(resultData.imported) ? resultData.imported : [],
      };
      
      setResult(finalResult);
      
      // Auto-refresh only if all items imported successfully
      if (Number(resultData.success) > 0 && Number(resultData.failed) === 0 && Number(resultData.skipped) === 0) {
        setTimeout(() => {
          onImportComplete();
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
      if (validateFile) {
        const validation = validateFile(droppedFile);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          return;
        }
      } else {
        const fileType = droppedFile.name.toLowerCase();
        const isValid = acceptedFileExtensions.some(ext => fileType.endsWith(`.${ext}`));
        if (!isValid) {
          setError(`Please select a file with one of the following extensions: ${acceptedFileExtensions.map(e => `.${e}`).join(', ')}`);
          return;
        }
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const acceptValue = acceptedFileTypes.join(',');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[570px] flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
          <div className="pt-6 pb-6">
            <DialogHeader className="mb-6">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-2">
                {description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Name Preview (if enabled) */}
              {showNamePreview && (
                <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-[#0f172a]">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
                      <FileCode className="h-5 w-5 text-white/70" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-white/90 mb-2 block">
                        {namePreviewLabel}
                      </Label>
                      {file && generatedName ? (
                        <div className="mt-2 p-3 bg-[#1e293b] border border-white/10 rounded text-sm">
                          <span className="font-medium text-white/90">{generatedName}</span>
                          <p className="text-xs text-white/50 mt-1">
                            A new resource will be created with this name
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-white/50 mt-2">
                          Upload a file to generate resource name from filename
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Environment Field (if enabled) */}
              {showEnvironmentField && environmentOptions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/90">
                    Environment {environmentRequired && <span className="text-red-500">*</span>}
                  </Label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger variant="glass" className="w-full">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent variant="glass">
                      {environmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                  accept={acceptValue}
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
                      {acceptedFileTypes.join(', ').toUpperCase()} files ({acceptedFileTypes.join(', ')})
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
                            <span className="font-medium text-white/70">{item.testMethodName}:</span>{' '}
                            <span className="text-white/60">{item.reason}</span>
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
                            <span className="font-medium text-white/70">{err.testMethodName}:</span>{' '}
                            <span className="text-white/60">{err.error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Number(result.success) > 0 && Number(result.failed) === 0 && Number(result.skipped) === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully imported {Number(result.success) || 0} items. Refreshing...
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
                        Click Close & Refresh to see the imported results.
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
            buttonName={`Upload XML - ${result && Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) ? 'Close & Refresh' : result ? 'Close' : 'Cancel'}`}
          >
            {result && Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) ? 'Close & Refresh' : result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <ButtonPrimary
              type="button"
              onClick={handleImport}
              disabled={!file || uploading}
              buttonName="Upload XML - Upload"
              className="cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload'}
            </ButtonPrimary>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

