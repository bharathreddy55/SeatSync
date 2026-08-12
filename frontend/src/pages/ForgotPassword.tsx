import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to initiate password reset request. Please check the email.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <KeyRound className="h-6 w-6 text-emerald-400" /> Reset Password
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Enter your account email to receive a recovery link</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-gray-300 text-sm mb-6">
              If an account exists for <strong>{email}</strong>, we have sent a secure recovery link to reset your password.
            </p>
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@seatsync.com"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="glow-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {submitting ? 'Sending Request...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-gray-400 hover:text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
