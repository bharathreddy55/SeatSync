import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Events } from './pages/Events';
import { EventDetails } from './pages/EventDetails';
import { Checkout } from './pages/Checkout';
import { Bookings } from './pages/Bookings';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative">
          {/* Animated Ambient background lights */}
          <div className="pulse-glow" style={{ top: '10%', left: '10%' }} />
          <div className="pulse-glow" style={{ bottom: '15%', right: '10%', animationDelay: '-10s' }} />
          
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              } />
              
              <Route path="/events/:id" element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/checkout/:bookingId" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
