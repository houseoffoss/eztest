'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Users, LogOut } from 'lucide-react';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { NotFoundState } from '@/frontend/reusable-components/errors/NotFoundState';
import { Project, ProjectMember } from './types';
import { MembersCard } from './subcomponents/MembersCard';
import { CreateAddMemberDialog } from './subcomponents/AddMemberDialog';
import { RemoveMemberDialog } from './subcomponents/RemoveMemberDialog';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

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

  const handleSignOut = () => {
    clearAllPersistedForms();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastProjectId');
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('defects-filters-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  useEffect(() => {
    fetchProjectAndMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Project Members - ${project.name} | EZTest`;
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
      <NotFoundState
        title="Project Not Found"
        message="The project you're trying to access doesn't exist or has been deleted."
        icon={Users}
        redirectingMessage="Redirecting to projects page..."
        showRedirecting={true}
      />
    );
  }


  return (
    <>
      {/* Navbar */}
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project.name, href: `/projects/${projectId}` },
              { label: 'Members' },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            {isAdminOrManager && (
              <ActionButtonGroup
                buttons={[
                  {
                    label: 'Add Member',
                    icon: Plus,
                    onClick: () => setAddDialogOpen(true),
                    variant: 'primary',
                  },
                ]}
              />
            )}
            <form action="/api/auth/signout" method="POST" onSubmit={handleSignOut}>
              <ButtonDestructive type="submit" size="default" className="px-5">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </ButtonDestructive>
            </form>
          </div>
        }
      />
      
      <div className="px-8 pt-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderWithBadge
            badge={project.key}
            title="Project Members"
            description={`Manage project members for ${project.name}${!isAdminOrManager ? ' (Project managers and admins can manage members)' : ''}`}
            className="mb-6"
          />

          <MembersCard
            members={members}
            isAdminOrManager={isAdminOrManager}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </div>

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
