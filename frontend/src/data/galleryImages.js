// src/data/galleryImages.js

// 1. Import all images from the src/assets folder
import bancas from '../assets/images/quinchogallery/bancas.jpg';
import pasto from '../assets/images/quinchogallery/pasto.jpg';
import ambiente from '../assets/images/quinchogallery/ambiente.jpg';
import parrilla from '../assets/images/quinchogallery/parrilla.jpg';
import camaelastica from '../assets/images/quinchogallery/camaelastica.jpg';
import piscinanoche from '../assets/images/quinchogallery/piscinanoche.jpg';
import estacionamiento from '../assets/images/quinchogallery/estacionamiento.jpg';
import estacionamiento2 from '../assets/images/quinchogallery/estacionamiento2.jpg';
// NOTE: If you have other gallery images in frontend/public (e.g. quincho.jpg or quincho1.jpg),
// you should either move them to src/assets and import them, or ensure their path in this file
// is correctly pointing to the public folder (e.g., using a relative path if imported, or just the absolute path if they stay in public).

export const galleryData = [
  {
    id: 1,
    src: bancas, // Now using the imported image source
    alt: 'Reposeras para descanso',
    description: 'Reposeras cómodas para relajarse al sol.',
  },
  {
    id: 2,
    src: pasto, // Now using the imported image source
    alt: 'Zona de Piscina',
    description: 'Área de piscina',
  },
  {
    id: 3,
    src: ambiente, // Now using the imported image source
    alt: 'Ambiente Interior del Quincho',
    description: 'Ambiente Interior del Quincho con mesas y sillas.',
  },
  {
    id: 4,
    src: parrilla, // Now using the imported image source
    alt: 'Parrilla del quincho',
    description: 'Amplia parrilla para asados.',
  },
  {
    id: 5,
    src: camaelastica, // Now using the imported image source
    alt: 'Cama elástica para niños',
    description: 'Cama elástica segura y divertida para los más pequeños.',
  },
  {
    id: 6,
    src: piscinanoche, // Now using the imported image source
    alt: 'Piscina en la noche',
    description: 'Área piscina iluminada para disfrutar de noche.',
  },
  {
    id: 7,
    src: estacionamiento, // Now using the imported image source
    alt: 'Estacionamiento de vehículos',
    description: 'Estacionamiento de vehículos.',
  },
  {
    id: 8,
    src: estacionamiento2, // Now using the imported image source
    alt: 'Estacionamiento de vehículos',
    description: 'Estacionamiento de vehículos.',
  },
];