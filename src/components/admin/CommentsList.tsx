import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trash2, RefreshCw, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  postId: string;
  postTitle: string;
  approved: boolean;
  createdAt: string;
}

const CommentsList = () => {
  const { session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      loadComments();
    }
  }, [session]);

  const loadComments = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('manage-comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'get-all-comments'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveComment = async (commentId: string, approve: boolean) => {
    if (!session) return;

    try {
      const response = await fetch(getApiUrl('manage-comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: approve ? 'approve-comment' : 'unapprove-comment',
          commentId: commentId
        }),
      });

      if (response.ok) {
        loadComments();
      } else {
        alert('Failed to update comment.');
      }
    } catch (error) {
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(getApiUrl('manage-comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete-comment',
          commentId: commentId
        }),
      });

      if (response.ok) {
        loadComments();
      } else {
        alert('Failed to delete comment.');
      }
    } catch (error) {
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No comments yet
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{comment.name}</h3>
                    <p className="text-xs text-muted-foreground">{comment.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    {!comment.approved && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApproveComment(comment.id, true)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {comment.approved && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApproveComment(comment.id, false)}
                        className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {comment.content}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                    <span className="text-primary font-medium">
                      On: {comment.postTitle}
                    </span>
                  </div>
                  <Badge variant={comment.approved ? "default" : "outline"}>
                    {comment.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
        <Button 
          onClick={loadComments}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommentsList;
