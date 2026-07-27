import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Clock, AlertCircle, Info } from 'lucide-react';

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
      // Sort seats by seat number (e.g. A1, A2, B1...)
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

  const handleSelectSeat = async (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (!user) {
      navigate('/login');
      return;
    }

    setHoldingSeatId(seat.id);
    setError('');
    try {
      // Call booking-service to place hold / create pending booking
      const response = await api.post('/api/bookings/book', {
        userId: user.id,
        eventId: event?.id,
        seatId: seat.id
      });
      // Hold successful! Navigate to Checkout
      navigate(`/checkout/${response.data.id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'This seat is currently locked or held by another user. Please select another seat.'
      );
      // Refresh seats to show updated statuses
      fetchEventAndSeats();
    } finally {
      setHoldingSeatId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-lg max-w-md mx-auto mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
        <button onClick={fetchEventAndSeats} className="text-emerald-400 hover:underline cursor-pointer">Retry</button>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Event Header Card */}
      <div className="glass-panel p-8 rounded-2xl mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {event.status}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">{event.title}</h1>
            <p className="text-gray-400 max-w-3xl">{event.description || 'No description available for this event.'}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>{event.venue.name}, {event.venue.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl mb-8 flex items-center gap-3 max-w-2xl mx-auto shadow-md">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Seat Selection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Seat Map */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-6 text-center w-full border-b border-white/5 pb-4">
            Select Your Seats
          </h2>

          {/* Screen Indicator */}
          <div className="w-full max-w-md bg-gradient-to-b from-emerald-500/30 to-transparent h-6 rounded-b-[40px] text-center text-xs font-bold text-emerald-400/80 tracking-[0.2em] mb-12 shadow-inner border-t border-emerald-500/20">
            STAGE / SCREEN
          </div>

          {/* Seat Grid */}
          <div className="grid grid-cols-10 gap-3 max-w-lg mx-auto mb-8">
            {seats.map((seat) => {
              const isAvailable = seat.status === 'AVAILABLE';
              const isHeld = seat.status === 'HELD';
              const isBooked = seat.status === 'BOOKED';
              const isHolding = holdingSeatId === seat.id;

              let btnClass = "";
              if (isAvailable) btnClass = "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 cursor-pointer";
              else if (isHeld) btnClass = "bg-amber-500/20 border border-amber-500/30 text-amber-400 cursor-not-allowed";
              else if (isBooked) btnClass = "bg-rose-500/20 border border-rose-500/30 text-rose-400 cursor-not-allowed";
              else btnClass = "bg-slate-800 border border-slate-700 text-gray-500 cursor-not-allowed";

              if (isHolding) btnClass = "bg-teal-500/40 border border-teal-400 animate-pulse text-white cursor-wait";

              return (
                <button
                  key={seat.id}
                  disabled={!isAvailable || isHolding}
                  onClick={() => handleSelectSeat(seat)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${btnClass}`}
                  title={`Seat ${seat.seatNumber} - $${seat.price} (${seat.status})`}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="flex justify-center flex-wrap gap-6 border-t border-white/5 pt-6 w-full max-w-md text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/30" />
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/30" />
              <span className="text-gray-400">Held</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500/30" />
              <span className="text-gray-400">Booked</span>
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-white/5 pb-4">
            Reservation Info
          </h2>

          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-emerald-300">
              <Info className="h-5 w-5 shrink-0" />
              <p className="text-xs leading-relaxed">
                Clicking an available seat will reserve it for you for <strong>5 minutes</strong> using Redis Distributed Locks. Complete your payment within this time limit to confirm your booking.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Standard Ticket Price</span>
                <span className="text-white font-bold">$100.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking Fee</span>
                <span className="text-white font-bold">$0.00</span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-white/5 font-extrabold">
                <span className="text-white">Total</span>
                <span className="text-emerald-400">$100.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
