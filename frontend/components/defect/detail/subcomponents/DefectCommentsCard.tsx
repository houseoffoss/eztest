'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { TextareaWithAttachments, Attachment } from '@/frontend/reusable-elements/textareas/TextareaWithAttachments';
import { uploadFileToS3 } from '@/lib/s3';

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
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { AttachmentDisplay } from '@/frontend/reusable-components/attachments/AttachmentDisplay';

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
  const [submitError, setSubmitError] = useState<string>('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const uploadCommentAttachmentWithFallback = async (file: File): Promise<Attachment> => {
    const uploadResult = await uploadFileToS3({
      file,
      fieldName: 'comment',
      entityType: 'comment',
      projectId,
      onProgress: () => {},
    });

    if (uploadResult.success && uploadResult.attachment) {
      return uploadResult.attachment;
    }

    // S3経由が失敗した場合はローカル保存へ再フォールバック
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', 'comment');
    formData.append('entityType', 'comment');
    formData.append('projectId', projectId);

    const localResponse = await fetch('/api/attachments/upload-local', {
      method: 'POST',
      body: formData,
    });

    if (!localResponse.ok) {
      const localError = await localResponse.json().catch(() => ({ error: 'Failed to upload attachment' }));
      throw new Error(uploadResult.error || localError.error || 'Failed to upload attachment');
    }

    const localData = await localResponse.json();
    if (!localData?.attachment) {
      throw new Error('アップロード結果が不正です');
    }

    return localData.attachment as Attachment;
  };

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
    // Allow submission if either text or attachments exist
    const hasText = newComment.trim().length > 0;
    const hasAttachments = commentAttachments.length > 0;
    if (!hasText && !hasAttachments) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      // First upload any pending attachments
      const uploadedAttachments: Attachment[] = [];
      for (const attachment of commentAttachments) {
        if (attachment.id.startsWith('pending-')) {
          // This is a pending attachment, need to upload it first
          const pendingAttachment = attachment as PendingAttachment;
          const file = pendingAttachment._pendingFile;
          if (!file) {
            console.error('Pending attachment missing file:', attachment.id);
            continue;
          }

          const uploaded = await uploadCommentAttachmentWithFallback(file);
          uploadedAttachments.push(uploaded);
        } else {
          // Already uploaded
          uploadedAttachments.push(attachment);
        }
      }

      // Create the comment (allow empty content if attachments exist)
      const commentContent = newComment.trim() || '';
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
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
            throw new Error(`添付ファイルの関連付けに失敗しました: ${errorText}`);
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
    } catch (error) {
      console.error('Failed to add comment', error);
      setSubmitError(error instanceof Error ? error.message : 'コメント投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return commentDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <DetailCard title="コメント" contentClassName="!p-0">
      <div className="flex flex-col h-[500px]">
        {/* Comments list */}
        <div className={`flex-1 p-6 space-y-4 ${comments.length > 0 ? 'overflow-y-auto custom-scrollbar' : 'overflow-y-hidden'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              コメントを読み込み中...
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <p className="text-base font-medium text-gray-300">まだコメントがありません</p>
                <p className="text-sm mt-2 text-gray-500">最初のコメントを投稿してみましょう</p>
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
                  <div className="w-10 h-10 flex-shrink-0 ring-2 ring-white/10 rounded-full overflow-hidden">
                    {comment.user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={comment.user.avatar} 
                        alt={comment.user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col max-w-[75%]`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`text-sm font-semibold ${
                        isCurrentUser ? 'text-blue-400' : 'text-gray-200'
                      }`}>
                        {isCurrentUser ? 'あなた' : comment.user.name}
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
                      {comment.content && comment.content.trim() && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      )}
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className={`space-y-2 ${comment.content && comment.content.trim() ? 'mt-3 pt-3 border-t border-white/10' : ''}`}>
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
              projectId={projectId}
              forceShowAttachments={true}
              uploadOnSave={true}
              placeholder="コメントを入力..."
              rows={2}
              disabled={submitting}
            />
            <div className="flex justify-end">
              <ButtonPrimary
                type="submit"
                disabled={(!newComment.trim() && commentAttachments.length === 0) || submitting}
                size="sm"
                className="min-w-[120px]"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? '保存中...' : '保存する'}
              </ButtonPrimary>
            </div>
            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}
          </form>
        </div>
      </div>
    </DetailCard>
  );
};
