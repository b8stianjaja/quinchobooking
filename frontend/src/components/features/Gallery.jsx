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
    // Navegación circular
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryData.length);
  }, [galleryData.length]);

  const goToPrevImage = useCallback(() => {
    // Navegación circular
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + galleryData.length) % galleryData.length
    );
  }, [galleryData.length]);

  const selectedImageData =
    currentImageIndex !== null ? galleryData[currentImageIndex] : null;

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
          // Cuadrícula uniforme de 2, 3 y 4 columnas.
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {galleryData.map(
              (
                image,
                index
              ) => (
              <div
                key={image.id}
                // Contenedor principal: usa el hack de padding para forzar la proporción 4:3
                className="relative cursor-pointer group rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                onClick={() => openModal(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openModal(index)}
                // Proporción 4:3 consistente en todos los dispositivos
                style={{ paddingTop: '75%' }} 
              >
                {/* Contenedor Absoluto para la imagen */}
                <div className="absolute inset-0">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    // CLAVE PARA ARMONÍA: object-cover fuerza a la imagen a llenar el 4:3 uniformemente.
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Overlay con Título y Descripción */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 font-hero-title">
                  <h3 className="text-white text-sm sm:text-md font-semibold">
                    {image.alt}
                  </h3>
                  <p className="text-white text-xs opacity-70 truncate">
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
          currentIndex={currentImageIndex} 
          totalImages={galleryData.length}
        />
      )}
    </section>
  );
}

export default Gallery;