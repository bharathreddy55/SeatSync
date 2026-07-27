import React, { useState, useEffect } from 'react';
import api from '../api';
import { LayoutDashboard, PlusCircle, Building, Calendar, DollarSign, TableProperties, Sparkles, AlertCircle, CheckCircle, Ticket } from 'lucide-react';

interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export const AdminDashboard: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  
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
  const [ePrice, setEPrice] = useState<number>(100.0);
  const [eRows, setERows] = useState<number>(5);
  const [eCols, setECols] = useState<number>(10);
  const [eSuccess, setESuccess] = useState('');
  const [eError, setEError] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/api/venues');
      setVenues(response.data);
      if (response.data.length > 0) {
        setEVenueId(response.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
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
    } catch (err: any) {
      setEError(err.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-4">
        <LayoutDashboard className="h-8 w-8 text-amber-400" />
        <h1 className="text-3xl font-black text-white tracking-tight uppercase tracking-wider">ORGANIZER COMMAND CENTER</h1>
      </div>

      {/* Metrics Row Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Active Venues</span>
            <span className="text-3xl font-black text-white block">{venues.length}</span>
          </div>
          <Building className="h-10 w-10 text-emerald-400 opacity-60" />
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Standard Tier Price</span>
            <span className="text-3xl font-black text-white block">$100.00</span>
          </div>
          <DollarSign className="h-10 w-10 text-emerald-400 opacity-60" />
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block">Ticket Registry</span>
            <span className="text-3xl font-black text-white block">Active</span>
          </div>
          <Ticket className="h-10 w-10 text-emerald-400 opacity-60 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Configure Venue Card */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-4 uppercase tracking-wider">
            <Building className="h-5.5 w-5.5 text-emerald-400" /> Configure Venues
          </h2>

          {vSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-inner">
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
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
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
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
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
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
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
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-inner">
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
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
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
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
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
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={eTime}
                  onChange={(e) => setETime(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                  placeholder="Join us for an exclusive live showcase..."
                  rows={2}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold transition-all"
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
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
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
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
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
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-3.5 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm font-semibold"
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
    </div>
  );
};
