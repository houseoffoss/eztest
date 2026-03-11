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
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
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
  /** テストケースインポート時のみ: 同一タイトルの既存を更新するオプションを表示 */
  showUpdateExistingOption?: boolean;
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
  showUpdateExistingOption = false,
}: FileImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateExisting, setUpdateExisting] = useState(showUpdateExistingOption);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setResult(null);
      setError(null);
      setUploading(false);
      setUpdateExisting(showUpdateExistingOption);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, showUpdateExistingOption]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase();
      if (fileType.endsWith('.csv') || fileType.endsWith('.xlsx') || fileType.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('CSVまたはExcelファイルを選択してください (.csv, .xlsx, .xls)');
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
      setError('テンプレートのダウンロードに失敗しました');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (showUpdateExistingOption && updateExisting) {
        formData.append('updateExisting', 'true');
      }

      const response = await fetch(importEndpoint, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data: { message?: string; data?: unknown };
      try {
        data = JSON.parse(text) as { message?: string; data?: unknown };
      } catch {
        if (text.trimStart().startsWith('<')) {
          throw new Error(
            'サーバーがHTMLを返しました。接続先URL・ネットワーク、またはサーバーエラーを確認してください。'
          );
        }
        throw new Error('サーバーからの応答を解析できませんでした。');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }

      // The response structure is: { message: "...", data: { success, failed, skipped, ... } }
      const resultData = data.data as Record<string, unknown> | null | undefined;

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
      if (finalResult.success > 0 && finalResult.failed === 0 && finalResult.skipped === 0) {
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
        setError('CSVまたはExcelファイルを選択してください (.csv, .xlsx, .xls)');
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
                <p className="text-sm font-medium text-white/90">テンプレートをダウンロード</p>
                <p className="text-xs text-white/50">
                  正しいフォーマットのテンプレートファイルを取得
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={uploading}
              buttonName={`${title} - Download Template`}
            >
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
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
                  クリックしてアップロード、またはドラッグ＆ドロップ
                </p>
                <p className="text-xs text-white/50 mt-1">
                  CSVまたはExcelファイル (.csv, .xlsx, .xls)
                </p>
              </div>
            )}
          </div>

          {showUpdateExistingOption && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-white/20 bg-white/5">
              <Checkbox
                id="import-update-existing"
                checked={updateExisting}
                onCheckedChange={(checked) => setUpdateExisting(checked === true)}
                disabled={uploading}
                className="mt-1"
              />
              <label htmlFor="import-update-existing" className="flex-1 cursor-pointer text-sm">
                <span className="font-medium text-white/90">同一タイトルの既存テストケースを更新する</span>
                <p className="mt-1 text-xs text-white/50">
                  オフのときは同一タイトルはスキップされます。オンにすると既存レコードを上書き更新します。
                </p>
              </label>
            </div>
          )}

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
                    <p className="text-sm font-medium text-white/90">成功</p>
                    <p className="text-2xl font-bold text-green-500">
                      {Number(result.success) || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-white/90">スキップ</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {Number(result.skipped) || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-red-500/30 rounded-lg bg-red-500/10">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-white/90">失敗</p>
                    <p className="text-2xl font-bold text-red-500">
                      {Number(result.failed) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {result.skippedItems && result.skippedItems.length > 0 && (
                <div className="border border-yellow-500/30 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar bg-yellow-500/5">
                  <h4 className="text-sm font-medium mb-2 text-yellow-400">
                    スキップされた項目 ({result.skippedItems.length}件):
                  </h4>
                  <ul className="space-y-2">
                    {result.skippedItems.map((item, index) => (
                      <li key={index} className="text-sm text-yellow-300">
                        <span className="font-medium text-white/70">行 {item.row}:</span>{' '}
                        <span className="text-white/60">{item.title}</span> - {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="border border-red-500/30 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar bg-red-500/5">
                  <h4 className="text-sm font-medium mb-2 text-red-400">
                    インポートエラー ({result.errors.length}件):
                  </h4>
                  <ul className="space-y-2">
                    {result.errors.map((err, index) => (
                      <li key={index} className="text-sm text-red-400">
                        <span className="font-medium text-white/70">行 {err.row}:</span>{' '}
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
                    {Number(result.success) || 0}件の{itemName}をインポートしました。更新中...
                  </AlertDescription>
                </Alert>
              )}
              {Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    一部インポート完了: {Number(result.success) || 0}件成功
                    {Number(result.skipped) > 0 && `、${Number(result.skipped) || 0}件スキップ`}
                    {Number(result.failed) > 0 && `、${Number(result.failed) || 0}件失敗`}。
                    「閉じて更新」をクリックしてインポートした項目を確認してください。
                  </AlertDescription>
                </Alert>
              )}
              {Number(result.success) === 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    インポートに問題がありました:
                    {Number(result.skipped) > 0 && ` ${Number(result.skipped) || 0}件スキップ`}
                    {Number(result.failed) > 0 && ` ${Number(result.failed) || 0}件失敗`}。
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
            buttonName={`${title} - ${result && Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) ? 'Close & Refresh' : result ? 'Close' : 'Cancel'}`}
          >
            {result && Number(result.success) > 0 && (Number(result.failed) > 0 || Number(result.skipped) > 0) ? '閉じて更新' : result ? '閉じる' : 'キャンセル'}
          </Button>
          {!result && (
            <ButtonPrimary
              type="button"
              onClick={handleImport}
              disabled={!file || uploading}
              buttonName={`${title} - Import`}
              className="cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'インポート中...' : 'インポート'}
            </ButtonPrimary>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
