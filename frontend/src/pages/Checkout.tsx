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
    // Generate an Idempotency Key on mount
    const key = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setIdempotencyKey(key);
    
    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;

    // Calculate time left from bookingTime (5 minutes TTL)
    const bookingTimeMs = new Date(booking.bookingTime).getTime();
    const expiryTimeMs = bookingTimeMs + 5 * 60 * 1000;
    
    const updateTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((expiryTimeMs - now) / 1000));
      setTimeLeft(diffSeconds);
      if (diffSeconds <= 0) {
        setError('Your 5-minute seat hold has expired. Please return to the event page and try again.');
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

      // Fetch seat & event metadata for display
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

      // Redirect on success
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-400" /> Secure Checkout
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Complete your ticket purchase</p>
        </div>

        {timeLeft > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between mb-8 text-amber-300">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-semibold">Seat reservation expires in:</span>
            </div>
            <span className="text-xl font-extrabold font-mono tracking-wider">{formatTime(timeLeft)}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl mb-8 flex items-center gap-3 shadow-md">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-6 space-y-4 mb-8">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-400" /> Order Summary
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-300">
            <span className="text-gray-400">Event:</span>
            <span className="text-white font-bold text-right truncate">{eventTitle}</span>

            <span className="text-gray-400">Seat Number:</span>
            <span className="text-emerald-400 font-bold text-right">Seat {seatNumber}</span>

            <span className="text-gray-400">Booking Reference:</span>
            <span className="text-white font-mono text-right">#000{booking?.id}</span>

            <span className="text-gray-400">Idempotency Key:</span>
            <span className="text-gray-500 font-mono text-xs text-right truncate">{idempotencyKey}</span>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between items-center">
            <span className="text-white font-bold">Total Amount</span>
            <span className="text-2xl font-extrabold text-emerald-400">${price.toFixed(2)}</span>
          </div>
        </div>

        {/* Idempotency test config */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-8 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-blue-300">Idempotent Transactions</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We send a unique <code>Idempotency-Key</code> header to the server. You can check the option below to send multiple identical requests concurrently, verifying that the server only charges you once!
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-white mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateDuplicate}
                onChange={(e) => setSimulateDuplicate(e.target.checked)}
                className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500 bg-slate-900 h-4 w-4"
              />
              Simulate Duplicate Request (Test Idempotency)
            </label>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={paying || timeLeft <= 0}
          className="glow-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {paying ? 'Authorizing Payment...' : 'Pay and Confirm Booking'}
        </button>
      </div>
    </div>
  );
};
