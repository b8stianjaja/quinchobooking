// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Importa el logo (ruta correcta desde la raíz del sitio)
import logoImage from '../../assets/images/navbar/qer3dtest.png';

const navLinksData = [
  { href: '#hero', label: 'Inicio' },
  { href: '#about', label: 'El Quincho' },
  { href: '#services', label: 'Servicios' },
  { href: '#gallery', label: 'Galería' },
  { href: '#booking', label: 'Reservas' },
  { href: '#testimonials', label: 'Opiniones' },
  { href: '#contact', label: 'Contacto' },
];

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleScroll = useCallback(() => {
    const navHeight = 120; 
    const scrollPosition = window.scrollY + navHeight;
    let currentSectionId = '';

    for (let i = navLinksData.length - 1; i >= 0; i--) {
      const link = navLinksData[i];
      const section = document.getElementById(link.href.substring(1));
      if (section && section.offsetTop <= scrollPosition) {
        currentSectionId = link.href;
        break;
      }
    }

    if (window.scrollY < 200) {
      currentSectionId = '#hero';
    }

    setActiveSection(currentSectionId);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavLinks = (isMobile = false) =>
    navLinksData.map((link) => (
      <a
        key={link.label}
        href={link.href}
        onClick={isMobile ? handleMobileLinkClick : undefined}
        className={`
          font-nav-link
          transition-colors duration-300
          ${
            isMobile
              ? 'block w-full text-left py-3 px-6 text-base'
              : 'px-3 py-2 rounded-md text-sm font-medium'
          }
          ${
            activeSection === link.href
              ? isMobile
                ? 'bg-orange-50 text-orange-600 font-semibold'
                : 'text-orange-600 font-semibold border-b-2 border-orange-600'
              : isMobile
                ? 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
                : 'text-gray-600 hover:text-orange-600'
          }
        `}
      >
        {link.label}
      </a>
    ));

  return (
    <nav className="bg-white sticky top-0 z-50 border-b-7 border-gray-100">
      {/* Contenedor principal: relative para el logo móvil y justify-between para espaciar el botón de menú */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 relative">
        
        {/* 1. ESPACIADOR IZQUIERDO (Ocupa el espacio que dejaría el logo en desktop) */}
        {/* En móvil, usamos este div como placeholder izquierdo para equilibrar el botón de menú */}
        <div className="md:hidden" style={{ minWidth: '50px' }}>
          {/* Este div vacío simula el ancho del botón para empujar el logo al centro */}
        </div>

        {/* 2. LOGO CENTRADO (Mobile ONLY) */}
        {/* Usa posicionamiento absoluto para el centrado, ignorando el flujo flex */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden">
           <a href="#hero" className="flex items-center">
              <img src={logoImage} alt="Quincho El Ruco Logo" className="h-8 w-auto" />
           </a>
        </div>
        
        {/* 3. ENLACES DE ESCRITORIO (Desktop ONLY) */}
        {/* Ocupa el espacio completo en desktop (flex-grow) y se centra */}
        <div className="hidden md:flex flex-grow items-center justify-center space-x-1 lg:space-x-2">
          {renderNavLinks()}
        </div>
        
        {/* 4. BOTÓN DE MENÚ MÓVIL (Derecha) */}
        <div
          className="flex items-center justify-end md:flex-shrink-0"
          style={{ minWidth: '50px' }}
        >
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="text-gray-600 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 p-2 rounded-md"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen
                  ? 'Cerrar menú principal'
                  : 'Abrir menú principal'
              }
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-gray-200 bg-white shadow-lg"
          id="mobile-menu"
        >
          <div className="py-2">{renderNavLinks(true)}</div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;