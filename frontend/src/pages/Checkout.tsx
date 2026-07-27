import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CreditCard, AlertCircle, Clock, ShieldCheck, Ticket } from 'lucide-react';

interface Booking {
  id: number;
  userId: number;
  eventId: number;
  seatId: number;
  status: string;
  bookingTime: string;
}

export const Checkout: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [price, setPrice] = useState(100.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [simulateDuplicate, setSimulateDuplicate] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes

  useEffect(() => {
    const key = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setIdempotencyKey(key);
    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;

    const bookingTimeMs = new Date(booking.bookingTime).getTime();
    const expiryTimeMs = bookingTimeMs + 5 * 60 * 1000;
    
    const updateTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((expiryTimeMs - now) / 1000));
      setTimeLeft(diffSeconds);
      if (diffSeconds <= 0) {
        setError('Your 5-minute seat hold has expired. Please return to the event details page and select your seat again.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/bookings/${bookingId}`);
      setBooking(res.data);

      const seatRes = await api.get(`/api/seats/${res.data.seatId}`);
      setSeatNumber(seatRes.data.seatNumber);
      setPrice(seatRes.data.price);

      const eventRes = await api.get(`/api/events/${res.data.eventId}`);
      setEventTitle(eventRes.data.title);
    } catch (err) {
      console.error(err);
      setError('Failed to load reservation details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (timeLeft <= 0) {
      setError('Cannot complete payment. Seat hold has expired.');
      return;
    }

    setPaying(true);
    setError('');

    try {
      if (simulateDuplicate) {
        console.log("[Idempotency Test] Simulating concurrent duplicate payment requests...");
        const request1 = api.post(
          '/api/payments',
          { bookingId: booking?.id, amount: price },
          { headers: { 'Idempotency-Key': idempotencyKey } }
        );
        const request2 = api.post(
          '/api/payments',
          { bookingId: booking?.id, amount: price },
          { headers: { 'Idempotency-Key': idempotencyKey } }
        );

        const [res1, res2] = await Promise.all([request1, request2]);
        console.log('Request 1 response:', res1.data);
        console.log('Request 2 response (Idempotent):', res2.data);
      } else {
        await api.post(
          '/api/payments',
          { bookingId: booking?.id, amount: price },
          { headers: { 'Idempotency-Key': idempotencyKey } }
        );
      }

      navigate('/bookings', { state: { bookingSuccess: true } });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTimerPercentage = () => {
    return (timeLeft / 300) * 100;
  };

  const getTimerColorClass = () => {
    if (timeLeft > 120) return 'bg-emerald-500';
    if (timeLeft > 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase animate-pulse">Verifying Seat Lock Status...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Checkout Billing Form */}
        <div className="lg:col-span-7 glass-panel p-8 rounded-3xl shadow-2xl border border-white/5 space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <CreditCard className="h-6 w-6 text-emerald-400" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Payment Details</h2>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl flex items-center gap-3 shadow-md">
              <AlertCircle className="h-5.5 w-5.5 shrink-0 text-rose-400" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {/* Micro-simulation of credit card widget */}
          <div className="relative h-44 w-full bg-gradient-to-br from-indigo-600 via-indigo-900 to-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-xxs font-black tracking-widest text-indigo-300 uppercase">SeatSync Premium Gate</span>
              <div className="w-9 h-6 bg-white/10 rounded-md backdrop-blur-sm" />
            </div>
            <div className="space-y-4">
              <div className="text-lg font-mono tracking-widest text-white font-semibold">•••• •••• •••• 9924</div>
              <div className="flex justify-between text-xxs font-bold uppercase text-gray-400 tracking-wider">
                <div>
                  <span className="block text-gray-500">Holder</span>
                  <span className="text-white mt-0.5 block">{window.localStorage.getItem('user_name') || 'SeatSync Customer'}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Expires</span>
                  <span className="text-white mt-0.5 block">12/30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment form mocks */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Card Number</label>
                <input
                  type="text"
                  disabled
                  value="4111 2222 3333 9924"
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-400 font-mono text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Security Code</label>
                <input
                  type="password"
                  disabled
                  value="123"
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-400 font-mono text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Idempotence settings widget */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-blue-300">Double Charge Protection Enabled</h4>
                <p className="text-xxs text-gray-400 leading-relaxed">
                  We secure this transaction using the API idempotency key listed in the order summary. Toggle the simulator below to test parallel duplicate booking processing.
                </p>
                <label className="flex items-center gap-2.5 text-xs font-bold text-white mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateDuplicate}
                    onChange={(e) => setSimulateDuplicate(e.target.checked)}
                    className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500 bg-slate-950 h-4.5 w-4.5"
                  />
                  Simulate Duplicate requests (Test Idempotency)
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={paying || timeLeft <= 0}
              className="glow-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black py-4 rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-400/20"
            >
              {paying ? 'Authorizing Payment Gateway...' : 'Pay and Confirm Reservation'}
            </button>
          </form>
        </div>

        {/* Order Details & Hold Timer Sidebox */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Reservation Hold Countdown widget */}
          {timeLeft > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-300">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 animate-pulse" />
                  <span>SEAT LOCK EXPIRES IN</span>
                </div>
                <span className="text-lg font-black font-mono tracking-widest">{formatTime(timeLeft)}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${getTimerColorClass()}`}
                  style={{ width: `${getTimerPercentage()}%` }}
                />
              </div>
              <p className="text-xxs text-gray-500 leading-normal">
                This seat is reserved for you. If payment details are not authorized before the lock bar depletes, the hold will automatically release back to event availability.
              </p>
            </div>
          )}

          {/* Order Details summary box */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3.5 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="h-5 w-5 text-emerald-400" /> Order Summary
            </h3>
            <div className="space-y-3.5 text-xs font-semibold text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Event</span>
                <span className="text-white font-black truncate max-w-[200px]">{eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reserved seat</span>
                <span className="text-emerald-400 font-black">Seat {seatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="text-white font-mono font-bold">#SNC-00{booking?.id}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500">Idempotency Key</span>
                <span className="text-gray-500 font-mono text-xxs text-right truncate max-w-[180px]">
                  {idempotencyKey}
                </span>
              </div>
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-sm font-extrabold text-white">
                <span className="uppercase tracking-wider">Total Charge</span>
                <span className="text-xl font-black text-emerald-400">${price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
