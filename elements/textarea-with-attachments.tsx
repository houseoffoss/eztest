import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from '@/elements/button';
import { ButtonDestructive } from '@/elements/button-destructive';
import { X, File, FileText, Image, Video, Archive, Download, Paperclip, FileIcon } from 'lucide-react';
import { BaseConfirmDialog } from '@/components/design/BaseConfirmDialog';
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
  entityType = 'testcase',
  showAttachments = true,
  ...props 
}: TextareaWithAttachmentsProps) {
  // Check if attachments feature is enabled
  const attachmentsEnabled = isAttachmentsEnabledClient();
  const shouldShowAttachments = showAttachments && attachmentsEnabled;
  
  const [charCount, setCharCount] = React.useState(0);
  const [isOverLimit, setIsOverLimit] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [fileError, setFileError] = React.useState<string>('');
  const [showPopup, setShowPopup] = React.useState(false);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [imageUrls, setImageUrls] = React.useState<Record<string, string>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);

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
              console.log(`Created object URL for pending attachment ${attachment.id}:`, objectUrl);
            } else {
              console.warn(`No file found for pending attachment ${attachment.id}`);
            }
          } else {
            // For uploaded attachments, fetch from server
            try {
              console.log(`[TextareaWithAttachments] Fetching URL for attachment ${attachment.id}`);
              // Use different endpoint based on entity type
              const endpoint = attachment.entityType === 'defect' 
                ? `/api/defect-attachments/${attachment.id}`
                : `/api/attachments/${attachment.id}`;
              console.log(`[TextareaWithAttachments] Using endpoint:`, endpoint);
              
              const response = await fetch(endpoint);
              if (response.ok) {
                const result = await response.json();
                console.log(`[TextareaWithAttachments] Response for ${attachment.id}:`, result);
                // API returns { data: { url, ... } }
                if (result.data?.url) {
                  urls[attachment.id] = result.data.url;
                  console.log(`[TextareaWithAttachments] Set image URL for ${attachment.id}:`, result.data.url);
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

  // Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPopup]);

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
    setShowPopup(false);

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
      console.log('Created pending attachment:', pendingAttachment.id, 'File:', file);
      onAttachmentsChange?.([...attachments, pendingAttachment]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAttachmentTypeClick = (type: 'documents' | 'images') => {
    if (fileInputRef.current) {
      if (type === 'images') {
        fileInputRef.current.accept = 'image/*';
      } else {
        fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar';
      }
      fileInputRef.current.click();
    }
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

  return (
    <div className="w-full space-y-3">
      <div className="relative overflow-visible">
        <textarea
          data-slot="textarea"
          className={cn(
            "placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground flex min-h-24 max-h-48 w-full rounded-[10px] border px-4 py-3 pr-12 text-base transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-xl resize-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
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
        
        {/* Attachments Inside Textarea - Bottom */}
        {shouldShowAttachments && attachments.length > 0 && (
          <div className="absolute bottom-2 left-2 right-14 flex gap-2 overflow-x-auto scrollbar-none z-40" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            <style>{`
              .scrollbar-none::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {attachments.map((attachment) => {
              const isImage = attachment.mimeType.startsWith('image/');
              const isPending = attachment.id.startsWith('pending-');
              
              return (
                <div
                  key={attachment.id}
                  className="relative flex-shrink-0 group"
                  onMouseEnter={() => setHoveredId(attachment.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Small Thumbnail */}
                  <div 
                    className={cn(
                      "relative w-10 h-10 rounded-md overflow-hidden border bg-white/5 hover:border-primary/50 transition-all cursor-pointer shadow-sm",
                      isPending ? "border-yellow-500/50 bg-yellow-500/10" : "border-white/15"
                    )}
                    onClick={async () => {
                      if (isPending) return; // Can't download pending files
                      try {
                        await handleDownload(attachment);
                      } catch (error) {
                        console.error('Failed to download file:', error);
                        setFileError('Failed to download file');
                      }
                    }}
                    title={isPending ? `⏳ Ready to upload: ${attachment.originalName}` : `Click to open ${attachment.originalName}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDownload(attachment).catch((error) => {
                          console.error('Failed to download file:', error);
                          setFileError('Failed to download file');
                        });
                      }
                    }}
                  >
                    {isImage && imageUrls[attachment.id] ? (
                      <img
                        src={imageUrls[attachment.id]}
                        alt={attachment.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center text-white/60",
                      isImage && imageUrls[attachment.id] && "hidden"
                    )}>
                      {getFileIcon(attachment.mimeType, "w-5 h-5")}
                    </div>
                    
                    {/* Pending Badge */}
                    {isPending && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white/30 animate-pulse" title="Will upload on save" />
                    )}
                    
                    {/* Delete Icon - Shows on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(attachment.id);
                      }}
                      className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/60 rounded-md transition-all"
                      title="Delete attachment"
                    >
                      <X className="w-5 h-5 text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Attachment Icon Button */}
        {shouldShowAttachments && (
          <div className="absolute bottom-3 right-3">
            <button
              type="button"
              onClick={() => setShowPopup(!showPopup)}
              disabled={uploading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4 text-white/70" />
            </button>
            
            {/* Popup Menu */}
            {showPopup && (
              <div
                ref={popupRef}
                className="absolute bottom-full right-0 mb-2 w-44 bg-[#1a2332] border border-white/15 rounded-lg shadow-xl overflow-hidden z-50"
              >
                <button
                  type="button"
                  onClick={() => handleAttachmentTypeClick('documents')}
                  disabled={uploading}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-white/90 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold">Documents</span>
                </button>
                <div className="h-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => handleAttachmentTypeClick('images')}
                  disabled={uploading}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-white/90 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image className="w-4 h-4 text-green-400" aria-hidden="true" />
                  <span className="text-sm font-semibold">Images</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
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
                  className="text-white/40 hover:text-white/80 transition-colors"
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
    </div>
  )
}

TextareaWithAttachments.displayName = "TextareaWithAttachments"

export { TextareaWithAttachments, type TextareaWithAttachmentsProps, type Attachment }
