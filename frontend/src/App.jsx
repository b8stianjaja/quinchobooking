// In frontend/src/App.jsx
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { checkSession, logout as logoutAdmin } from './services/adminService';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import Hero from './components/features/Hero';
import Services from './components/features/Services';
import AboutQuincho from './components/features/AboutQuincho';
import Gallery from './components/features/Gallery';
import Testimonials from './components/features/Testimonials';
import BookingSection from './components/features/Booking/BookingSection';
import Contact from './components/features/Booking/Contact';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FIX: handleLoginSuccess now performs the navigation directly ---
  // This makes the code's intent clearer: when login succeeds,
  // update the state AND navigate immediately.
  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    toast.success(`Bienvenido, ${user.username || 'Admin'}`);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    logoutAdmin()
      .then(() => {
        setAdminUser(null);
        toast.success('Sesión cerrada con éxito.');
        navigate('/admin/login');
      })
      .catch(() => toast.error('No se pudo cerrar la sesión.'));
  };

  // Checks for an existing session when the app loads
  useEffect(() => {
    checkSession()
      .then((data) => {
        if (data && data.admin) {
          setAdminUser(data.admin);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // --- REMOVED: The useEffect that watched for isLoggedIn is no longer needed ---
  // The navigation is now handled directly by handleLoginSuccess.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  const isLoggedIn = !!adminUser;
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <AboutQuincho />
                <Services />
                <Gallery />
                <BookingSection />
                <Testimonials />
                <Contact />
              </>
            }
          />

          {/* If the user is logged in and tries to visit /login, redirect them to the dashboard */}
          <Route
            path="/admin/login"
            element={
              isLoggedIn ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* If the user is logged in, going to /admin will redirect to the dashboard, otherwise to the login page */}
          <Route
            path="/admin"
            element={
              <Navigate
                to={isLoggedIn ? '/admin/dashboard' : '/admin/login'}
                replace
              />
            }
          />

          {/* This is the protected route for the dashboard. It requires a user to be logged in. */}
          <Route
            path="/admin/dashboard"
            element={
              isLoggedIn ? (
                <AdminDashboard
                  currentAdminUser={adminUser}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AppContent />
    </Router>
  );
}

export default App;
