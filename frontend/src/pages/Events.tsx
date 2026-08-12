import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Calendar, MapPin, Clock, Sparkles, ArrowRight, 
  Music, Trophy, Film, Presentation, Eye, X 
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  venue: {
    name: string;
    location: string;
  };
  date: string;
  time: string;
  description: string;
  status: string;
}

interface Seat {
  id: number;
  eventId: number;
  seatNumber: string;
  price: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'CANCELLED';
}

interface Booking {
  id: number;
  userId: number;
  eventId: number;
  seatId: number;
  status: string;
  bookingTime: string;
}

export const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Monitor Modal states
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [monitoredEvent, setMonitoredEvent] = useState<Event | null>(null);
  const [monitoredSeats, setMonitoredSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchEvents();
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/api/events/search?query=${searchQuery}`);
      setEvents(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMonitor = async (e: React.MouseEvent, eventObj: Event) => {
    e.stopPropagation(); // prevent navigating to event page
    setMonitoredEvent(eventObj);
    setShowMonitorModal(true);
    setMonitoringLoading(true);
    try {
      // Fetch seats for this event
      const seatsRes = await api.get(`/api/seats/event/${eventObj.id}`);
      const sortedSeats = seatsRes.data.sort((a: Seat, b: Seat) => 
        a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true, sensitivity: 'base' })
      );
      setMonitoredSeats(sortedSeats);

      // Fetch bookings for metrics calculations
      const bookingsRes = await api.get('/api/bookings');
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error("Failed to load live monitor stats:", err);
    } finally {
      setMonitoringLoading(false);
    }
  };

  // Mock categorisation based on title matches for rich UX
  const getEventCategoryIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('concert') || t.includes('show') || t.includes('music') || t.includes('live')) {
      return <Music className="h-4 w-4" />;
    } else if (t.includes('cup') || t.includes('match') || t.includes('game') || t.includes('sport') || t.includes('bowl')) {
      return <Trophy className="h-4 w-4" />;
    } else if (t.includes('movie') || t.includes('film') || t.includes('theatre') || t.includes('play')) {
      return <Film className="h-4 w-4" />;
    }
    return <Presentation className="h-4 w-4" />;
  };

  // Abstract banner gradients based on event details for a premium look
  const getBannerGradient = (id: number) => {
    const gradients = [
      'from-indigo-600/30 via-slate-900 to-slate-950',
      'from-emerald-600/30 via-slate-900 to-slate-950',
      'from-rose-600/30 via-slate-900 to-slate-950',
      'from-amber-600/30 via-slate-900 to-slate-950',
      'from-cyan-600/30 via-slate-900 to-slate-950',
    ];
    return gradients[id % gradients.length];
  };

  const getCategoryBorder = (id: number) => {
    const borders = [
      'border-indigo-500/20 text-indigo-300 bg-indigo-500/5',
      'border-emerald-500/20 text-emerald-300 bg-emerald-500/5',
      'border-rose-500/20 text-rose-300 bg-rose-500/5',
      'border-amber-500/20 text-amber-300 bg-amber-500/5',
      'border-cyan-500/20 text-cyan-300 bg-cyan-500/5',
    ];
    return borders[id % borders.length];
  };

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      {/* Visual Hero Banner */}
      <div className="text-center mb-16 relative py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none pulse-light" />
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
          Find Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
            Unforgettable Moment
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Zero double-booking guarantee. High-concurrency seat maps locking ticket holds in real time using Redis Distributed Locks.
        </p>
      </div>

      {/* Search & Category Pills bar */}
      <div className="space-y-8 mb-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative shadow-2xl rounded-2xl overflow-hidden bg-slate-950/40 border border-white/5 backdrop-blur-xl p-1.5 flex items-center">
            <div className="relative flex-grow flex items-center pl-4">
              <Search className="h-5.5 w-5.5 text-gray-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, venues, conferences..."
                className="w-full bg-transparent border-0 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-base"
              />
            </div>
            <button
              type="submit"
              className="glow-btn bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all text-sm cursor-pointer border border-emerald-400/20"
            >
              Find Tickets
            </button>
          </form>
        </div>

        {/* Category selector pills */}
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {['All', 'Concerts', 'Sports', 'Theater', 'Conferences'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Catalogue */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-28 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase animate-pulse">Syncing Event Databases...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl max-w-xl mx-auto border border-white/5">
          <p className="text-xl text-gray-400 font-semibold">No live events found matching your query.</p>
          <button 
            onClick={() => { setSearchQuery(''); fetchEvents(); }} 
            className="mt-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-emerald-400 font-bold text-sm hover:bg-white/10 transition-all cursor-pointer"
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full group glow-border"
            >
              {/* Event Cover Banner */}
              <div className={`h-48 bg-gradient-to-br ${getBannerGradient(event.id)} p-8 flex flex-col justify-between border-b border-white/5 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-all duration-500" />
                
                <div className="flex justify-between items-start">
                  <span className={`border text-xxs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest ${getCategoryBorder(event.id)}`}>
                    {getEventCategoryIcon(event.title)}
                    <span className="ml-1.5">{event.status}</span>
                  </span>
                  
                  {isAdmin ? (
                    <button
                      onClick={(e) => handleOpenMonitor(e, event)}
                      className="p-2 bg-slate-950/80 hover:bg-indigo-500 hover:text-slate-950 border border-white/10 rounded-full transition-all duration-200 shadow-md cursor-pointer hover:scale-110 z-10 text-indigo-400 hover:border-indigo-400"
                      title="Monitor live occupancy & metrics"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <Sparkles className="h-5 w-5 text-emerald-400 opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
                  )}
                </div>

                <h3 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors duration-300 leading-tight tracking-tight line-clamp-2">
                  {event.title}
                </h3>
              </div>

              {/* Event Specs Card */}
              <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {event.description || "Grab your seats now for an exclusive live showcase at the venue. Reserved holds apply."}
                </p>

                <div className="space-y-3 border-t border-white/5 pt-5">
                  <div className="flex items-center gap-3 text-gray-300 text-xs font-semibold">
                    <Calendar className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 text-xs font-semibold">
                    <Clock className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 text-xs font-semibold">
                    <MapPin className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{event.venue.name}, {event.venue.location}</span>
                  </div>
                </div>

                {/* Buy Ticket indicator */}
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-all pt-2">
                  <span>Explore Tickets</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time Occupancy Modal Popup (Admin Only) */}
      {showMonitorModal && monitoredEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80 overflow-y-auto">
          <div className="relative w-full max-w-4xl glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto space-y-8 animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={() => { setShowMonitorModal(false); setMonitoredEvent(null); }}
              className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-full border border-white/5 hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <X className="h-5.5 w-5.5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-white/5 pb-4 space-y-2">
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xxs font-extrabold px-3.5 py-2 rounded-full uppercase tracking-wider shadow-sm inline-block">
                Live Occupancy monitor
              </span>
              <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-wide">
                {monitoredEvent.title}
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Venue: {monitoredEvent.venue.name}, {monitoredEvent.venue.location}
              </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Seating Grid Map Visualizer */}
              <div className="lg:col-span-8 bg-slate-950/60 rounded-2xl border border-white/5 p-6 flex flex-col items-center">
                <h3 className="text-xxs font-extrabold text-gray-500 uppercase tracking-widest mb-6 w-full border-b border-white/5 pb-2">
                  Live Occupancy Seating Map
                </h3>
                
                {monitoringLoading ? (
                  <div className="py-20 animate-pulse text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    Syncing seating registry...
                  </div>
                ) : monitoredSeats.length === 0 ? (
                  <div className="py-20 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    No seat layout configured.
                  </div>
                ) : (
                  <div className="space-y-3.5 overflow-x-auto w-full pb-4 flex flex-col items-center">
                    {/* Row mapper */}
                    {Object.keys(
                      monitoredSeats.reduce((acc: any, seat) => {
                        const row = seat.seatNumber.match(/[A-Z]+/)?.[0] || 'A';
                        if (!acc[row]) acc[row] = [];
                        acc[row].push(seat);
                        return acc;
                      }, {})
                    ).map((rowLetter) => {
                      const rowSeats = monitoredSeats.filter(s => s.seatNumber.startsWith(rowLetter));
                      return (
                        <div key={rowLetter} className="flex items-center gap-2.5 min-w-max">
                          <span className="w-5 text-right font-black text-gray-500 text-xs mr-1">{rowLetter}</span>
                          <div className="flex gap-1.5">
                            {rowSeats.map((seat) => {
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
                                  className={`w-7.5 h-7.5 rounded-lg text-[9px] font-black flex items-center justify-center border ${badgeClass}`}
                                  title={`Seat ${seat.seatNumber} - Status: ${seat.status}`}
                                >
                                  {seat.seatNumber}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Legend */}
                    <div className="flex justify-center flex-wrap gap-5 border-t border-white/5 pt-5 w-full max-w-sm text-[10px] font-bold uppercase tracking-wider mt-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-emerald-500/10 border border-emerald-500/20" />
                        <span className="text-gray-400 text-xxs">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-amber-500/15 border border-amber-500/20" />
                        <span className="text-gray-400 text-xxs">Held</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-rose-500/15 border border-rose-500/20" />
                        <span className="text-gray-400 text-xxs">Booked</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sales Analytics Sidebar Widget */}
              <div className="lg:col-span-4 bg-slate-950/60 rounded-2xl border border-white/5 p-6 space-y-4">
                <h3 className="text-xxs font-extrabold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2.5">
                  Live Sales Dashboard
                </h3>
                
                {(() => {
                  const eventBookings = bookings.filter(b => b.eventId === monitoredEvent.id);
                  const confirmedCount = eventBookings.filter(b => b.status === 'CONFIRMED').length;
                  const pendingCount = eventBookings.filter(b => b.status === 'PENDING').length;
                  const cancelledCount = eventBookings.filter(b => b.status === 'CANCELLED').length;
                  
                  const totalRevenue = confirmedCount * (monitoredSeats[0]?.price || 120);

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                        <span>Tickets Sold</span>
                        <span className="text-white font-black">{confirmedCount} Seats</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                        <span>Active Holds</span>
                        <span className="text-amber-400 font-black">{pendingCount} HELD</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                        <span>Cancellations</span>
                        <span className="text-rose-400 font-black">{cancelledCount} Releases</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                        <span>Available Seats</span>
                        <span className="text-emerald-400 font-black">
                          {monitoredSeats.filter(s => s.status === 'AVAILABLE').length} Seats
                        </span>
                      </div>
                      <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                        <span className="text-white">Live Revenue</span>
                        <span className="text-emerald-400 font-black text-sm">${totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
