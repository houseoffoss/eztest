// ============================================
// REUSABLE COMPONENTS - Barrel Exports
// ============================================

// Alerts
export { FloatingAlert } from './alerts/FloatingAlert';
export type { FloatingAlertMessage } from './alerts/FloatingAlert';

// Attachments
export { AttachmentDisplay } from './attachments/AttachmentDisplay';
export { AttachmentField } from './attachments/AttachmentField';
export { AttachmentUpload } from './attachments/AttachmentUpload';
export type { AttachmentUploadProps } from './attachments/AttachmentUpload';

// Auth
export { OtpVerification } from './auth/OtpVerification';

// Badges
export { StatusBadge } from './badges/StatusBadge';
export type { StatusBadgeProps, TestStatus } from './badges/StatusBadge';
export { PriorityBadge } from './badges/PriorityBadge';
export type { PriorityBadgeProps, Priority } from './badges/PriorityBadge';
export { ProgressBar } from './badges/ProgressBar';
export type { ProgressBarProps } from './badges/ProgressBar';

// Cards
export { DataCard } from './cards/DataCard';
export { DetailCard } from './cards/DetailCard';
export type { DetailCardProps } from './cards/DetailCard';
export { FeatureCard } from './cards/FeatureCard';
export { ItemCard } from './cards/ItemCard';
export { StatCard } from './cards/StatCard';
export type { StatCardProps } from './cards/StatCard';
export { UserCard } from './cards/UserCard';
export type { UserCardProps } from './cards/UserCard';
export { EmptyStateSimple } from './cards/EmptyStateSimple';
export type { EmptyStateSimpleProps } from './cards/EmptyStateSimple';
export { EmptyStateCard } from './cards/EmptyStateCard';

// Dialogs
export { BaseDialog } from './dialogs/BaseDialog';
export type { BaseDialogConfig, BaseDialogField } from './dialogs/BaseDialog';
export { BaseConfirmDialog } from './dialogs/BaseConfirmDialog';
export type { BaseConfirmDialogConfig } from './dialogs/BaseConfirmDialog';
export { ConfirmDialog } from './dialogs/ConfirmDialog';
export type { ConfirmDialogProps } from './dialogs/ConfirmDialog';
export { ConfirmDeleteDialog } from './dialogs/ConfirmDeleteDialog';
export type { ConfirmDeleteDialogProps } from './dialogs/ConfirmDeleteDialog';
export { CreateDialog } from './dialogs/CreateDialog';
export type { CreateDialogProps } from './dialogs/CreateDialog';
export { FileImportDialog } from './dialogs/FileImportDialog';
export type { FileImportDialogProps } from './dialogs/FileImportDialog';
export { AddModulesAndTestCasesDialog } from './dialogs/AddModulesAndTestCasesDialog';

// Emails
export { SendEmailDialog } from './emails/SendEmailDialog';

// Empty States
export { EmptyState } from './empty-states/EmptyState';
export type { EmptyStateProps } from './empty-states/EmptyState';

// Forms
export { FormField } from './forms/FormField';
export type { FormFieldConfig, FieldType, SelectOption } from './forms/FormField';
export { FormBuilder } from './forms/FormBuilder';

// Inputs
export { FilterBar } from './inputs/FilterBar';
export type { FilterBarProps } from './inputs/FilterBar';
export { FilterDropdown } from './inputs/FilterDropdown';
export type { FilterOption } from './inputs/FilterDropdown';
export { SearchableUserSelect } from './inputs/SearchableUserSelect';

// Layout
export { Sidebar } from './layout/Sidebar';
export type { SidebarProps, SidebarItem } from './layout/Sidebar';
export { TopBar } from './layout/TopBar';
export type { TopBarProps } from './layout/TopBar';
export { Navbar } from './layout/Navbar';
export type { NavbarProps, NavItem } from './layout/Navbar';
export { PageHeader } from './layout/PageHeader';
export type { PageHeaderProps, Crumb } from './layout/PageHeader';
export { GlassFooter } from './layout/GlassFooter';
export { GlassPanel } from './layout/GlassPanel';
export type { GlassPanelProps } from './layout/GlassPanel';
export { Section } from './layout/Section';
export type { SectionProps } from './layout/Section';
export { Breadcrumbs } from './layout/Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './layout/Breadcrumbs';

// Tables
export { DefectTable } from './tables/DefectTable';
export type { Defect, SortField, SortOrder } from './tables/DefectTable';
export { DataTable } from './tables/DataTable';
export type { DataTableProps, ColumnDef } from './tables/DataTable';

// Uploads
export { FileUploadModal } from './uploads/FileUploadModal';
