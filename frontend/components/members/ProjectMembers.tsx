'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Users } from 'lucide-react';
import { ButtonPrimary } from '@/elements/button-primary';
import { Card, CardContent } from '@/elements/card';
import { Loader } from '@/elements/loader';
import { TopBar } from '@/components/design';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/design/FloatingAlert';
import { Project, ProjectMember } from './types';
import { MembersCard } from './subcomponents/MembersCard';
import { CreateAddMemberDialog } from './subcomponents/AddMemberDialog';
import { RemoveMemberDialog } from './subcomponents/RemoveMemberDialog';

interface ProjectMembersProps {
  projectId: string;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  // Check if user is admin or project manager
  const isAdminOrManager = session?.user?.roleName === 'ADMIN' || session?.user?.roleName === 'PROJECT_MANAGER';

  useEffect(() => {
    fetchProjectAndMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Team Members - ${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProjectAndMembers = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/members`),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData.data);
      } else if (projectRes.status === 404 || projectRes.status === 403) {
        // Project not found or no access - redirect after showing message
        setAlert({
          type: 'error',
          title: 'Project Not Found',
          message: 'The project you\'re looking for doesn\'t exist or has been deleted. Redirecting...',
        });
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAdded = (member: unknown) => {
    if (member) {
      const newMember = member as ProjectMember;
      setMembers([...members, newMember]);
      setAddDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Member Added',
        message: `${newMember.user?.name || 'User'} has been added to the project.`,
      });
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setDeleteDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete || !project) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'Failed to Remove Member',
          message: data.error || 'Failed to remove member from project.',
        });
        return;
      }

      setMembers(members.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Member Removed',
        message: `${memberToDelete.name} has been removed from the project.`,
      });
    } catch {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while removing the member.',
      });
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading project members..." />;
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
              <Users className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-white/70 mb-6">
            The project you&apos;re trying to access doesn&apos;t exist or has been deleted.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span>Redirecting to projects page...</span>
          </div>
        </div>
      </div>
    );
  }

  // Old fallback - keeping for safety
  if (false && !project) {
    return (
      <div className="max-w-6xl mx-auto p-8">
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-white/70">Project not found (OLD)</p>
              <ButtonPrimary
                onClick={() => router.push('/projects')}
                className="mt-4"
              >
                Back to Projects
              </ButtonPrimary>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name, href: `/projects/${projectId}` },
          { label: 'Members' },
        ]}
        actions={
          isAdminOrManager && (
            <ButtonPrimary
              size="default"
              onClick={() => setAddDialogOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </ButtonPrimary>
          )
        }
      />
      
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Project Members</h1>
          <p className="text-white/70 text-sm">
            Manage team members for <span className="font-semibold text-white">{project.name}</span>
            {!isAdminOrManager && (
              <span className="text-white/50 ml-2">(Project managers and admins can manage members)</span>
            )}
          </p>
        </div>
      </div>

      <MembersCard
        members={members}
        isAdminOrManager={isAdminOrManager}
        onRemoveMember={handleRemoveMember}
      />

      <CreateAddMemberDialog
        projectId={projectId}
        triggerOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onMemberAdded={handleMemberAdded}
      />

      <RemoveMemberDialog
        member={memberToDelete}
        triggerOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmRemoveMember}
      />

      {alert && (
        <FloatingAlert
          alert={alert}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
