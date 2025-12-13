'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';
import { DetailCard } from '@/components/design/DetailCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/elements/avatar';
import { TextareaWithAttachments, Attachment } from '@/elements/textarea-with-attachments';

// Extended type for pending attachments with file object
interface PendingAttachment extends Attachment {
  _pendingFile?: File;
}

// Separate component for comment attachments to avoid hook ordering issues
function CommentAttachmentItem({ attachment }: { attachment: { id: string; filename: string; originalName: string; size: number; mimeType: string; uploadedAt: Date } }) {
  const isImage = attachment.mimeType.startsWith('image/');
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isImage) {
      fetch(`/api/comment-attachments/${attachment.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.url) {
            setImageUrl(data.data.url);
          }
        })
        .catch(console.error);
    }
  }, [attachment.id, isImage]);

  if (isImage && imageUrl) {
    return (
      <div className="rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={attachment.originalName}
          className="max-w-full h-auto max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(imageUrl, '_blank')}
        />
      </div>
    );
  }

  return (
    <AttachmentDisplay
      attachments={[{
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt.toString(),
        entityType: 'comment',
      }]}
      showPreview={true}
    />
  );
}
import { ButtonPrimary } from '@/elements/button-primary';
import { AttachmentDisplay } from '@/components/common/AttachmentDisplay';

import { DefectComment } from '../types';

interface DefectCommentsCardProps {
  projectId: string;
  defectId: string;
}

export const DefectCommentsCard: React.FC<DefectCommentsCardProps> = ({
  projectId,
  defectId,
}) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<DefectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.data || []);
    } catch {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [projectId, defectId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // First upload any pending attachments
      const uploadedAttachments = [];
      for (const attachment of commentAttachments) {
        if (attachment.id.startsWith('pending-')) {
          // This is a pending attachment, need to upload it first
          const pendingAttachment = attachment as PendingAttachment;
          const file = pendingAttachment._pendingFile;
          if (!file) {
            console.error('Pending attachment missing file:', attachment.id);
            continue;
          }

          // Upload the file
          const { uploadFileToS3 } = await import('@/lib/s3');
          const uploadResult = await uploadFileToS3({
            file,
            fieldName: 'comment',
            entityType: 'comment',
            onProgress: () => {},
          });

          if (uploadResult.success && uploadResult.attachment) {
            uploadedAttachments.push(uploadResult.attachment);
          } else {
            console.error('Failed to upload attachment:', uploadResult.error);
          }
        } else {
          // Already uploaded
          uploadedAttachments.push(attachment);
        }
      }

      // Create the comment
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const data = await response.json();
      const newCommentData = data.data;

      // Then link attachments to the comment
      if (uploadedAttachments.length > 0) {
        for (const attachment of uploadedAttachments) {
          // The attachment.filename from upload IS the S3 path
          // No need to fetch it again
          const linkResponse = await fetch(`/api/comments/${newCommentData.id}/attachments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: attachment.filename, // This is the S3 key from upload
              originalName: attachment.originalName,
              mimeType: attachment.mimeType,
              size: attachment.size,
              path: attachment.filename, // Use the S3 key as path
              fieldName: 'comment',
            }),
          });

          if (!linkResponse.ok) {
            const errorText = await linkResponse.text();
            console.error('Failed to link attachment:', errorText);
          }
        }
      }

      // Refetch comments to get the comment with attachments
      await fetchComments();
      setNewComment('');
      setCommentAttachments([]);
      
      // Scroll to bottom after adding comment
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      console.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    // Scroll to bottom when comments load
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <DetailCard title="Comments" contentClassName="!p-0">
      <div className="flex flex-col h-[500px]">
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <p className="text-base font-medium text-gray-300">No comments yet</p>
                <p className="text-sm mt-2 text-gray-500">Be the first to share your thoughts</p>
              </div>
            </div>
          ) : (
            comments.map((comment) => {
              const currentUserId = session?.user?.id;
              const isCurrentUser = currentUserId === comment.userId || currentUserId === comment.user.id;
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} group`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-white/10">
                    {comment.user.avatar ? (
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    ) : null}
                    <AvatarFallback className="text-sm font-semibold">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col max-w-[75%]`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`text-sm font-semibold ${
                        isCurrentUser ? 'text-blue-400' : 'text-gray-200'
                      }`}>
                        {isCurrentUser ? 'You' : comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-lg ${
                        isCurrentUser
                          ? 'bg-gray-800/90 backdrop-blur-sm text-gray-100 border border-blue-500/30'
                          : 'bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          {comment.attachments.map(att => (
                            <CommentAttachmentItem key={att.id} attachment={att} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment input */}
        <div className="border-t border-gray-700/50 p-5 bg-gradient-to-b from-gray-900 to-gray-900/95">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <TextareaWithAttachments
              variant="glass"
              fieldName="comment"
              value={newComment}
              onChange={setNewComment}
              attachments={commentAttachments}
              onAttachmentsChange={setCommentAttachments}
              entityType="comment"
              placeholder="Write a comment..."
              rows={2}
              disabled={submitting}
            />
            <div className="flex justify-end">
              <ButtonPrimary
                type="submit"
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="min-w-[120px]"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </ButtonPrimary>
            </div>
          </form>
        </div>
      </div>
    </DetailCard>
  );
};
