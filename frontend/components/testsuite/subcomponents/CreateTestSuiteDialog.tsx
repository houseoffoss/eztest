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
import { TestSuite, TestSuiteFormData } from '../types';
import { TestCaseFormBuilder } from '../../testcase/subcomponents/TestCaseFormBuilder';
import { getCreateTestSuiteFormFields } from '../constants/testSuiteFormConfig';

interface CreateTestSuiteDialogProps {
  open: boolean;
  formData: TestSuiteFormData;
  testSuites: TestSuite[];
  errors?: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: TestSuiteFormData) => void;
  onFieldChange?: (field: keyof TestSuiteFormData, value: string | number | null) => void;
  onSubmit: () => void;
}

export type { CreateTestSuiteDialogProps };

export function CreateTestSuiteDialog({
  open,
  formData,
  testSuites,
  errors = {},
  onOpenChange,
  onFormChange,
  onFieldChange,
  onSubmit,
}: CreateTestSuiteDialogProps) {
  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  const fields = getCreateTestSuiteFormFields(testSuites);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Test Suite</DialogTitle>
          <DialogDescription>
            Organize your test cases into suites
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
