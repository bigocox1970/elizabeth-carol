import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Save, ChevronLeft, ChevronRight, Eye, Copy } from "lucide-react";
import { toast } from "sonner";

interface AvailabilitySlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  notes?: string;
}

const AvailabilityManager = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromDate, setCopyFromDate] = useState<string | null>(null);
  const [selectedCopyDates, setSelectedCopyDates] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    date: '',
    start_time: '',
    end_time: '',
    service_type: 'both',
    notes: ''
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      // For now, we'll use localStorage to store availability
      // Later we can connect to Supabase when ready
      const stored = localStorage.getItem('elizabeth_availability');
      if (stored) {
        setSlots(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = (updatedSlots: AvailabilitySlot[]) => {
    try {
      localStorage.setItem('elizabeth_availability', JSON.stringify(updatedSlots));
      setSlots(updatedSlots);
      toast.success('Availability saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    }
  };

  const addSlot = () => {
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const slotWithId = {
      ...newSlot,
      id: Date.now() // Simple ID for now
    };

    const updatedSlots = [...slots, slotWithId].sort((a, b) => 
      new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime()
    );

    saveAvailability(updatedSlots);
    
    // Reset form
    setNewSlot({
      date: '',
      start_time: '',
      end_time: '',
      service_type: 'both',
      notes: ''
    });
  };

  const removeSlot = (id: number) => {
    const updatedSlots = slots.filter(slot => slot.id !== id);
    saveAvailability(updatedSlots);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return slots.filter(slot => slot.date === dateString);
  };

  const hasAvailability = (date: Date) => {
    return getSlotsForDate(date).length > 0;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setNewSlot({ ...newSlot, date: dateString });
    setShowTimeSlots(true);
  };

  // Generate 15-minute interval times
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const addTimeSlot = () => {
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const slotWithId = {
      ...newSlot,
      id: Date.now()
    };

    const updatedSlots = [...slots, slotWithId].sort((a, b) => 
      new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime()
    );

    saveAvailability(updatedSlots);
    
    // Reset time fields but keep the date
    setNewSlot({
      ...newSlot,
      start_time: '',
      end_time: '',
      notes: ''
    });
  };

  const copyTimesToDates = () => {
    if (!copyFromDate || selectedCopyDates.length === 0) {
      toast.error('Please select dates to copy to');
      return;
    }

    const sourceSlots = getSlotsForDate(new Date(copyFromDate));
    if (sourceSlots.length === 0) {
      toast.error('No time slots found for the selected date');
      return;
    }

    const newSlots = [];
    selectedCopyDates.forEach(targetDate => {
      sourceSlots.forEach(sourceSlot => {
        newSlots.push({
          ...sourceSlot,
          id: Date.now() + Math.random(), // Unique ID
          date: targetDate
        });
      });
    });

    const updatedSlots = [...slots, ...newSlots].sort((a, b) => 
      new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime()
    );

    saveAvailability(updatedSlots);
    setShowCopyModal(false);
    setSelectedCopyDates([]);
    setCopyFromDate(null);
    
    toast.success(`Copied ${sourceSlots.length} time slot(s) to ${selectedCopyDates.length} date(s)`);
  };

  const toggleCopyDate = (dateString: string) => {
    setSelectedCopyDates(prev => 
      prev.includes(dateString) 
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Manage Your Availability</h2>
        <p className="text-muted-foreground">
          Click on dates to add available times. Green dates show existing availability.
        </p>
      </div>

      {/* View Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold min-w-[200px] text-center">
                {view === 'month' && currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                {view === 'week' && `Week of ${currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                {view === 'day' && currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          {view === 'month' && (
            <div className="space-y-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date ? (
                      <Button
                        variant="ghost"
                        className={`w-full h-full p-1 text-sm ${
                          hasAvailability(date) 
                            ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300' 
                            : 'hover:bg-muted'
                        } ${
                          date < new Date(new Date().setHours(0,0,0,0)) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'cursor-pointer'
                        }`}
                        onClick={() => date >= new Date(new Date().setHours(0,0,0,0)) && selectDate(date)}
                        disabled={date < new Date(new Date().setHours(0,0,0,0))}
                      >
                        <div className="flex flex-col items-center">
                          <span>{date.getDate()}</span>
                          {hasAvailability(date) && (
                            <div className="w-1 h-1 bg-green-600 rounded-full mt-1"></div>
                          )}
                        </div>
                      </Button>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'week' && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays(currentDate).map((date, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </div>
                    <Button
                      variant="ghost"
                      className={`w-full h-20 p-2 ${
                        hasAvailability(date) 
                          ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300' 
                          : 'hover:bg-muted'
                      } ${
                        date < new Date(new Date().setHours(0,0,0,0)) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer'
                      }`}
                      onClick={() => date >= new Date(new Date().setHours(0,0,0,0)) && selectDate(date)}
                      disabled={date < new Date(new Date().setHours(0,0,0,0))}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold">{date.getDate()}</span>
                        {hasAvailability(date) && (
                          <span className="text-xs">Available</span>
                        )}
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'day' && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  variant="ghost"
                  className={`w-full max-w-md h-32 p-4 ${
                    hasAvailability(currentDate) 
                      ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => selectDate(currentDate)}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">{currentDate.getDate()}</span>
                    <span className="text-sm">{currentDate.toLocaleDateString('en-GB', { month: 'long' })}</span>
                    {hasAvailability(currentDate) && (
                      <span className="text-sm mt-2">Click to manage times</span>
                    )}
                  </div>
                </Button>
              </div>
              
              {/* Show existing slots for this day */}
              <div className="space-y-2">
                {getSlotsForDate(currentDate).map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <div className="font-medium">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {slot.service_type === 'both' ? 'In-person & Remote' :
                         slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => slot.id && removeSlot(slot.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slot Management */}
      {showTimeSlots && selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Time for {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </CardTitle>
                <CardDescription>
                  Add available time slots for this date
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTimeSlots(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <select
                  id="start_time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Select start time</option>
                  {timeOptions.map(time => (
                    <option key={time.value} value={time.value}>{time.display}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <select
                  id="end_time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Select end time</option>
                  {timeOptions.map(time => (
                    <option key={time.value} value={time.value}>{time.display}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <select
                  id="service_type"
                  value={newSlot.service_type}
                  onChange={(e) => setNewSlot({ ...newSlot, service_type: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="both">Both (In-person & Remote)</option>
                  <option value="in_person">In-person Only</option>
                  <option value="remote">Remote Only</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any special notes about this time slot..."
                value={newSlot.notes}
                onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
              />
            </div>
            <Button onClick={addTimeSlot} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
            
            {/* Existing slots for this date */}
            {getSlotsForDate(new Date(selectedDate)).length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Existing times for this date:</h4>
                {getSlotsForDate(new Date(selectedDate)).map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {slot.service_type === 'both' ? 'In-person & Remote' :
                         slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                      </Badge>
                      {slot.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{slot.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => slot.id && removeSlot(slot.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Availability Summary
            </CardTitle>
            {slots.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCopyModal(true)}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Times
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No availability set yet.</p>
              <p className="text-sm">Use the calendar above to add your available times.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                You have {slots.length} available time slot{slots.length === 1 ? '' : 's'} set up.
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {slots
                  .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime())
                  .map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <div>
                        <div className="font-medium">
                          {formatDate(slot.date)} - {formatTime(slot.start_time)} to {formatTime(slot.end_time)}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {slot.service_type === 'both' ? 'In-person & Remote' :
                           slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => slot.id && removeSlot(slot.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {slots.length > 0 && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Green dates show when you're available. Click any date to add or manage time slots. Use "Copy Times" to duplicate your schedule to multiple days.
          </p>
        </div>
      )}

      {/* Copy Times Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Copy Times to Multiple Days
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowCopyModal(false)}>
                  Close
                </Button>
              </div>
              <CardDescription>
                Select a date to copy from, then select the dates you want to copy to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Select source date */}
              <div className="space-y-3">
                <h4 className="font-medium">Step 1: Choose date to copy FROM</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {Array.from(new Set(slots.map(slot => slot.date)))
                    .sort()
                    .map(date => {
                      const dateObj = new Date(date);
                      const slotsForDate = getSlotsForDate(dateObj);
                      return (
                        <Button
                          key={date}
                          variant={copyFromDate === date ? "default" : "outline"}
                          className="justify-start h-auto p-3"
                          onClick={() => setCopyFromDate(date)}
                        >
                          <div className="text-left">
                            <div className="font-medium">
                              {formatDate(date)}
                            </div>
                            <div className="text-sm opacity-75">
                              {slotsForDate.length} time slot{slotsForDate.length === 1 ? '' : 's'}: {' '}
                              {slotsForDate.map(slot => `${formatTime(slot.start_time)}-${formatTime(slot.end_time)}`).join(', ')}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                </div>
              </div>

              {/* Step 2: Select target dates */}
              {copyFromDate && (
                <div className="space-y-3">
                  <h4 className="font-medium">Step 2: Choose dates to copy TO</h4>
                  <div className="text-sm text-muted-foreground mb-2">
                    Click dates to select/deselect. Selected: {selectedCopyDates.length}
                  </div>
                  
                  {/* Mini calendar for date selection */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h5 className="font-medium">
                        {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </h5>
                      <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    
                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentDate).map((date, index) => {
                        if (!date) return <div key={index}></div>;
                        
                        const dateString = date.toISOString().split('T')[0];
                        const isSelected = selectedCopyDates.includes(dateString);
                        const isSourceDate = dateString === copyFromDate;
                        const isPastDate = date < new Date(new Date().setHours(0,0,0,0));
                        
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className={`h-8 p-1 text-xs ${
                              isSourceDate 
                                ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                                : isSelected 
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : isPastDate
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-muted'
                            }`}
                            onClick={() => !isSourceDate && !isPastDate && toggleCopyDate(dateString)}
                            disabled={isSourceDate || isPastDate}
                          >
                            {date.getDate()}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {copyFromDate && selectedCopyDates.length > 0 && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={copyTimesToDates} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to {selectedCopyDates.length} date{selectedCopyDates.length === 1 ? '' : 's'}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedCopyDates([])}>
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager; 