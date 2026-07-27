import React, { useState, useEffect } from 'react';
import api from '../api';
import { LayoutDashboard, PlusCircle, Building, Calendar, DollarSign, TableProperties, Sparkles } from 'lucide-react';

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
      setVSuccess(`Venue '${response.data.name}' created successfully!`);
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
      setESuccess(`Event '${response.data.title}' and seat map created successfully!`);
      setETitle('');
      setEDesc('');
      setEDate('');
      setETime('');
    } catch (err: any) {
      setEError(err.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
        <LayoutDashboard className="h-7 w-7 text-amber-400" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Event Organizer Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Venue Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-400" /> Configure Venues
          </h2>

          {vSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm p-3 rounded-lg">{vSuccess}</div>}
          {vError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm p-3 rounded-lg">{vError}</div>}

          <form onSubmit={handleCreateVenue} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-1.5">Venue Name</label>
              <input
                type="text"
                required
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="Royal Arena"
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-1.5">Location</label>
              <input
                type="text"
                required
                value={vLocation}
                onChange={(e) => setVLocation(e.target.value)}
                placeholder="London, UK"
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-1.5">Total Capacity</label>
              <input
                type="number"
                required
                value={vCapacity}
                onChange={(e) => setVCapacity(parseInt(e.target.value))}
                min={1}
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
            <button
              type="submit"
              className="glow-btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <PlusCircle className="h-4 w-4" /> Save Venue
            </button>
          </form>
        </div>

        {/* Create Event Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-400" /> Schedule Events & Seats
          </h2>

          {eSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm p-3 rounded-lg">{eSuccess}</div>}
          {eError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm p-3 rounded-lg">{eError}</div>}

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-300 text-sm font-semibold mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                  placeholder="Rock Concert"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-300 text-sm font-semibold mb-1.5">Select Venue</label>
                {venues.length === 0 ? (
                  <p className="text-rose-400 text-xs font-semibold">Please create a venue first.</p>
                ) : (
                  <select
                    value={eVenueId}
                    onChange={(e) => setEVenueId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} (Max: {v.capacity})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1.5">Time</label>
                <input
                  type="time"
                  required
                  value={eTime}
                  onChange={(e) => setETime(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-300 text-sm font-semibold mb-1.5">Description</label>
                <textarea
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                  placeholder="Live rock concert..."
                  rows={2}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1.5 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Ticket Price ($)
                </label>
                <input
                  type="number"
                  required
                  value={ePrice}
                  onChange={(e) => setEPrice(parseFloat(e.target.value))}
                  min={1}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 text-[10px] font-semibold mb-1.5 flex items-center gap-0.5">
                    <TableProperties className="h-3 w-3 text-amber-500" /> Rows
                  </label>
                  <input
                    type="number"
                    required
                    value={eRows}
                    onChange={(e) => setERows(parseInt(e.target.value))}
                    min={1}
                    max={15}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-[10px] font-semibold mb-1.5 flex items-center gap-0.5">
                    <TableProperties className="h-3 w-3 text-amber-500" /> Columns
                  </label>
                  <input
                    type="number"
                    required
                    value={eCols}
                    onChange={(e) => setECols(parseInt(e.target.value))}
                    min={1}
                    max={15}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 px-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={venues.length === 0}
              className="glow-btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <Sparkles className="h-4 w-4" /> Create Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
