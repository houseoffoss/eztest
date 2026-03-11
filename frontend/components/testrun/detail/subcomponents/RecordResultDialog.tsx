import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import { CheckCircle, XCircle, AlertCircle, Circle, Bug, Timer, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ResultFormData } from '../types';
import { CreateDefectDialog } from '@/frontend/components/defect/subcomponents/CreateDefectDialog';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestCaseDetail {
  id: string;
  tcId: string;
  rtcId?: string | null;
  title: string;
  description?: string;
  expectedResult?: string;
  preconditions?: string;
  postconditions?: string;
  testData?: string;
  priority: string;
  status: string;
  estimatedTime?: number | null;
  steps?: TestStep[];
  module?: { id: string; name: string } | null;
  testCaseSuites?: Array<{ testSuite: { id: string; name: string } }>;
}

interface Defect {
  id: string;
  defectId: string;
  title: string;
  status: string;
  severity: string;
}

interface RecordResultDialogProps {
  open: boolean;
  testCaseName: string;
  testCaseId: string;
  projectId: string;
  testRunEnvironment?: string; // Environment from test run
  testRunPlatform?: string;
  testRunDevice?: string;
  formData: ResultFormData;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: Partial<ResultFormData>) => void;
  onSubmit: (durationSeconds?: number) => void;
  refreshTrigger?: number; // Trigger to refresh defects after creation
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function RecordResultDialog({
  open,
  testCaseName,
  testCaseId,
  projectId,
  testRunEnvironment,
  testRunPlatform,
  testRunDevice,
  formData,
  onOpenChange,
  onFormChange,
  onSubmit,
  refreshTrigger,
  onNavigate,
  hasPrev = false,
  hasNext = false,
}: RecordResultDialogProps) {
  const [existingDefects, setExistingDefects] = useState<Defect[]>([]);
  const [otherDefects, setOtherDefects] = useState<Defect[]>([]);
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>([]);
  const [createDefectDialogOpen, setCreateDefectDialogOpen] = useState(false);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [defectFilter, setDefectFilter] = useState<'all' | 'existing' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // テストケース詳細
  const [testCaseDetail, setTestCaseDetail] = useState<TestCaseDetail | null>(null);
  const [loadingTestCase, setLoadingTestCase] = useState(false);
  const [testCaseExpanded, setTestCaseExpanded] = useState(true);

  // 経過時間タイマー（テストケース読み込み完了後に開始）
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerOffset, setTimerOffset] = useState(0); // 既存の実行時間からの継続用オフセット（秒）
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerCacheRef = useRef<Record<string, number>>({});
  const activeTestCaseIdRef = useRef<string | null>(null);
  const loadedTestCaseIdRef = useRef<string | null>(null);
  const fetchInFlightTestCaseIdRef = useRef<string | null>(null);
  const testCaseDetailRef = useRef<TestCaseDetail | null>(null);
  const elapsedSecondsRef = useRef(0);
  const timerStartTimeRef = useRef<number | null>(null);
  const timerOffsetRef = useRef(0);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    timerStartTimeRef.current = timerStartTime;
  }, [timerStartTime]);

  useEffect(() => {
    timerOffsetRef.current = timerOffset;
  }, [timerOffset]);

  useEffect(() => {
    testCaseDetailRef.current = testCaseDetail;
  }, [testCaseDetail]);

  const getCurrentElapsedSeconds = useCallback(() => {
    if (timerStartTimeRef.current) {
      return timerOffsetRef.current + Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
    }
    return elapsedSecondsRef.current;
  }, []);

  const persistElapsedForTestCase = useCallback((targetTestCaseId?: string) => {
    const id = targetTestCaseId || activeTestCaseIdRef.current;
    if (!id) return;
    timerCacheRef.current[id] = getCurrentElapsedSeconds();
  }, [getCurrentElapsedSeconds]);

  // ダイアログが開いたらテストケース詳細を取得し、読み込み完了後にタイマー開始
  useEffect(() => {
    if (open && testCaseId) {
      // 取得済みの同一テストケースは再取得しない
      if (loadedTestCaseIdRef.current === testCaseId && testCaseDetailRef.current?.id === testCaseId) {
        setLoadingTestCase(false);
        setTestCaseExpanded(true);
        return;
      }

      // 同じテストケースのリクエストが進行中なら重複実行しない
      if (fetchInFlightTestCaseIdRef.current === testCaseId) {
        return;
      }
      fetchInFlightTestCaseIdRef.current = testCaseId;

      // 別テストケースへ遷移したら、前のテストケースの経過時間を保存
      if (activeTestCaseIdRef.current && activeTestCaseIdRef.current !== testCaseId) {
        persistElapsedForTestCase(activeTestCaseIdRef.current);
      }
      activeTestCaseIdRef.current = testCaseId;

      const cachedElapsed = timerCacheRef.current[testCaseId];
      if (cachedElapsed !== undefined) {
        // 一度計測したテストケースは保存済み時間から継続
        setTimerOffset(cachedElapsed);
        setElapsedSeconds(cachedElapsed);
        setTimerStartTime(Date.now());
      } else {
        // 初回表示時のみ既存実行時間を初期値として利用
        setTimerStartTime(null);
        setTimerOffset(0);
        setElapsedSeconds(0);
      }

      const fetchTestCaseDetail = async () => {
        setLoadingTestCase(true);
        try {
          const response = await fetch(`/api/testcases/${testCaseId}`);
          const data = await response.json();
          if (data.data) {
            setTestCaseDetail(data.data);
            // キャッシュがない場合のみ既存実行時間をオフセットに採用
            if (cachedElapsed === undefined) {
              const existingTime = data.data.estimatedTime;
              if (existingTime && existingTime > 0) {
                setTimerOffset(existingTime);
                setElapsedSeconds(existingTime);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching test case detail:', error);
        } finally {
          loadedTestCaseIdRef.current = testCaseId;
          fetchInFlightTestCaseIdRef.current = null;
          setLoadingTestCase(false);
          if (!timerRef.current) {
            setTimerStartTime(Date.now());
          }
        }
      };
      fetchTestCaseDetail();
      setTestCaseExpanded(true);
    } else if (!open) {
      // ダイアログが閉じても経過時間は保持し、次回同じテストケースで継続
      persistElapsedForTestCase();
      fetchInFlightTestCaseIdRef.current = null;
      setTimerStartTime(null);
      setTestCaseDetail(null);
    }
  }, [open, testCaseId, persistElapsedForTestCase]);

  useEffect(() => {
    if (open && timerStartTime) {
      const updateElapsed = () => {
        setElapsedSeconds(timerOffset + Math.floor((Date.now() - timerStartTime) / 1000));
      };
      updateElapsed();
      timerRef.current = setInterval(updateElapsed, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, timerStartTime, timerOffset]);

  const formatElapsedTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Fetch dynamic dropdown options
  const { options: statusOptions } = useDropdownOptions('TestResult', 'status');

  // Helper function to get icon for status
  const getStatusIcon = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PASSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'BLOCKED':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'SKIPPED':
        return <Circle className="w-4 h-4 text-gray-500" />;
      case 'RETEST':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const fetchDefects = useCallback(async () => {
    try {
      setLoadingDefects(true);
      // Fetch existing defects linked to this test case
      const existingResponse = await fetch(`/api/projects/${projectId}/testcases/${testCaseId}/defects`);
      const existingData = await existingResponse.json();
      
      // Fetch all defects in the project
      const allDefectsResponse = await fetch(`/api/projects/${projectId}/defects`);
      const allDefectsData = await allDefectsResponse.json();
      
      const existing = existingData.data || [];
      const all = allDefectsData.data || [];
      
      // Filter out defects that are already linked to this test case
      const existingIds = new Set(existing.map((d: Defect) => d.id));
      const others = all.filter((d: Defect) => !existingIds.has(d.id));
      
      setExistingDefects(existing);
      setOtherDefects(others);
    } catch (error) {
      console.error('Error fetching defects:', error);
    } finally {
      setLoadingDefects(false);
    }
  }, [testCaseId, projectId]);

  useEffect(() => {
    if (open && formData.status === 'FAILED') {
      fetchDefects();
    } else {
      // Reset defect selections when dialog closes or status changes
      setSelectedDefectIds([]);
    }
  }, [open, formData.status, testCaseId, refreshTrigger, fetchDefects]);

  const handleDefectToggle = (defectId: string) => {
    setSelectedDefectIds((prev) =>
      prev.includes(defectId)
        ? prev.filter((id) => id !== defectId)
        : [...prev, defectId]
    );
  };

  const handleCreateDefect = (defect: { id: string; defectId: string; title: string }) => {
    setCreateDefectDialogOpen(false);
    // Add the newly created defect to selected defects
    setSelectedDefectIds((prev) => [...prev, defect.id]);
    // Refresh defects list
    fetchDefects();
  };

  const handleSubmitWithDefects = async () => {
    try {
      // Link selected defects to test case if any are selected
      if (selectedDefectIds.length > 0) {
        try {
          await fetch(`/api/projects/${projectId}/testcases/${testCaseId}/defects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ defectIds: selectedDefectIds }),
          });
        } catch (error) {
          console.error('Error linking defects:', error);
        }
      }
      // 計測した経過秒数（既存の実行時間 + 今回の計測時間）を渡して保存
      const duration = Math.round(getCurrentElapsedSeconds());
      if (testCaseId) {
        timerCacheRef.current[testCaseId] = duration;
      }
      await onSubmit(duration);
    } catch (error) {
      throw error;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      case 'LOW':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getFilteredDefects = () => {
    let defects: Defect[] = [];
    
    if (defectFilter === 'existing') {
      defects = existingDefects;
    } else if (defectFilter === 'other') {
      defects = otherDefects;
    } else {
      defects = [...existingDefects, ...otherDefects];
    }
    
    // Filter by search query
    return defects.filter(
      (defect) =>
        defect.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        defect.defectId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[90vh]">
        {/* ◀▶ ナビゲーションボタン */}
        {onNavigate && (
          <>
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onNavigate('prev')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)] z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-white/70"
              aria-label="前のテストケース"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onNavigate('next')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-white/70"
              aria-label="次のテストケース"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <DialogHeader className="mb-4 flex-shrink-0">
          <DialogTitle>テスト結果を記録</DialogTitle>
          <DialogDescription>{testCaseName}</DialogDescription>
          {timerStartTime && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Timer className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">経過時間:</span>
              <span className="text-sm font-mono font-semibold text-blue-200">
                {formatElapsedTime(elapsedSeconds)}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {/* テストケース詳細表示 */}
        {loadingTestCase ? (
          <div className="mb-4 py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-white/50">テストケースを読み込み中...</p>
          </div>
        ) : testCaseDetail && (
          <div className="mb-4 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
              onClick={() => setTestCaseExpanded(!testCaseExpanded)}
            >
              <span className="text-sm font-medium text-white/90">テストケース内容</span>
              {testCaseExpanded ? (
                <ChevronUp className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/50" />
              )}
            </button>
            {testCaseExpanded && (
              <div className="px-4 pb-4 space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {/* 基本情報 */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-white/40">TC-ID:</span>{' '}
                    <span className="text-white/80 font-mono">{testCaseDetail.tcId}</span>
                  </div>
                  {testCaseDetail.rtcId && (
                    <div>
                      <span className="text-white/40">RTC-ID:</span>{' '}
                      <span className="text-white/80 font-mono">{testCaseDetail.rtcId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/40">優先度:</span>{' '}
                    <span className="text-white/80">{testCaseDetail.priority}</span>
                  </div>
                  <div>
                    <span className="text-white/40">ステータス:</span>{' '}
                    <span className="text-white/80">{testCaseDetail.status}</span>
                  </div>
                  {testCaseDetail.module && (
                    <div>
                      <span className="text-white/40">モジュール:</span>{' '}
                      <span className="text-white/80">{testCaseDetail.module.name}</span>
                    </div>
                  )}
                  {testCaseDetail.testCaseSuites && testCaseDetail.testCaseSuites.length > 0 && (
                    <div>
                      <span className="text-white/40">スイート:</span>{' '}
                      <span className="text-white/80">
                        {testCaseDetail.testCaseSuites.map(s => s.testSuite.name).join(', ')}
                      </span>
                    </div>
                  )}
                  {testCaseDetail.estimatedTime != null && (
                    <div>
                      <span className="text-white/40">テスト実行時間:</span>{' '}
                      <span className="text-white/80 font-mono">
                        {String(Math.floor(testCaseDetail.estimatedTime / 3600)).padStart(2, '0')}:
                        {String(Math.floor((testCaseDetail.estimatedTime % 3600) / 60)).padStart(2, '0')}:
                        {String(testCaseDetail.estimatedTime % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 説明 */}
                {testCaseDetail.description && (
                  <div>
                    <p className="text-xs font-medium text-white/40 mb-1">説明</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap bg-white/5 rounded p-2">
                      {testCaseDetail.description}
                    </p>
                  </div>
                )}

                {/* 前提条件 */}
                {testCaseDetail.preconditions && (
                  <div>
                    <p className="text-xs font-medium text-white/40 mb-1">前提条件</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap bg-white/5 rounded p-2">
                      {testCaseDetail.preconditions}
                    </p>
                  </div>
                )}

                {/* テストデータ */}
                {testCaseDetail.testData && (
                  <div>
                    <p className="text-xs font-medium text-white/40 mb-1">テストデータ</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap bg-white/5 rounded p-2">
                      {testCaseDetail.testData}
                    </p>
                  </div>
                )}

                {/* テストステップ */}
                {testCaseDetail.steps && testCaseDetail.steps.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-white/40 mb-2">テストステップ</p>
                    <div className="space-y-2">
                      {testCaseDetail.steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex gap-3 p-2 rounded bg-white/5 text-sm"
                        >
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                            {step.stepNumber}
                          </span>
                          <div className="flex-1 space-y-1">
                            <p className="text-white/80">
                              <span className="text-white/40 text-xs">操作: </span>
                              {step.action}
                            </p>
                            <p className="text-white/60">
                              <span className="text-white/40 text-xs">期待結果: </span>
                              {step.expectedResult}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 期待結果（全体） */}
                {testCaseDetail.expectedResult && (
                  <div>
                    <p className="text-xs font-medium text-white/40 mb-1">期待結果</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap bg-white/5 rounded p-2">
                      {testCaseDetail.expectedResult}
                    </p>
                  </div>
                )}

                {/* 事後条件 */}
                {testCaseDetail.postconditions && (
                  <div>
                    <p className="text-xs font-medium text-white/40 mb-1">事後条件</p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap bg-white/5 rounded p-2">
                      {testCaseDetail.postconditions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* テスト結果を記録 */}
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="status">結果ステータス *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) => onFormChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="結果ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(option.value)}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">コメント</Label>
            <Textarea
              id="comment"
              variant="glass"
              value={formData.comment}
              onChange={(e) => onFormChange({ comment: e.target.value })}
              placeholder="このテスト実行についてコメントを追加（任意）"
              rows={4}
            />
          </div>

          {/* Show defect options when status is FAILED */}
          {formData.status === 'FAILED' && (
            <div className="space-y-4 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-2">
                <Label>Defectをリンク（任意）</Label>
                <p className="text-xs text-white/50">
                  新規Defectを作成するには、テーブルのアクション列の「Defectを作成」ボタンを使用してください。
                </p>
              </div>

              {loadingDefects ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  <p className="text-sm text-white/50">Defectを読み込み中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filter Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <ButtonSecondary
                      size="sm"
                      onClick={() => {
                        setDefectFilter('all');
                        setSearchQuery('');
                      }}
                      className={defectFilter === 'all' ? 'bg-blue-500/20 border-blue-500/50 text-white' : ''}
                    >
                      すべてのDefect
                    </ButtonSecondary>
                    {existingDefects.length > 0 && (
                      <ButtonSecondary
                        size="sm"
                        onClick={() => {
                          setDefectFilter('existing');
                          setSearchQuery('');
                        }}
                        className={defectFilter === 'existing' ? 'bg-blue-500/20 border-blue-500/50 text-white' : ''}
                    >
                      リンク済みDefect ({existingDefects.length})
                    </ButtonSecondary>
                    )}
                    {otherDefects.length > 0 && (
                      <ButtonSecondary
                        size="sm"
                        onClick={() => {
                          setDefectFilter('other');
                          setSearchQuery('');
                        }}
                        className={defectFilter === 'other' ? 'bg-blue-500/20 border-blue-500/50 text-white' : ''}
                    >
                      その他のDefect ({otherDefects.length})
                    </ButtonSecondary>
                    )}
                  </div>

                  {/* Search Input */}
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="タイトルまたはIDでDefectを検索..."
                  />

                  {/* Defects List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {getFilteredDefects().length > 0 ? (
                      getFilteredDefects().map((defect) => (
                        <div
                          key={defect.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            existingDefects.find((d) => d.id === defect.id)
                              ? 'bg-blue-500/10 border-blue-500/20'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <Checkbox
                            checked={selectedDefectIds.includes(defect.id)}
                            onCheckedChange={() => handleDefectToggle(defect.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Bug className="w-4 h-4 flex-shrink-0" />
                              <span className="font-mono text-sm text-white/70">
                                {defect.defectId}
                              </span>
                              <span className={`text-xs ${getSeverityColor(defect.severity)}`}>
                                {defect.severity}
                              </span>
                            </div>
                            <p className="text-sm text-white/90 truncate">{defect.title}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/50 text-center py-4">
                        {searchQuery ? '検索に一致するDefectがありません' : '利用可能なDefectがありません'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button 
            variant="glass" 
            onClick={() => onOpenChange(false)}
            buttonName="Record Test Result Dialog - Cancel"
          >
            キャンセル
          </Button>
          <ButtonPrimary 
            onClick={handleSubmitWithDefects}
            buttonName="Record Test Result Dialog - Save Result"
          >
            {formData.status === 'FAILED' ? 'Defectレポートを作成' : '結果を保存'}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>

      {/* Create Defect Dialog */}
      <CreateDefectDialog
        projectId={projectId}
        open={createDefectDialogOpen}
        onOpenChange={setCreateDefectDialogOpen}
        onDefectCreated={handleCreateDefect}
        testCaseId={testCaseId}
        testRunEnvironment={testRunEnvironment}
        testRunPlatform={testRunPlatform}
        testRunDevice={testRunDevice}
      />
    </Dialog>
  );
}
