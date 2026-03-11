import { FormFieldConfig } from '../../testcase/subcomponents/TestCaseFormField';

export const ENVIRONMENT_OPTIONS = [
  { label: '本番', value: 'Production' },
  { label: 'ステージング', value: 'Staging' },
  { label: 'QA', value: 'QA' },
  { label: '開発', value: 'Development' },
];

export const STATUS_OPTIONS = [
  { label: '計画中', value: 'PLANNED' },
  { label: '実行中', value: 'IN_PROGRESS' },
  { label: '完了', value: 'COMPLETED' },
  { label: 'キャンセル', value: 'CANCELLED' },
];

/**
 * Get all available test run form fields
 */
export function getTestRunFormFields(): FormFieldConfig[] {
  return [
    {
      name: 'name',
      label: '名前',
      type: 'text',
      required: true,
      placeholder: 'テストラン名を入力',
      maxLength: 50,
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      required: false,
      placeholder: 'テストランの説明を入力',
      maxLength: 250,
    },
    {
      name: 'environment',
      label: '環境',
      type: 'select',
      required: false,
      options: ENVIRONMENT_OPTIONS,
      placeholder: '環境を選択',
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
