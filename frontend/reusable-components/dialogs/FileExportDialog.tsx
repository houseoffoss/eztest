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
import { FileSpreadsheet, FileText, FileType2, Upload, AlertCircle, Loader2, type LucideIcon } from 'lucide-react';
import { exportData, ExportOptions } from '@/frontend/lib/export-utils';

type ExportFormat = ExportOptions['format'];

export interface FileExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  exportOptions: Omit<ExportOptions, 'format'>;
  availableFormats?: ExportFormat[];
  itemName: string; // e.g., "test cases", "defects"
}

export function FileExportDialog({
  open,
  onOpenChange,
  title,
  description,
  exportOptions,
  availableFormats = ['csv', 'excel'],
  itemName,
}: FileExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formatOptions: Record<ExportFormat, { title: string; description: string; Icon: LucideIcon }> = {
    csv: {
      title: 'Формат CSV',
      description: 'Файл значений, разделенных запятыми (.csv)',
      Icon: FileText,
    },
    excel: {
      title: 'Формат Excel',
      description: 'Таблица Microsoft Excel (.xlsx)',
      Icon: FileSpreadsheet,
    },
    pdf: {
      title: 'Формат PDF',
      description: 'Красивый отчет PDF с ключевой статистикой, кейсами и дефектами (.pdf)',
      Icon: FileType2,
    },
  };

  const handleExport = async () => {
    if (!selectedFormat) {
      setError('Выберите формат экспорта');
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
      const errorMsg = error instanceof Error ? error.message : 'Экспорт не удался';
      setError(errorMsg);
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
                <p className="text-sm font-medium text-white/90">Выберите формат экспорта</p>

                {availableFormats.map((format) => {
                  const option = formatOptions[format];
                  const isSelected = selectedFormat === format;
                  const Icon = option.Icon;

                  return (
                    <div
                      key={format}
                      className={`p-4 border rounded-lg cursor-pointer transition-all bg-[#0f0f12] ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                      }`}
                      onClick={() => !exporting && setSelectedFormat(format)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          isSelected ? 'bg-primary/20' : 'bg-white/10'
                        }`}>
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-white/70'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white/90">{option.title}</p>
                          <p className="text-xs text-white/50 mt-1">{option.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f0f12] px-6 py-4 flex gap-3 justify-end">
          <Button
            type="button"
            variant="glass"
            onClick={handleClose}
            disabled={exporting}
            className="cursor-pointer"
            buttonName={`${title} - Cancel`}
          >
            Отмена
          </Button>
          <ButtonPrimary
            type="button"
            onClick={handleExport}
            disabled={!selectedFormat || exporting}
            className="cursor-pointer"
            buttonName={`${title} - Export`}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {exporting ? 'Экспорт...' : 'Экспортировать'}
          </ButtonPrimary>
        </div>
      </DialogContent>
    </Dialog>
  );
}
