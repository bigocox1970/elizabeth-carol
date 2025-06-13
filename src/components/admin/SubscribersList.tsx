import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, RefreshCw, Trash2, Mail, CheckSquare, Square, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  source: string;
  dateAdded: string;
  active: boolean;
}

const SubscribersList = () => {
  const { session } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (session) {
      loadSubscribers();
    }
  }, [session]);

  // Reset selections when exiting edit mode
  useEffect(() => {
    if (!isEditMode) {
      setSelectedSubscribers(new Set());
    }
  }, [isEditMode]);

  const loadSubscribers = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('manage-subscribers'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'get-all-subscribers' }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await fetch(getApiUrl('manage-subscribers'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete-subscriber',
          subscriberId: subscriberId
        }),
      });

      if (response.ok) {
        loadSubscribers();
        // Remove from selected if it was selected
        const newSelected = new Set(selectedSubscribers);
        newSelected.delete(subscriberId);
        setSelectedSubscribers(newSelected);
      } else {
        alert('Failed to delete subscriber.');
      }
    } catch (error) {
      alert('Failed to delete subscriber. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSubscribers.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedSubscribers.size} selected subscribers?`)) return;

    for (const subscriberId of selectedSubscribers) {
      try {
        await fetch(getApiUrl('manage-subscribers'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'delete-subscriber',
            subscriberId: subscriberId
          }),
        });
      } catch (error) {
        console.error(`Failed to delete subscriber ${subscriberId}:`, error);
      }
    }
    
    setSelectedSubscribers(new Set());
    loadSubscribers();
  };

  const toggleSubscriber = (subscriberId: string) => {
    if (!isEditMode) return;
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(subscriberId)) {
      newSelected.delete(subscriberId);
    } else {
      newSelected.add(subscriberId);
    }
    setSelectedSubscribers(newSelected);
  };

  const toggleAll = () => {
    if (!isEditMode) return;
    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map(sub => sub.id)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Subscribers ({subscribers.length})</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Edit Mode Toggle */}
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? "default" : "outline"}
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
            
            {/* Show selected count and delete button when in edit mode with selections */}
            {isEditMode && selectedSubscribers.size > 0 && (
              <>
                <Badge variant="secondary">
                  {selectedSubscribers.size} selected
                </Badge>
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={`Delete ${selectedSubscribers.size} selected subscribers`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : subscribers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No subscribers yet
          </p>
        ) : (
          <div className="space-y-3">
            {/* Select All - Only show in edit mode */}
            {isEditMode && (
              <div className="flex items-center space-x-2 p-3 bg-secondary/10 rounded-lg border">
                <Checkbox
                  checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm font-medium">
                  Select All ({subscribers.length})
                </span>
              </div>
            )}

            {/* Subscribers List */}
            {subscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                {/* Checkbox - Only show in edit mode */}
                {isEditMode && (
                  <Checkbox
                    checked={selectedSubscribers.has(subscriber.id)}
                    onCheckedChange={() => toggleSubscriber(subscriber.id)}
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{subscriber.name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground truncate">{subscriber.email}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant={subscriber.source === 'contact_form' ? 'default' : 'secondary'} className="text-xs">
                        {subscriber.source === 'contact_form' ? 'Contact' : 'Newsletter'}
                      </Badge>
                      
                      <Badge variant={subscriber.active ? 'default' : 'outline'} className="text-xs">
                        {subscriber.active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <Button
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete subscriber"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {subscriber.dateAdded && (
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(subscriber.dateAdded).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2 mt-4">
          <Button 
            onClick={loadSubscribers}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
          
          {selectedSubscribers.size > 0 && (
            <Button
              onClick={() => {
                // This will be used by the Newsletter component
                window.dispatchEvent(new CustomEvent('selectedSubscribers', { 
                  detail: Array.from(selectedSubscribers) 
                }));
              }}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Selected ({selectedSubscribers.size})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscribersList;
