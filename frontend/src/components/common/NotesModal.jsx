// frontend/src/components/common/NotesModal.jsx
import React from 'react';
import PropTypes from 'prop-types';

function NotesModal({ title, content, onClose }) {
  // Efecto para cerrar con Escape y evitar scroll del fondo
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose} // Cierra al hacer clic en el fondo
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 id="notes-modal-title" className="text-lg font-semibold text-gray-800">
            {title || 'Notas Completas'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-grow">
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words"> {/* Mantiene saltos de línea y corta palabras largas */}
            {content || 'No hay notas disponibles.'}
          </p>
        </div>

        {/* Pie (Opcional, botón extra de cierre) */}
        <div className="p-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

NotesModal.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default NotesModal;