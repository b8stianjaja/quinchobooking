// src/components/features/Testimonials.jsx
import React from 'react';
import { testimonials } from '../../data/testimonialsData'; // Importa los datos

function Testimonials() {
  if (!testimonials || testimonials.length === 0) {
    return null; // No renderizar la sección si no hay testimonios
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-amber-50/30">
      {' '}
      {/* Un fondo sutil para diferenciar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-yellow-900 mb-4 font-hero-title"
            style={{ color: '#6F4E37' }}
          >
            Lo Que Nuestros Clientes Opinan
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed font-hero-title">
            La satisfacción de quienes han disfrutado del Quincho es nuestra
            mejor carta de presentación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-xl shadow-lg flex flex-col" // flex-col para alinear el autor abajo si es necesario
            >
              <div className="flex-grow mb-4">
                {/* Icono de comillas opcional */}
                <svg
                  className="w-8 h-8 text-yellow-500 mb-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.555 5.304C4.262 6.597 3.403 8.22 3.403 10c0 2.314 1.134 4.268 2.907 5.337a.75.75 0 01-.402 1.407C3.047 15.801 1.903 13.438 1.903 10c0-2.632.904-5.038 2.597-6.996a.75.75 0 011.055 1.06zM14.555 5.304C13.262 6.597 12.403 8.22 12.403 10c0 2.314 1.134 4.268 2.907 5.337a.75.75 0 01-.402 1.407C12.047 15.801 10.903 13.438 10.903 10c0-2.632.904-5.038 2.597-6.996a.75.75 0 011.055 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-gray-600 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="mt-auto text-right">
                {' '}
                {/* mt-auto para empujar esto al final si la tarjeta tiene altura variable */}
                <p className="font-semibold text-yellow-700 font-hero-title">
                  {testimonial.author}
                </p>
                {testimonial.event && (
                  <p className="text-xs text-gray-500">{testimonial.event}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
