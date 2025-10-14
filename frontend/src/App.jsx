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
  const [loading, setLoading] = useState(true); // Empezamos en 'true' para mostrar carga inicial

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

  // --- LÓGICA MEJORADA ---
  // Este efecto se ejecuta solo una vez cuando la aplicación carga.
  useEffect(() => {
    // Intentamos verificar si ya existe una sesión.
    checkSession()
      .then((data) => {
        if (data && data.admin) {
          // Si la sesión existe, guardamos el usuario.
          setAdminUser(data.admin);
        }
      })
      .catch((err) => {
        // A diferencia de antes, ahora "atrapamos" el error.
        // Si el error es "No active session", es un comportamiento esperado,
        // por lo que no hacemos nada y la consola se mantendrá limpia.
        console.log('No active session found on initial load. This is normal.');
      })
      .finally(() => {
        // Sea cual sea el resultado, terminamos la carga.
        setLoading(false);
      });
  }, []); // El array vacío asegura que esto solo se ejecute una vez.

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
          <Route
            path="/admin"
            element={
              <Navigate to={isLoggedIn ? '/admin/dashboard' : '/admin/login'} replace />
            }
          />
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