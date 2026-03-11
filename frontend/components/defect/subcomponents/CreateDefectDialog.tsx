'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SearchableSelect } from '@/frontend/reusable-elements/selects/SearchableSelect';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { type Attachment } from '@/lib/s3';
import { uploadFileToS3 } from '@/lib/s3';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { DefectDescriptionAttachmentField } from '@/frontend/components/defect/shared/DefectDescriptionAttachmentField';

interface Defect {
  id: string;
  defectId: string;
  title: string;
}

interface CreateDefectDialogProps {
  projectId: string;
  open?: boolean;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDefectCreated: (defect: Defect) => void;
  // Context-specific props for auto-population
  testCaseId?: string; // When creating from test run with failed test case
  testRunEnvironment?: string; // When creating from test run, auto-populate environment
  testRunPlatform?: string; // When creating from test run, auto-populate platform
  testRunDevice?: string; // When creating from test run, auto-populate device
}

export function CreateDefectDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onDefectCreated,
  testCaseId,
  testRunEnvironment,
  testRunPlatform,
  testRunDevice,
}: CreateDefectDialogProps) {
  const { data: session } = useSession();
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string }>>([]);
  const [testCases, setTestCases] = useState<Array<{ id: string; testCaseId: string; title: string }>>([]);
  const [descriptionAttachments, setDescriptionAttachments] = useState<Attachment[]>([]);

  // Fetch dynamic dropdown options
  const { options: severityOptions } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptions } = useDropdownOptions('Defect', 'priority');
  const { options: environmentOptions } = useDropdownOptions('Defect', 'environment');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignees
        const assigneesResponse = await fetch(`/api/projects/${projectId}/members`);
        const assigneesData = await assigneesResponse.json();
        if (assigneesData.data) {
          setAssignees(
            assigneesData.data.map((member: { user: { id: string; name: string } }) => ({
              id: member.user.id,
              name: member.user.name,
            }))
          );
        }

        // Fetch test cases for the project
        const testCasesResponse = await fetch(`/api/projects/${projectId}/testcases`);
        const testCasesData = await testCasesResponse.json();
        
        if (testCasesData.data && Array.isArray(testCasesData.data)) {
          const mappedTestCases = testCasesData.data.map((tc: { id: string; tcId: string; title: string }) => ({
            id: tc.id,
            testCaseId: tc.tcId, // Use tcId from database
            title: tc.title,
          }));
          setTestCases(mappedTestCases);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [projectId]);

  // Convert test cases to SearchableSelect options (for searchable dropdown)
  const testCaseOptions = testCases.map(tc => ({
    id: tc.id,
    label: tc.testCaseId,
    subtitle: tc.title,
  }));

  const assigneeOptions = assignees.map((assignee) => ({
    value: assignee.id,
    label: assignee.name,
  }));
  const validAssigneeIds = new Set(assignees.map((assignee) => assignee.id));

  // Map dropdown options to the format expected by BaseDialog
  const SEVERITY_OPTIONS = severityOptions.map(opt => ({ value: opt.value, label: opt.label }));
  const PRIORITY_OPTIONS = priorityOptions.map(opt => ({ value: opt.value, label: opt.label }));
  const ENVIRONMENT_OPTIONS = environmentOptions.map(opt => ({ value: opt.value, label: opt.label }));

  const fields: BaseDialogField[] = [
    {
      name: 'title',
      label: 'タイトル',
      placeholder: 'Defectタイトルを入力',
      type: 'text',
      required: true,
      maxLength: 200,
      cols: 1,
    },
    // Test Case field - searchable select when from defect list, text input when from test run
    ...(testCaseId ? [{
      name: 'testCaseId',
      label: 'テストケース（自動入力）',
      type: 'text' as const,
      defaultValue: testCaseId,
      readOnly: true,
      cols: 1,
      placeholder: testCases.find(tc => tc.id === testCaseId) 
        ? `${testCases.find(tc => tc.id === testCaseId)!.testCaseId} - ${testCases.find(tc => tc.id === testCaseId)!.title}`
        : 'テストケースを読み込み中...',
    }] : [{
      name: 'testCaseId',
      label: 'テストケース（任意）',
      type: 'custom' as const,
      cols: 1,
      customRender: (value: string, onChange: (value: string) => void) => (
        <SearchableSelect
          options={testCaseOptions}
          value={value}
          onValueChange={onChange}
          label=""
          id="testCaseSearch"
          searchPlaceholder="TC-IDまたはタイトルで検索..."
          emptyMessage="該当するテストケースがありません"
          maxResults={10}
        />
      ),
    }]),
    {
      name: 'severity',
      label: '深刻度',
      type: 'select',
      required: true,
      defaultValue: 'MEDIUM',
      options: SEVERITY_OPTIONS,
      cols: 1,
    },
    {
      name: 'priority',
      label: '優先度',
      type: 'select',
      required: true,
      defaultValue: 'MEDIUM',
      options: PRIORITY_OPTIONS,
      cols: 1,
    },
    {
      name: 'assignedToId',
      label: '担当者（自動入力）',
      type: 'select',
      placeholder: '担当者を選択',
      defaultValue: session?.user?.id || '',
      options: assigneeOptions,
      cols: 1,
    },
    // Environment field - dropdown if from defect list, auto-populated if from test run
    {
      name: 'environment',
      label: testRunEnvironment ? '環境（自動入力）' : '環境',
      type: testRunEnvironment ? 'text' : 'select',
      placeholder: testRunEnvironment ? testRunEnvironment : '環境を選択',
      defaultValue: testRunEnvironment,
      options: testRunEnvironment ? undefined : ENVIRONMENT_OPTIONS,
      readOnly: !!testRunEnvironment,
      maxLength: 100,
      cols: 1,
    },
    {
      name: 'platform',
      label: testRunPlatform ? 'プラットフォーム（自動入力）' : 'プラットフォーム',
      type: testRunPlatform ? 'text' : 'select',
      placeholder: testRunPlatform ? testRunPlatform : 'プラットフォームを選択',
      defaultValue: testRunPlatform || 'none',
      options: testRunPlatform ? undefined : [
        { value: 'none', label: 'プラットフォームを選択' },
        { value: 'Web', label: 'Web' },
        { value: 'Web(SP)', label: 'Web(SP)' },
        { value: 'iOS Native', label: 'iOS Native' },
        { value: 'Android Native', label: 'Android Native' },
      ],
      readOnly: !!testRunPlatform,
      maxLength: 100,
      cols: 1,
    },
    {
      name: 'device',
      label: testRunDevice ? '端末（自動入力）' : '端末',
      type: testRunDevice ? 'text' : 'select',
      placeholder: testRunDevice ? testRunDevice : '端末を選択',
      defaultValue: testRunDevice || 'none',
      options: testRunDevice ? undefined : [
        { value: 'none', label: '端末を選択' },
        { value: 'iPhone', label: 'iPhone' },
        { value: 'Android', label: 'Android' },
        { value: 'PC', label: 'PC' },
      ],
      readOnly: !!testRunDevice,
      maxLength: 100,
      cols: 1,
    },
    {
      name: 'dueDate',
      label: '期限（任意）',
      type: 'date',
      cols: 1,
    },
    {
      name: 'progressPercentage',
      label: '進捗 %（任意）',
      type: 'number',
      placeholder: '0-100',
      min: 0,
      max: 100,
      cols: 1,
    },
    {
      name: 'description',
      label: '説明（画像・動画を添付可能）',
      type: 'custom',
      rows: 3,
      cols: 2,
      maxLength: 2000,
      customRender: (value: string, onChange: (value: string) => void) => (
        <DefectDescriptionAttachmentField
          value={value}
          onChange={onChange}
          attachments={descriptionAttachments}
          onAttachmentsChange={setDescriptionAttachments}
          projectId={projectId}
          rows={3}
          maxLength={2000}
        />
      ),
    },
  ];

  const handleDialogOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const uploadPendingAttachments = async (): Promise<Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }>> => {
    const pendingAttachments = descriptionAttachments.filter((att) => att.id.startsWith('pending-'));
    
    if (pendingAttachments.length === 0) {
      return [];
    }

    const uploadedAttachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }> = [];

    for (const attachment of pendingAttachments) {
      // @ts-expect-error - Access the pending file object
      const file = attachment._pendingFile;
      if (!file) continue;

      try {
        const result = await uploadFileToS3({
          file,
          fieldName: attachment.fieldName || 'attachment',
          entityType: 'defect',
          projectId,
          onProgress: () => {},
        });

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        if (result.attachment) {
          uploadedAttachments.push({
            id: result.attachment.id,
            s3Key: result.attachment.filename,
            fileName: file.name,
            mimeType: file.type,
            fieldName: attachment.fieldName,
          });
        }
      } catch (error) {
        console.error('Failed to upload attachment:', error);
        // 個別ファイルの失敗は無視して続行
      }
    }

    return uploadedAttachments;
  };

  const config: BaseDialogConfig = {
    title: '新規Defectを作成',
    description: 'バグの内容を入力してください。ステータスはデフォルトで「新規」になります。',
    fields,
    submitLabel: 'Defectを作成',
    cancelLabel: 'キャンセル',
    triggerOpen,
    onOpenChange: handleDialogOpenChange,
    formPersistenceKey: `create-defect-${projectId}`,
    projectId,
    submitButtonName: 'Create Defect Dialog - Create Defect',
    cancelButtonName: 'Create Defect Dialog - Cancel',
    onSubmit: async (formData) => {
      // Collect already-uploaded attachments (immediate upload mode)
      const existingUploadedAttachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }> =
        descriptionAttachments
          .filter((att) => !att.id.startsWith('pending-'))
          .map((att) => ({
            id: att.id,
            s3Key: att.filename,
            fileName: att.originalName,
            mimeType: att.mimeType,
            fieldName: att.fieldName,
          }));

      // Upload pending attachments first (failure doesn't block defect creation)
      let uploadedPendingAttachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }> = [];
      try {
        uploadedPendingAttachments = await uploadPendingAttachments();
      } catch (error) {
        console.warn('Attachment upload failed, continuing with defect creation:', error);
      }

      // Merge attachments and dedupe by id/s3Key
      const uploadedAttachments = [...existingUploadedAttachments, ...uploadedPendingAttachments].filter(
        (att, index, arr) =>
          arr.findIndex((x) => (x.id ? x.id === att.id : x.s3Key === att.s3Key)) === index
      );

      // Get test case ID from prop (passed when creating from test run) or from form data (selected from dropdown)
      const finalTestCaseId = testCaseId || formData.testCaseId || null;
      
      const rawAssignedToId = typeof formData.assignedToId === 'string' ? formData.assignedToId.trim() : '';
      const normalizedAssignedToId = rawAssignedToId !== '' && validAssigneeIds.has(rawAssignedToId)
        ? rawAssignedToId
        : null;

      const payload = {
        title: formData.title,
        description: formData.description || null,
        severity: formData.severity,
        priority: formData.priority,
        assignedToId: normalizedAssignedToId,
        environment: formData.environment && formData.environment.trim() !== '' ? formData.environment : null,
        platform: formData.platform && formData.platform.trim() !== '' && formData.platform !== 'none' ? formData.platform : null,
        device: formData.device && formData.device.trim() !== '' && formData.device !== 'none' ? formData.device : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate as string).toISOString() : undefined,
        progressPercentage: formData.progressPercentage ? Number(formData.progressPercentage) : undefined,
        status: 'NEW', // Always start as NEW as per lifecycle requirements
        testCaseIds: finalTestCaseId ? [finalTestCaseId] : undefined, // Link test case during creation
      };

      const response = await fetch(`/api/projects/${projectId}/defects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create defect');
      }

      const createdDefect = data.data;

      // Link uploaded attachments to the defect
      if (uploadedAttachments.length > 0) {
        try {
          await fetch(`/api/projects/${projectId}/defects/${createdDefect.id}/attachments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attachments: uploadedAttachments }),
          });
        } catch (error) {
          console.error('Failed to link attachments:', error);
        }
      }

      return createdDefect;
    },
    onSuccess: (result) => {
      if (result) {
        const defect = result as Defect;
        setAlert({
          type: 'success',
          title: 'Defectを作成しました',
          message: `Defect ${defect.defectId} が正常に作成されました`,
        });
        // Reset attachments state
        setDescriptionAttachments([]);
        onDefectCreated(defect);
      }
    },
  };

  return (
    <>
      <BaseDialog {...config} />
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </>
  );
}
