import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Clock, AlertCircle, Info, Landmark } from 'lucide-react';

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

interface Seat {
  id: number;
  eventId: number;
  seatNumber: string;
  price: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'CANCELLED';
}

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection states
  const [maxSeats, setMaxSeats] = useState<number>(1);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [holdingSeatId, setHoldingSeatId] = useState<number | null>(null);

  useEffect(() => {
    fetchEventAndSeats();
  }, [id]);

  const fetchEventAndSeats = async () => {
    setLoading(true);
    setError('');
    try {
      const eventRes = await api.get(`/api/events/${id}`);
      setEvent(eventRes.data);

      const seatsRes = await api.get(`/api/seats/event/${id}`);
      const sortedSeats = seatsRes.data.sort((a: Seat, b: Seat) => 
        a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true, sensitivity: 'base' })
      );
      setSeats(sortedSeats);
    } catch (err) {
      console.error(err);
      setError('Failed to load event details or seat maps.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length < maxSeats) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        // Replace oldest selection
        setSelectedSeats([...selectedSeats.slice(1), seat]);
      }
    }
  };

  const handleBookSelectedSeats = async () => {
    if (selectedSeats.length !== maxSeats) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setHoldingSeatId(selectedSeats[0].id); // mock locking indicator state
    setError('');
    try {
      // Call booking-service to place holds / create pending bookings concurrently
      const holdPromises = selectedSeats.map(seat =>
        api.post('/api/bookings/book', {
          userId: user.id,
          eventId: event?.id,
          seatId: seat.id
        })
      );
      const responses = await Promise.all(holdPromises);
      
      // Navigate to Checkout with comma-separated booking IDs
      const bookingIds = responses.map(res => res.data.id).join(',');
      navigate(`/checkout/${bookingIds}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'One or more selected seats are currently locked or held by another user. Please select other seats.'
      );
      // Refresh seat inventory list
      fetchEventAndSeats();
      setSelectedSeats([]);
    } finally {
      setHoldingSeatId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase animate-pulse">Syncing Seat Inventory...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-6 py-12 text-center max-w-md">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl mb-6 flex items-center gap-2 shadow-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
        <button 
          onClick={fetchEventAndSeats} 
          className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-emerald-400 font-bold hover:bg-white/10 cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!event) return null;

  // Group seats by row for cinema mapping
  const groupedSeats: { [key: string]: Seat[] } = {};
  seats.forEach(seat => {
    const row = seat.seatNumber.match(/[A-Z]+/)?.[0] || 'A';
    if (!groupedSeats[row]) {
      groupedSeats[row] = [];
    }
    groupedSeats[row].push(seat);
  });

  const totalSelectedPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      {/* Event Details Jumbotron */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden shadow-2xl border border-white/5 glow-border">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none pulse-light" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-5">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xxs font-extrabold px-3.5 py-2 rounded-full uppercase tracking-widest shadow-sm inline-block">
              {event.status}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">{event.title}</h1>
            <p className="text-gray-400 max-w-4xl text-base leading-relaxed">
              {event.description || 'Join us for this live event. Lock in your tickets instantly. Holds release in 5 minutes if not completed.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-gray-300 text-sm font-medium pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-emerald-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-emerald-400" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-emerald-400" />
                <span>{event.venue.name}, {event.venue.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4.5 rounded-2xl mb-8 flex items-center gap-3 max-w-3xl mx-auto shadow-lg">
          <AlertCircle className="h-5.5 w-5.5 shrink-0 text-rose-400" />
          <p className="text-sm font-bold leading-normal">{error}</p>
        </div>
      )}

      {/* Main Reservation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Seating Grid Map */}
        <div className="lg:col-span-2 glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-tight text-white mb-8 text-center w-full border-b border-white/5 pb-4.5 uppercase tracking-wider">
            VENUE SEATING MAP
          </h2>

          {/* Stage Graphic */}
          <div className="w-full max-w-lg bg-gradient-to-b from-indigo-500/15 via-indigo-500/5 to-transparent h-10 rounded-b-[60px] text-center text-xs font-extrabold text-indigo-300/80 tracking-[0.3em] mb-16 shadow-inner border-t border-indigo-500/20">
            STAGE / SCREEN
          </div>

          {/* Seating Row Layout */}
          <div className="space-y-4 w-full overflow-x-auto pb-4 flex flex-col items-center">
            {Object.keys(groupedSeats).map((rowLetter) => (
              <div key={rowLetter} className="flex items-center gap-3 min-w-max">
                <span className="w-6 text-right font-black text-gray-500 text-sm mr-2">{rowLetter}</span>
                <div className="flex gap-2.5">
                  {groupedSeats[rowLetter].map((seat) => {
                    const isAvailable = seat.status === 'AVAILABLE';
                    const isHeld = seat.status === 'HELD';
                    const isBooked = seat.status === 'BOOKED';
                    const isHolding = holdingSeatId === seat.id;
                    const isSelected = selectedSeats.some(s => s.id === seat.id);

                    let btnClass = "";
                    if (isSelected) {
                      btnClass = "bg-indigo-500 border border-indigo-400 text-slate-950 font-black shadow-lg shadow-indigo-500/20 scale-105 cursor-pointer";
                    } else if (isAvailable) {
                      btnClass = "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-400 hover:text-slate-950 hover:border-emerald-300 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/15 hover:-translate-y-0.5";
                    } else if (isHeld) {
                      btnClass = "bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-not-allowed";
                    } else if (isBooked) {
                      btnClass = "bg-rose-500/10 border border-rose-500/20 text-rose-400 cursor-not-allowed";
                    } else {
                      btnClass = "bg-slate-900 border border-slate-800 text-gray-600 cursor-not-allowed";
                    }

                    if (isHolding) {
                      btnClass = "bg-teal-500/30 border border-teal-400 animate-pulse text-white cursor-wait";
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={(!isAvailable && !isSelected) || isHolding}
                        onClick={() => handleSelectSeat(seat)}
                        className={`w-9.5 h-9.5 rounded-lg text-xxs font-extrabold flex items-center justify-center transition-all duration-200 ${btnClass}`}
                        title={`Seat ${seat.seatNumber} - $${seat.price} (${seat.status})`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
                <span className="w-6 text-left font-black text-gray-500 text-sm ml-2">{rowLetter}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center flex-wrap gap-8 border-t border-white/5 pt-8 w-full max-w-lg text-xs font-bold uppercase tracking-wider mt-6">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-indigo-500 border border-indigo-400" />
              <span className="text-gray-400">Selected</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20" />
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/20" />
              <span className="text-gray-400">Held</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-rose-500/10 border border-rose-500/20" />
              <span className="text-gray-400">Booked</span>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Booking Actions */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/5 space-y-8">
          <h2 className="text-xl font-bold text-white border-b border-white/5 pb-4 tracking-tight uppercase tracking-wider">
            HOLD DETAILS
          </h2>

          <div className="space-y-6">
            {/* Number of Seats Dropdown Selector */}
            <div>
              <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2.5">Number of Seats to Book</label>
              <select
                value={maxSeats}
                onChange={(e) => {
                  setMaxSeats(parseInt(e.target.value));
                  setSelectedSeats([]); // reset selections on size change
                }}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-bold"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Seat' : 'Seats'}</option>
                ))}
              </select>
            </div>

            {/* List Selected Seats */}
            {selectedSeats.length > 0 && (
              <div className="space-y-2.5 bg-white/5 border border-white/5 p-4.5 rounded-2xl">
                <span className="text-xxs text-gray-500 font-bold uppercase tracking-wider block">Your Selection</span>
                <div className="flex flex-wrap gap-2.5">
                  {selectedSeats.map(s => (
                    <span key={s.id} className="bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      Seat {s.seatNumber}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-900/5 border border-indigo-500/25 rounded-2xl p-5 flex gap-4 text-indigo-300">
              <Info className="h-5.5 w-5.5 shrink-0 text-indigo-400" />
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wide">Multi-Seat Holds</h4>
                <p className="text-xxs leading-relaxed text-gray-400">
                  Selecting your seats maps them to Redis holds concurrently. All selected seats must be purchased within 5 minutes to guarantee booking confirmation.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>Selected Seats Total</span>
                <span className="text-white font-bold">${totalSelectedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>Network Booking Fee</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base pt-4 border-t border-white/5 font-black">
                <span className="text-white uppercase tracking-wider text-sm">Estimated Cost</span>
                <span className="text-emerald-400 text-xl font-black">${totalSelectedPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Booking action button */}
            <button
              onClick={handleBookSelectedSeats}
              disabled={selectedSeats.length !== maxSeats || holdingSeatId !== null}
              className="glow-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-400/20"
            >
              {holdingSeatId !== null ? 'Placing Locks...' : selectedSeats.length === maxSeats 
                ? `Proceed to Payment` 
                : `Select ${maxSeats - selectedSeats.length} More ${maxSeats - selectedSeats.length === 1 ? 'Seat' : 'Seats'}`
              }
            </button>

            {/* Venue Capacity Specs widget */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Venue Configuration</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-2 text-xxs font-bold text-gray-400 uppercase tracking-wide">
                <div className="flex justify-between">
                  <span>Venue capacity</span>
                  <span className="text-white font-black">{event.venue.capacity} Seats</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Seats</span>
                  <span className="text-emerald-400 font-black">
                    {seats.filter(s => s.status === 'AVAILABLE').length} Available
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
