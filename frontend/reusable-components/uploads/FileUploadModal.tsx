'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileIcon, Image as ImageIcon, File, FileText, Video, Archive, Download, Check, Loader } from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { type Attachment, validateFile, downloadFile, formatFileSize, getFileIconType, uploadFileToS3 } from '@/lib/s3';
import { cn } from '@/lib/utils';
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';

// Helper function to convert camelCase or snake_case to Title Case
function formatFieldName(fieldName: string): string {
  return fieldName
    // Insert space before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, (char) => char.toUpperCase())
    // Trim any extra spaces
    .trim();
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  fieldName: string;
  entityId?: string;
  projectId?: string;
  entityType?: 'testcase' | 'defect' | 'comment' | 'testresult' | 'teststep' | 'unassigned';
  title?: string;
  maxFiles?: number;
  onDeleteMarked?: (deletedIds: string[]) => void;
  forceShow?: boolean;
  uploadOnSave?: boolean;
}

export function FileUploadModal({
  isOpen,
  onClose,
  attachments,
  onAttachmentsChange,
  fieldName,
  entityId,
  projectId,
  entityType = 'testcase',
  title = 'Manage Files',
  maxFiles = 20,
  onDeleteMarked,
  forceShow = false,
  uploadOnSave = false,
}: FileUploadModalProps) {
  const [attachmentsEnabled, setAttachmentsEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchAttachmentUrl = async (attachment: Attachment): Promise<string | null> => {
    const candidateEndpoints: string[] = [];
    if (attachment.entityType === 'defect') {
      candidateEndpoints.push(`/api/defect-attachments/${attachment.id}`);
      candidateEndpoints.push(`/api/attachments/${attachment.id}`);
    } else if (attachment.entityType === 'comment') {
      candidateEndpoints.push(`/api/comment-attachments/${attachment.id}`);
      candidateEndpoints.push(`/api/attachments/${attachment.id}`);
    } else {
      candidateEndpoints.push(`/api/attachments/${attachment.id}`);
    }

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) continue;
        const result = await response.json();
        if (result.data?.url) return result.data.url;
      } catch {
        // try next endpoint
      }
    }
    return null;
  };

  // Mount portal on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch attachment feature status from server
  useEffect(() => {
    isAttachmentsEnabledClient().then(enabled => {
      setAttachmentsEnabled(enabled);
    });
  }, []);

  // Fetch image URLs for preview
  React.useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const attachment of attachments) {
        const isPending = attachment.id.startsWith('pending-');
        
        if (attachment.mimeType.startsWith('image/')) {
          if (isPending) {
            // @ts-expect-error - Access the File object stored in _pendingFile
            const file = attachment._pendingFile as File;
            if (file) {
              const objectUrl = URL.createObjectURL(file);
              urls[attachment.id] = objectUrl;
            }
          } else {
            const url = await fetchAttachmentUrl(attachment);
            if (url) {
              urls[attachment.id] = url;
            }
          }
        }
      }
      setImageUrls(urls);
    };

    if (attachments.length > 0) {
      fetchImageUrls();
    } else {
      setImageUrls({});
    }

    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  const getFileIcon = (mimeType: string, className = "w-6 h-6") => {
    const iconType = getFileIconType(mimeType);
    if (iconType === 'image') return <ImageIcon className={className} />;
    if (iconType === 'video') return <Video className={className} />;
    if (iconType === 'pdf') return <FileText className={className} />;
    if (iconType === 'archive') return <Archive className={className} />;
    return <File className={className} />;
  };

  // Suppress unused variable warnings - these are needed for API calls later
  void entityId;
  void projectId;
  void entityType;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setFileError('');
    const nextAttachments = [...attachments];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check max files limit
      if (nextAttachments.length >= maxFiles) {
        setFileError(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        setFileError(validation.error || 'Invalid file');
        continue;
      }

      if (!uploadOnSave && (forceShow || entityId)) {
        // 即座にアップロード（ローカルフォールバック含む）
        try {
          const result = await uploadFileToS3({
            file,
            fieldName,
            entityId,
            projectId,
            entityType,
            onProgress: () => {},
          });
          if (result.success && result.attachment) {
            nextAttachments.push(result.attachment);
          } else {
            setFileError(result.error || 'アップロードに失敗しました');
          }
        } catch (error) {
          console.error('Upload failed:', error);
          setFileError('アップロードに失敗しました');
        }
      } else {
        // Creating new entity - store in memory, upload on save
        const pendingAttachment: Attachment = {
          id: `pending-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          filename: file.name,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          fieldName: fieldName,
          // @ts-expect-error - Add file object for later upload
          _pendingFile: file,
        };
        nextAttachments.push(pendingAttachment);
      }
    }

    onAttachmentsChange(nextAttachments);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteClick = (attachmentId: string) => {
    const isPending = attachmentId.startsWith('pending-');
    
    if (isPending) {
      // For pending attachments, remove immediately without confirmation
      onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
    } else {
      // For uploaded attachments, show confirmation dialog
      setDeleteConfirmId(attachmentId);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    // For uploaded attachments, mark for deletion (will delete on save)
    const newMarked = new Set(markedForDeletion);
    newMarked.add(deleteConfirmId);
    setMarkedForDeletion(newMarked);
    
    // Notify parent of marked deletions
    if (onDeleteMarked) {
      onDeleteMarked(Array.from(newMarked));
    }
    
    setDeleteConfirmId(null);
    setDeleteConfirmOpen(false);
  };

  const handleDownload = async (attachment: Attachment) => {
    const isPending = attachment.id.startsWith('pending-');
    if (isPending) {
      // Can't download pending files
      return;
    }
    
    try {
      await downloadFile(attachment.id, attachment.entityType);
    } catch (error) {
      console.error('Download error:', error);
      setFileError('Failed to download file');
    }
  };

  // Filter out attachments marked for deletion
  const visibleAttachments = attachments.filter(a => !markedForDeletion.has(a.id));
  const hasFiles = visibleAttachments.length > 0;
  const canAddMore = visibleAttachments.length < maxFiles;
  const pendingCount = visibleAttachments.filter(a => a.id.startsWith('pending-')).length;
  const markedCount = markedForDeletion.size;

  // Format the title to be more readable
  const formattedTitle = title.includes(fieldName) 
    ? title.replace(fieldName, formatFieldName(fieldName))
    : title;

  if ((!attachmentsEnabled && !forceShow) || !isOpen) return null;

  // Don't render on server side
  if (!mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ zIndex: 9999, pointerEvents: 'auto' }}
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1229]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl flex flex-col"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white/90">{formattedTitle}</h2>
            <p className="text-sm text-white/50 mt-1">
              {hasFiles ? `${visibleAttachments.length} file${visibleAttachments.length !== 1 ? 's' : ''} attached` : 'No files attached yet'}
              {pendingCount > 0 && (
                <span className="ml-2 text-yellow-400">
                  • {pendingCount} pending upload
                </span>
              )}
              {markedCount > 0 && (
                <span className="ml-2 text-red-400">
                  • {markedCount} marked for deletion
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-md opacity-70 transition-all hover:opacity-100 hover:bg-accent/50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {/* Upload Area - Always visible in create mode, or when can add more in edit mode */}
          {canAddMore && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar,.png,.jpg,.jpeg"
              />
              
              {/* Single Drag & Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-blue-500/50', 'bg-blue-500/5');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/5');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/5');
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && fileInputRef.current) {
                    // Create a new FileList-like object
                    const dataTransfer = new DataTransfer();
                    for (let i = 0; i < files.length; i++) {
                      dataTransfer.items.add(files[i]);
                    }
                    fileInputRef.current.files = dataTransfer.files;
                    handleFileSelect({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                className={cn(
                  "relative p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                  "bg-white/5 hover:bg-white/10 border-white/20 hover:border-blue-500/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex flex-col items-center justify-center gap-2"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-1">
                  <FileIcon className="w-6 h-6 text-white/60" />
                </div>
                <p className="text-white/90 text-base">
                  Drag & Drop or <span className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300">Choose File</span> to upload
                </p>
                <p className="text-white/50 text-sm">
                  Doc, pdf, png, jpeg
                </p>
              </div>

              <p className="text-xs text-white/40 text-center">
                {visibleAttachments.length}/{maxFiles} files - Max 100MB per file
              </p>

              {fileError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{fileError}</p>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Files Section */}
          {hasFiles && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-white/90">Uploaded Files</h3>
                <span className="text-sm text-white/50">{visibleAttachments.length} file{visibleAttachments.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {/* Files Grid */}
          {hasFiles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {visibleAttachments.map((attachment) => {
                const isImage = attachment.mimeType.startsWith('image/');
                const isPending = attachment.id.startsWith('pending-');
                
                return (
                  <div
                    key={attachment.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredId(attachment.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className={cn(
                      "relative h-48 rounded-xl overflow-hidden border-2 transition-all",
                      "bg-white/5 backdrop-blur-sm",
                      isPending 
                        ? "border-yellow-500/40 bg-yellow-500/5" 
                        : "border-white/15 hover:border-blue-500/50"
                    )}>
                      {/* Preview */}
                      <div className="absolute inset-0">
                        {isImage && imageUrls[attachment.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrls[attachment.id]}
                            alt={attachment.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/60">
                            {getFileIcon(attachment.mimeType, "w-16 h-16")}
                          </div>
                        )}
                      </div>

                      {/* Pending Badge */}
                      {isPending && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-md">
                          <Loader className="w-3 h-3 text-white animate-spin" />
                          <span className="text-xs font-medium text-white">Pending</span>
                        </div>
                      )}

                      {/* Hover Overlay with Actions */}
                      <div className={cn(
                        "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity flex items-center justify-center gap-2",
                        hoveredId === attachment.id ? "opacity-100" : "opacity-0"
                      )}>
                        {!isPending && (
                          <Button
                            type="button"
                            size="sm"
                            variant="glass"
                            onClick={() => handleDownload(attachment)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <ButtonDestructive
                          size="sm"
                          onClick={() => handleDeleteClick(attachment.id)}
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </ButtonDestructive>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="mt-2 px-1">
                      <p className="text-sm text-white/90 font-medium truncate" title={attachment.originalName}>
                        {attachment.originalName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-white/50">
                          {formatFileSize(attachment.size)}
                        </p>
                        {isPending && (
                          <p className="text-xs text-yellow-400">
                            Will upload on save
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !canAddMore ? null : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/10 rounded-xl">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileIcon className="w-10 h-10 text-white/30" />
              </div>
              <p className="text-white/60 text-lg font-medium">No files uploaded yet</p>
              <p className="text-white/40 text-sm mt-2">Drag files here or click the area above to start uploading</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
          <p className="text-xs text-white/50">
            Maximum file size: 500MB • All formats supported
          </p>
          <ButtonPrimary
            onClick={onClose}
            className="cursor-pointer"
          >
            <Check className="w-4 h-4 mr-2" />
            Done
          </ButtonPrimary>
        </div>

        {/* Delete Confirmation Dialog - Rendered in separate portal for proper z-index */}
        {deleteConfirmOpen && mounted && createPortal(
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 10000 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setDeleteConfirmOpen(false);
              }
            }}
          >
            <div className="backdrop-blur-md rounded-xl border p-6 w-full max-w-[520px] bg-background/80 text-foreground shadow-2xl">
              {/* Header */}
              <div className="flex flex-col gap-2 text-center sm:text-left mb-5">
                <h2 className="text-lg leading-none font-semibold text-primary">Delete Attachment</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  This attachment will be deleted when you save the form. This action cannot be undone.
                </p>
              </div>
              
              {/* Actions */}
              <div className="space-y-5">
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="glass"
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <ButtonDestructive
                    type="button"
                    onClick={async () => {
                      await handleDeleteConfirm();
                    }}
                    className="cursor-pointer"
                  >
                    Mark for Deletion
                  </ButtonDestructive>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );

  // Render modal in a portal at document root level
  return createPortal(modalContent, document.body);
}

