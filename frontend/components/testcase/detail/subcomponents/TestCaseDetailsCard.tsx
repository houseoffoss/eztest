'use client';

import { DetailCard } from '@/components/design/DetailCard';
import { Clock } from 'lucide-react';
import { TestCase, TestCaseFormData } from '../types';
import { TestCaseFormBuilder } from '../../subcomponents/TestCaseFormBuilder';
import { getEditTestCaseFormFields } from '../../constants/testCaseFormConfig';

interface TestCaseDetailsCardProps {
  testCase: TestCase;
  isEditing: boolean;
  formData: TestCaseFormData;
  errors?: Record<string, string>;
  testSuites?: any[];
  onFormChange: (data: TestCaseFormData) => void;
  onFieldChange?: (field: keyof TestCaseFormData, value: string | number | null) => void;
}

export function TestCaseDetailsCard({
  testCase,
  isEditing,
  formData,
  errors = {},
  testSuites = [],
  onFormChange,
  onFieldChange,
}: TestCaseDetailsCardProps) {
  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  const fields = getEditTestCaseFormFields(testSuites);

  return (
    <DetailCard title="Details" contentClassName="space-y-4">
      {isEditing ? (
        <TestCaseFormBuilder
          fields={fields}
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          variant="glass"
        />
      ) : (
        <>
          {testCase.description && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Description
              </h4>
              <p className="text-white/90 break-words">{testCase.description}</p>
            </div>
          )}

          {testCase.expectedResult && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Expected Result
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.expectedResult}
              </p>
            </div>
          )}

          {testCase.estimatedTime && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Estimated Time
              </h4>
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span>{testCase.estimatedTime} minutes</span>
              </div>
            </div>
          )}

          {testCase.preconditions && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Preconditions
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.preconditions}
              </p>
            </div>
          )}

          {testCase.postconditions && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Postconditions
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.postconditions}
              </p>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
