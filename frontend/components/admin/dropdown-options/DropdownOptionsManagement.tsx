'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import EditDropdownOptionsModal from './EditDropdownOptionsModal';
import { DropdownOption } from './types';
import { DropdownOptionsTable } from './DropdownOptionsTable';

export default function DropdownOptionsManagement() {
  const [groupedOptions, setGroupedOptions] = useState<
    Record<string, Record<string, DropdownOption[]>>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  const fetchDropdownOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dropdown-options/grouped');
      const data = await response.json();

      if (data.success) {
        setGroupedOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDropdown = (entity: string, field: string, options: DropdownOption[]) => {
    setSelectedEntity(entity);
    setSelectedField(field);
    setSelectedOptions(options);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEntity(null);
    setSelectedField(null);
    setSelectedOptions([]);
  };

  const handleSaveSuccess = () => {
    fetchDropdownOptions();
    handleModalClose();
  };

  if (loading) {
    return <Loader fullScreen text="Loading dropdown options..." />;
  }

  return (
    <div className="flex-1">
      {/* Top Bar */}
      <TopBar breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dropdown Options' }]} />

      {/* Content */}
      <div className="px-8 pt-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <PageHeaderWithBadge
            title="Dropdown Options Management"
            description="Manage dropdown options for various entities across the application"
            className="mb-6"
          />

          {/* Dropdown Options Table */}
          {Object.keys(groupedOptions).length === 0 ? (
            <div className="text-center py-12 text-white/60 bg-white/5 rounded-lg border border-white/10">
              <p>No dropdown options found.</p>
              <p className="text-sm mt-2">Run the seed script to populate dropdown options.</p>
            </div>
          ) : (
            <DropdownOptionsTable
              groupedOptions={groupedOptions}
              onEdit={handleEditDropdown}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedEntity && selectedField && (
        <EditDropdownOptionsModal
          entity={selectedEntity}
          field={selectedField}
          options={selectedOptions}
          onClose={handleModalClose}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
