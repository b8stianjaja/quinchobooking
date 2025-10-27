// In frontend/src/components/admin/AdminLoginPage.jsx
import { useState } from 'react';
import PropTypes from 'prop-types'; // Step 1: Import PropTypes
import { loginAdmin } from '../../services/adminService';
import heroBackgroundImage from '../../assets/images/quincho.png';

function AdminLoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await loginAdmin({ username, password });

      if (result.success && result.user) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        setError(result.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo conectar al servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${heroBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen flex items-stretch text-gray-800">
      <div
        className="hidden lg:flex w-1/2 items-center justify-center p-12 relative"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-orange-900 opacity-60"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-white text-4xl font-bold leading-tight mb-4 font-hero-title">
            Administración
          </h1>
          <p className="text-orange-200 text-lg"></p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
            <p className="text-gray-500 mt-2">Accede al panel de administración</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Usuario
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Tu usuario"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {error && (
                <div className="text-center bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-orange-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
                >
                  {isLoading ? 'Ingresando...' : 'Ingresar al Panel'}
                </button>
              </div>
            </div>
          </form>
          <div className="text-center mt-8">
            <a href="/" className="text-sm text-gray-500 hover:text-orange-600">
              ← Volver al sitio principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Define the prop types for the component
AdminLoginPage.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};

export default AdminLoginPage;