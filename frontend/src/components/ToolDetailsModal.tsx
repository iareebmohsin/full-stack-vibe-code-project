'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Badge, Button, Textarea } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface Tool {
  id: number;
  title: string;
  description: string;
  url?: string;
  github_url?: string;
  documentation_url?: string;
  thumbnail_url?: string;
  category: {
    id: number;
    name: string;
    icon?: string;
  };
  tags: Array<{ id: number; name: string }>;
  roles_list?: string[];
  tool_type: string;
  pricing_model: string;
  views_count: number;
  favorites_count: number;
  is_favorited: boolean;
  created_at: string;
}

interface Comment {
  id: number;
  comment: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
  created_at_full: string;
}

interface ToolDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
  onFavoriteToggle: (toolId: number) => void;
}

export const ToolDetailsModal: React.FC<ToolDetailsModalProps> = ({
  isOpen,
  onClose,
  tool,
  onFavoriteToggle,
}) => {
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isOpen && tool) {
      fetchComments();
    }
  }, [isOpen, tool]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/tools/${tool.id}/comments`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !token) return;

    setIsSubmittingComment(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/tools/${tool.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.data, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-[#1a1a1a] rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {tool.thumbnail_url ? (
                <img
                  src={tool.thumbnail_url}
                  alt={tool.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl flex-shrink-0">
                  🤖
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{tool.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" size="sm">
                    {tool.category.icon} {tool.category.name}
                  </Badge>
                  <Badge variant="default" size="sm">{tool.tool_type}</Badge>
                  <Badge variant="info" size="sm">{tool.pricing_model.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300 leading-relaxed">{tool.description}</p>
          </div>

          {/* Stats & Favorite */}
          <div className="flex items-center gap-6 py-4 border-y border-[#2a2a2a]">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{tool.views_count} views</span>
            </div>

            <button
              onClick={() => onFavoriteToggle(tool.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a2a] hover:border-rose-500/50 transition-all group"
            >
              <svg
                className={`w-5 h-5 transition-all ${
                  tool.is_favorited
                    ? 'fill-rose-500 text-rose-500'
                    : 'fill-none text-gray-400 group-hover:text-rose-500'
                }`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className={tool.is_favorited ? 'text-rose-500' : 'text-gray-400 group-hover:text-rose-500'}>
                {tool.favorites_count} {tool.favorites_count === 1 ? 'favorite' : 'favorites'}
              </span>
            </button>
          </div>

          {/* Links */}
          {(tool.url || tool.github_url || tool.documentation_url) && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Links</h3>
              <div className="flex flex-wrap gap-3">
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                )}
                {tool.github_url && (
                  <a
                    href={tool.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {tool.documentation_url && (
                  <a
                    href={tool.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documentation
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tool.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge key={tag.id} variant="default" size="sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Roles */}
          {tool.roles_list && tool.roles_list.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Relevant for</h3>
              <div className="flex flex-wrap gap-2">
                {tool.roles_list.map((role) => (
                  <Badge key={role} variant="success" size="sm">
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-[#2a2a2a] pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {token && (
              <div className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  fullWidth
                />
                <div className="flex justify-end mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-[#2a2a2a] rounded-lg p-4">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{comment.user.name}</span>
                          <span className="text-xs text-gray-500">{comment.created_at}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
