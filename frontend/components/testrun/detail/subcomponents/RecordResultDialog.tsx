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
import { ButtonSecondary } from '@/elements/button-secondary';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import { Input } from '@/elements/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { Checkbox } from '@/elements/checkbox';
import { CheckCircle, XCircle, AlertCircle, Circle, Plus, Bug, Search } from 'lucide-react';
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
  refreshTrigger?: number; // Trigger to refresh defects after creation
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
  refreshTrigger,
}: RecordResultDialogProps) {
  const [existingDefects, setExistingDefects] = useState<Defect[]>([]);
  const [otherDefects, setOtherDefects] = useState<Defect[]>([]);
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>([]);
  const [createDefectDialogOpen, setCreateDefectDialogOpen] = useState(false);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [defectFilter, setDefectFilter] = useState<'all' | 'existing' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open && formData.status === 'FAILED') {
      fetchDefects();
    } else {
      // Reset defect selections when dialog closes or status changes
      setSelectedDefectIds([]);
    }
  }, [open, formData.status, testCaseId, refreshTrigger]);

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
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Record Test Result</DialogTitle>
          <DialogDescription>{testCaseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mb-4">
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
                      All Defects
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
                        Existing Defects ({existingDefects.length})
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
                        Other Defects ({otherDefects.length})
                      </ButtonSecondary>
                    )}
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search defects by title or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Defects List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
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
                        {searchQuery ? 'No defects match your search' : 'No defects available'}
                      </p>
                    )}
                  </div>
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
