import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, ShieldCheck, Clock, MapPin, AlertCircle } from 'lucide-react';

interface Booking {
  id: number;
  userId: number;
  eventId: number;
  seatId: number;
  paymentId: number | null;
  status: string;
  bookingTime: string;
}

export const Bookings: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Cache of seat and event info to avoid redundant fetches
  const [eventCache, setEventCache] = useState<Record<number, any>>({});
  const [seatCache, setSeatCache] = useState<Record<number, any>>({});

  useEffect(() => {
    if (location.state && (location.state as any).bookingSuccess) {
      setShowSuccessBanner(true);
      // Clear location state history so banner doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/bookings/user/${user.id}`);
      const list = response.data;
      setBookings(list);

      // Proactively cache event and seat metadata for all bookings
      for (const booking of list) {
        if (!eventCache[booking.eventId]) {
          try {
            const evRes = await api.get(`/api/events/${booking.eventId}`);
            setEventCache(prev => ({ ...prev, [booking.eventId]: evRes.data }));
          } catch (e) {
            console.error('Failed to cache event details', e);
          }
        }
        if (!seatCache[booking.seatId]) {
          try {
            const seatRes = await api.get(`/api/seats/${booking.seatId}`);
            setSeatCache(prev => ({ ...prev, [booking.seatId]: seatRes.data }));
          } catch (e) {
            console.error('Failed to cache seat details', e);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Ticket className="h-7 w-7 text-emerald-400" /> My Bookings
        </h1>
      </div>

      {showSuccessBanner && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-lg">
          <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-base text-white">Payment Successful!</h3>
            <p className="text-sm text-gray-300">Your tickets have been confirmed. An email receipt and SMS notification are being dispatched asynchronously via Kafka.</p>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
          <p className="text-gray-400">Browse the event catalog and find experiences to attend.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const eventInfo = eventCache[booking.eventId];
            const seatInfo = seatCache[booking.seatId];
            
            const isConfirmed = booking.status === 'CONFIRMED';
            const isPending = booking.status === 'PENDING';

            return (
              <div
                key={booking.id}
                className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 shadow-xl relative overflow-hidden"
                style={{ borderLeft: isConfirmed ? '4px solid #10b981' : isPending ? '4px solid #f59e0b' : '4px solid #f43f5e' }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span 
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isConfirmed ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' : 
                        isPending ? 'bg-amber-500/10 text-amber-300 border border-amber-400/20' : 
                        'bg-rose-500/10 text-rose-300 border border-rose-400/20'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">Reference ID: #000{booking.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      {eventInfo?.title || `Event #${booking.eventId}`}
                    </h3>
                    <p className="text-emerald-400 font-bold text-sm mt-1">
                      Seat {seatInfo?.seatNumber || `ID ${booking.seatId}`} &bull; ${seatInfo?.price || '100.00'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{eventInfo?.date || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{eventInfo?.time || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{eventInfo?.venue?.name || 'Loading...'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-[120px]">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Reserved On</span>
                    <span className="text-xs text-white font-medium">
                      {new Date(booking.bookingTime).toLocaleDateString()} {new Date(booking.bookingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => navigate(`/checkout/${booking.id}`)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs tracking-wide shadow-md transition-all cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
