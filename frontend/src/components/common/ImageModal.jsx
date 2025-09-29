// src/components/common/ImageModal.jsx
import React from 'react';

function ImageModal({
  src,
  alt,
  description,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex,
  totalImages,
}) {
  if (!src) {
    return null;
  }

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && hasPrev) onPrev();
      if (event.key === 'ArrowRight' && hasNext) onNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-3 sm:p-4 transition-opacity duration-300 ease-in-out animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-alt-text"
      aria-describedby={description ? 'image-modal-description' : undefined}
    >
      {/* Contenedor Principal del Modal - CON FONDO SEMI-TRANSPARENTE */}
      <div
        className="bg-white/100 backdrop-blur-md rounded-xl shadow-2xl w-11/12 sm:w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-black/10 flex-shrink-0">
          {' '}
          {/* Borde más sutil */}
          {typeof currentIndex === 'number' &&
          typeof totalImages === 'number' &&
          totalImages > 0 ? (
            <p
              className="text-gray-700 text-xs sm:text-sm font-medium"
              id="image-modal-counter"
            >
              {' '}
              {/* Texto un poco más oscuro para contraste */}
              Imagen {currentIndex + 1}{' '}
              <span className="text-gray-500">de</span> {totalImages}
            </p>
          ) : (
            <div aria-hidden="true"></div>
          )}
          <button
            onClick={onClose}
            className="text-3xl font-light text-gray-600 hover:text-red-600 transition-colors leading-none p-1 -m-1 rounded-full hover:bg-black/10"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        {/* Cuerpo del Modal: Imagen y Botones de Navegación */}
        <div className="flex-grow p-1 sm:p-2 flex items-center justify-center relative overflow-hidden min-h-[200px] xs:min-h-[250px] sm:min-h-[300px] md:min-h-[400px]">
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full focus:outline-none transition-all duration-150 ease-in-out transform focus:scale-110 hover:scale-105"
              aria-label="Imagen anterior"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
          )}

          <div className="flex justify-center items-center w-full h-full p-1">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain block rounded-sm"
              id="image-modal-alt-text"
            />
          </div>

          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full focus:outline-none transition-all duration-150 ease-in-out transform focus:scale-110 hover:scale-105"
              aria-label="Siguiente imagen"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          )}
        </div>

        {/* Pie del Modal: Descripción */}
        {description && (
          <div className="p-3 sm:p-4 border-t border-black/10 flex-shrink-0">
            {' '}
            {/* Borde más sutil */}
            <p
              id="image-modal-description"
              className="text-gray-700 text-sm text-center leading-relaxed"
            >
              {' '}
              {/* Texto un poco más oscuro */}
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageModal;
