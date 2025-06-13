import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, RefreshCw, Trash2, Mail, Edit, UserX } from "lucide-react";
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

  const handleSuspendSelected = async () => {
    if (selectedSubscribers.size === 0) return;
    
    if (!confirm(`Are you sure you want to suspend ${selectedSubscribers.size} selected subscribers?`)) return;

    for (const subscriberId of selectedSubscribers) {
      try {
        await fetch(getApiUrl('manage-subscribers'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'update-subscriber',
            subscriberId: subscriberId,
            active: false
          }),
        });
      } catch (error) {
        console.error(`Failed to suspend subscriber ${subscriberId}:`, error);
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
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span className="sm:hidden">Subs ({subscribers.length})</span>
          <span className="hidden sm:inline">Subscribers ({subscribers.length})</span>
        </CardTitle>
        
        <div className="flex items-center space-x-2">
          {/* Edit Mode Toggle */}
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            title={isEditMode ? 'Done editing' : 'Edit subscribers'}
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          {/* Show action buttons when in edit mode with selections */}
          {isEditMode && selectedSubscribers.size > 0 && (
            <>
              <Badge variant="secondary">
                {selectedSubscribers.size}
              </Badge>
              <Button
                onClick={handleSuspendSelected}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                title={`Suspend ${selectedSubscribers.size} selected subscribers`}
              >
                <UserX className="w-4 h-4" />
              </Button>
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
          <div className="space-y-2">
            {/* Select All - Only show in edit mode */}
            {isEditMode && (
              <div className="flex items-center space-x-2 p-2 bg-secondary/10 rounded border">
                <Checkbox
                  checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm">Select All</span>
              </div>
            )}

            {/* Subscribers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subscribers.map((subscriber) => (
                <Card key={subscriber.id} className="relative">
                  <CardContent className="p-4">
                    {/* Checkbox - Only show in edit mode */}
                    {isEditMode && (
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedSubscribers.has(subscriber.id)}
                          onCheckedChange={() => toggleSubscriber(subscriber.id)}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-sm truncate">
                            {subscriber.name || 'No name'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {subscriber.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge 
                            variant={subscriber.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {subscriber.active ? "Active" : "Suspended"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {subscriber.source || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      
                      {subscriber.dateAdded && (
                        <p className="text-xs text-muted-foreground">
                          Added: {new Date(subscriber.dateAdded).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
