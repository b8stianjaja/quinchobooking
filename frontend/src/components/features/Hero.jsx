// frontend/src/components/features/Hero.jsx
import React, { useState, useEffect } from 'react';
// Importa ambas imágenes
import heroImageNight from '../../assets/images/heroquincho.jpg';
import heroImageDay from '../../assets/images/gallerypiscina.jpg'; // Usaremos esta como imagen de día

function Hero() {
  // Estado para controlar qué imagen está activa (0 para día, 1 para noche)
  const [activeImageIndex, setActiveImageIndex] = useState(0); // Empezar con la imagen de día

  const images = [heroImageDay, heroImageNight];
  const transitionDuration = 1000; // Duración del fade en ms
  const intervalDuration = 8000; // Tiempo que cada imagen es visible en ms

  // Efecto para cambiar la imagen cada cierto tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalDuration);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [images.length, intervalDuration]); // Dependencias del efecto

  // Función para manejar el scroll suave (sin cambios)
  const handleScrollToBooking = (event) => {
    event.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center text-white relative overflow-hidden" // Añadir overflow-hidden
      // Ya no se necesita el estilo de fondo aquí
    >
      {/* Contenedor para las imágenes de fondo */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-${transitionDuration} ease-in-out`}
            style={{ backgroundImage: `url(${image})` }}
            // Controlar opacidad basado en el índice activo
            // opacity-100 si es la activa, opacity-0 si no
            // pointer-events-none para asegurar que no interfieran con clics
            // z-index negativo para estar detrás del overlay
            {...{
              className: `absolute inset-0 bg-cover bg-center transition-opacity ease-in-out pointer-events-none -z-10 ${
                activeImageIndex === index ? 'opacity-100' : 'opacity-0'
              }`,
              // ¡Importante! Tailwind necesita la clase completa para `duration`,
              // por lo que si quieres duración variable, usa style o define clases específicas en tailwind.config.js
              // Para 1000ms, podemos usar 'duration-1000' que es una clase común.
              style: {
                backgroundImage: `url(${image})`,
                transitionDuration: `${transitionDuration}ms`, // Aplicar duración vía style
              },
            }}
          />
        ))}
      </div>

      {/* Overlay oscuro (ahora encima de las imágenes, z-10) */}
      <div className="absolute inset-0 bg-black/40 z-10"></div> {/* Ajusta la opacidad si es necesario */}

      {/* Contenido (ahora encima del overlay, z-20) */}
      <div className="relative z-20 text-center p-6 max-w-3xl mx-auto">
        {/* Título */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight font-hero-title drop-shadow-lg">
          El espacio ideal para celebrar es en <br /> Quincho El Ruco
        </h1>
        {/* Descripción */}
        <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto font-hero-title drop-shadow-md">
          Eventos, asados y momentos inolvidables. Totalmente equipado y listo
          para que disfrutes.
        </p>

        {/* Botón (sin cambios) */}
        <a
          href="#booking"
          onClick={handleScrollToBooking}
          className="inline-flex items-center justify-center bg-[#DD6B20] hover:bg-orange-400 text-white font-hero-title font-semibold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
        >
          Ver Disponibilidad y Reservar
          <svg //
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