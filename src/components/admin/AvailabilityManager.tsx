import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Save, ChevronLeft, ChevronRight, Copy, X, List, Grid3X3, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AvailabilitySlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  notes?: string;
}

interface Booking {
  id?: number;
  availability_slot_id: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  booking_type: 'manual' | 'online';
  reading_type?: 'in_person' | 'video' | 'telephone' | 'other';
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

interface Client {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

const AvailabilityManager = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayView, setShowDayView] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [selectedCopyDates, setSelectedCopyDates] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<number | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    date: '',
    start_time: '',
    end_time: '',
    service_type: 'both',
    notes: ''
  });
  const [showEditMode, setShowEditMode] = useState(false);

  useEffect(() => {
    loadAvailability();
    loadClients();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (clientSearch) {
        searchClients(clientSearch);
      } else {
        loadClients();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [clientSearch]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      // Load availability slots from Supabase
      const { data: slotsData, error: slotsError } = await supabase
        .from('availability_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (slotsError) {
        console.error('Error loading slots:', slotsError);
        console.error('Error details:', JSON.stringify(slotsError, null, 2));
        toast.error(`Failed to load availability slots: ${slotsError.message}`);
        return;
      }

      // Load bookings from Supabase
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'confirmed');

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
        toast.error('Failed to load bookings');
        return;
      }

      setSlots(slotsData || []);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      console.log('🔍 Loading clients from profiles table...');
      
      // First try to load from profiles table
      let profilesData;
      const { data: initialProfilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
                  .order('name', { ascending: true });
      
      profilesData = initialProfilesData;
      
      // If profiles table is empty or has issues, try to populate it from reviews
      if (!profilesData || profilesData.length === 0) {
        console.log('📝 Profiles table empty, trying to populate from reviews...');
        
        // Get unique users from reviews table
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('name, email')
          .not('email', 'is', null);
        
        if (reviewsData && reviewsData.length > 0) {
          console.log('✅ Found review data:', reviewsData);
          
          // Create profiles for each unique email from reviews
          for (const review of reviewsData) {
            if (review.email) {
              await supabase
                .from('profiles')
                .upsert({
                  id: crypto.randomUUID(),
                  email: review.email,
                  name: review.name || review.email.split('@')[0],
                  created_at: new Date().toISOString()
                }, { onConflict: 'email' });
            }
          }
          
          // Try loading profiles again
          const { data: newProfilesData } = await supabase
            .from('profiles')
            .select('id, name, email, phone')
            .order('name', { ascending: true });
          
          profilesData = newProfilesData;
        }
      }
      
      if (profilesError && profilesError.code === '42P01') {
        toast.error('Profiles table not found. Please run the database migration first.');
        setClients([]);
        return;
      }

      console.log('✅ Final profiles data:', JSON.stringify(profilesData, null, 2));

      const clientsFromProfiles = (profilesData || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || profile.email?.split('@')[0] || 'Unknown',
        phone: profile.phone || ''
      }));

      console.log('✅ Processed clients:', clientsFromProfiles);
      setClients(clientsFromProfiles);
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      setClients([]);
    }
  };

  const searchClients = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await loadClients();
      return;
    }

    console.log('🔍 Searching profiles for:', searchTerm);
    setIsSearchingClients(true);
    try {
      // Search profiles table by name, email, or phone - ALL FIELDS
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(50);
      
      if (profilesError) {
        console.error('❌ Error searching profiles:', profilesError);
        // If profiles table doesn't exist yet, fall back to empty array
        setClients([]);
        return;
      }

      console.log('✅ Search results from profiles:', profilesData);

      const filteredClients = (profilesData || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || profile.email?.split('@')[0] || 'Unknown',
        phone: profile.phone || ''
      }));

      console.log('✅ Processed search results:', filteredClients);
      setClients(filteredClients);
    } catch (error) {
      console.error('❌ Error searching clients:', error);
      setClients([]);
    } finally {
      setIsSearchingClients(false);
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
    return slotsForDate.some(slot => 
      bookings.some(booking => booking.availability_slot_id === slot.id && booking.status === 'confirmed')
    );
  };

  const isSlotBooked = (slotId: number) => {
    return bookings.some(booking => 
      booking.availability_slot_id === slotId && booking.status === 'confirmed'
    );
  };

  const getBookingCount = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const slotsForDate = slots.filter(slot => slot.date === dateString);
    return slotsForDate.filter(slot => 
      bookings.some(booking => booking.availability_slot_id === slot.id && booking.status === 'confirmed')
    ).length;
  };

  const toggleSlotBooking = async (slotId: number) => {
    const existingBooking = bookings.find(booking => 
      booking.availability_slot_id === slotId && booking.status === 'confirmed'
    );

    if (existingBooking) {
      // Edit existing booking
      setEditingBooking(existingBooking);
      setSelectedSlotForBooking(slotId);
      
      // Pre-populate the selected client from booking data
      if (existingBooking.client_name || existingBooking.client_email) {
        const clientFromBooking: Client = {
          id: 'from-booking', // Special ID to indicate this came from booking data
          email: existingBooking.client_email || '',
          name: existingBooking.client_name || existingBooking.client_email || 'Unknown',
          phone: existingBooking.client_phone || ''
        };
        setSelectedClient(clientFromBooking);
      } else {
        setSelectedClient(null);
      }
      
      setClientSearch('');
      setShowBookingModal(true);
    } else {
      // Create new booking - show client selection modal
      setSelectedSlotForBooking(slotId);
      setEditingBooking(null);
      setSelectedClient(null);
      setClientSearch('');
      setShowBookingModal(true);
    }
  };

  const saveBooking = async (bookingData: Partial<Booking>) => {
    try {
      if (editingBooking) {
        // Update existing booking
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', editingBooking.id);

        if (error) {
          console.error('Error updating booking:', error);
          toast.error('Failed to update booking');
          return;
        }

        setBookings(prev => prev.map(b => 
          b.id === editingBooking.id ? { ...b, ...bookingData } : b
        ));
        toast.success('Booking updated successfully');
      } else {
        // Create new booking
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            availability_slot_id: selectedSlotForBooking!,
            booking_type: 'manual',
            status: 'confirmed',
            ...bookingData
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating booking:', error);
          toast.error('Failed to create booking');
          return;
        }

        setBookings(prev => [...prev, data]);
        toast.success('Booking created successfully');
      }

      setShowBookingModal(false);
      setEditingBooking(null);
      setSelectedSlotForBooking(null);
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Failed to save booking');
    }
  };

  const deleteBooking = async (bookingId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking');
        return;
      }

      setBookings(prev => prev.filter(b => b.id !== bookingId));
      toast.success('Booking deleted successfully');
      setShowBookingModal(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
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
    setShowEditMode(false);
    setSelectedSlots([]);
  };

  const addTimeSlot = async () => {
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .insert({
          date: newSlot.date,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          service_type: newSlot.service_type,
          notes: newSlot.notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding slot:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast.error(`Failed to add time slot: ${error.message}`);
        return;
      }

      const updatedSlots = [...slots, data].sort((a, b) => 
        new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime()
      );

      setSlots(updatedSlots);
      toast.success('Time slot added successfully');
      
      setNewSlot({
        ...newSlot,
        start_time: '',
        end_time: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error('Failed to add time slot');
    }
  };

  const removeSlot = async (id: number) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing slot:', error);
        toast.error('Failed to remove time slot');
        return;
      }

      const updatedSlots = slots.filter(slot => slot.id !== id);
      setSlots(updatedSlots);
      
      // Also remove any bookings for this slot
      setBookings(prev => prev.filter(booking => booking.availability_slot_id !== id));
      
      toast.success('Time slot removed successfully');
    } catch (error) {
      console.error('Error removing time slot:', error);
      toast.error('Failed to remove time slot');
    }
  };

  const toggleSlotSelection = (slotId: number) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const selectAllSlots = () => {
    const slotsForDate = getSlotsForDate(new Date(selectedDate!));
    const allSlotIds = slotsForDate.map(slot => slot.id!);
    setSelectedSlots(allSlotIds);
  };

  const deselectAllSlots = () => {
    setSelectedSlots([]);
  };

  const deleteSelectedSlots = async () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select time slots to delete first');
      return;
    }

    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .in('id', selectedSlots);

      if (error) {
        console.error('Error deleting slots:', error);
        toast.error('Failed to delete time slots');
        return;
      }

      const updatedSlots = slots.filter(slot => !selectedSlots.includes(slot.id!));
      setSlots(updatedSlots);
      
      // Also remove any bookings for these slots
      setBookings(prev => prev.filter(booking => !selectedSlots.includes(booking.availability_slot_id)));
      
      setSelectedSlots([]);
      setShowEditMode(false);
      
      toast.success(`${selectedSlots.length} time slot${selectedSlots.length === 1 ? '' : 's'} deleted successfully`);
    } catch (error) {
      console.error('Error deleting time slots:', error);
      toast.error('Failed to delete time slots');
    }
  };

  const navigateDayView = (direction: 'prev' | 'next') => {
    if (!selectedDate) return;
    
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    
    const newDateString = newDate.toISOString().split('T')[0];
    setSelectedDate(newDateString);
    setNewSlot({ ...newSlot, date: newDateString });
    setSelectedSlots([]);
    setShowEditMode(false);
  };

  const copySelectedSlots = async () => {
    if (selectedSlots.length === 0 || selectedCopyDates.length === 0) {
      toast.error('Please select time slots and dates to copy to');
      return;
    }

    try {
      const slotsToCopy = slots.filter(slot => selectedSlots.includes(slot.id!));
      
      const newSlots = [];
      selectedCopyDates.forEach(targetDate => {
        slotsToCopy.forEach(sourceSlot => {
          newSlots.push({
            date: targetDate,
            start_time: sourceSlot.start_time,
            end_time: sourceSlot.end_time,
            service_type: sourceSlot.service_type,
            notes: sourceSlot.notes
          });
        });
      });

      const { data, error } = await supabase
        .from('availability_slots')
        .insert(newSlots)
        .select();

      if (error) {
        console.error('Error copying slots:', error);
        toast.error('Failed to copy time slots');
        return;
      }

      const updatedSlots = [...slots, ...data].sort((a, b) => 
        new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime()
      );

      setSlots(updatedSlots);
      setShowCopyModal(false);
      setSelectedCopyDates([]);
      setSelectedSlots([]);
      
      toast.success(`Copied ${slotsToCopy.length} time slot(s) to ${selectedCopyDates.length} date(s)`);
    } catch (error) {
      console.error('Error copying time slots:', error);
      toast.error('Failed to copy time slots');
    }
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
                        {hasBookings(date) && (
                          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                            {Array.from({ length: Math.min(getBookingCount(date), 6) }, (_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-blue-600"></div>
                            ))}
                            {getBookingCount(date) > 6 && (
                              <span className="text-xs text-blue-600 ml-0.5">+</span>
                            )}
                          </div>
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
              Your Bookings List
            </CardTitle>
            <CardDescription>
              Your upcoming booked sessions grouped by day
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
              <div className="space-y-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {slots.filter(slot => isSlotBooked(slot.id!)).length} booking{slots.filter(slot => isSlotBooked(slot.id!)).length === 1 ? '' : 's'}
                  </p>
                </div>
                
                {/* Group bookings by day */}
                {(() => {
                  const bookedSlots = slots
                    .filter(slot => isSlotBooked(slot.id!))
                    .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime());
                  
                  const groupedByDay = bookedSlots.reduce((groups, slot) => {
                    const date = slot.date;
                    if (!groups[date]) {
                      groups[date] = [];
                    }
                    groups[date].push(slot);
                    return groups;
                  }, {} as Record<string, typeof bookedSlots>);

                  return Object.entries(groupedByDay).map(([date, daySlots]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-3 pb-2 border-b">
                        <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
                        <Badge variant="outline" className="text-xs">
                          {daySlots.length} session{daySlots.length === 1 ? '' : 's'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {daySlots.map((slot) => {
                          const booking = bookings.find(b => b.availability_slot_id === slot.id && b.status === 'confirmed');
                          return (
                            <Card key={slot.id} className="hover:shadow-md transition-shadow max-w-none">
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                  {/* Time and Basic Info */}
                                  <div className="lg:col-span-3">
                                    <div className="font-medium text-lg">
                                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      <Badge variant="default" className="text-xs">
                                        🔵 Booked
                                      </Badge>
                                      {booking?.reading_type && (
                                        <Badge variant="secondary" className="text-xs">
                                          {booking.reading_type === 'in_person' && '🏠 In-person'}
                                          {booking.reading_type === 'video' && '📹 Video'}
                                          {booking.reading_type === 'telephone' && '📞 Telephone'}
                                          {booking.reading_type === 'other' && '✨ Other'}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Client Information */}
                                  <div className="lg:col-span-6">
                                    {booking && (booking.client_name || booking.client_email) ? (
                                      <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="font-medium text-foreground">
                                          {booking.client_name || 'Client'}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                                          {booking.client_email && (
                                            <div className="text-sm text-muted-foreground">
                                              📧 {booking.client_email}
                                            </div>
                                          )}
                                          {booking.client_phone && (
                                            <div className="text-sm text-muted-foreground">
                                              📞 {booking.client_phone}
                                            </div>
                                          )}
                                        </div>
                                        {booking.notes && (
                                          <div className="text-sm text-muted-foreground mt-2 italic">
                                            "{booking.notes}"
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-muted-foreground italic">
                                        No client details available
                                      </div>
                                    )}
                                    
                                    {slot.notes && (
                                      <p className="text-sm text-muted-foreground italic mt-2">
                                        Session notes: "{slot.notes}"
                                      </p>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="lg:col-span-3 flex lg:justify-end gap-2">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => toggleSlotBooking(slot.id!)}
                                      className="text-xs flex-1 lg:flex-none"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => selectDate(new Date(slot.date))}
                                      className="text-xs flex-1 lg:flex-none"
                                    >
                                      Day
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
                
                {slots.filter(slot => isSlotBooked(slot.id!)).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No bookings yet. Switch to Calendar view to manage your availability.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Day View Modal */}
      {showDayView && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setShowDayView(false)}>
          <Card className="w-[94vw] max-w-4xl min-h-0 shadow-2xl my-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center">
                <Button variant="outline" size="sm" onClick={() => navigateDayView('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="flex items-center gap-2 text-lg mx-4">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">{formatDate(selectedDate)}</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigateDayView('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              {/* Add New Time Slot - Now First */}
              {(showAddSlotForm || getSlotsForDate(new Date(selectedDate)).length === 0) && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Time Slot
                    </h4>
                    <div className="flex gap-2">
                      {getSlotsForDate(new Date(selectedDate)).length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setShowAddSlotForm(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {getSlotsForDate(new Date(selectedDate)).length === 0 && (
                        <Button variant="outline" size="sm" onClick={() => setShowDayView(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <select
                        id="start_time"
                        value={newSlot.start_time}
                        onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                        className="w-full px-3 py-3 sm:py-2 border border-input bg-background rounded-md text-sm min-h-[44px]"
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
                        className="w-full px-3 py-3 sm:py-2 border border-input bg-background rounded-md text-sm min-h-[44px]"
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
                      className="w-full px-3 py-3 sm:py-2 border border-input bg-background rounded-md text-sm min-h-[44px]"
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
                      className="min-h-[44px]"
                    />
                  </div>
                  <Button onClick={addTimeSlot} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              )}

              {/* Existing Time Slots - Now Second */}
              {getSlotsForDate(new Date(selectedDate)).length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAddSlotForm(!showAddSlotForm)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Time
                      </Button>
                      <Button 
                        variant={showEditMode ? "default" : "outline"}
                        size="sm" 
                        onClick={() => {
                          setShowEditMode(!showEditMode);
                          if (!showEditMode) {
                            setSelectedSlots([]);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className={`w-4 h-4 ${showEditMode ? 'hidden' : ''}`} />
                        <EyeOff className={`w-4 h-4 ${!showEditMode ? 'hidden' : ''}`} />
                        {showEditMode ? 'Done' : 'Edit'}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowDayView(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {showEditMode && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const slotsForDate = getSlotsForDate(new Date(selectedDate));
                            const allSelected = slotsForDate.every(slot => selectedSlots.includes(slot.id!));
                            if (allSelected) {
                              deselectAllSlots();
                            } else {
                              selectAllSlots();
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          {(() => {
                            const slotsForDate = getSlotsForDate(new Date(selectedDate));
                            const allSelected = slotsForDate.every(slot => selectedSlots.includes(slot.id!));
                            return allSelected ? 'Deselect All' : 'Select All';
                          })()}
                        </Button>
                        {selectedSlots.length > 0 && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setShowCopyModal(true)}
                              className="flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy ({selectedSlots.length})
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={deleteSelectedSlots}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete ({selectedSlots.length})
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    {getSlotsForDate(new Date(selectedDate)).map((slot) => {
                      const booking = bookings.find(b => b.availability_slot_id === slot.id && b.status === 'confirmed');
                      return (
                        <div key={slot.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          {showEditMode && (
                            <input
                              type="checkbox"
                              checked={selectedSlots.includes(slot.id!)}
                              onChange={() => toggleSlotSelection(slot.id!)}
                              className="rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={isSlotBooked(slot.id!) ? "default" : "secondary"}>
                                {isSlotBooked(slot.id!) ? '🔵 Booked' : '🟢 Available'}
                              </Badge>
                              {isSlotBooked(slot.id!) && booking?.reading_type ? (
                                <Badge variant="secondary" className="text-xs">
                                  {booking.reading_type === 'in_person' && '🏠 In-person'}
                                  {booking.reading_type === 'video' && '📹 Video'}
                                                                     {booking.reading_type === 'telephone' && '📞 Telephone'}
                                  {booking.reading_type === 'other' && '✨ Other'}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {slot.service_type === 'both' ? 'In-person & Remote' :
                                   slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                                </Badge>
                              )}
                            </div>
                            {booking && (booking.client_name || booking.client_email) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Client: {booking.client_name || booking.client_email}
                              </p>
                            )}
                            {slot.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{slot.notes}</p>
                            )}
                          </div>
                          {!showEditMode && (
                            <Button
                              variant={isSlotBooked(slot.id!) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleSlotBooking(slot.id!)}
                              className="text-xs"
                            >
                              {isSlotBooked(slot.id!) ? 'Edit' : 'Book'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {selectedSlots.length > 0 && (
                    <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      💡 <strong>Tip:</strong> {selectedSlots.length} slot{selectedSlots.length === 1 ? '' : 's'} selected. Click "Copy" to duplicate to other days.
                    </div>
                  )}
                </div>
              )}


            </CardContent>
          </Card>
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setShowCopyModal(false)}>
          <Card className="w-[94vw] max-w-3xl min-h-0 shadow-2xl my-2">
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

      {/* Booking Modal */}
      {showBookingModal && selectedSlotForBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setShowBookingModal(false)}>
          <Card className="w-[94vw] max-w-lg min-h-0 shadow-2xl my-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {editingBooking ? 'Edit Booking' : 'Book Time Slot'}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowBookingModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                {editingBooking ? 'Update booking details' : 'Assign a client to this time slot'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Client</Label>
                  {selectedClient && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClient(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear Selection
                    </Button>
                  )}
                </div>
                
                {selectedClient ? (
                  <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {selectedClient.id === 'not-registered' ? 'Not Registered Client' : selectedClient.name || selectedClient.email}
                        </div>
                        {selectedClient.id !== 'not-registered' && (
                          <div className="text-sm text-muted-foreground">{selectedClient.email}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClient(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search clients by name or email..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                      />
                      {isSearchingClients && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {clients.length > 0 ? (
                        clients.map(client => (
                          <div
                            key={client.id}
                            className="p-3 cursor-pointer hover:bg-muted border-b last:border-b-0 transition-colors"
                            onClick={() => setSelectedClient(client)}
                          >
                            <div className="font-medium">{client.name || client.email}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                            {client.phone && (
                              <div className="text-xs text-muted-foreground">📞 {client.phone}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">
                          {clientSearch ? 'No clients found' : 'Loading clients...'}
                        </div>
                      )}
                      
                      <div
                        className="p-3 cursor-pointer hover:bg-muted border-t bg-muted/30 transition-colors"
                        onClick={() => setSelectedClient({ id: 'not-registered', email: '', name: 'Not Registered' })}
                      >
                        <div className="font-medium">➕ Not Registered</div>
                        <div className="text-sm text-muted-foreground">Manual booking for non-registered client</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Client Details (if not registered selected) */}
              {selectedClient?.id === 'not-registered' && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <h4 className="font-medium">Client Details</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="client_name">Name</Label>
                      <Input
                        id="client_name"
                        placeholder="Client's name"
                        defaultValue={editingBooking?.client_name || ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_email">Email (Optional)</Label>
                      <Input
                        id="client_email"
                        type="email"
                        placeholder="Client's email"
                        defaultValue={editingBooking?.client_email || ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_phone">Phone (Optional)</Label>
                      <Input
                        id="client_phone"
                        placeholder="Client's phone number"
                        defaultValue={editingBooking?.client_phone || ''}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reading Type */}
              <div className="space-y-2">
                <Label htmlFor="reading_type">Reading Type</Label>
                <select
                  id="reading_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={editingBooking?.reading_type || 'in_person'}
                >
                  <option value="in_person">🏠 In-person</option>
                  <option value="video">📹 Video Call</option>
                  <option value="telephone">📞 Telephone</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>

              {/* Booking Notes */}
              <div className="space-y-2">
                <Label htmlFor="booking_notes">Notes (Optional)</Label>
                <Input
                  id="booking_notes"
                  placeholder="Any special notes for this booking..."
                  defaultValue={editingBooking?.notes || ''}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {editingBooking && (
                  <Button
                    variant="destructive"
                    onClick={() => editingBooking.id && deleteBooking(editingBooking.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const clientNameInput = document.getElementById('client_name') as HTMLInputElement;
                    const clientEmailInput = document.getElementById('client_email') as HTMLInputElement;
                    const clientPhoneInput = document.getElementById('client_phone') as HTMLInputElement;
                    const readingTypeSelect = document.getElementById('reading_type') as HTMLSelectElement;
                    const notesInput = document.getElementById('booking_notes') as HTMLInputElement;

                    const bookingData: Partial<Booking> = {
                      client_name: selectedClient?.id === 'not-registered' 
                        ? clientNameInput?.value || ''
                        : selectedClient?.name || selectedClient?.email || '',
                      client_email: selectedClient?.id === 'not-registered'
                        ? clientEmailInput?.value || ''
                        : selectedClient?.email || '',
                      client_phone: selectedClient?.id === 'not-registered'
                        ? clientPhoneInput?.value || ''
                        : selectedClient?.phone || '',
                      reading_type: readingTypeSelect?.value as 'in_person' | 'video' | 'telephone' | 'other' || 'in_person',
                      notes: notesInput?.value || ''
                    };

                    saveBooking(bookingData);
                  }}
                  className="flex-1"
                  disabled={!selectedClient}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingBooking ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {slots.length > 0 && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> {viewMode === 'list' 
              ? 'Click "Edit" to modify client details or "Edit Day" to manage availability times.'
              : 'Click dates to manage times. Select time slots with checkboxes to copy them to multiple days.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager; 