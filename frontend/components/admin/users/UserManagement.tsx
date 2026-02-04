'use client';

import { useEffect, useState, useMemo } from 'react';
import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { MembersList } from '@/frontend/reusable-components/users/MembersList';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { 
  Users, 
  UserPlus,
} from 'lucide-react';
import { User, Role, UserFormData, EditUserFormData } from './types';
import { AddUserDialog } from './subcomponents/AddUserDialog';
import { EditUserDialog } from './subcomponents/EditUserDialog';
import { DeleteUserDialog } from './subcomponents/DeleteUserDialog';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.data) {
        setUsers(data.data);
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Failed to Load Users',
        message: 'Could not load users list.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (data.data) {
        setRoles(data.data);
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Failed to Load Roles',
        message: 'Could not load available roles.',
      });
    }
  };

  const handleAddUser = async (formData: UserFormData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    fetchUsers();
    setAlert({
      type: 'success',
      title: 'User Added',
      message: `User "${data.data.name}" has been added successfully.`,
    });
  };

  const handleUpdateUser = async (formData: EditUserFormData) => {
    if (!selectedUser) return;

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const userName = data.data?.name || selectedUser.name || 'User';
    
    fetchUsers();
    setAlert({
      type: 'success',
      title: 'User Updated',
      message: `User "${userName}" has been updated successfully.`,
    });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const userName = selectedUser.name;
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
        setAlert({
          type: 'success',
          title: 'User Deleted',
          message: `User "${userName}" has been deleted successfully.`,
        });
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Failed to Delete User',
        message: 'Could not delete the user.',
      });
    }
  };


  // Build role filter options from roles
  const roleFilterOptions: FilterOption[] = [
    { value: 'all', label: 'All Roles' },
    ...roles.map((role) => ({
      value: role.id,
      label: role.name,
    })),
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const navbarActions = useMemo(() => {
    return [
      {
        type: 'action' as const,
        label: 'Add User',
        icon: UserPlus,
        onClick: () => setAddDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'User Management - Add User',
      },
      {
        type: 'signout' as const,
        showConfirmation: true,
      },
    ];
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Users', href: '/admin/users' },
            ]}
          />
        }
        actions={navbarActions}
      />

      {/* Page Header and Filters */}
      <div className="px-8 pt-8">
        <HeaderWithFilters
          header={
            <PageHeaderWithBadge
              title="User Management"
              description="Manage application users and assign roles"
            />
          }
          filters={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="md:col-span-2">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search users..."
                />
              </div>
              <div>
                <FilterDropdown
                  value={roleFilter}
                  onValueChange={setRoleFilter}
                  placeholder="Role"
                  options={roleFilterOptions}
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Users List */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <Loader fullScreen={false} text="Loading users..." />
          ) : (
            <MembersList
              members={filteredUsers.map((user) => ({
                id: user.id,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar,
                  role: user.role,
                },
                createdAt: user.createdAt,
              }))}
              title={`All Users (${filteredUsers.length})`}
              description="Application users and their assigned roles"
              emptyTitle="No users found"
              emptyDescription={searchQuery ? 'Try a different search term' : 'Add your first user to get started'}
              emptyIcon={Users}
              onEdit={(userId) => {
                const user = filteredUsers.find((u) => u.id === userId);
                if (user) {
                  setSelectedUser(user);
                  setEditDialogOpen(true);
                }
              }}
              onDelete={(userId) => {
                const user = filteredUsers.find((u) => u.id === userId);
                if (user) {
                  setSelectedUser(user);
                  setDeleteDialogOpen(true);
                }
              }}
              viewHref={(userId) => `/admin/users/${userId}`}
              showProjects={true}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddUserDialog
        open={addDialogOpen}
        roles={roles}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddUser}
      />

      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        roles={roles}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdateUser}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        userName={selectedUser?.name || ''}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteUser}
      />

      {/* Alerts */}
      {alert && (
        <FloatingAlert
          alert={alert}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
