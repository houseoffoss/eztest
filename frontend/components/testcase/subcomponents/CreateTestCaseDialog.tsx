'use client';

import { Button } from '@/elements/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { TestCaseFormData, TestSuite } from '../types';
import { TestCaseFormBuilder } from './TestCaseFormBuilder';
import { getCreateTestCaseFormFields } from '../constants/testCaseFormConfig';

interface CreateTestCaseDialogProps {
  open: boolean;
  formData: TestCaseFormData;
  testSuites: TestSuite[];
  errors?: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: TestCaseFormData) => void;
  onFieldChange?: (field: keyof TestCaseFormData, value: string | number | null) => void;
  onSubmit: () => void;
}

export type { CreateTestCaseDialogProps };

export function CreateTestCaseDialog({
  open,
  formData,
  testSuites,
  errors = {},
  onOpenChange,
  onFormChange,
  onFieldChange,
  onSubmit,
}: CreateTestCaseDialogProps) {
  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  const fields = getCreateTestCaseFormFields(testSuites);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Test Case</DialogTitle>
          <DialogDescription>
            Add a new test case to this project
          </DialogDescription>
        </DialogHeader>
        
        <TestCaseFormBuilder
          fields={fields}
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          variant="glass"
        />

        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glass-primary" onClick={onSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
