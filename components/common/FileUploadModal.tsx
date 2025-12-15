'use client';

import React, { useRef, useState } from 'react';
import { X, FileIcon, Image as ImageIcon, File, FileText, Video, Archive, Download, Check, Loader } from 'lucide-react';
import { Button } from '@/elements/button';
import { ButtonDestructive } from '@/elements/button-destructive';
import { type Attachment, validateFile, downloadFile, formatFileSize, getFileIconType } from '@/lib/s3';
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
}: FileUploadModalProps) {
  const attachmentsEnabled = isAttachmentsEnabledClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
            try {
              const endpoint = attachment.entityType === 'defect' 
                ? `/api/defect-attachments/${attachment.id}`
                : `/api/attachments/${attachment.id}`;
              
              const response = await fetch(endpoint);
              if (response.ok) {
                const result = await response.json();
                if (result.data?.url) {
                  urls[attachment.id] = result.data.url;
                }
              }
            } catch (error) {
              console.error('Error fetching image URL:', error);
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

  if (!attachmentsEnabled || !isOpen) return null;

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

    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check max files limit
      if (attachments.length + newAttachments.length >= maxFiles) {
        setFileError(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        setFileError(validation.error || 'Invalid file');
        continue;
      }

      // Create pending attachment (will be uploaded on save)
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
      
      newAttachments.push(pendingAttachment);
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
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

  const hasFiles = attachments.length > 0;
  const canAddMore = attachments.length < maxFiles;
  const pendingCount = attachments.filter(a => a.id.startsWith('pending-')).length;

  // Format the title to be more readable
  const formattedTitle = title.includes(fieldName) 
    ? title.replace(fieldName, formatFieldName(fieldName))
    : title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1229]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white/90">{formattedTitle}</h2>
            <p className="text-sm text-white/50 mt-1">
              {hasFiles ? `${attachments.length} file${attachments.length !== 1 ? 's' : ''} attached` : 'No files attached yet'}
              {pendingCount > 0 && (
                <span className="ml-2 text-yellow-400">
                  • {pendingCount} pending upload
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
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
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
              />
              
              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar';
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={!canAddMore}
                  className={cn(
                    "p-6 rounded-xl border-2 border-dashed transition-all",
                    "bg-white/5 hover:bg-white/10 border-white/20 hover:border-blue-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    "flex flex-col items-center justify-center gap-3"
                  )}
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileIcon className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/90 font-semibold">Documents</p>
                    <p className="text-white/50 text-xs mt-1">
                      PDF, Word, Excel, Text
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*';
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={!canAddMore}
                  className={cn(
                    "p-6 rounded-xl border-2 border-dashed transition-all",
                    "bg-white/5 hover:bg-white/10 border-white/20 hover:border-green-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    "flex flex-col items-center justify-center gap-3"
                  )}
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/90 font-semibold">Images</p>
                    <p className="text-white/50 text-xs mt-1">
                      JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </button>
              </div>

              <p className="text-xs text-white/40 text-center">
                {attachments.length}/{maxFiles} files • Max 500MB per file
              </p>

              {fileError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{fileError}</p>
                </div>
              )}
            </div>
          )}

          {/* Files Grid */}
          {hasFiles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {attachments.map((attachment) => {
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
                      "relative h-48 rounded-lg overflow-hidden border transition-all",
                      "bg-white/5 backdrop-blur-sm",
                      isPending 
                        ? "border-yellow-500/40 bg-yellow-500/5" 
                        : "border-white/15 hover:border-primary/50"
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
                          onClick={() => handleDelete(attachment.id)}
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileIcon className="w-10 h-10 text-white/30" />
              </div>
              <p className="text-white/60 text-lg font-medium">No files uploaded yet</p>
              <p className="text-white/40 text-sm mt-1">Click the upload button above to add files</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
          <p className="text-xs text-white/50">
            Maximum file size: 500MB • All formats supported
          </p>
          <Button
            variant="glass"
            onClick={onClose}
            className="cursor-pointer"
          >
            <Check className="w-4 h-4 mr-2" />
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
