'use client';

import type { FormFieldConfig } from '../subcomponents/TestCaseFormField';
import { TestSuite } from '../types';

export const PRIORITY_OPTIONS = [
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Deprecated', value: 'DEPRECATED' },
];

export function getTestCaseFormFields(testSuites: TestSuite[] = []): FormFieldConfig[] {
  const suiteOptions = testSuites.map((suite) => ({
    label: suite.name,
    value: suite.id,
  }));

  return [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter test case title',
      required: true,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: PRIORITY_OPTIONS,
    },
    {
      name: 'suiteId',
      label: 'Test Suite',
      type: 'select',
      placeholder: 'Select a test suite',
      options: [
        { label: 'None (No Suite)', value: 'none' },
        ...suiteOptions,
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
    {
      name: 'estimatedTime',
      label: 'Estimated Time (minutes)',
      type: 'number',
      placeholder: 'Enter estimated time',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter test case description',
      rows: 3,
    },
    {
      name: 'preconditions',
      label: 'Preconditions',
      type: 'textarea',
      placeholder: 'Enter preconditions',
      rows: 2,
    },
    {
      name: 'postconditions',
      label: 'Postconditions',
      type: 'textarea',
      placeholder: 'Enter postconditions',
      rows: 2,
    },
    {
      name: 'expectedResult',
      label: 'Expected Result',
      type: 'textarea',
      placeholder: 'Enter the expected result or outcome',
      rows: 3,
    },
  ];
}

export function getCreateTestCaseFormFields(
  testSuites: TestSuite[] = []
): FormFieldConfig[] {
  return getTestCaseFormFields(testSuites);
}

export function getEditTestCaseFormFields(
  testSuites: TestSuite[] = []
): FormFieldConfig[] {
  // Same as create, but could be extended for edit-specific fields
  return getTestCaseFormFields(testSuites);
}
