// src/components/layout/Footer.jsx
import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-gray-400 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl font-hero-title font-semibold text-white mb-2">
          Quincho El Ruco
        </h3>
        <p className="text-sm mb-4 font-hero-title">
          Tu espacio ideal para eventos y celebraciones.
        </p>
        <div className="mb-4">
          <a
            href="https://facebook.com/QuinchoelRuco/"
            className="px-3 hover:text-yellow-400 transition-colors font-hero-title"
          >
            Facebook
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="https://instagram.com/quincho_ruco/"
            className="px-3 hover:text-yellow-400 transition-colors font-hero-title"
          >
            Instagram
          </a>
          {/* Añade más redes sociales si es necesario */}
        </div>
        <p className="text-xs">
          &copy; {currentYear} Quincho El Ruco. Todos los derechos reservados.
        </p>
        {/* Opcional: Enlace a políticas o términos */}
        {/* <p className="text-xs mt-2">
          <a href="/politica-privacidad" className="hover:underline">Política de Privacidad</a>
        </p> */}
      </div>
    </footer>
  );
}

export default Footer;
