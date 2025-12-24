'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, Image as ImageIcon, File as FileIcon, X } from 'lucide-react';
import { type Attachment, downloadFile, getFileIconType, formatFileSize } from '@/lib/s3';
import { cn } from '@/lib/utils';
import { Button } from "../../reusable-elements/buttons/Button";
import { ButtonDestructive } from "../../reusable-elements/buttons/ButtonDestructive";
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';

interface AttachmentDisplayProps {
  attachments: Attachment[];
  showPreview?: boolean;
  onDelete?: (attachmentId: string) => void;
  showDelete?: boolean;
}

export function AttachmentDisplay({ attachments, showPreview = true, onDelete, showDelete = false }: AttachmentDisplayProps) {
  // Check if attachments feature is enabled
  const [attachmentsEnabled, setAttachmentsEnabled] = useState(false);
  
  useEffect(() => {
    isAttachmentsEnabledClient().then(enabled => {
      setAttachmentsEnabled(enabled);
    });
  }, []);
  
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
              console.warn(`[AttachmentDisplay] Failed to fetch image URL for ${attachment.id}:`, response.status);
            }
          } catch (error) {
            console.error('[AttachmentDisplay] Error fetching image URL:', error);
          }
        }
      }
      setImageUrls(urls);
    };

    if (attachments.length > 0 && showPreview) {
      fetchImageUrls();
    } else {
      setImageUrls({});
    }
  }, [attachments, showPreview]);

  const getFileIcon = (mimeType: string, className = "w-5 h-5") => {
    const iconType = getFileIconType(mimeType);
    if (iconType === 'image') return <ImageIcon className={className} />;
    if (iconType === 'pdf') return <FileText className={className} />;
    return <FileIcon className={className} />;
  };

  const handleHover = (attachmentId: string, e: React.MouseEvent) => {
    if (!showPreview) return;
    
    const thumbnail = thumbnailRefs.current[attachmentId];
    if (!thumbnail) return;

    const rect = thumbnail.getBoundingClientRect();
    const previewHeight = 320;
    
    let top = rect.top - previewHeight - 8;
    let showAbove = true;
    
    if (top < 0) {
      top = rect.bottom + 8;
      showAbove = false;
    }

    setPreviewPosition({
      top: top + window.scrollY,
      left: Math.min(rect.left, window.innerWidth - 320 - 8),
      showAbove,
    });
    setHoveredId(attachmentId);
  };

  const handleHoverLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredId(null);
      setPreviewPosition(null);
    }, 100);
  };

  const renderAttachmentThumbnail = (attachment: Attachment) => {
    const isImage = attachment.mimeType.startsWith('image/');

    return (
      <div
        key={attachment.id}
        ref={(el) => {
          if (el) thumbnailRefs.current[attachment.id] = el;
        }}
        className="relative group"
        onMouseEnter={(e) => handleHover(attachment.id, e)}
        onMouseLeave={handleHoverLeave}
      >
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          {isImage && imageUrls[attachment.id] ? (
            <img
              src={imageUrls[attachment.id]}
              alt={attachment.originalName}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              {getFileIcon(attachment.mimeType, "w-4 h-4")}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/90 truncate">{attachment.originalName}</p>
            <p className="text-xs text-white/60">{formatFileSize(attachment.size)}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => downloadFile(attachment.id, attachment.entityType)}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
            {showDelete && onDelete && (
              <ButtonDestructive
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (deleteConfirmId === attachment.id) {
                    onDelete(attachment.id);
                    setDeleteConfirmId(null);
                  } else {
                    setDeleteConfirmId(attachment.id);
                  }
                }}
                title="Delete"
              >
                <X className="w-4 h-4" />
              </ButtonDestructive>
            )}
          </div>
        </div>
        {deleteConfirmId === attachment.id && showDelete && onDelete && (
          <div className="absolute top-0 right-0 bg-red-500/20 border border-red-500/30 rounded-lg p-2 whitespace-nowrap text-xs text-red-300">
            Click again to confirm
          </div>
        )}
      </div>
    );
  };

  if (!attachmentsEnabled || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {attachments.map(renderAttachmentThumbnail)}
      {mounted && showPreview && hoveredId && previewPosition && (
        createPortal(
          <div
            className="fixed z-50 w-80 bg-[#1a2332] border border-white/20 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: `${previewPosition.top}px`,
              left: `${previewPosition.left}px`,
            }}
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
              }
            }}
            onMouseLeave={handleHoverLeave}
          >
            {attachments.map((attachment) => {
              if (attachment.id !== hoveredId) return null;
              const isImage = attachment.mimeType.startsWith('image/');

              return (
                <div key={attachment.id}>
                  <div className="relative h-64 bg-black/20 flex items-center justify-center">
                    {isImage && imageUrls[attachment.id] ? (
                      <img
                        src={imageUrls[attachment.id]}
                        alt={attachment.originalName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-white/60 flex items-center justify-center">
                        {getFileIcon(attachment.mimeType, "w-16 h-16")}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white/90">{attachment.originalName}</p>
                      <p className="text-xs text-white/60">{formatFileSize(attachment.size)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => downloadFile(attachment.id, attachment.entityType)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {showDelete && onDelete && (
                        <ButtonDestructive
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(attachment.id)}
                        >
                          <X className="w-4 h-4" />
                        </ButtonDestructive>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>,
          document.body
        )
      )}
    </div>
  );
}

