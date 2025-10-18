// src/components/features/Services.jsx
import React from 'react';

// --- IMPORTA TUS ÍCONOS AQUÍ ---
// Asegúrate de que las rutas y los nombres de archivo sean correctos.
import piscinaIcon from '../../assets/icons/piscina.png';
import audioIcon from '../../assets/icons/audio.png';
import estacionamientoIcon from '../../assets/icons/estacionamiento.png';
import parrillaIcon from '../../assets/icons/parrilla.png';
import hornoIcon from '../../assets/icons/horno.png';
import cocinaIcon from '../../assets/icons/cocina.png';
import mobiliarioIcon from '../../assets/icons/mobiliario.png';
import vajillaIcon from '../../assets/icons/vajilla.png';
import refrigeracionIcon from '../../assets/icons/refrigeracion.png';
import banosIcon from '../../assets/icons/banos.png';
import pingPongIcon from '../../assets/icons/ping-pong.png';
import camaSaltarinaIcon from '../../assets/icons/cama-saltarina.png';
import tacaTacaIcon from '../../assets/icons/tacataca.png';

// Lista de servicios actualizada para usar los íconos importados
const servicesList = [
  {
    icon: piscinaIcon,
    name: 'Piscina',
    description:
      'Disfruta de nuestra refrescante piscina, ideal para los días de sol y para relajarse en familia o con amigos.',
  },
  {
    icon: audioIcon,
    name: 'Sistema de Audio',
    description:
      'Equipo de música con conexión Bluetooth para ambientar tu evento.',
  },
  {
    icon: estacionamientoIcon,
    name: 'Estacionamiento',
    description:
      'Espacio de estacionamiento seguro y conveniente para ti y tus invitados.',
  },
  {
    icon: parrillaIcon,
    name: 'Parrilla',
    description:
      'Amplia parrilla con todos los implementos necesarios para un asado perfecto.',
  },
  {
    icon: hornoIcon,
    name: 'Horno',
    description: 'Disponible para tus preparaciones horneadas',
  },
  {
    icon: cocinaIcon,
    name: 'Cocina',
    description:
      'Zona de preparación con lavaplatos y el espacio necesario para organizar cómodamente tus alimentos.',
  },
  {
    icon: mobiliarioIcon,
    name: 'Mobiliario Completo',
    description:
      'Mesas, sillas y cómodos sillones para tus invitados, tanto en interior como exterior.',
  },
  {
    icon: vajillaIcon,
    name: 'Vajilla y Utensilios',
    description:
      'Set completo de platos, vasos, cubiertos y utensilios de cocina y parrilla.',
  },
  {
    icon: refrigeracionIcon,
    name: 'Refrigeración',
    description:
      'Refrigerador de gran capacidad y conservadora para mantener tus bebidas y alimentos frescos.',
  },
  {
    icon: banosIcon,
    name: 'Baños Equipados',
    description:
      'Baños limpios, modernos y completamente equipados para damas y varones.',
  },
  {
    icon: pingPongIcon,
    name: 'Mesa de Ping Pong',
    description:
      '¡Que la diversión no pare! Desafía a tus amigos y familia en nuestra mesa de ping pong, con paletas y pelotas incluidas.',
  },
  {
    icon: camaSaltarinaIcon,
    name: 'Cama Saltarina',
    description:
      '¡Energía y risas aseguradas para los más pequeños! Disfruten de nuestra cama saltarina amplia y segura.',
  },
  {
    icon: tacaTacaIcon,
    name: 'Taca Taca',
    description:
      '¿Listos para la revancha? Arma los equipos y disfruta de entretenidos partidos en nuestro Taca Taca.',
  },
];

function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-amber-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2
            className="text-3xl font-hero-title md:text-4xl font-bold text-yellow-900 mb-4"
            style={{ color: '#6F4E37' }}
          >
            Servicios y Comodidades Incluidas
          </h2>
          <p className="text-lg font-hero-title text-gray-700 leading-relaxed">
            En Quincho El Ruco, hemos pensado en todo para que tu única
            preocupación sea disfrutar. Descubre el equipamiento y los servicios
            que tenemos para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {servicesList.map((service, index) => (
            <div
              key={`${service.name}-${index}`}
              className="bg-white font-hero-title p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
            >
              {/* --- CAMBIO: Se usa una etiqueta <img> en lugar de un div --- */}
              <img
                src={service.icon}
                alt={`Ícono de ${service.name}`}
                className="w-16 h-16 mb-4" // Ajusta el tamaño según necesites
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services; 