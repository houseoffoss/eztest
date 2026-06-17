'use client';

import { X } from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { TestCase, ResultFormData } from '../types';

interface TestCaseResultSidePanelProps {
  open: boolean;
  testCase: TestCase | null;
  formData: ResultFormData;
  saving?: boolean;
  onClose: () => void;
  onFormChange: (data: Partial<ResultFormData>) => void;
  onSave: () => void;
  getStatusIcon: (status?: string) => React.JSX.Element;
}

const STATUS_LABELS: Record<string, string> = {
  PASSED: 'Успешно',
  FAILED: 'Провалено',
  BLOCKED: 'Заблокировано',
  RETEST: 'Ретест',
  NOT_RUN: 'Not run',
};

const QUICK_STATUS_VALUES = ['PASSED', 'FAILED', 'BLOCKED', 'RETEST', 'NOT_RUN'] as const;

const STATUS_BUTTON_STYLES: Record<string, { idle: string; active: string }> = {
  PASSED: {
    idle: 'border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/15',
    active: 'border-green-400/60 bg-green-500/20 text-green-200 shadow-[0_0_0_1px_rgba(74,222,128,0.2)]',
  },
  FAILED: {
    idle: 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15',
    active: 'border-red-400/60 bg-red-500/20 text-red-200 shadow-[0_0_0_1px_rgba(248,113,113,0.2)]',
  },
  BLOCKED: {
    idle: 'border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/15',
    active: 'border-orange-400/60 bg-orange-500/20 text-orange-200 shadow-[0_0_0_1px_rgba(251,146,60,0.2)]',
  },
  RETEST: {
    idle: 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/15',
    active: 'border-purple-400/60 bg-purple-500/20 text-purple-200 shadow-[0_0_0_1px_rgba(196,181,253,0.2)]',
  },
  NOT_RUN: {
    idle: 'border-slate-500/30 bg-slate-500/10 text-slate-300 hover:bg-slate-500/15',
    active: 'border-slate-400/60 bg-slate-500/20 text-slate-100 shadow-[0_0_0_1px_rgba(203,213,225,0.2)]',
  },
};

export function TestCaseResultSidePanel({
  open,
  testCase,
  formData,
  saving = false,
  onClose,
  onFormChange,
  onSave,
  getStatusIcon,
}: TestCaseResultSidePanelProps) {
  if (!open || !testCase) {
    return null;
  }

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-full max-w-xl border-l border-white/10 bg-[#0f0f12] shadow-2xl">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-white/10 p-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-white/60">{testCase.tcId || '-'}</p>
            <h3 className="mt-1 truncate text-base font-semibold text-white/90">{testCase.title || testCase.name || 'Тест-кейс'}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
          {testCase.preconditions && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h4 className="text-sm font-medium text-white/90">Предусловия</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{testCase.preconditions}</p>
            </div>
          )}

          {testCase.steps && testCase.steps.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <h4 className="text-sm font-medium text-white/90">Шаги</h4>
              <div className="mt-3 space-y-2">
                {testCase.steps.map((step) => (
                  <div key={step.id} className="rounded-md border border-white/10 bg-black/10 p-2">
                    <p className="text-xs text-white/60">Шаг {step.stepNumber}</p>
                    <p className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{step.action}</p>
                    <p className="mt-1 text-xs text-white/60 whitespace-pre-wrap">Ожидаемый результат: {step.expectedResult}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="panel-status">Статус результата</Label>

            <div className="flex flex-wrap gap-2">
              {QUICK_STATUS_VALUES.map((statusValue) => (
                <Button
                  key={statusValue}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={formData.status === statusValue ? STATUS_BUTTON_STYLES[statusValue].active : STATUS_BUTTON_STYLES[statusValue].idle}
                  onClick={() => onFormChange({ status: statusValue })}
                >
                  {STATUS_LABELS[statusValue] || statusValue}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="panel-comment">Комментарий</Label>
            <Textarea
              id="panel-comment"
              variant="glass"
              value={formData.comment}
              onChange={(event) => onFormChange({ comment: event.target.value })}
              placeholder="Добавьте комментарий к выполнению"
              rows={6}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 p-4">
          <Button variant="glass" onClick={onClose}>
            Закрыть
          </Button>
          <ButtonPrimary onClick={onSave} disabled={saving || !formData.status}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </ButtonPrimary>
        </div>
      </div>
    </aside>
  );
}
