'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { type Attachment, downloadFile, getFileIconType, formatFileSize } from '@/lib/s3';
import { cn } from '@/lib/utils';
import { Button } from '@/elements/button';
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';

interface AttachmentDisplayProps {
  attachments: Attachment[];
  showPreview?: boolean;
}

export function AttachmentDisplay({ attachments, showPreview = true }: AttachmentDisplayProps) {
  // Check if attachments feature is enabled
  const attachmentsEnabled = isAttachmentsEnabledClient();
  
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

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

  // Don't show attachments if feature is disabled
  if (!attachmentsEnabled || attachments.length === 0) {
    return null;
  }

  return (
    <div className="relative flex flex-wrap gap-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith('image/');
        
        return (
          <div
            key={attachment.id}
            className="relative flex-shrink-0"
            onMouseEnter={() => showPreview && setHoveredId(attachment.id)}
            onMouseLeave={() => showPreview && setHoveredId(null)}
          >
            {/* Thumbnail */}
            <div 
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

            {/* Hover Preview Card */}
            {showPreview && hoveredId === attachment.id && (
              <div 
                className="absolute bottom-full left-0 mb-2 z-50 w-80 bg-[#1a2332] border border-white/20 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onMouseEnter={() => setHoveredId(attachment.id)}
                onMouseLeave={() => setHoveredId(null)}
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
                      size="sm"
                      variant="glass"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                      title="Download file"
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
