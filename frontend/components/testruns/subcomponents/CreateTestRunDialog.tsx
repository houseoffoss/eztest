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
import { TestRunFormData } from '../types';
import { TestCaseFormBuilder } from '../../testcase/subcomponents/TestCaseFormBuilder';
import { getCreateTestRunFormFields } from '../constants/testRunFormConfig';

interface CreateTestRunDialogProps {
  open: boolean;
  formData: TestRunFormData;
  errors?: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: TestRunFormData) => void;
  onFieldChange?: (field: keyof TestRunFormData, value: string | number | null) => void;
  onCreate: () => void;
}

export type { CreateTestRunDialogProps };

export function CreateTestRunDialog({
  open,
  formData,
  errors = {},
  onOpenChange,
  onFormChange,
  onFieldChange,
  onCreate,
}: CreateTestRunDialogProps) {
  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  const fields = getCreateTestRunFormFields();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Test Run</DialogTitle>
          <DialogDescription>
            Create a new test run to execute test cases
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
          <Button variant="glass-primary" onClick={onCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
