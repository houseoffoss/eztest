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
      // Set attachment context when viewing/editing test case
      // Don't set entityId - files stay in browser storage until save
      attachmentStorage.setContext({
        entityType: 'testcase',
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
                          console.log(`[TestCaseDetail] Step ${step.id} attachments from API:`, stepAttachmentsList.length, 'attachments');
                          
                          // Group by fieldName
                          const actionAtts = stepAttachmentsList.filter((att: Attachment) => att.fieldName === 'action');
                          const expectedResultAtts = stepAttachmentsList.filter((att: Attachment) => att.fieldName === 'expectedResult');
                          console.log(`[TestCaseDetail] Step ${step.id} - action: ${actionAtts.length}, expectedResult: ${expectedResultAtts.length}`);
                          
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

  const uploadPendingAttachments = async (): Promise<Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }>> => {
    const allAttachments = [
      ...descriptionAttachments,
      ...expectedResultAttachments,
      ...preconditionAttachments,
      ...postconditionAttachments,
    ];

    const pendingAttachments = allAttachments.filter((att) => att.id.startsWith('pending-'));
    
    if (pendingAttachments.length === 0) {
      return []; // No pending attachments
    }

    const uploadedAttachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }> = [];

    // Upload all pending files
    for (const attachment of pendingAttachments) {
      // @ts-expect-error - Access the pending file object
      const file = attachment._pendingFile;
      if (!file) continue;

      try {
        const { uploadFileToS3 } = await import('@/lib/s3');
        const result = await uploadFileToS3({
          file,
          fieldName: attachment.fieldName || 'attachment',
          entityType: 'testcase',
          onProgress: () => {}, // Silent upload
        });

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Store the uploaded attachment info for linking
        if (result.attachment) {
          uploadedAttachments.push({
            id: result.attachment.id, // Use the database ID
            s3Key: result.attachment.filename,
            fileName: file.name,
            mimeType: file.type,
            fieldName: attachment.fieldName,
          });
        }
      } catch (error) {
        console.error('Failed to upload attachment:', error);
        throw error; // Throw error to stop save
      }
    }

    return uploadedAttachments;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload all pending attachments first
      const uploadedAttachments = await uploadPendingAttachments();

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
        // Associate uploaded attachments with the test case
        if (uploadedAttachments.length > 0) {
          try {
            console.log('Linking attachments:', uploadedAttachments);
            await fetch(`/api/testcases/${testCaseId}/attachments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ attachments: uploadedAttachments }),
            });
          } catch (error) {
            console.error('Error linking attachments:', error);
            // Don't fail the save if attachment linking fails
          }
        }

        // Update steps and get the mapping of temp IDs to real IDs
        const updatedStepAttachmentsMap = await updateSteps();
        
        // Associate step attachments using the updated mapping
        for (const stepId in updatedStepAttachmentsMap) {
          const actionAttachments = updatedStepAttachmentsMap[stepId]?.action || [];
          const expectedResultAttachments = updatedStepAttachmentsMap[stepId]?.expectedResult || [];
          const allStepAttachments = [...actionAttachments, ...expectedResultAttachments];
          
          console.log(`[handleSave] Step ${stepId} has ${allStepAttachments.length} total attachments in state`);
          
          if (allStepAttachments.length > 0) {
            // Separate pending attachments (need upload) from existing attachments (already in DB)
            const pendingAttachments = allStepAttachments.filter(att => att.id.startsWith('pending-'));
            const existingAttachments = allStepAttachments.filter(att => !att.id.startsWith('pending-'));
            
            console.log(`[handleSave] Step ${stepId}: ${pendingAttachments.length} pending, ${existingAttachments.length} existing`);
            
            if (pendingAttachments.length > 0) {
              console.log(`Uploading ${pendingAttachments.length} pending attachments for step ${stepId}`);
              // Upload pending attachments first
              const { uploadFileToS3 } = await import('@/lib/s3');
              const uploadedAttachments = await Promise.all(
                pendingAttachments.map(async (att) => {
                  try {
                    // @ts-expect-error - Access the File object
                    const file = att._pendingFile;
                    if (file) {
                      const result = await uploadFileToS3({
                        file,
                        fieldName: att.fieldName || 'action',
                        entityType: 'teststep',
                        onProgress: () => {}, // Silent upload
                      });
                      if (result.success && result.attachment) {
                        return {
                          id: result.attachment.id,
                          s3Key: result.attachment.filename,
                          fileName: file.name,
                          mimeType: file.type,
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
                  console.log(`[handleSave] Linking ${validUploadedAttachments.length} new attachments to step ${stepId}`);
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
            
            // Existing attachments are already linked to the step in the database
            // They will be reloaded when fetchTestCase() is called
            console.log(`Step ${stepId}: ${existingAttachments.length} existing attachments preserved in database`);
          }
        }
        
        setIsEditing(false);
        
        // Clear only test case level attachment states after successful save
        // DON'T clear stepAttachments - they are preserved in updatedStepAttachmentsMap
        setDescriptionAttachments([]);
        setExpectedResultAttachments([]);
        setPreconditionAttachments([]);
        setPostconditionAttachments([]);
        setNewStepActionAttachments([]);
        setNewStepExpectedResultAttachments([]);
        
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Test case updated successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        
        // Reload from database to get fresh data including any backend changes
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
      // Clean steps data - only send necessary fields to prevent backend issues
      const cleanedSteps = steps.map(step => ({
        id: step.id,
        stepNumber: step.stepNumber,
        action: step.action,
        expectedResult: step.expectedResult,
      }));
      
      const response = await fetch(`/api/testcases/${testCaseId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: cleanedSteps }),
      });

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        // Preserve all existing attachments and map temp IDs to real IDs
        const updatedStepAttachments: Record<string, Record<string, Attachment[]>> = { ...stepAttachments };
        
        steps.forEach((step, index) => {
          const realStep = data.data[index];
          if (realStep && realStep.id && step.id) {
            if (step.id.startsWith('temp-')) {
              // New step - map temp ID to real ID
              if (stepAttachments[step.id]) {
                updatedStepAttachments[realStep.id] = stepAttachments[step.id];
                // Remove the temp ID entry
                delete updatedStepAttachments[step.id];
              }
            }
            // Existing steps keep their attachments automatically since we spread stepAttachments above
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
          onCancel={() => {
            setIsEditing(false);
            // Clear any pending attachments when cancelling
            setDescriptionAttachments([]);
            setExpectedResultAttachments([]);
            setPreconditionAttachments([]);
            setPostconditionAttachments([]);
            setNewStepActionAttachments([]);
            setNewStepExpectedResultAttachments([]);
            // Refetch to restore original data
            fetchTestCase();
          }}
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
                console.log('[TestCaseDetail] Step attachment change:', { stepId, field, attachmentCount: attachments.length });
                setStepAttachments(prev => {
                  const updated = {
                    ...prev,
                    [stepId]: {
                      ...prev[stepId],
                      [field]: attachments
                    }
                  };
                  console.log('[TestCaseDetail] Updated stepAttachments:', updated);
                  return updated;
                });
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
