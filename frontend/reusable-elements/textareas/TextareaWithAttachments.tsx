import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { X, File, FileText, Image, Video, Archive, Download, Paperclip } from 'lucide-react';
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import {
  type Attachment,
  validateFile,
  uploadFileToS3,
  downloadFile,
  deleteFile,
  formatFileSize,
  getFileIconType,
} from '@/lib/s3';
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';
import { FileUploadModal } from '@/frontend/reusable-components/uploads/FileUploadModal';

type TextareaWithAttachmentsProps = Omit<React.ComponentProps<"textarea">, 'value' | 'onChange'> & {
  variant?: "default" | "glass"
  maxLength?: number
  showCharCount?: boolean
  value?: string
  onChange?: (value: string) => void
  // Attachment props
  fieldName: string;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  entityId?: string;
  projectId?: string;
  entityType?: 'testcase' | 'defect' | 'comment' | 'testresult' | 'teststep' | 'unassigned';
  showAttachments?: boolean;
}

function TextareaWithAttachments({ 
  className, 
  variant = "default", 
  maxLength,
  showCharCount = true,
  value = '',
  onChange,
  fieldName,
  attachments = [],
  onAttachmentsChange,
  entityId,
  projectId,
  entityType = 'testcase',
  showAttachments = true,
  ...props 
}: TextareaWithAttachmentsProps) {
  // Check if attachments feature is enabled
  const [attachmentsEnabled, setAttachmentsEnabled] = React.useState(false);
  const shouldShowAttachments = showAttachments && attachmentsEnabled;
  
  const [charCount, setCharCount] = React.useState(0);
  const [isOverLimit, setIsOverLimit] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [fileError, setFileError] = React.useState<string>('');
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [imageUrls, setImageUrls] = React.useState<Record<string, string>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = React.useState<string | null>(null);
  const [fileModalOpen, setFileModalOpen] = React.useState(false);
  const [markedForDeletion, setMarkedForDeletion] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch attachment feature status from server
  React.useEffect(() => {
    isAttachmentsEnabledClient().then(enabled => {
      setAttachmentsEnabled(enabled);
    });
  }, []);

  React.useEffect(() => {
    const text = typeof value === 'string' ? value : '';
    setCharCount(text.length);
    setIsOverLimit(maxLength ? text.length > maxLength : false);
  }, [value, maxLength]);

  // Clear error when attachments are cleared
  React.useEffect(() => {
    if (attachments.length === 0) {
      setFileError('');
    }
  }, [attachments]);
  // Fetch image URLs for attachments
  React.useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const attachment of attachments) {
        const isPending = attachment.id.startsWith('pending-');
        
        if (attachment.mimeType.startsWith('image/')) {
          // For pending attachments, use local object URL
          if (isPending) {
            // @ts-expect-error - Access the File object stored in _pendingFile
            const file = attachment._pendingFile as File;
            if (file) {
              const objectUrl = URL.createObjectURL(file);
              urls[attachment.id] = objectUrl;
            } else {
              console.warn(`No file found for pending attachment ${attachment.id}`);
            }
          } else {
            // For uploaded attachments, fetch from server
            try {
              // Use different endpoint based on entity type
              const endpoint = attachment.entityType === 'defect' 
                ? `/api/defect-attachments/${attachment.id}`
                : `/api/attachments/${attachment.id}`;
              
              const response = await fetch(endpoint);
              if (response.ok) {
                const result = await response.json();
                // API returns { data: { url, ... } }
                if (result.data?.url) {
                  urls[attachment.id] = result.data.url;
                } else {
                  console.warn(`[TextareaWithAttachments] No URL in response for ${attachment.id}`, result);
                }
              } else {
                console.warn(`[TextareaWithAttachments] Failed to fetch image URL for ${attachment.id}:`, response.status);
              }
            } catch (error) {
              console.error('[TextareaWithAttachments] Error fetching image URL:', error);
            }
          }
        }
      }
      setImageUrls(urls);
    };

    // Reset imageUrls when attachments change to prevent stale URLs
    if (attachments.length > 0) {
      fetchImageUrls();
    } else {
      // Clear image URLs if no attachments
      setImageUrls({});
    }

    // Cleanup object URLs on unmount to prevent memory leaks
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const getFileIcon = (mimeType: string, className = "w-4 h-4") => {
    const iconType = getFileIconType(mimeType);
    // eslint-disable-next-line jsx-a11y/alt-text
    if (iconType === 'image') return <Image className={className} />;
    if (iconType === 'video') return <Video className={className} />;
    if (iconType === 'pdf') return <FileText className={className} />;
    if (iconType === 'archive') return <Archive className={className} />;
    return <File className={className} />;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setFileError('');

    const result = await uploadFileToS3({
      file,
      fieldName,
      entityId,
      projectId,
      entityType,
      onProgress: (progress) => setUploadProgress(progress),
    });

    if (result.success && result.attachment) {
      onAttachmentsChange?.([...attachments, result.attachment]);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } else {
      // Format CORS errors for better readability
      let errorMessage = result.error || 'Failed to upload file';
      if (errorMessage.includes('CORS Error')) {
        errorMessage = errorMessage.replace(/\n\n/g, '\n');
      }
      setFileError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');

    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Store file in browser memory as "pending" instead of uploading immediately
    if (entityId) {
      // Editing existing entity - upload immediately
      await handleUpload(file);
    } else {
      // Creating new entity - store in memory, upload on save
      const pendingAttachment: Attachment = {
        id: `pending-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        filename: file.name,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        fieldName: fieldName, // Track which field this attachment belongs to
        // @ts-expect-error - Add file object for later upload
        _pendingFile: file,
      };
      onAttachmentsChange?.([...attachments, pendingAttachment]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await downloadFile(attachment.id, attachment.entityType);
    } catch (error) {
      console.error('File access error:', error);
      setFileError('Failed to access file');
    }
  };

  const handleDeleteClick = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!attachmentToDelete) return;

    try {
      const isPending = attachmentToDelete.startsWith('pending-');
      
      if (!isPending) {
        // Only delete from S3 if it's an uploaded attachment
        // Find the attachment to get its entityType
        const attachment = attachments.find(a => a.id === attachmentToDelete);
        await deleteFile(attachmentToDelete, attachment?.entityType);
      }
      
      // Remove from local state
      onAttachmentsChange?.(attachments.filter((a) => a.id !== attachmentToDelete));
      setAttachmentToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      setFileError('Failed to delete attachment');
      setDeleteConfirmOpen(false);
    }
  };

  const handleDeleteMarked = (deletedIds: string[]) => {
    setMarkedForDeletion(deletedIds);
  };

  // Process marked deletions when modal closes
  const handleModalClose = async () => {
    setFileModalOpen(false);
    
    // Remove marked attachments from local state
    if (markedForDeletion.length > 0) {
      // Filter out marked attachments
      const remainingAttachments = attachments.filter((a) => !markedForDeletion.includes(a.id));
      onAttachmentsChange?.(remainingAttachments);
      
      // Delete marked attachments from S3 and database
      for (const attachmentId of markedForDeletion) {
        try {
          const attachment = attachments.find(a => a.id === attachmentId);
          if (attachment) {
            await deleteFile(attachmentId, attachment.entityType);
          }
        } catch (error) {
          console.error('Error deleting attachment:', attachmentId, error);
          setFileError('Failed to delete some attachments');
        }
      }
      
      // Clear marked deletions
      setMarkedForDeletion([]);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="relative overflow-visible">
        <textarea
          data-slot="textarea"
          className={cn(
            "placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground flex min-h-24 max-h-48 w-full rounded-[10px] border px-4 py-3 text-base transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-xl resize-none overflow-y-auto custom-scrollbar",
            variant === "glass"
              ? "bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] rounded-[10px]"
              : "border-border/40 bg-input",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            isOverLimit && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/40",
            className
          )}
          value={value}
          onChange={handleTextChange}
          maxLength={maxLength}
          {...props}
        />
      </div>
      
      {/* Attachment Display and Button - Below textarea */}
      {shouldShowAttachments && (
        <div className="flex items-center justify-between w-full px-3 py-2 rounded-[10px] bg-[#101a2b]/70 border border-white/20 text-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          {/* Left side - Attachment count display (non-clickable) */}
          <span className="text-white/60">{attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}</span>
          
          {/* Right side - Clickable button with paperclip icon */}
          <button
            type="button"
            onClick={() => setFileModalOpen(true)}
            disabled={uploading}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white/60 hover:text-white/80"
            title={attachments.length > 0 ? `Manage ${attachments.length} file${attachments.length !== 1 ? 's' : ''}` : 'Attach Files'}
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {showCharCount && maxLength && (
        <div className={cn(
          "text-xs mt-1 text-right",
          isOverLimit ? "text-red-500" : "text-white/60"
        )}>
          {charCount}/{maxLength} characters
        </div>
      )}

      {showAttachments && (
        <>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
          />
          
          {/* Upload Progress */}
          {uploading && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-white/70">{uploadProgress}%</span>
            </div>
          )}

          {/* Inline Error */}
          {fileError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-5 h-5 text-red-500" />
                    <h4 className="text-sm font-semibold text-red-500">Upload Failed</h4>
                  </div>
                  <div className="text-sm text-white/80 whitespace-pre-line">
                    {fileError}
                  </div>
                  {fileError.includes('CORS') && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-200">
                      <strong>Quick Fix:</strong> Add <code className="px-1 py-0.5 bg-black/30 rounded">{window.location.origin}</code> to your S3 bucket&apos;s CORS AllowedOrigins
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setFileError('')}
                  className="opacity-70 transition-all hover:opacity-100 hover:bg-accent/50 rounded-md p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Hover Preview Card */}
      {showAttachments && hoveredId && attachments.find(a => a.id === hoveredId) && (
        <div 
          className="absolute bottom-16 left-2 z-50 w-80 bg-[#1a2332] border border-white/20 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        >
          {attachments.map((attachment) => {
            if (attachment.id !== hoveredId) return null;
            const isPending = attachment.id.startsWith('pending-');
            const isImage = attachment.mimeType.startsWith('image/');
            
            return (
              <div 
                key={attachment.id}
                onMouseEnter={() => setHoveredId(attachment.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Preview Image/Icon */}
                <div className="relative h-64 bg-black/20 flex items-center justify-center">
                  {isImage ? (
                    imageUrls[attachment.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrls[attachment.id]}
                        alt={attachment.originalName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Failed to load image preview:', attachment.originalName);
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="text-white/60 flex items-center justify-center flex-col gap-2">
                        {getFileIcon(attachment.mimeType, "w-24 h-24")}
                        <p className="text-xs text-white/50">
                          {isPending ? 'Preview will load shortly...' : 'Loading image...'}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-white/60 flex items-center justify-center">
                      {getFileIcon(attachment.mimeType, "w-24 h-24")}
                    </div>
                  )}
                  {isImage && !imageUrls[attachment.id] && (
                    <div data-fallback className="absolute inset-0 items-center justify-center flex-col gap-2" style={{ display: 'none' }}>
                      {getFileIcon(attachment.mimeType, "w-24 h-24")}
                      <p className="text-xs text-white/50">Failed to load image</p>
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm text-white/90 font-medium truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-white/50">
                    {formatFileSize(attachment.size)}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="glass"
                      className="flex-1"
                      onClick={() => handleDownload(attachment)}
                      disabled={isPending}
                      title={isPending ? "Will be available after saving" : "Download file"}
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      {isPending ? 'Pending' : 'Download'}
                    </Button>
                    <ButtonDestructive
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClick(attachment.id)}
                    >
                      <X className="w-4 h-4" />
                    </ButtonDestructive>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Attachment Confirmation Dialog */}
      <BaseConfirmDialog
        title="Delete Attachment"
        description="Are you sure you want to delete this attachment? This action cannot be undone."
        submitLabel="Delete"
        cancelLabel="Cancel"
        triggerOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onSubmit={handleDeleteConfirm}
        destructive={true}
      />

      {/* File Upload Modal */}
      {shouldShowAttachments && (
        <FileUploadModal
          isOpen={fileModalOpen}
          onClose={handleModalClose}
          attachments={attachments}
          onAttachmentsChange={onAttachmentsChange || (() => {})}
          onDeleteMarked={handleDeleteMarked}
          fieldName={fieldName}
          entityId={entityId}
          projectId={projectId}
          entityType={entityType}
          title={`Manage Files - ${fieldName}`}
        />
      )}
    </div>
  )
}

TextareaWithAttachments.displayName = "TextareaWithAttachments"

export { TextareaWithAttachments, type TextareaWithAttachmentsProps, type Attachment }