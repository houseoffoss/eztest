'use client';

import type { FormFieldConfig } from '../subcomponents/TestCaseFormField';
import { Module } from '../types';

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

export function getTestCaseFormFields(modules: Module[] = []): FormFieldConfig[] {
  const moduleOptions = modules.map((module) => ({
    label: module.name,
    value: module.id,
  }));

  return [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter test case title',
      required: true,
      maxLength: 200,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: PRIORITY_OPTIONS,
    },
    {
      name: 'moduleId',
      label: 'Module',
      type: 'select',
      placeholder: 'Select a module',
      options: [
        { label: 'None (No Module)', value: 'none' },
        ...moduleOptions,
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
      label: 'テスト実行時間（秒）',
      type: 'number',
      placeholder: 'Enter estimated time',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter test case description',
      rows: 3,
      maxLength: 250,
    },
    {
      name: 'preconditions',
      label: '前提条件',
      type: 'textarea',
      placeholder: 'Enter preconditions',
      rows: 2,
      maxLength: 250,
    },
    {
      name: 'postconditions',
      label: '事後条件',
      type: 'textarea',
      placeholder: 'Enter postconditions',
      rows: 2,
      maxLength: 250,
    },
    {
      name: 'expectedResult',
      label: '期待結果',
      type: 'textarea',
      placeholder: 'Enter the expected result',
      rows: 3,
      maxLength: 250,
    },
  ];
}

export function getCreateTestCaseFormFields(
  modules: Module[] = []
): FormFieldConfig[] {
  return getTestCaseFormFields(modules);
}

export function getEditTestCaseFormFields(
  modules: Module[] = []
): FormFieldConfig[] {
  // Same as create, but could be extended for edit-specific fields
  return getTestCaseFormFields(modules);
}
