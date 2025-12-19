'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, Image as ImageIcon, File as FileIcon, X } from 'lucide-react';
import { type Attachment, downloadFile, getFileIconType, formatFileSize } from '@/lib/s3';
import { cn } from '@/lib/utils';
import { Button } from '@/elements/button';
import { ButtonDestructive } from '@/elements/button-destructive';
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';

interface AttachmentDisplayProps {
  attachments: Attachment[];
  showPreview?: boolean;
  onDelete?: (attachmentId: string) => void;
  showDelete?: boolean;
}

export function AttachmentDisplay({ attachments, showPreview = true, onDelete, showDelete = false }: AttachmentDisplayProps) {
  // Check if attachments feature is enabled
  const attachmentsEnabled = isAttachmentsEnabledClient();
  
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number; showAbove?: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const thumbnailRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mount portal on client side only
  useEffect(() => {
    setMounted(true);
    
    // Cleanup timeout on unmount
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Fetch image URLs for attachments
  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const attachment of attachments) {
        if (attachment.mimeType.startsWith('image/')) {
          try {
            console.log(`[AttachmentDisplay] Fetching URL for attachment:`, attachment);
            console.log(`[AttachmentDisplay] Attachment entityType:`, attachment.entityType);
            // Use different endpoint based on entity type
            let endpoint: string;
            if (attachment.entityType === 'defect') {
              endpoint = `/api/defect-attachments/${attachment.id}`;
            } else if (attachment.entityType === 'comment') {
              endpoint = `/api/comment-attachments/${attachment.id}`;
            } else {
              endpoint = `/api/attachments/${attachment.id}`;
            }
            console.log(`[AttachmentDisplay] Using endpoint:`, endpoint);
            
            const response = await fetch(endpoint);
            console.log(`[AttachmentDisplay] Response status for ${attachment.id}:`, response.status);
            
            if (response.ok) {
              const result = await response.json();
              console.log(`[AttachmentDisplay] Response data for ${attachment.id}:`, result);
              
              // API returns { data: { url, ... } }
              if (result.data?.url) {
                urls[attachment.id] = result.data.url;
                console.log(`[AttachmentDisplay] Set image URL for ${attachment.id}:`, result.data.url);
              } else {
                console.warn(`[AttachmentDisplay] No URL in response for ${attachment.id}`, result);
              }
            } else {
              const errorText = await response.text();
              console.error(`[AttachmentDisplay] Failed to fetch URL for ${attachment.id}:`, response.status, errorText);
            }
          } catch (error) {
            console.error(`[AttachmentDisplay] Error fetching image URL for ${attachment.id}:`, error);
          }
        }
      }
      console.log('[AttachmentDisplay] Final imageUrls:', urls);
      setImageUrls(urls);
    };

    if (attachments.length > 0) {
      fetchImageUrls();
    }

    // Cleanup object URLs on unmount
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  const getFileIcon = (mimeType: string, className?: string) => {
    const type = getFileIconType(mimeType);
    switch (type) {
      case 'image':
        return <ImageIcon className={className || "w-6 h-6"} />;
      case 'pdf':
        return <FileText className={className || "w-6 h-6"} />;
      default:
        return <FileIcon className={className || "w-6 h-6"} />;
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await downloadFile(attachment.id, attachment.entityType);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = (attachmentId: string) => {
    setDeleteConfirmId(attachmentId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId && onDelete) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
      setHoveredId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Don't show attachments if feature is disabled
  if (!attachmentsEnabled || attachments.length === 0) {
    return null;
  }

  const handleMouseEnter = (attachmentId: string) => {
    if (!showPreview) return;
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredId(attachmentId);
    
    const thumbnail = thumbnailRefs.current[attachmentId];
    if (thumbnail) {
      const rect = thumbnail.getBoundingClientRect();
      const previewWidth = 320;
      const previewHeight = 350; // Approximate height including padding
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const padding = 10;
      
      // Calculate horizontal position - center on thumbnail
      let left = rect.left - (previewWidth / 2) + (rect.width / 2);
      // Ensure preview doesn't go off-screen horizontally
      if (left < padding) left = padding;
      if (left + previewWidth > viewportWidth - padding) left = viewportWidth - previewWidth - padding;
      
      // Calculate vertical position - show above if space available, otherwise below
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      
      let top;
      let shouldShowAbove = false;
      
      // Show above if more space above OR if not enough space below
      if (spaceAbove > spaceBelow || spaceBelow < previewHeight + padding) {
        shouldShowAbove = true;
        // Position so the preview appears above the thumbnail
        top = rect.top - padding;
      } else {
        shouldShowAbove = false;
        // Position so the preview appears below the thumbnail
        top = rect.bottom + padding;
      }
      
      setPreviewPosition({
        top,
        left,
        showAbove: shouldShowAbove
      });
    }
  };

  const handleMouseLeave = () => {
    if (!showPreview) return;
    // Add a small delay before closing to allow user to move mouse to preview
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredId(null);
      setPreviewPosition(null);
    }, 150); // 150ms delay
  };

  const handleMouseEnterPreview = () => {
    // Clear any pending close timeout when mouse enters preview
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeavePreview = () => {
    // Immediately close when leaving preview
    setHoveredId(null);
    setPreviewPosition(null);
  };

  return (
    <div className="relative grid grid-cols-3 gap-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith('image/');
        
        return (
          <div
            key={attachment.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(attachment.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Thumbnail */}
            <div
              ref={(el) => { thumbnailRefs.current[attachment.id] = el; }} 
              className="relative w-10 h-10 rounded-md overflow-hidden border border-white/15 bg-white/5 hover:border-primary/50 transition-all cursor-pointer shadow-sm"
              onClick={() => handleDownload(attachment)}
              title={`Click to download ${attachment.originalName || attachment.filename}`}
            >
              {isImage && imageUrls[attachment.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrls[attachment.id]}
                  alt={attachment.originalName || attachment.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback instanceof HTMLElement) {
                      fallback.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center text-white/60",
                isImage && imageUrls[attachment.id] && "hidden"
              )}>
                {getFileIcon(attachment.mimeType, "w-5 h-5")}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Render preview as portal */}
      {mounted && showPreview && hoveredId && previewPosition && (() => {
        const attachment = attachments.find(a => a.id === hoveredId);
        if (!attachment) return null;
        
        const isImage = attachment.mimeType.startsWith('image/');
        
        return createPortal(
          <div 
            className="fixed w-80 bg-[#1a2332] border border-white/20 rounded-lg shadow-2xl overflow-hidden"
            style={{ 
              top: `${previewPosition.top}px`, 
              left: `${previewPosition.left}px`,
              zIndex: 9999,
              transform: previewPosition.showAbove ? 'translateY(-100%)' : 'translateY(0)',
              pointerEvents: 'auto',
              maxHeight: 'calc(100vh - 20px)'
            }}
            onMouseEnter={handleMouseEnterPreview}
            onMouseLeave={handleMouseLeavePreview}
          >
                {/* Preview Image/Icon */}
                <div className="relative h-64 bg-black/20 flex items-center justify-center">
                  {isImage && imageUrls[attachment.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrls[attachment.id]}
                      alt={attachment.originalName || attachment.filename}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('Failed to load image preview');
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('[data-fallback]');
                        if (fallback instanceof HTMLElement) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-white/60 flex items-center justify-center flex-col gap-2">
                      {getFileIcon(attachment.mimeType, "w-24 h-24")}
                      {isImage && !imageUrls[attachment.id] && (
                        <p className="text-xs text-white/50">Loading preview...</p>
                      )}
                    </div>
                  )}
                  {isImage && (
                    <div 
                      data-fallback 
                      className="absolute inset-0 items-center justify-center flex-col gap-2 hidden"
                    >
                      {getFileIcon(attachment.mimeType, "w-24 h-24")}
                      <p className="text-xs text-white/50">Failed to load image</p>
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm text-white/90 font-medium truncate">
                    {attachment.originalName || attachment.filename}
                  </p>
                  <p className="text-xs text-white/50">
                    {formatFileSize(attachment.size || 0)}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="glass"
                      className="w-10 h-10 p-0 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {showDelete && onDelete && (
                      <ButtonDestructive
                        type="button"
                        size="icon"
                        className="w-10 h-10 p-0 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(attachment.id);
                        }}
                        title="Delete file"
                      >
                        <X className="w-4 h-4" />
                      </ButtonDestructive>
                    )}
                  </div>
                </div>
              </div>,
          document.body
        );
      })()}
      
      {/* Delete Confirmation Dialog */}
      {mounted && deleteConfirmId && (() => {
        const attachment = attachments.find(a => a.id === deleteConfirmId);
        if (!attachment) return null;
        
        return createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10000 }}>
            <div className="bg-[#1a2332] border border-white/20 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Delete Attachment</h3>
              <p className="text-white/70 mb-4">
                Are you sure you want to delete <span className="font-medium text-white/90">{attachment.originalName || attachment.filename}</span>?
              </p>
              <p className="text-sm text-white/50 mb-6">This action cannot be undone.</p>
              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="glass"
                  onClick={cancelDelete}
                >
                  Cancel
                </Button>
                <ButtonDestructive
                  onClick={confirmDelete}
                >
                  Delete
                </ButtonDestructive>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
