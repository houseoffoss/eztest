import { FormFieldConfig } from '../../testcase/subcomponents/TestCaseFormField';

export const ENVIRONMENT_OPTIONS = [
  { label: 'Production', value: 'Production' },
  { label: 'Staging', value: 'Staging' },
  { label: 'QA', value: 'QA' },
  { label: 'Development', value: 'Development' },
];

export const STATUS_OPTIONS = [
  { label: 'Planned', value: 'PLANNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

/**
 * Get all available test run form fields
 */
export function getTestRunFormFields(): FormFieldConfig[] {
  return [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter test run name',
      maxLength: 50,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter test run description',
      maxLength: 250,
    },
    {
      name: 'environment',
      label: 'Environment',
      type: 'select',
      required: false,
      options: ENVIRONMENT_OPTIONS,
      placeholder: 'Select environment',
    },
  ];
}

/**
 * Get form fields for creating a new test run
 */
export function getCreateTestRunFormFields(): FormFieldConfig[] {
  return getTestRunFormFields();
}

/**
 * Get form fields for editing an existing test run
 */
export function getEditTestRunFormFields(): FormFieldConfig[] {
  return getTestRunFormFields();
}
