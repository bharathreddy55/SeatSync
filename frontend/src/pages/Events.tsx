import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Calendar, MapPin, Clock, Sparkles } from 'lucide-react';

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

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero section */}
      <div className="text-center mb-12 relative py-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Live Experiences</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Book seats in real time. Powered by Redis Locks to guarantee you get the exact seat you reserve.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, venues, performances..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-3.5 pl-12 pr-28 text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-base shadow-xl"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2 rounded-lg shadow-lg transition-all text-sm cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No events found matching your query.</p>
          <button onClick={fetchEvents} className="mt-4 text-emerald-400 hover:underline cursor-pointer">Show all events</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full group"
            >
              {/* Image banner replacement with abstract patterns */}
              <div className="h-44 bg-gradient-to-br from-slate-900 to-emerald-950/80 p-6 flex flex-col justify-between border-b border-white/5 relative overflow-hidden">
                {/* Visual decorations */}
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all duration-300" />
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {event.status}
                  </span>
                  <Sparkles className="h-5 w-5 text-emerald-400 opacity-60 group-hover:scale-125 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {event.title}
                </h3>
              </div>

              {/* Event Info */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <p className="text-gray-400 text-sm line-clamp-3">
                  {event.description || "No description provided."}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="truncate">{event.venue.name}, {event.venue.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
