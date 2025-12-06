import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { Checkbox } from '@/elements/checkbox';
import { CheckCircle, XCircle, AlertCircle, Circle, Plus, Bug } from 'lucide-react';
import { ResultFormData } from '../types';
import { CreateDefectDialog } from '@/frontend/components/defect/subcomponents/CreateDefectDialog';

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
  formData: ResultFormData;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: Partial<ResultFormData>) => void;
  onSubmit: () => void;
}

export function RecordResultDialog({
  open,
  testCaseName,
  testCaseId,
  projectId,
  testRunEnvironment,
  formData,
  onOpenChange,
  onFormChange,
  onSubmit,
}: RecordResultDialogProps) {
  const [existingDefects, setExistingDefects] = useState<Defect[]>([]);
  const [otherDefects, setOtherDefects] = useState<Defect[]>([]);
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>([]);
  const [createDefectDialogOpen, setCreateDefectDialogOpen] = useState(false);
  const [loadingDefects, setLoadingDefects] = useState(false);

  useEffect(() => {
    if (open && formData.status === 'FAILED') {
      fetchDefects();
    } else {
      // Reset defect selections when dialog closes or status changes
      setSelectedDefectIds([]);
    }
  }, [open, formData.status, testCaseId]);

  const fetchDefects = async () => {
    try {
      setLoadingDefects(true);
      // Fetch existing defects linked to this test case
      const existingResponse = await fetch(`/api/testcases/${testCaseId}/defects`);
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
  };

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
    // Link selected defects to test case if any are selected
    if (selectedDefectIds.length > 0) {
      try {
        await fetch(`/api/testcases/${testCaseId}/defects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defectIds: selectedDefectIds }),
        });
      } catch (error) {
        console.error('Error linking defects:', error);
      }
    }
    onSubmit();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Test Result</DialogTitle>
          <DialogDescription>{testCaseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Result Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) => onFormChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select result status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASSED">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Passed</span>
                  </div>
                </SelectItem>
                <SelectItem value="FAILED">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Failed</span>
                  </div>
                </SelectItem>
                <SelectItem value="BLOCKED">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Blocked</span>
                  </div>
                </SelectItem>
                <SelectItem value="SKIPPED">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <span>Skipped</span>
                  </div>
                </SelectItem>
                <SelectItem value="RETEST">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-500" />
                    <span>Retest</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              variant="glass"
              value={formData.comment}
              onChange={(e) => onFormChange({ comment: e.target.value })}
              placeholder="Add any comments about this test execution"
              rows={4}
            />
          </div>

          {/* Show defect options when status is FAILED */}
          {formData.status === 'FAILED' && (
            <div className="space-y-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <Label>Link to Defects (Optional)</Label>
              </div>

              {loadingDefects ? (
                <p className="text-sm text-white/50">Loading defects...</p>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {/* Existing Defects for this test case */}
                  {existingDefects.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Existing Defects for this Test Case
                      </p>
                      {existingDefects.map((defect) => (
                        <div
                          key={defect.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                        >
                          <Checkbox
                            checked={selectedDefectIds.includes(defect.id)}
                            onCheckedChange={() => handleDefectToggle(defect.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Bug className="w-4 h-4 text-blue-400" />
                              <span className="font-mono text-sm text-blue-400">
                                {defect.defectId}
                              </span>
                              <span className={`text-xs ${getSeverityColor(defect.severity)}`}>
                                {defect.severity}
                              </span>
                            </div>
                            <p className="text-sm text-white/90 truncate">{defect.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other Defects in the project */}
                  {otherDefects.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Other Defects in Project
                      </p>
                      {otherDefects.map((defect) => (
                        <div
                          key={defect.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <Checkbox
                            checked={selectedDefectIds.includes(defect.id)}
                            onCheckedChange={() => handleDefectToggle(defect.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
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
                      ))}
                    </div>
                  )}

                  {existingDefects.length === 0 && otherDefects.length === 0 && (
                    <p className="text-sm text-white/50 text-center py-4">
                      No defects available. Create a new defect to link to this test case.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <ButtonPrimary onClick={handleSubmitWithDefects}>
            Save Result
            {formData.status === 'FAILED' && selectedDefectIds.length > 0 && (
              <span className="ml-2 text-xs">
                ({selectedDefectIds.length} defect{selectedDefectIds.length > 1 ? 's' : ''})
              </span>
            )}
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
      />
    </Dialog>
  );
}
