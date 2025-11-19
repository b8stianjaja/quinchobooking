// src/components/features/Gallery.jsx
import React, { useState, useCallback } from 'react'; // Añade useCallback
import { galleryData } from '../../data/galleryImages';
import ImageModal from '../common/ImageModal';

function Gallery() {
  // En lugar de guardar el objeto imagen, guardamos el ÍNDICE de la imagen seleccionada
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  // Función para abrir el modal con el índice de la imagen
  const openModal = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  // Función para cerrar el modal
  const closeModal = useCallback(() => {
    setCurrentImageIndex(null);
  }, []);

  // Funciones para navegar
  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryData.length); // Navegación circular
  }, [galleryData.length]);

  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + galleryData.length) % galleryData.length
    ); // Navegación circular
  }, [galleryData.length]);

  // Obtenemos el objeto de la imagen actual basado en el índice
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
            Descubre
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed font-hero-title">
            Una mirada íntima a nuestras instalaciones. El espacio perfecto para
            tu próximo evento.
          </p>
        </div>

        {galleryData.length > 0 ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 md:gap-6 space-y-4">
            {galleryData.map(
              (
                image,
                index // Necesitamos el 'index' aquí
              ) => (
              <div
                key={image.id}
                className="break-inside-avoid bg-gray-300 rounded-lg overflow-hidden cursor-pointer group relative shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => openModal(index)} // Pasamos el índice al abrir
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openModal(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 font-hero-title">
                    <h3 className="text-white text-sm font-semibold font-hero-title">
                      {' '}
                      {/* Quité las clases _text-shadow-sm_ ya que no son estándar */}
                      {image.alt}
                    </h3>
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

      {selectedImageData && ( // Usamos selectedImageData ahora
        <ImageModal
          src={selectedImageData.src}
          alt={selectedImageData.alt}
          description={selectedImageData.description}
          onClose={closeModal}
          onPrev={goToPrevImage} // Pasamos la función para ir a la anterior
          onNext={goToNextImage} // Pasamos la función para ir a la siguiente
          // Determinar si hay anterior/siguiente (para navegación circular simple, si hay más de una imagen, siempre hay)
          hasPrev={galleryData.length > 1}
          hasNext={galleryData.length > 1}
          // Opcional, si quieres deshabilitar en los extremos sin loop:
          // hasPrev={currentImageIndex > 0}
          // hasNext={currentImageIndex < galleryData.length - 1}
          // Opcional: para mostrar "Imagen X de Y"
          // currentIndex={currentImageIndex}
          // totalImages={galleryData.length}
        />
      )}
    </section>
  );
}

export default Gallery;
