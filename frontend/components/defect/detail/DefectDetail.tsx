'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/design';
import {
  FloatingAlert,
  type FloatingAlertMessage,
} from '@/components/utils/FloatingAlert';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/elements/loader';
import { ButtonSecondary } from '@/elements/button-secondary';
import { List, TestTube2, PlayCircle } from 'lucide-react';
import { Defect, DefectFormData } from './types';
import type { Attachment } from '@/lib/s3';
import {
  DefectHeader,
  DefectDetailsCard,
  DefectInfoCard,
  DeleteDefectDialog,
  LinkedTestCasesCard,
  DefectCommentsCard,
} from './subcomponents';

interface DefectDetailProps {
  projectId: string;
  defectId: string;
}

export default function DefectDetail({ projectId, defectId }: DefectDetailProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck } = usePermissions();
  const [defect, setDefect] = useState<Defect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<DefectFormData>({
    title: '',
    description: '',
    severity: 'MEDIUM',
    priority: 'MEDIUM',
    status: 'NEW',
    assignedToId: null,
    testRunId: null,
    environment: '',
    dueDate: null,
    progressPercentage: null,
  });

  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  // Attachment states
  const [descriptionAttachments, setDescriptionAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    fetchDefect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defectId]);

  useEffect(() => {
    if (defect) {
      document.title = `${defect.title} | EZTest`;
    }
  }, [defect]);

  // Check permissions
  const canUpdateDefect = hasPermissionCheck('defects:update');
  const canDeleteDefect = hasPermissionCheck('defects:delete');

  const fetchDefect = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}`);
      const data = await response.json();

      if (data.data) {
        setDefect(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          severity: data.data.severity,
          priority: data.data.priority,
          status: data.data.status,
          assignedToId: data.data.assignedToId || null,
          testRunId: data.data.testRunId || null,
          environment: data.data.environment || '',
          dueDate: data.data.dueDate ? new Date(data.data.dueDate).toISOString().split('T')[0] : null,
          progressPercentage: data.data.progressPercentage ?? null,
        });

        // Load existing attachments
        if (data.data.attachments && Array.isArray(data.data.attachments)) {
          const descAtts = data.data.attachments
            .filter((att: any) => !att.fieldName || att.fieldName === 'description')
            .map((att: any) => ({
              id: att.id,
              filename: att.filename,
              originalName: att.originalName,
              size: att.size,
              mimeType: att.mimeType,
              uploadedAt: att.uploadedAt,
              fieldName: att.fieldName,
              entityType: 'defect' as const,
            }));
          setDescriptionAttachments(descAtts);
        }
      }
    } catch (error) {
      console.error('Error fetching defect:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload pending attachments first
      const allAttachments = [...descriptionAttachments];
      const pendingAttachments = allAttachments.filter((att) => att.id.startsWith('pending-'));
      const uploadedAttachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }> = [];

      if (pendingAttachments.length > 0) {
        for (const attachment of pendingAttachments) {
          // @ts-ignore - Access the pending file object
          const file = attachment._pendingFile;
          if (!file) continue;

          try {
            const { uploadFileToS3 } = await import('@/lib/s3');
            const result = await uploadFileToS3({
              file,
              fieldName: attachment.fieldName || 'attachment',
              entityType: 'defect',
              onProgress: () => {}, // Silent upload
            });

            if (!result.success) {
              throw new Error(result.error || 'Upload failed');
            }

            // Store uploaded attachment info
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
            setSaving(false);
            setAlert({
              type: 'error',
              title: 'Upload Failed',
              message: error instanceof Error ? error.message : 'Failed to upload attachments',
            });
            return;
          }
        }
      }

      // Always include title since it's required and shouldn't change, but only send other fields if changed
      const dataToSend: Record<string, unknown> = {};
      
      // Always send title (needed for API)
      if (formData.title && formData.title.trim()) {
        dataToSend.title = formData.title;
      }
      
      // Send other fields that have values
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'title') return; // Already handled
        
        // Skip empty/null values except for specific fields that need explicit null
        if (value !== null && value !== '' && value !== undefined) {
          // Special handling for dueDate - convert from YYYY-MM-DD to ISO datetime
          if (key === 'dueDate' && typeof value === 'string') {
            try {
              const isoDateTime = new Date(`${value}T00:00:00Z`).toISOString();
              dataToSend[key] = isoDateTime;
            } catch (e) {
              console.error(`Failed to convert dueDate "${value}":`, e);
            }
          } else {
            dataToSend[key] = value;
          }
        } else if (key === 'assignedToId' && value === null) {
          // Explicitly include null for unassigned users
          dataToSend[key] = null;
        }
      });
      
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      
      if (response.ok && data.data && !Array.isArray(data.data)) {
        // Link uploaded attachments to the defect
        if (uploadedAttachments.length > 0) {
          try {
            await fetch(`/api/defects/${defectId}/attachments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ attachments: uploadedAttachments }),
            });
          } catch (error) {
            console.error('Failed to link attachments:', error);
          }
        }

        setIsEditing(false);
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Defect updated successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        fetchDefect();
      } else {
        const errorMessage = Array.isArray(data.data) 
          ? data.data.map((e: { path?: string[]; message: string }) => `${e.path?.join('.') || 'Field'}: ${e.message}`).join(', ')
          : data.message || 'Failed to update defect';
        setAlert({
          type: 'error',
          title: 'Failed to Update Defect',
          message: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error updating defect:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDefect = async () => {
    const response = await fetch(`/api/projects/${projectId}/defects/${defectId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Defect deleted successfully',
      });
      setTimeout(() => {
        router.push(`/projects/${projectId}/defects`);
      }, 1500);
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete defect');
    }
  };

  const handleReopen = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      const data = await response.json();

      if (data.data) {
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Defect reopened successfully',
        });
        setTimeout(() => setAlert(null), 5000);
        fetchDefect();
      } else {
        setAlert({
          type: 'error',
          title: 'Failed to Reopen Defect',
          message: data.error || 'Failed to reopen defect',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Error reopening defect:', error);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading defect..." />;
  }

  if (!defect) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Defect not found</p>
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
            label: defect.project.name,
            href: `/projects/${defect.project.id}`,
          },
          {
            label: 'Defects',
            href: `/projects/${defect.project.id}/defects`,
          },
          { label: defect.title },
        ]}
      />

      <div className="p-4 md:p-6 lg:p-8">
        <DefectHeader
          defect={defect}
          isEditing={isEditing}
          formData={formData}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            setIsEditing(false);
            // Reset form data to original values
            setFormData({
              title: defect.title,
              description: defect.description || '',
              severity: defect.severity,
              priority: defect.priority,
              status: defect.status,
              assignedToId: defect.assignedToId || null,
              testRunId: defect.testRunId || null,
              environment: defect.environment || '',
              dueDate: defect.dueDate ? new Date(defect.dueDate).toISOString().split('T')[0] : null,
              progressPercentage: defect.progressPercentage ?? null,
            });
          }}
          onSave={handleSave}
          onDelete={() => setDeleteDialogOpen(true)}
          onReopen={handleReopen}
          onFormChange={setFormData}
          saving={saving}
          canUpdate={canUpdateDefect}
          canDelete={canDeleteDefect}
        />

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <ButtonSecondary
            onClick={() =>
              router.push(`/projects/${defect.project.id}/defects`)
            }
          >
            <List className="w-4 h-4 mr-2" />
            View All Defects
          </ButtonSecondary>
          <ButtonSecondary
            onClick={() =>
              router.push(`/projects/${defect.project.id}/testcases`)
            }
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            View All Test Cases
          </ButtonSecondary>
          <ButtonSecondary
            onClick={() =>
              router.push(`/projects/${defect.project.id}/testruns`)
            }
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            View All Test Runs
          </ButtonSecondary>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DefectDetailsCard
              defect={defect}
              isEditing={isEditing}
              formData={formData}
              onFormChange={setFormData}
              descriptionAttachments={descriptionAttachments}
              onDescriptionAttachmentsChange={setDescriptionAttachments}
            />
            <LinkedTestCasesCard defect={defect} onRefresh={fetchDefect} />
            <DefectCommentsCard projectId={projectId} defectId={defectId} />
          </div>

          <div className="space-y-6">
            <DefectInfoCard defect={defect} />
          </div>
        </div>

        <DeleteDefectDialog
          defect={defect}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteDefect}
        />
      </div>
    </div>
  );
}
