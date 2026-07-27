import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, ShieldCheck, Clock, MapPin, AlertCircle, ChevronRight } from 'lucide-react';

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

  const [eventCache, setEventCache] = useState<Record<number, any>>({});
  const [seatCache, setSeatCache] = useState<Record<number, any>>({});

  useEffect(() => {
    if (location.state && (location.state as any).bookingSuccess) {
      setShowSuccessBanner(true);
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

      // Fetch metadata
      for (const booking of list) {
        if (!eventCache[booking.eventId]) {
          try {
            const evRes = await api.get(`/api/events/${booking.eventId}`);
            setEventCache(prev => ({ ...prev, [booking.eventId]: evRes.data }));
          } catch (e) {
            console.error(e);
          }
        }
        if (!seatCache[booking.seatId]) {
          try {
            const seatRes = await api.get(`/api/seats/${booking.seatId}`);
            setSeatCache(prev => ({ ...prev, [booking.seatId]: seatRes.data }));
          } catch (e) {
            console.error(e);
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
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase animate-pulse">Syncing Your Ticket Wallet...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-4">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Ticket className="h-8 w-8 text-emerald-400 rotate-45" /> My Ticket Wallet
        </h1>
        <span className="text-xs font-bold bg-white/5 border border-white/5 px-4 py-2 rounded-full text-gray-400">
          {bookings.length} Tickets Total
        </span>
      </div>

      {showSuccessBanner && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-5 rounded-2xl mb-10 flex items-start gap-4 shadow-xl glow-border">
          <ShieldCheck className="h-6.5 w-6.5 shrink-0 mt-0.5 text-emerald-400" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white">Payment Authorized!</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your tickets are fully booked. Confirmation receipt emails and SMS notifications are being published asynchronously via Kafka brokers.
            </p>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel text-center py-20 rounded-3xl border border-white/5 max-w-xl mx-auto">
          <AlertCircle className="h-14 w-14 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Tickets</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Explore live concert performance seating logs to fill your wallet.</p>
          <button 
            onClick={() => navigate('/')}
            className="glow-btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
          >
            Explore Live Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {bookings.map((booking) => {
            const eventInfo = eventCache[booking.eventId];
            const seatInfo = seatCache[booking.seatId];
            
            const isConfirmed = booking.status === 'CONFIRMED';
            const isPending = booking.status === 'PENDING';

            return (
              <div
                key={booking.id}
                className="glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5 relative group glow-border"
              >
                {/* Visual side highlights */}
                <div 
                  className="w-full md:w-3.5 h-3.5 md:h-auto" 
                  style={{ backgroundColor: isConfirmed ? '#10b981' : isPending ? '#f59e0b' : '#ef4444' }}
                />

                {/* Ticket Details Main section */}
                <div className="p-8 flex-grow flex flex-col justify-between gap-6 md:border-r md:border-dashed md:border-white/10 relative">
                  {/* Decorative stub circles on ticket stubs */}
                  <div className="hidden md:block absolute -right-3.5 -top-3.5 w-7 h-7 bg-[#050811] rounded-full border border-white/5 z-10" />
                  <div className="hidden md:block absolute -right-3.5 -bottom-3.5 w-7 h-7 bg-[#050811] rounded-full border border-white/5 z-10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span 
                        className={`text-xxs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest ${
                          isConfirmed ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' : 
                          isPending ? 'bg-amber-500/10 text-amber-300 border border-amber-400/20' : 
                          'bg-rose-500/10 text-rose-300 border border-rose-400/20'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-xxs text-gray-500 font-mono tracking-wider">REF ID: #SNC-00{booking.id}</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight group-hover:text-emerald-300 transition-colors">
                        {eventInfo?.title || `Live Showcase Event`}
                      </h3>
                      <p className="text-emerald-400 font-black text-sm mt-1 uppercase tracking-wider">
                        Seat {seatInfo?.seatNumber || `SeatHold`} &bull; ${seatInfo?.price?.toFixed(2) || '100.00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-xxs font-bold text-gray-400 uppercase tracking-wider pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <span>{eventInfo?.date || 'Syncing...'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>{eventInfo?.time || 'Syncing...'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <span className="truncate max-w-[200px]">{eventInfo?.venue?.name || 'Syncing...'}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Stub Action section */}
                <div className="p-8 md:w-64 bg-white/2 flex flex-col justify-between items-center md:items-end gap-6 relative">
                  <div className="text-center md:text-right space-y-1">
                    <span className="text-xxs text-gray-500 font-bold uppercase tracking-wider block">Lock Timestamp</span>
                    <span className="text-xs text-white font-bold block">
                      {new Date(booking.bookingTime).toLocaleDateString()}
                    </span>
                    <span className="text-xxs text-gray-400 font-mono block">
                      {new Date(booking.bookingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isPending ? (
                    <button
                      onClick={() => navigate(`/checkout/${booking.id}`)}
                      className="glow-btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer flex items-center gap-1.5 border border-amber-400/20"
                    >
                      Process hold <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    /* Mock Barcode graphics for realistic voucher feel */
                    <div className="flex flex-col items-center gap-2 w-full md:items-end opacity-40 hover:opacity-75 transition-opacity">
                      <div className="h-10 w-36 bg-white rounded flex items-center justify-evenly p-1 overflow-hidden">
                        {[...Array(24)].map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-black h-full" 
                            style={{ width: `${i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px'}` }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 tracking-[0.2em]">{booking.paymentId ? `TXN-P${booking.paymentId}` : 'VERIFIED'}</span>
                    </div>
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
