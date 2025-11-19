// src/components/features/Gallery.jsx
import React, { useState, useCallback } from 'react';
import { galleryData } from '../../data/galleryImages';
import ImageModal from '../common/ImageModal';

function Gallery() {
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  const openModal = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentImageIndex(null);
  }, []);

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryData.length);
  }, [galleryData.length]);

  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + galleryData.length) % galleryData.length
    );
  }, [galleryData.length]);

  const selectedImageData =
    currentImageIndex !== null ? galleryData[currentImageIndex] : null;

  // Función para aplicar clases dinámicas de span y crear el efecto de cuadrícula mixta
  const getGridClasses = (id) => {
    switch (id) {
      case 1: // Quincho principal (grande)
        return 'md:col-span-5 md:row-span-2';
      case 3: // Zona de Piscina (mediano horizontal)
        return 'md:col-span-4';
      case 7: // Piscina Noche (mediano vertical)
        return 'md:col-span-3 md:row-span-2';
      case 4: // Ambiente interior
      case 6: // Cama elastica
        return 'md:col-span-3';
      default:
        // Tamaño por defecto para el resto de imágenes
        return 'md:col-span-4';
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-yellow-900 mb-4 font-hero-title"
            style={{ color: '#6F4E37' }}
          >
            Descubre Nuestra Galería
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed font-hero-title">
            Una mirada íntima a nuestras instalaciones. Encuentra el espacio
            perfecto para tu evento en Quincho El Ruco.
          </p>
        </div>

        {galleryData.length > 0 ? (
          // Cuadrícula de 12 columnas con filas autoajustables para el patrón mixto
          <div className="grid grid-cols-12 gap-4 auto-rows-fr">
            {galleryData.map(
              (
                image,
                index
              ) => (
              <div
                key={image.id}
                // Clases base: tamaño en móviles/tablets
                className={`
                  col-span-12 sm:col-span-6 
                  ${getGridClasses(image.id)} 
                  relative group cursor-pointer overflow-hidden 
                  rounded-xl shadow-xl hover:shadow-2xl 
                  transition-all duration-300 transform hover:scale-[1.02]
                  min-h-[250px]
                `}
                onClick={() => openModal(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openModal(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  // Ocupa el 100% del contenedor con object-cover y transición suave
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                  {/* Overlay con Título y Descripción */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 font-hero-title">
                    <h3 className="text-white text-md font-semibold">
                      {image.alt}
                    </h3>
                    <p className="text-white text-xs opacity-70">
                       {image.description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            Galería de imágenes próximamente disponible.
          </p>
        )}
      </div>

      {selectedImageData && (
        <ImageModal
          src={selectedImageData.src}
          alt={selectedImageData.alt}
          description={selectedImageData.description}
          onClose={closeModal}
          onPrev={goToPrevImage}
          onNext={goToNextImage}
          hasPrev={galleryData.length > 1}
          hasNext={galleryData.length > 1}
        />
      )}
    </section>
  );
}

export default Gallery;