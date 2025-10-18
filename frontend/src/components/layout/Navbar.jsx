// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
// FIX: The logo is in the public folder, so it should be referenced from the root.
import logoImage from '/qer.svg';

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

  // FIX: Using the more robust scroll handler we developed.
  const handleScroll = useCallback(() => {
    const navHeight = 120; // Offset for scroll detection
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

    // Handle special case for being at the very top of the page
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
    <nav className="bg-white sticky top-0 z-50 border-b-4 border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <div className="flex-shrink-0">
          <a href="#hero" className="flex items-center"></a>
        </div>
        <div className="hidden md:flex flex-grow items-center justify-center space-x-1 lg:space-x-2">
          {renderNavLinks()}
        </div>
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
