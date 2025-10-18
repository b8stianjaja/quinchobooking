import React from 'react';

function Contact() {
  // A valid Google Maps embed URL for the location mentioned in the component.
  const mapEmbedUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3352.2202134705503!2d-70.98751632449282!3d-32.83942057363771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96883b004de10cf5%3A0xd143f4bdcd19652b!2sQuincho%20el%20Ruco!5e0!3m2!1ses!2scl!4v1760810461781!5m2!1ses!2scl';

  return (
    <section id="contact" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-900 mb-4 font-hero-title">
            Ponte en Contacto
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed font-hero-title">
            ¿Tienes preguntas, quieres coordinar una visita o necesitas más
            información? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 font-hero-title">
                Información
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="text-xl mr-3 text-yellow-600">📞</span>
                  <a
                    href="tel:+56912345678"
                    className="hover:text-yellow-700"
                  >
                    +56 9 5444 6433
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="text-xl mr-3 text-yellow-600">✉️</span>
                  <a
                    href="mailto:contacto@qera.cl"
                    className="hover:text-yellow-700"
                  >
                    quinchoelruco@gmail.com
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="text-xl mr-3 text-yellow-600">📍</span>
                  <span>Las Vegas, Parcela 30 Sitio 7, Llay-Llay</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 font-hero-title">
                Encuéntranos
              </h3>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl border">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Quincho El Ruco"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;