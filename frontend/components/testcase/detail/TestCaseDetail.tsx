'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
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
import { uploadFileToS3 } from '@/lib/s3';

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
    testData: '',
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

  // Sync first step's expectedResult attachments when entering edit mode
  // This ensures attachments added during creation are preserved when editing
  useEffect(() => {
    if (isEditing && steps.length > 0 && steps[0]?.id && expectedResultAttachments.length > 0) {
      const firstStepId = steps[0].id;
      const firstStep = steps[0];
      
      // Only sync if the first step has expectedResult text and no step-level attachments yet
      if (firstStep.expectedResult) {
        setStepAttachments(prev => {
          const currentStepAtts = prev[firstStepId];
          // Only sync if step attachments don't exist or expectedResult is empty
          if (!currentStepAtts || !currentStepAtts.expectedResult || currentStepAtts.expectedResult.length === 0) {
            const updated = { ...prev };
            if (!updated[firstStepId]) {
              updated[firstStepId] = { action: [], expectedResult: [] };
            }
            // Only set if not already present to avoid overwriting existing attachments
            if (!updated[firstStepId].expectedResult || updated[firstStepId].expectedResult.length === 0) {
              updated[firstStepId] = {
                ...updated[firstStepId],
                expectedResult: [...expectedResultAttachments]
              };
              return updated;
            }
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

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
          testData: data.data.testData || '',
          priority: data.data.priority,
          status: data.data.status,
          estimatedTime: data.data.estimatedTime?.toString() || '',
          preconditions: data.data.preconditions || '',
          postconditions: data.data.postconditions || '',
          suiteId: data.data.suiteId || null,
          moduleId: data.data.moduleId || null,
          rtcId: data.data.rtcId || undefined,
          flowId: data.data.flowId || undefined,
          layer: data.data.layer || undefined,
          testType: data.data.testType || undefined,
          evidence: data.data.evidence || undefined,
          notes: data.data.notes || undefined,
          platform: data.data.platform || undefined,
          device: data.data.device || undefined,
          domain: data.data.domain || undefined,
          functionName: data.data.functionName || undefined,
          executionType: data.data.executionType || undefined,
          automationStatus: data.data.automationStatus || undefined,
        });

        // Initialize steps and ensure the test case level expected result is
        // always reflected in the first step's expected result for display/editing.
        let apiSteps: TestStep[] = data.data.steps || [];

        if (data.data.expectedResult) {
          if (apiSteps.length === 0) {
            // No steps yet: create an initial first step with the expected result.
            apiSteps = [
              {
                id: `temp-initial-${Date.now()}`,
                stepNumber: 1,
                action: '',
                expectedResult: data.data.expectedResult,
              },
            ];
          } else {
            // Only sync test case expected result to first step if first step doesn't already have one
            // This prevents overwriting individual step expected results when multiple expected results exist
            const firstStep = apiSteps[0];
            if (!firstStep.expectedResult || firstStep.expectedResult.trim() === '') {
              // First step has no expected result - use test case level one
              apiSteps[0] = {
                ...firstStep,
                expectedResult: data.data.expectedResult,
              };
            }
            // If first step already has an expected result, don't overwrite it
            // This preserves individual step expected results when multiple were imported
          }
        }

        setSteps(apiSteps);
        
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
              // Filter attachments by fieldName
              const descAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'description');
              const expResultAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'expectedResult');
              const preCondAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'preconditions');
              const postCondAttachments = attachmentsData.data.filter((att: Attachment) => att.fieldName === 'postconditions');
              
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
              
              // If there's a first step with expectedResult text and test case level has expectedResult attachments,
              // associate those attachments with the first step if it doesn't already have step-level attachments.
              // This handles the case where expectedResult attachments were added during test case creation.
              if (apiSteps.length > 0 && apiSteps[0] && apiSteps[0].stepNumber === 1 && expResultAttachments.length > 0) {
                const firstStep = apiSteps[0];
                const firstStepId = firstStep.id;
                
                // Only apply if the first step has expectedResult text (matches test case expectedResult or is a temp step)
                if (firstStepId && firstStep.expectedResult) {
                  // Initialize step attachments if not already present
                  if (!stepAtts[firstStepId]) {
                    stepAtts[firstStepId] = {
                      action: [],
                      expectedResult: []
                    };
                  }
                  // If the first step has no expectedResult attachments but test case level has them,
                  // use the test case level attachments
                  if (!stepAtts[firstStepId].expectedResult || stepAtts[firstStepId].expectedResult.length === 0) {
                    stepAtts[firstStepId].expectedResult = [...expResultAttachments];
                  }
                }
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
        const result = await uploadFileToS3({
          file,
          fieldName: attachment.fieldName || 'attachment',
          entityType: 'testcase',
          projectId: testCase?.project?.id,
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

      // Keep the test case level expectedResult in sync with the first step's
      // expected result when it's provided. If the first step's expected
      // result is cleared/empty, preserve the existing test case
      // expectedResult so saves (like action-only edits) still succeed.
      const firstStepExpectedResult = steps[0]?.expectedResult?.trim() || '';
      const updatedFormData: TestCaseFormData = {
        ...formData,
        expectedResult: firstStepExpectedResult || formData.expectedResult,
      };
      setFormData(updatedFormData);

      const response = await fetch(`/api/testcases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFormData,
          estimatedTime,
        }),
      });

      const data = await response.json();

      if (data.data) {
        // Associate uploaded attachments with the test case
        if (uploadedAttachments.length > 0) {
          try {
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
        const { attachmentsMap: updatedStepAttachmentsMap, updatedSteps } = await updateSteps();
        
        // After updating steps, ensure expectedResult attachments are linked to first step
        // This handles existing test cases that have expectedResult attachments at test case level
        // but not linked to the first step yet (follows same pattern as expectedResult text)
        const existingExpectedResultAttachments = expectedResultAttachments.filter(att => !att.id.startsWith('pending-'));
        const newlyUploadedExpectedResultAttachments = uploadedAttachments.filter(att => att.fieldName === 'expectedResult');
        
        if ((existingExpectedResultAttachments.length > 0 || newlyUploadedExpectedResultAttachments.length > 0) && 
            updatedSteps.length > 0 && updatedSteps[0]?.id) {
          const firstStep = updatedSteps[0];
          const firstStepId = firstStep.id;
          
          if (firstStepId && !firstStepId.startsWith('temp-')) {
            // Check if first step already has expectedResult attachments
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const firstStepHasExpectedResultAtts = updatedStepAttachmentsMap[firstStepId]?.expectedResult?.length > 0;
            
            // If first step has expectedResult text, merge test case level attachments with step-level ones
            if (firstStep.expectedResult) {
              try {
                // Fetch existing step attachments to merge with test case level ones
                let existingStepAttachments: Attachment[] = [];
                try {
                  const stepAttResponse = await fetch(`/api/teststeps/${firstStepId}/attachments`);
                  if (stepAttResponse.ok) {
                    const stepAttData = await stepAttResponse.json();
                    existingStepAttachments = stepAttData.data || [];
                    // Filter for expectedResult attachments
                    const existingStepExpectedResultAtts = existingStepAttachments.filter((att: Attachment) => att.fieldName === 'expectedResult');
                    
                    // Merge with test case level attachments, avoiding duplicates
                    const existingIds = new Set(existingStepExpectedResultAtts.map((att: Attachment) => att.id));
                    const testCaseLevelAttsToAdd = existingExpectedResultAttachments.filter(att => !existingIds.has(att.id));
                    
                    // Combine all expectedResult attachments for linking
                    const allExpectedResultAttachments = [
                      ...existingStepExpectedResultAtts,
                      ...testCaseLevelAttsToAdd,
                      ...newlyUploadedExpectedResultAttachments
                    ];
                    
                    const attachmentsToLink = allExpectedResultAttachments.map(att => ({ 
                      id: att.id, 
                      fieldName: 'expectedResult' as const 
                    }));
                    
                    if (attachmentsToLink.length > 0) {
                      await fetch(`/api/teststeps/${firstStepId}/attachments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attachments: attachmentsToLink }),
                      });
                    }
                  }
                } catch (fetchError) {
                  console.error(`Error fetching existing step attachments for ${firstStepId}:`, fetchError);
                  // Fallback: just link test case level attachments
                  const attachmentsToLink = [
                    ...existingExpectedResultAttachments.map(att => ({ id: att.id, fieldName: 'expectedResult' as const })),
                    ...newlyUploadedExpectedResultAttachments.map(att => ({ id: att.id, fieldName: 'expectedResult' as const })),
                  ];
                  
                  if (attachmentsToLink.length > 0) {
                    await fetch(`/api/teststeps/${firstStepId}/attachments`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ attachments: attachmentsToLink }),
                    });
                  }
                }
              } catch (error) {
                console.warn('Failed to link expectedResult attachments to first step:', error);
                // Non-critical - attachments are still at test case level and will be displayed via frontend logic
              }
            }
          }
        }
        
        // Associate step attachments using the updated mapping
        for (const stepId in updatedStepAttachmentsMap) {
          // Skip temporary step IDs - they don't exist in database yet
          if (stepId.startsWith('temp-')) {
            continue;
          }
          
          const actionAttachments = updatedStepAttachmentsMap[stepId]?.action || [];
          const expectedResultAttachments = updatedStepAttachmentsMap[stepId]?.expectedResult || [];
          const allStepAttachments = [...actionAttachments, ...expectedResultAttachments];
          
          // Fetch existing attachments from database to ensure we don't lose any
          let existingDbAttachments: Attachment[] = [];
          try {
            const existingResponse = await fetch(`/api/teststeps/${stepId}/attachments`);
            if (existingResponse.ok) {
              const existingData = await existingResponse.json();
              existingDbAttachments = existingData.data || [];
            }
          } catch (error) {
            console.error(`Error fetching existing attachments for step ${stepId}:`, error);
          }
          
          // Separate pending attachments (need upload) from existing attachments (already in DB)
          const pendingAttachments = allStepAttachments.filter(att => att.id.startsWith('pending-'));
          const existingStateAttachments = allStepAttachments.filter(att => !att.id.startsWith('pending-'));
          
          // Merge existing DB attachments with state attachments, avoiding duplicates
          const existingAttachmentIds = new Set(existingStateAttachments.map(att => att.id));
          const additionalDbAttachments = existingDbAttachments.filter(att => !existingAttachmentIds.has(att.id));
          const allExistingAttachments = [...existingStateAttachments, ...additionalDbAttachments];
          
          if (pendingAttachments.length > 0) {
            // Upload pending attachments first
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
                      projectId: testCase?.project?.id,
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
            
            // Combine existing and newly uploaded attachments
            const allAttachmentsToLink = [
              ...allExistingAttachments.map(att => ({ id: att.id, fieldName: att.fieldName || 'action' })),
              ...validUploadedAttachments.map(att => ({ id: att.id, fieldName: att.fieldName || 'action' }))
            ];
            
            if (allAttachmentsToLink.length > 0) {
              try {
                await fetch(`/api/teststeps/${stepId}/attachments`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ attachments: allAttachmentsToLink }),
                });
              } catch (error) {
                console.error(`Error associating attachments for step ${stepId}:`, error);
              }
            }
          } else if (allExistingAttachments.length > 0) {
            // No new attachments, but ensure existing ones are properly linked
            const attachmentsToLink = allExistingAttachments.map(att => ({ 
              id: att.id, 
              fieldName: att.fieldName || 'action' 
            }));
            
            try {
              await fetch(`/api/teststeps/${stepId}/attachments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attachments: attachmentsToLink }),
              });
            } catch (error) {
              console.error(`Error ensuring existing attachments for step ${stepId}:`, error);
            }
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

  const updateSteps = async (): Promise<{ attachmentsMap: Record<string, Record<string, Attachment[]>>; updatedSteps: TestStep[] }> => {
    try {
      // Clean steps data - only send necessary fields to prevent backend issues.
      // Also drop any steps where both action and expectedResult are empty,
      // and re-number remaining steps sequentially.
      const nonEmptySteps = steps.filter(
        (step) =>
          step.action.trim().length > 0 ||
          step.expectedResult.trim().length > 0
      );

      const cleanedSteps = nonEmptySteps.map((step, index) => ({
        id: step.id,
        stepNumber: index + 1,
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
        
        nonEmptySteps.forEach((step, index) => {
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
        // Return both the updated attachments map and updated steps for immediate use
        return { attachmentsMap: updatedStepAttachments, updatedSteps: data.data };
      } else {
        console.error('Failed to update steps:', data.error);
        return { attachmentsMap: stepAttachments, updatedSteps: steps };
      }
    } catch (error) {
      console.error('Error updating steps:', error);
      return { attachmentsMap: stepAttachments, updatedSteps: steps };
    }
  };

  const handleAddStep = () => {
    // Allow creating a step with either Action, Expected Result, or both.
    // Only enforce that at least one of them is provided.
    if (!newStep.action.trim() && !newStep.expectedResult.trim()) {
      setAlert({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please fill in Action or Expected Result',
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
        <ActionButtonGroup
          buttons={[
            {
              label: 'View All Test Cases',
              icon: TestTube2,
              onClick: () => router.push(`/projects/${testCase.project.id}/testcases`),
              variant: 'secondary',
            },
            {
              label: 'View Test Suite',
              icon: Folder,
              onClick: () => router.push(`/projects/${testCase.project.id}/testsuites/${testCase.suite?.id}`),
              variant: 'secondary',
              show: !!testCase.suite,
            },
            {
              label: 'View All Test Suites',
              icon: Folder,
              onClick: () => router.push(`/projects/${testCase.project.id}/testsuites`),
              variant: 'secondary',
            },
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TestCaseDetailsCard
              testCase={testCase}
              isEditing={isEditing}
              formData={formData}
              modules={modules}
              onFormChange={setFormData}
              projectId={testCase?.project?.id}
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
              projectId={testCase?.project?.id}
              stepAttachments={stepAttachments}
              onStepAttachmentsChange={(stepId, field, attachments) => {
                setStepAttachments(prev => {
                  const updated = {
                    ...prev,
                    [stepId]: {
                      ...prev[stepId],
                      [field]: attachments
                    }
                  };
                  return updated;
                });
              }}
              testCaseId={testCaseId}
              newStepActionAttachments={newStepActionAttachments}
              newStepExpectedResultAttachments={newStepExpectedResultAttachments}
              onNewStepActionAttachmentsChange={setNewStepActionAttachments}
              onNewStepExpectedResultAttachmentsChange={setNewStepExpectedResultAttachments}
            />

            <LinkedDefectsCard testCase={testCase} onRefresh={fetchTestCase} />

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
