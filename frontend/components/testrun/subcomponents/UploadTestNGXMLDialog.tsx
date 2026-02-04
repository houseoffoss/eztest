'use client';

import { UploadXMLDialog, UploadXMLDialogProps } from '@/frontend/reusable-components/dialogs/UploadXMLDialog';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

export interface UploadTestNGXMLDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onImportComplete: () => void;
}

export function UploadTestNGXMLDialog({
  open,
  onOpenChange,
  projectId,
  onImportComplete,
}: UploadTestNGXMLDialogProps) {
  // Fetch dynamic dropdown options
  const { options: environmentOptions } = useDropdownOptions('TestRun', 'environment');

  // Generate test run name from filename with date postfix
  const generateTestRunName = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.xml$/i, '');
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    return `${nameWithoutExt}_${dateStr}`;
  };

  const dialogProps: UploadXMLDialogProps = {
    open,
    onOpenChange,
    title: 'Upload TestNG XML Results',
    description: 'Upload TestNG XML results file to import test execution results. Test methods will be matched with test case IDs.',
    acceptedFileTypes: ['.xml'],
    acceptedFileExtensions: ['xml'],
    checkEndpoint: `/api/projects/${projectId}/testruns/check-xml`,
    createEndpoint: `/api/projects/${projectId}/testruns`,
    uploadEndpoint: `/api/projects/${projectId}/testruns/[id]/upload-xml`,
    generateName: generateTestRunName,
    showNamePreview: true,
    namePreviewLabel: 'New Test Run Name',
    onImportComplete,
    showEnvironmentField: true,
    environmentRequired: true,
    environmentOptions: environmentOptions.map(opt => ({ value: opt.value, label: opt.label })),
    createRequestBody: (filename, generatedName, environment) => ({
      name: generatedName,
      description: `Test run created from XML file: ${filename}`,
      status: 'COMPLETED',
      environment: environment,
      executionType: 'AUTOMATION',
      testCaseIds: [],
    }),
  };

  return <UploadXMLDialog {...dialogProps} />;
}
