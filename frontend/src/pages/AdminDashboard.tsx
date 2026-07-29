import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  LayoutDashboard, PlusCircle, Building, Calendar, DollarSign, 
  TableProperties, Sparkles, AlertCircle, CheckCircle, 
  Eye, TrendingUp, BarChart3, Users, RefreshCw
} from 'lucide-react';

interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

interface Event {
  id: number;
  title: string;
  venue: {
    name: string;
    location: string;
    capacity: number;
  };
  date: string;
  time: string;
  description: string;
  status: string;
}

interface Booking {
  id: number;
  userId: number;
  eventId: number;
  seatId: number;
  paymentId: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  bookingTime: string;
}

interface Seat {
  id: number;
  eventId: number;
  seatNumber: string;
  price: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'CANCELLED';
}

export const AdminDashboard: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Venue Form
  const [vName, setVName] = useState('');
  const [vLocation, setVLocation] = useState('');
  const [vCapacity, setVCapacity] = useState<number>(100);
  const [vSuccess, setVSuccess] = useState('');
  const [vError, setVError] = useState('');

  // Event Form
  const [eTitle, setETitle] = useState('');
  const [eVenueId, setEVenueId] = useState('');
  const [eDate, setEDate] = useState('');
  const [eTime, setETime] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [ePrice, setEPrice] = useState<number>(120.0);
  const [eRows, setERows] = useState<number>(5);
  const [eCols, setECols] = useState<number>(10);
  const [eSuccess, setESuccess] = useState('');
  const [eError, setEError] = useState('');

  // Monitoring State
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [monitoredSeats, setMonitoredSeats] = useState<Seat[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  useEffect(() => {
    fetchVenues();
    fetchEventsAndBookings();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchMonitoredSeats();
    }
  }, [selectedEventId]);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/api/venues');
      setVenues(response.data);
      if (response.data.length > 0 && !eVenueId) {
        setEVenueId(response.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEventsAndBookings = async () => {
    try {
      const eventsRes = await api.get('/api/events');
      setEvents(eventsRes.data);
      if (eventsRes.data.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsRes.data[0].id.toString());
      }

      const bookingsRes = await api.get('/api/bookings');
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error("Failed to load events/bookings data:", err);
    }
  };

  const fetchMonitoredSeats = async () => {
    setMonitoringLoading(true);
    try {
      const res = await api.get(`/api/seats/event/${selectedEventId}`);
      const sortedSeats = res.data.sort((a: Seat, b: Seat) => 
        a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true, sensitivity: 'base' })
      );
      setMonitoredSeats(sortedSeats);
    } catch (err) {
      console.error("Failed to fetch monitored seat config:", err);
    } finally {
      setMonitoringLoading(false);
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setVSuccess('');
    setVError('');
    try {
      const response = await api.post('/api/venues', {
        name: vName,
        location: vLocation,
        capacity: vCapacity
      });
      setVSuccess(`Venue '${response.data.name}' configured successfully!`);
      setVName('');
      setVLocation('');
      fetchVenues();
    } catch (err: any) {
      setVError(err.response?.data?.message || 'Failed to create venue.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setESuccess('');
    setEError('');
    try {
      const response = await api.post('/api/events', {
        title: eTitle,
        venueId: parseInt(eVenueId),
        date: eDate,
        time: eTime,
        description: eDesc,
        price: ePrice,
        rows: eRows,
        cols: eCols
      });
      setESuccess(`Event '${response.data.title}' and seat layouts published successfully!`);
      setETitle('');
      setEDesc('');
      setEDate('');
      setETime('');
      fetchEventsAndBookings();
    } catch (err: any) {
      setEError(err.response?.data?.message || 'Failed to create event.');
    }
  };

  // Group seats row-by-row for the monitor chart mapping
  const monitorGroupedSeats: { [key: string]: Seat[] } = {};
  monitoredSeats.forEach(seat => {
    const row = seat.seatNumber.match(/[A-Z]+/)?.[0] || 'A';
    if (!monitorGroupedSeats[row]) {
      monitorGroupedSeats[row] = [];
    }
    monitorGroupedSeats[row].push(seat);
  });

  // Calculate live single-event analytics
  const eventBookings = bookings.filter(b => b.eventId === parseInt(selectedEventId));
  const confirmedBookings = eventBookings.filter(b => b.status === 'CONFIRMED');
  const pendingBookings = eventBookings.filter(b => b.status === 'PENDING');
  const cancelledBookings = eventBookings.filter(b => b.status === 'CANCELLED');

  const totalEventRevenue = confirmedBookings.reduce((sum, b) => {
    const seat = monitoredSeats.find(s => s.id === b.seatId);
    return sum + (seat ? seat.price : 120.00);
  }, 0);

  // Global aggregate stats
  const globalConfirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  
  // Calculate total global revenue based on booking seat ids
  const totalGlobalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED')
    .length * 120.00; // Mock calculation based on average ticket value

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-black text-white tracking-tight uppercase tracking-wider">ORGANIZER COMMAND CENTER</h1>
        </div>
        <button 
          onClick={fetchEventsAndBookings}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider border border-white/5 transition-all"
        >
          <RefreshCw className="h-4 w-4 animate-spin-slow" /> Refresh Metrics
        </button>
      </div>

      {/* Metrics Row Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Configure Venues</span>
            <span className="text-3xl font-black text-white block">{venues.length}</span>
          </div>
          <Building className="h-10 w-10 text-emerald-400 opacity-60" />
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Active Events</span>
            <span className="text-3xl font-black text-white block">{events.length}</span>
          </div>
          <Calendar className="h-10 w-10 text-amber-400 opacity-60" />
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Total Bookings</span>
            <span className="text-3xl font-black text-white block">{globalConfirmedCount}</span>
          </div>
          <Users className="h-10 w-10 text-indigo-400 opacity-60" />
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Total Revenue</span>
            <span className="text-3xl font-black text-emerald-400 block">${totalGlobalRevenue.toFixed(2)}</span>
          </div>
          <DollarSign className="h-10 w-10 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Main Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Configure Venue Card */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-4 uppercase tracking-wider">
            <Building className="h-5.5 w-5.5 text-emerald-400" /> Configure Venues
          </h2>

          {vSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-inner animate-pulse">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              {vSuccess}
            </div>
          )}
          {vError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-inner">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              {vError}
            </div>
          )}

          <form onSubmit={handleCreateVenue} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Venue Name</label>
              <input
                type="text"
                required
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="Royal Albert Hall"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Location</label>
              <input
                type="text"
                required
                value={vLocation}
                onChange={(e) => setVLocation(e.target.value)}
                placeholder="London, UK"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Total Capacity</label>
              <input
                type="number"
                required
                value={vCapacity}
                onChange={(e) => setVCapacity(parseInt(e.target.value))}
                min={1}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
              />
            </div>
            <button
              type="submit"
              className="glow-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-lg border border-emerald-400/20"
            >
              <PlusCircle className="h-4.5 w-4.5" /> Save Venue Config
            </button>
          </form>
        </div>

        {/* Schedule Event Card */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-4 uppercase tracking-wider">
            <Calendar className="h-5.5 w-5.5 text-amber-400" /> Schedule Events & Seats
          </h2>

          {eSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-inner animate-pulse">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              {eSuccess}
            </div>
          )}
          {eError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-inner">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              {eError}
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Event Title</label>
                <input
                  type="text"
                  required
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                  placeholder="Rock Concert Live"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Assign Venue</label>
                {venues.length === 0 ? (
                  <p className="text-rose-400 text-xxs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Please configure a venue first.
                  </p>
                ) : (
                  <select
                    value={eVenueId}
                    onChange={(e) => setEVenueId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} (Capacity: {v.capacity})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={eTime}
                  onChange={(e) => setETime(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                  placeholder="Join us for an exclusive live showcase..."
                  rows={2}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Ticket Price ($)
                </label>
                <input
                  type="number"
                  required
                  value={ePrice}
                  onChange={(e) => setEPrice(parseFloat(e.target.value))}
                  min={1}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-0.5">
                    <TableProperties className="h-3 w-3 text-amber-500" /> Rows
                  </label>
                  <input
                    type="number"
                    required
                    value={eRows}
                    onChange={(e) => setERows(parseInt(e.target.value))}
                    min={1}
                    max={15}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-0.5">
                    <TableProperties className="h-3 w-3 text-amber-500" /> Columns
                  </label>
                  <input
                    type="number"
                    required
                    value={eCols}
                    onChange={(e) => setECols(parseInt(e.target.value))}
                    min={1}
                    max={15}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={venues.length === 0}
              className="glow-btn w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-lg border border-amber-400/25 disabled:opacity-40 disabled:cursor-not-allowed mt-4"
            >
              <Sparkles className="h-4.5 w-4.5" /> Publish Event & Seats
            </button>
          </form>
        </div>
      </div>

      {/* NEW Realtime Monitoring Section */}
      <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-wider">LIVE EVENT SEATING & SALES MONITOR</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Select Event</span>
            {events.length === 0 ? (
              <span className="text-rose-400 text-xxs font-bold uppercase">No active events</span>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl py-2 px-4 text-white text-xs font-bold focus:outline-none focus:border-indigo-400"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedEventId ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Seating Map Real-time Visualizer */}
            <div className="lg:col-span-8 bg-slate-950/60 rounded-2xl border border-white/5 p-6 flex flex-col items-center">
              <h3 className="text-xxs font-extrabold text-gray-500 uppercase tracking-widest mb-6 w-full border-b border-white/5 pb-2">
                Live Occupancy Seating Map
              </h3>
              
              {monitoringLoading ? (
                <div className="py-20 animate-pulse text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  Syncing grid view...
                </div>
              ) : monitoredSeats.length === 0 ? (
                <div className="py-20 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  No seat layout configured for this event.
                </div>
              ) : (
                <div className="space-y-3.5 overflow-x-auto w-full pb-4 flex flex-col items-center">
                  {Object.keys(monitorGroupedSeats).map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center gap-2.5 min-w-max">
                      <span className="w-5 text-right font-black text-gray-500 text-xs mr-1">{rowLetter}</span>
                      <div className="flex gap-1.5">
                        {monitorGroupedSeats[rowLetter].map((seat) => {
                          const isAvailable = seat.status === 'AVAILABLE';
                          const isHeld = seat.status === 'HELD';
                          const isBooked = seat.status === 'BOOKED';

                          let badgeClass = "";
                          if (isAvailable) badgeClass = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
                          else if (isHeld) badgeClass = "bg-amber-500/15 border border-amber-500/20 text-amber-400 animate-pulse";
                          else if (isBooked) badgeClass = "bg-rose-500/15 border border-rose-500/20 text-rose-400 font-extrabold";

                          return (
                            <div
                              key={seat.id}
                              className={`w-8 h-8 rounded-lg text-[9px] font-black flex items-center justify-center border ${badgeClass}`}
                              title={`Seat ${seat.seatNumber} - Status: ${seat.status}`}
                            >
                              {seat.seatNumber}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Legend */}
                  <div className="flex justify-center flex-wrap gap-6 border-t border-white/5 pt-6 w-full max-w-md text-[10px] font-bold uppercase tracking-wider mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-emerald-500/15 border border-emerald-500/25" />
                      <span className="text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-amber-500/15 border border-amber-500/25" />
                      <span className="text-gray-400">Held (Locking)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-rose-500/15 border border-rose-500/25" />
                      <span className="text-gray-400">Booked</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sales Analytics Sidebar Widget */}
            <div className="lg:col-span-4 space-y-6">
              {/* Event Statistics */}
              <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-6 space-y-5">
                <h3 className="text-xxs font-extrabold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2.5 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-indigo-400" /> Sales Metrics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Tickets Sold</span>
                    <span className="text-white font-black text-sm">{confirmedBookings.length} Seats</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Active Locks (Holds)</span>
                    <span className="text-amber-400 font-black text-sm">{pendingBookings.length} HELD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Cancellations</span>
                    <span className="text-rose-400 font-black text-sm">{cancelledBookings.length} Releases</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Available Inventory</span>
                    <span className="text-emerald-400 font-black text-sm">
                      {monitoredSeats.filter(s => s.status === 'AVAILABLE').length} Seats
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span className="text-white">Event Revenue</span>
                    <span className="text-emerald-400 font-black text-base">${totalEventRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Conversion Performance Alert */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-900/5 border border-indigo-500/20 rounded-2xl p-5 flex gap-3 text-indigo-300">
                <TrendingUp className="h-5.5 w-5.5 shrink-0 text-indigo-400" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide">Live Stream Performance</h4>
                  <p className="text-[10px] leading-relaxed text-gray-400 font-medium">
                    Seating charts stream live metrics directly from Eureka-registered repositories. Real-time updates reflect changes in locks or payments instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm font-semibold uppercase">
            No events registered yet. Publish an event above to start live monitoring.
          </div>
        )}
      </div>
    </div>
  );
};
