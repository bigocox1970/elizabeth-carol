import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Save, ChevronLeft, ChevronRight, Copy, X, List, Grid3X3, Eye, EyeOff, CheckCircle } from "lucide-react";
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayView, setShowDayView] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [selectedCopyDates, setSelectedCopyDates] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
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
      const stored = localStorage.getItem('elizabeth_availability');
      if (stored) {
        setSlots(JSON.parse(stored));
      }
      const bookedStored = localStorage.getItem('elizabeth_booked_slots');
      if (bookedStored) {
        setBookedSlots(JSON.parse(bookedStored));
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
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

  const hasBookings = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const slotsForDate = slots.filter(slot => slot.date === dateString);
    return slotsForDate.some(slot => bookedSlots.includes(slot.id!));
  };

  const isSlotBooked = (slotId: number) => {
    return bookedSlots.includes(slotId);
  };

  const toggleSlotBooking = (slotId: number) => {
    const newBookedSlots = isSlotBooked(slotId)
      ? bookedSlots.filter(id => id !== slotId)
      : [...bookedSlots, slotId];
    
    setBookedSlots(newBookedSlots);
    localStorage.setItem('elizabeth_booked_slots', JSON.stringify(newBookedSlots));
    
    toast.success(isSlotBooked(slotId) ? 'Slot marked as available' : 'Slot marked as booked');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setNewSlot({ ...newSlot, date: dateString });
    setShowDayView(true);
  };

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
    
    setNewSlot({
      ...newSlot,
      start_time: '',
      end_time: '',
      notes: ''
    });
  };

  const removeSlot = (id: number) => {
    const updatedSlots = slots.filter(slot => slot.id !== id);
    saveAvailability(updatedSlots);
  };

  const toggleSlotSelection = (slotId: number) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const copySelectedSlots = () => {
    if (selectedSlots.length === 0 || selectedCopyDates.length === 0) {
      toast.error('Please select time slots and dates to copy to');
      return;
    }

    const slotsToCopy = slots.filter(slot => selectedSlots.includes(slot.id!));
    
    const newSlots = [];
    selectedCopyDates.forEach(targetDate => {
      slotsToCopy.forEach(sourceSlot => {
        newSlots.push({
          ...sourceSlot,
          id: Date.now() + Math.random(),
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
    setSelectedSlots([]);
    
    toast.success(`Copied ${slotsToCopy.length} time slot(s) to ${selectedCopyDates.length} date(s)`);
  };

  const toggleCopyDate = (dateString: string) => {
    setSelectedCopyDates(prev => 
      prev.includes(dateString) 
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString]
    );
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
        <p className="text-muted-foreground mb-4">
          {viewMode === 'calendar' 
            ? 'Click dates to add times. Select time slots to copy them to other days.'
            : 'View your upcoming booked sessions in chronological order.'
          }
        </p>
        
        {/* View Toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            Bookings
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Availability Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            🟢 Available times • 🔵 Bookings • Click any date to manage times
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <div key={index} className="aspect-square min-w-0">
                  {date ? (
                    <Button
                      variant="ghost"
                      className={`w-full h-full p-1 text-xs sm:text-sm min-w-0 ${
                        hasBookings(date)
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300'
                          : hasAvailability(date) 
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
                      <div className="flex flex-col items-center min-w-0">
                        <span className="truncate">{date.getDate()}</span>
                        {(hasAvailability(date) || hasBookings(date)) && (
                          <div className={`w-1 h-1 rounded-full mt-1 ${
                            hasBookings(date) ? 'bg-blue-600' : 'bg-green-600'
                          }`}></div>
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
        </CardContent>
      </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Your Availability List
            </CardTitle>
            <CardDescription>
              Your upcoming booked sessions in chronological order
            </CardDescription>
          </CardHeader>
          <CardContent>

            {slots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Availability Set</h3>
                <p className="text-muted-foreground mb-6">
                  Switch to Calendar view to add your available times.
                </p>
                <Button 
                  onClick={() => setViewMode('calendar')}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Go to Calendar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {slots.filter(slot => isSlotBooked(slot.id!)).length} booking{slots.filter(slot => isSlotBooked(slot.id!)).length === 1 ? '' : 's'}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {slots
                    .filter(slot => isSlotBooked(slot.id!))
                    .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime())
                    .map((slot) => (
                      <Card key={slot.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <div className="font-medium text-lg">
                                    {formatDate(slot.date)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                  </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-2">
                                  <div className="flex flex-col gap-1">
                                    <Badge variant={isSlotBooked(slot.id!) ? "default" : "secondary"}>
                                      {isSlotBooked(slot.id!) ? '🔵 Booked' : '🟢 Available'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {slot.service_type === 'both' ? 'In-person & Remote' :
                                       slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant={isSlotBooked(slot.id!) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleSlotBooking(slot.id!)}
                                      className="text-xs"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {isSlotBooked(slot.id!) ? 'Booked' : 'Mark Booked'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => selectDate(new Date(slot.date))}
                                      className="text-xs"
                                    >
                                      Edit Day
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {slot.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  "{slot.notes}"
                                </p>
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
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Day View Modal */}
      {showDayView && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={(e) => e.target === e.currentTarget && setShowDayView(false)}>
          <Card className="w-full max-w-lg sm:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">{formatDate(selectedDate)}</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowDayView(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              {/* Add New Time Slot */}
              <div className="space-y-4">
                <h4 className="font-medium">Add New Time Slot</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Existing Time Slots */}
              {getSlotsForDate(new Date(selectedDate)).length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="font-medium">Your Times for This Day</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (selectedSlots.length === 0) {
                          toast.error('Please select time slots first by ticking the checkboxes');
                          return;
                        }
                        setShowCopyModal(true);
                      }}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Copy className="w-4 h-4" />
                      {selectedSlots.length > 0 ? `Copy Selected (${selectedSlots.length})` : 'Copy Times'}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    💡 <strong>Tip:</strong> Tick the checkboxes next to time slots, then click "Copy Times" to duplicate them to other days
                  </div>
                  <div className="space-y-2">
                    {getSlotsForDate(new Date(selectedDate)).map((slot) => (
                      <div key={slot.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <input
                          type="checkbox"
                          checked={selectedSlots.includes(slot.id!)}
                          onChange={() => toggleSlotSelection(slot.id!)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={isSlotBooked(slot.id!) ? "default" : "secondary"}>
                              {isSlotBooked(slot.id!) ? '🔵 Booked' : '🟢 Available'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {slot.service_type === 'both' ? 'In-person & Remote' :
                               slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                            </Badge>
                          </div>
                          {slot.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{slot.notes}</p>
                          )}
                        </div>
                        <Button
                          variant={isSlotBooked(slot.id!) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSlotBooking(slot.id!)}
                          className="text-xs mr-2"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {isSlotBooked(slot.id!) ? 'Booked' : 'Mark Booked'}
                        </Button>
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
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={(e) => e.target === e.currentTarget && setShowCopyModal(false)}>
          <Card className="w-full max-w-lg sm:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Copy {selectedSlots.length} Time Slot{selectedSlots.length === 1 ? '' : 's'}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowCopyModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Select the dates you want to copy these time slots to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium">Selected Time Slots:</h4>
                <div className="space-y-2">
                  {slots.filter(slot => selectedSlots.includes(slot.id!)).map(slot => (
                    <div key={slot.id} className="p-2 bg-muted rounded text-sm">
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)} ({slot.service_type})
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Choose Dates to Copy To:</h4>
                <div className="text-sm text-muted-foreground mb-2">
                  Selected: {selectedCopyDates.length} date{selectedCopyDates.length === 1 ? '' : 's'}
                </div>
                
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
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((date, index) => {
                      if (!date) return <div key={index}></div>;
                      
                      const dateString = date.toISOString().split('T')[0];
                      const isSelected = selectedCopyDates.includes(dateString);
                      const isPastDate = date < new Date(new Date().setHours(0,0,0,0));
                      
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className={`h-8 p-1 text-xs ${
                            isSelected 
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : isPastDate
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-muted'
                          }`}
                          onClick={() => !isPastDate && toggleCopyDate(dateString)}
                          disabled={isPastDate}
                        >
                          {date.getDate()}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedCopyDates.length > 0 && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={copySelectedSlots} className="flex-1">
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

      {slots.length > 0 && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Click dates to manage times. Select time slots with checkboxes to copy them to multiple days.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager; 