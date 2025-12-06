'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';
import { DetailCard } from '@/components/design/DetailCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/elements/avatar';
import { Input } from '@/elements/input';
import { Button } from '@/elements/button';

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
      const response = await fetch(`/api/projects/${projectId}/defects/${defectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const data = await response.json();
      setComments([...comments, data.data]);
      setNewComment('');
      
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
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment</p>
            </div>
          ) : (
            comments.map((comment) => {
              const currentUserId = session?.user?.id;
              const isCurrentUser = currentUserId === comment.userId || currentUserId === comment.user.id;
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {comment.user.avatar ? (
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    ) : null}
                    <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`text-sm font-medium ${isCurrentUser ? 'text-blue-400' : 'text-gray-300'}`}>
                        {isCurrentUser ? 'You' : comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment input */}
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={submitting}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </DetailCard>
  );
};
