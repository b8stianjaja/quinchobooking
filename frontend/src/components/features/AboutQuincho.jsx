// src/components/features/AboutQuincho.jsx
import React from 'react';
// Opcional: importa una imagen si quieres añadir una imagen descriptiva aquí
// import aboutImage from '../../assets/images/quincho-interior-detalle.jpg';

function AboutQuincho() {
  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      {' '}
      {/* Fondo blanco o un color muy sutil */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-hero-title   font-bold text-yellow-900 mb-6"
            style={{ color: '#6F4E37' }}
          >
            Quincho El Ruco
          </h2>
          <p className="text-lg font-hero-title text-gray-700 mb-4 leading-relaxed">
            En Las Vegas, Llay-Llay, Quincho El Ruco te ofrece un ambiente
            rústico ideal, con parrilla y piscina, para tus celebraciones más
            memorables...
          </p>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed"></p>
          {/* Opcional: Podrías añadir un botón aquí si quieres dirigir a otra sección, como servicios o galería */}
          {/* <a
            href="#services"
            className="mt-4 inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Descubre Nuestros Servicios
          </a> */}
        </div>

        {/* Opcional: Sección para una imagen y más texto, o puntos clave
        <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img src={aboutImage} alt="Detalle interior del Quincho QERa" className="rounded-lg shadow-xl"/>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Características Destacadas</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Ambiente acogedor y privado.</li>
              <li>Totalmente equipado para tu comodidad.</li>
              <li>Ubicación privilegiada en San Pedro de la Paz.</li>
              <li>Ideal para todo tipo de eventos.</li>
            </ul>
          </div>
        </div>
        */}
      </div>
    </section>
  );
}

export default AboutQuincho;
