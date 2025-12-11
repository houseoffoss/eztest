'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/design';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/elements/loader';
import { ButtonSecondary } from '@/elements/button-secondary';
import { TestTube2, Folder } from 'lucide-react';
import { TestCase, TestCaseFormData, TestStep } from './types';
import { Module } from '../types';
import { TestCaseHeader } from './subcomponents/TestCaseHeader';
import { TestCaseDetailsCard } from './subcomponents/TestCaseDetailsCard';
import { TestStepsCard } from './subcomponents/TestStepsCard';
import { TestCaseInfoCard } from './subcomponents/TestCaseInfoCard';
import { TestCaseHistoryCard } from './subcomponents/TestCaseHistoryCard';
import { LinkedDefectsCard } from './subcomponents/LinkedDefectsCard';
import { DeleteTestCaseDialog } from './subcomponents/DeleteTestCaseDialog';
import { attachmentStorage } from '@/lib/attachment-storage';
import type { Attachment } from '@/lib/s3';

interface TestCaseDetailProps {
  testCaseId: string;
}

export default function TestCaseDetail({ testCaseId }: TestCaseDetailProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck } = usePermissions();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const [formData, setFormData] = useState<TestCaseFormData>({
    title: '',
    description: '',
    expectedResult: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    estimatedTime: '',
    preconditions: '',
    postconditions: '',
    suiteId: null,
    moduleId: null,
  });

  const [steps, setSteps] = useState<TestStep[]>([]);
  const [newStep, setNewStep] = useState({ action: '', expectedResult: '' });
  const [addingStep, setAddingStep] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [descriptionAttachments, setDescriptionAttachments] = useState<Attachment[]>([]);
  const [expectedResultAttachments, setExpectedResultAttachments] = useState<Attachment[]>([]);
  const [preconditionAttachments, setPreconditionAttachments] = useState<Attachment[]>([]);
  const [postconditionAttachments, setPostconditionAttachments] = useState<Attachment[]>([]);
  const [stepAttachments, setStepAttachments] = useState<Record<string, Record<string, Attachment[]>>>({});
  const [newStepActionAttachments, setNewStepActionAttachments] = useState<Attachment[]>([]);
  const [newStepExpectedResultAttachments, setNewStepExpectedResultAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCaseId]);

  useEffect(() => {
    if (testCase) {
      document.title = `${testCase.title} | EZTest`;
      // Set attachment context when viewing test case
      attachmentStorage.setContext({
        entityType: 'testcase',
        entityId: testCaseId,
        projectId: testCase.project.id,
      });
    }
  }, [testCase, testCaseId]);

  // Check permissions
  const canUpdateTestCase = hasPermissionCheck('testcases:update');
  const canDeleteTestCase = hasPermissionCheck('testcases:delete');

  const fetchTestCase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testcases/${testCaseId}`);
      const data = await response.json();

      if (data.data) {
        setTestCase(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          expectedResult: data.data.expectedResult || '',
          priority: data.data.priority,
          status: data.data.status,
          estimatedTime: data.data.estimatedTime?.toString() || '',
          preconditions: data.data.preconditions || '',
          postconditions: data.data.postconditions || '',
          suiteId: data.data.suiteId || null,
          moduleId: data.data.moduleId || null,
        });
        setSteps(data.data.steps || []);
        
        // Fetch attachments for all fields
        if (data.data.id) {
          try {
            const attachmentsResponse = await fetch(`/api/testcases/${data.data.id}/attachments`);
            if (!attachmentsResponse.ok) {
              console.error('Failed to fetch attachments:', attachmentsResponse.status);
              return;
            }
            const attachmentsData = await attachmentsResponse.json();
            if (attachmentsData.data && Array.isArray(attachmentsData.data)) {
              console.log('Fetched attachments:', attachmentsData.data);
              
              // Filter attachments by fieldName
              const descAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'description');
              const expResultAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'expectedResult');
              const preCondAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'preconditions');
              const postCondAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'postconditions');
              
              console.log('Description attachments:', descAttachments);
              console.log('Expected result attachments:', expResultAttachments);
              console.log('Preconditions attachments:', preCondAttachments);
              console.log('Postconditions attachments:', postCondAttachments);
              
              setDescriptionAttachments(descAttachments);
              setExpectedResultAttachments(expResultAttachments);
              setPreconditionAttachments(preCondAttachments);
              setPostconditionAttachments(postCondAttachments);
              
              // Group step attachments by stepId and fieldName
              const stepAtts: Record<string, Record<string, Attachment[]>> = {};
              
              // Fetch attachments for each step
              if (data.data.steps && Array.isArray(data.data.steps)) {
                await Promise.all(
                  data.data.steps.map(async (step: TestStep) => {
                    if (step.id) {
                      try {
                        const stepAttachmentsResponse = await fetch(`/api/teststeps/${step.id}/attachments`);
                        if (stepAttachmentsResponse.ok) {
                          const stepAttachmentsData = await stepAttachmentsResponse.json();
                          const stepAttachmentsList = stepAttachmentsData.data || [];
                          console.log('[TestCaseDetail] Step attachments from API:', stepAttachmentsList);
                          
                          // Group by fieldName
                          const actionAtts = stepAttachmentsList.filter((att: Attachment) => att.fieldName === 'action');
                          const expectedResultAtts = stepAttachmentsList.filter((att: Attachment) => att.fieldName === 'expectedResult');
                          
                          stepAtts[step.id] = {
                            action: actionAtts,
                            expectedResult: expectedResultAtts
                          };
                        } else {
                          // Initialize empty if fetch fails
                          stepAtts[step.id] = {
                            action: [],
                            expectedResult: []
                          };
                        }
                      } catch (error) {
                        console.error(`Error fetching attachments for step ${step.id}:`, error);
                        stepAtts[step.id] = {
                          action: [],
                          expectedResult: []
                        };
                      }
                    }
                  })
                );
              }
              
              setStepAttachments(stepAtts);
            }
          } catch (error) {
            console.error('Error fetching attachments:', error);
          }
        }
        
        // Fetch modules for the project
        if (data.data.project?.id) {
          try {
            const modulesResponse = await fetch(`/api/projects/${data.data.project.id}/modules`);
            const modulesData = await modulesResponse.json();
            if (modulesData.data) {
              setModules(modulesData.data);
            }
          } catch (error) {
            console.error('Error fetching modules:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching test case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const estimatedTime = formData.estimatedTime
        ? parseInt(formData.estimatedTime)
        : undefined;

      const response = await fetch(`/api/testcases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedTime,
        }),
      });

      const data = await response.json();

      if (data.data) {
        // Update steps and get the mapping of temp IDs to real IDs
        const updatedStepAttachmentsMap = await updateSteps();
        
        // Associate any completed attachments with the test case
        const completedAttachments = attachmentStorage.getCompletedAttachmentKeys();
        if (completedAttachments.length > 0) {
          try {
            await fetch(`/api/testcases/${testCaseId}/attachments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ attachments: completedAttachments }),
            });
          } catch (error) {
            console.error('Error associating attachments:', error);
            // Don't fail the save if attachment linking fails
          }
        }
        
        // Associate step attachments using the updated mapping
        for (const stepId in updatedStepAttachmentsMap) {
          const actionAttachments = updatedStepAttachmentsMap[stepId]?.action || [];
          const expectedResultAttachments = updatedStepAttachmentsMap[stepId]?.expectedResult || [];
          const allStepAttachments = [...actionAttachments, ...expectedResultAttachments];
          
          if (allStepAttachments.length > 0) {
            // Check if attachments are pending (need to be uploaded)
            const pendingAttachments = allStepAttachments.filter(att => att.id.startsWith('pending-'));
            
            if (pendingAttachments.length > 0) {
              console.log(`Uploading ${pendingAttachments.length} pending attachments for step ${stepId}`);
              // Upload pending attachments first
              const { uploadFileToS3 } = await import('@/lib/s3/upload-utils');
              const uploadedAttachments = await Promise.all(
                pendingAttachments.map(async (att) => {
                  try {
                    // @ts-ignore - Access the File object
                    const file = att._pendingFile as File;
                    if (file) {
                      const result = await uploadFileToS3({
                        file,
                        fieldName: att.fieldName || 'action',
                        entityId: stepId,
                        entityType: 'teststep'
                      });
                      if (result.success && result.attachment) {
                        return {
                          id: result.attachment.id,
                          fieldName: att.fieldName || 'action'
                        };
                      }
                    }
                  } catch (error) {
                    console.error('Error uploading attachment:', error);
                    return null;
                  }
                  return null;
                })
              );
              
              const validUploadedAttachments = uploadedAttachments.filter(att => att !== null);
              
              if (validUploadedAttachments.length > 0) {
                try {
                  await fetch(`/api/teststeps/${stepId}/attachments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attachments: validUploadedAttachments }),
                  });
                } catch (error) {
                  console.error(`Error associating uploaded attachments for step ${stepId}:`, error);
                }
              }
            }
            
            // Skip existing attachments - they're already linked to the step
            // Only newly uploaded attachments (from pending state) need to be associated
            console.log(`Step ${stepId}: Skipping ${allStepAttachments.length - pendingAttachments.length} existing attachments (already linked)`);
          }
        }
        
        setIsEditing(false);
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Test case updated successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        fetchTestCase();
      } else {
        setAlert({
          type: 'error',
          title: 'Failed to Update Test Case',
          message: data.error || 'Failed to update test case',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error updating test case:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSteps = async () => {
    try {
      const response = await fetch(`/api/testcases/${testCaseId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        // Map temp step IDs to real step IDs returned from backend
        const updatedStepAttachments = { ...stepAttachments };
        
        steps.forEach((step, index) => {
          if (step.id && step.id.startsWith('temp-')) {
            const realStep = data.data[index];
            if (realStep && realStep.id) {
              // Move attachments from temp ID to real ID
              if (updatedStepAttachments[step.id]) {
                updatedStepAttachments[realStep.id] = updatedStepAttachments[step.id];
                delete updatedStepAttachments[step.id];
              }
            }
          }
        });
        
        setStepAttachments(updatedStepAttachments);
        // Update steps with real IDs
        setSteps(data.data);
        // Return the updated attachments map for immediate use
        return updatedStepAttachments;
      } else {
        console.error('Failed to update steps:', data.error);
        return stepAttachments;
      }
    } catch (error) {
      console.error('Error updating steps:', error);
      return stepAttachments;
    }
  };

  const handleAddStep = () => {
    if (!newStep.action || !newStep.expectedResult) {
      setAlert({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please fill in both action and expected result',
      });
      return;
    }

    const maxStepNumber =
      steps.length > 0 ? Math.max(...steps.map((s) => s.stepNumber)) : 0;

    // Create a temporary ID for the new step
    const tempStepId = `temp-${Date.now()}`;

    const newStepData = {
      id: tempStepId,
      stepNumber: maxStepNumber + 1,
      action: newStep.action,
      expectedResult: newStep.expectedResult,
    };

    setSteps([...steps, newStepData]);

    // Store attachments for the new step
    if (newStepActionAttachments.length > 0 || newStepExpectedResultAttachments.length > 0) {
      setStepAttachments(prev => ({
        ...prev,
        [tempStepId]: {
          action: newStepActionAttachments,
          expectedResult: newStepExpectedResultAttachments
        }
      }));
    }

    // Clear the form and attachments
    setNewStep({ action: '', expectedResult: '' });
    setNewStepActionAttachments([]);
    setNewStepExpectedResultAttachments([]);
    setAddingStep(false);
  };

  const handleRemoveStep = (stepNumber: number) => {
    const filtered = steps.filter((s) => s.stepNumber !== stepNumber);
    const renumbered = filtered.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
    setSteps(renumbered);
  };

  const handleDeleteTestCase = async () => {
    const response = await fetch(`/api/testcases/${testCaseId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Test case deleted successfully',
      });
      setTimeout(() => {
        router.push(`/projects/${testCase?.project.id}/testcases`);
      }, 1500);
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete test case');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading test case..." />;
  }

  if (!testCase) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Test case not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          {
            label: testCase.project.name,
            href: `/projects/${testCase.project.id}`,
          },
          {
            label: 'Test Cases',
            href: `/projects/${testCase.project.id}/testcases`,
          },
          { label: testCase.title },
        ]}
      />

      <div className="p-4 md:p-6 lg:p-8">
        <TestCaseHeader
          testCase={testCase}
          isEditing={isEditing}
          formData={formData}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
          onDelete={() => setDeleteDialogOpen(true)}
          saving={saving}
          onFormChange={setFormData}
          canUpdate={canUpdateTestCase}
          canDelete={canDeleteTestCase}
        />

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <ButtonSecondary
            onClick={() => router.push(`/projects/${testCase.project.id}/testcases`)}
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            View All Test Cases
          </ButtonSecondary>
          {testCase.suite && (
            <ButtonSecondary
              onClick={() => router.push(`/projects/${testCase.project.id}/testsuites/${testCase.suite?.id}`)}
            >
              <Folder className="w-4 h-4 mr-2" />
              View Test Suite
            </ButtonSecondary>
          )}
          <ButtonSecondary
            onClick={() => router.push(`/projects/${testCase.project.id}/testsuites`)}
          >
            <Folder className="w-4 h-4 mr-2" />
            View All Test Suites
          </ButtonSecondary>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TestCaseDetailsCard
              testCase={testCase}
              isEditing={isEditing}
              formData={formData}
              modules={modules}
              onFormChange={setFormData}
              descriptionAttachments={descriptionAttachments}
              expectedResultAttachments={expectedResultAttachments}
              preconditionAttachments={preconditionAttachments}
              postconditionAttachments={postconditionAttachments}
              onDescriptionAttachmentsChange={setDescriptionAttachments}
              onExpectedResultAttachmentsChange={setExpectedResultAttachments}
              onPreconditionAttachmentsChange={setPreconditionAttachments}
              onPostconditionAttachmentsChange={setPostconditionAttachments}
            />

            <TestStepsCard
              steps={steps}
              isEditing={isEditing}
              addingStep={addingStep}
              newStep={newStep}
              onStepsChange={setSteps}
              onAddingStepChange={setAddingStep}
              onNewStepChange={setNewStep}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
              stepAttachments={stepAttachments}
              onStepAttachmentsChange={(stepId, field, attachments) => {
                setStepAttachments(prev => ({
                  ...prev,
                  [stepId]: {
                    ...prev[stepId],
                    [field]: attachments
                  }
                }));
              }}
              testCaseId={testCaseId}
              newStepActionAttachments={newStepActionAttachments}
              newStepExpectedResultAttachments={newStepExpectedResultAttachments}
              onNewStepActionAttachmentsChange={setNewStepActionAttachments}
              onNewStepExpectedResultAttachmentsChange={setNewStepExpectedResultAttachments}
            />

            <LinkedDefectsCard testCase={testCase} />

            <TestCaseHistoryCard testCaseId={testCaseId} />
          </div>

          <div className="space-y-6">
            <TestCaseInfoCard testCase={testCase} />
          </div>
        </div>

        <DeleteTestCaseDialog
          testCase={testCase}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTestCase}
        />
      </div>
    </div>
  );
}
