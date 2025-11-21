// src/components/features/Services.jsx
import React, { useEffect, useRef, useState } from 'react';
import tacaTacaIcon from '../../assets/icons/tacataca.png';

const servicesList = [
  {
    icon: '🏊',
    name: 'Piscina',
    description: 'Disfruta de nuestra refrescante piscina, ideal para los días de sol y para relajarse en familia o con amigos.',
  },
  {
    icon: '🎵',
    name: 'Sistema de Audio',
    description: 'Equipo de música con conexión Bluetooth para ambientar tu evento.',
  },
  {
    icon: '🚗',
    name: 'Estacionamiento',
    description: 'Espacio de estacionamiento seguro y conveniente para ti y tus invitados.',
  },
  {
    icon: '🔥',
    name: 'Parrilla',
    description: 'Amplia parrilla con todos los implementos necesarios para un asado perfecto.',
  },
  {
    icon: '🍞',
    name: 'Horno',
    description: 'Disponible para tus preparaciones horneadas.',
  },
  {
    icon: '🎛️',
    name: 'Cocina',
    description: 'Zona de preparación con lavaplatos y el espacio necesario para organizar cómodamente tus alimentos.',
  },
  {
    icon: '🪑',
    name: 'Mobiliario Completo',
    description: 'Mesas, sillas y cómodos sillones para tus invitados, tanto en interior como exterior.',
  },
  {
    icon: '🍽️',
    name: 'Vajilla y Utensilios',
    description: 'Set completo de platos, vasos, cubiertos y utensilios de cocina y parrilla.',
  },
  {
    icon: '🧊',
    name: 'Refrigeración',
    description: 'Refrigerador de gran capacidad y conservadora para mantener tus bebidas y alimentos frescos.',
  },
  {
    icon: '🚽',
    name: 'Baños Equipados',
    description: 'Baños limpios, modernos y completamente equipados para damas y varones.',
  },
  {
    icon: '🏓',
    name: 'Mesa de Ping Pong',
    description: '¡Que la diversión no pare! Desafía a tus amigos y familia en nuestra mesa de ping pong, con paletas y pelotas incluidas.',
  },
  {
    icon: '🤸',
    name: 'Cama Saltarina',
    description: '¡Energía y risas aseguradas para los más pequeños! Disfruten de nuestra cama saltarina amplia y segura.',
  },
  {
    icon: tacaTacaIcon,
    name: 'Taca Taca',
    description: '¿Listos para la revancha? Arma los equipos y disfruta de entretenidos partidos en nuestro Taca Taca.',
    isImage: true,
  },
];

function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false); // Estado para controlar la fase de animación
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Esperamos a que termine la animación de entrada (1.2s aprox) para activar el modo interactivo rápido
          const timer = setTimeout(() => {
            setHasAnimated(true);
          }, 1200);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-b from-amber-50/60 to-white overflow-hidden relative"
    >
       <style>{`
        .spring-transition {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div 
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ease-out transform
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <h2
            className="text-3xl font-hero-title md:text-4xl font-bold mb-4 text-[#6F4E37]"
          >
            Servicios y Comodidades Incluidas
          </h2>
          <p className="text-lg font-hero-title text-gray-700 leading-relaxed">
            En Quincho El Ruco, hemos pensado en todo para que tu única
            preocupación sea disfrutar. Descubre el equipamiento y los servicios
            que tenemos para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {servicesList.map((service, index) => (
            <div
              key={`${service.name}-${index}`}
              // Solo aplicamos delay durante la entrada, luego se quita para respuesta instantánea
              style={{ transitionDelay: isVisible && !hasAnimated ? `${index * 80}ms` : '0ms' }}
              className={`
                group relative bg-white font-hero-title p-6 rounded-2xl 
                shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                border border-amber-100/50
                flex flex-col items-center text-center h-full
                
                /* UX: Prevenir selección de texto */
                select-none cursor-default

                /* ANIMACIÓN: Lenta al entrar (spring), Rápida al interactuar (ease-out) */
                transform transition-all 
                ${hasAnimated ? 'duration-300 ease-out' : 'duration-700 spring-transition'}

                /* ESTADO DE ENTRADA */
                ${isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-20 scale-90'}

                /* INTERACCIONES (Escritorio Solamente) */
                /* El media query [@media(hover:hover)] evita que se quede "pegado" en móviles */
                [@media(hover:hover)]:hover:shadow-xl 
                [@media(hover:hover)]:hover:border-amber-200 
                [@media(hover:hover)]:hover:-translate-y-2
                
                /* INTERACCIONES (Móvil y Escritorio - Click/Touch) */
                active:scale-[0.97] active:transition-transform active:duration-100
              `}
            >
              <div 
                style={{ transitionDelay: isVisible && !hasAnimated ? `${(index * 80) + 150}ms` : '0ms' }}
                className={`
                  w-16 h-16 mb-5 rounded-full bg-amber-50 text-yellow-900
                  flex items-center justify-center text-3xl
                  
                  transition-all 
                  ${hasAnimated ? 'duration-300 ease-out' : 'duration-700 spring-transition'}

                  ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  
                  /* Efectos Hover protegidos para escritorio */
                  [@media(hover:hover)]:group-hover:bg-amber-100 
                  [@media(hover:hover)]:group-hover:scale-110 
                  [@media(hover:hover)]:group-hover:rotate-6
                `}
              >
                {service.isImage ? (
                  <img
                    src={service.icon}
                    alt={`Ícono de ${service.name}`}
                    className="w-9 h-9 object-contain drop-shadow-sm"
                  />
                ) : (
                  <span className="filter drop-shadow-sm">
                    {service.icon}
                  </span>
                )}
              </div>

              <h3 className={`
                text-xl font-bold text-gray-800 mb-3 
                transition-colors duration-300
                [@media(hover:hover)]:group-hover:text-[#6F4E37]
              `}>
                {service.name}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed opacity-90">
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