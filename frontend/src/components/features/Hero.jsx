import React from 'react';
import heroBackgroundImage from '../../assets/images/heroquincho.jpg';

function Hero() {
  const heroStyle = {
    backgroundImage: `url(${heroBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center text-white relative"
      style={heroStyle}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 text-center p-6 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight font-hero-title drop-shadow-lg">
          El espacio ideal para celebrar es en <br /> Quincho El Ruco
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto font-hero-title drop-shadow-md">
          Eventos, asados y momentos inolvidables. Totalmente equipado y listo
          para que disfrutes.
        </p>

        {/* --- AJUSTE DE COLOR EN EL BOTÓN --- */}
        <a
          href="#booking"
          className="inline-flex items-center justify-center bg-[#DD6B20] hover:bg-orange-400 text-white font-hero-title font-semibold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
        >
          Ver Disponibilidad y Reservar
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

export default Hero;
