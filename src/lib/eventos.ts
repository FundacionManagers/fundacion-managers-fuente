export type Evento = {
  id: string;
  tipo: string;
  titulo: string;
  bajada: string;
  fecha: string;
  lugar?: string;
  precio: string | null;
  imagen: string;
  cta: { etiqueta: string; href: string };
};

export const EVENTOS: Evento[] = [
  {
    id: 'torneo-5-edicion',
    tipo: 'Torneo F7',
    titulo: '5.ª Edición del Torneo Managers',
    bajada:
      'La espera terminó. 5 jornadas de liga, 8 equipos y muchas historias por escribir. F7 para líderes mayores de 28 años.',
    fecha: 'Desde el 18 de oct · KRAKSGOL',
    lugar: 'KRAKSGOL',
    precio: '$2.500.000 por equipo',
    imagen: '/eventos/torneo-5-edicion.jpg',
    cta: { etiqueta: 'Inscribe tu equipo', href: '/torneo/inscripciones/' },
  },
  {
    id: 'torneo-mixto-2-edicion',
    tipo: 'Torneo Mixto',
    titulo: '2.ª Edición Torneo Managers Mixto',
    bajada:
      'Formato 6 vs. 6 con 3 hombres y 3 mujeres en cancha. Cuadrangular en 3 jornadas para definir al campeón.',
    fecha: '25 oct · 8 nov · 22 nov',
    lugar: 'KRAKSGOL',
    precio: '$1.400.000 por equipo',
    imagen: '/eventos/torneo-mixto-2-edicion.jpg',
    cta: { etiqueta: 'Confirmar participación', href: '/contacto/' },
  },
  {
    id: 'torneo-penaltis',
    tipo: 'Evento especial',
    titulo: 'Torneo de Penaltis Managers',
    bajada:
      '15 penaltis por equipo. Premio sorpresa para el ganador. Exclusivo para equipos inscritos en la 5.ª edición.',
    fecha: 'Dom. 18 de oct · 10:00 a.m.',
    lugar: 'KRAKSGOL',
    precio: 'Gratis · equipos inscritos',
    imagen: '/eventos/torneo-penaltis.jpg',
    cta: { etiqueta: 'Confirmar antes del 16 oct', href: '/contacto/' },
  },
  {
    id: 'amistoso-villeta',
    tipo: 'Amistoso',
    titulo: 'Fútbol 11 – Managers en Villeta',
    bajada:
      'La Fundación se va de parche a Villeta. Fútbol 11, asado, hospedaje y buenos momentos. Cupos limitados, 22 jugadores + parejas.',
    fecha: 'Sáb. 28 de noviembre',
    lugar: 'Villeta, Cundinamarca',
    precio: '$300.000 por persona',
    imagen: '/eventos/amistoso-villeta.jpg',
    cta: { etiqueta: 'Reservar cupo', href: '/contacto/' },
  },
  {
    id: 'convocatoria-emprendimiento',
    tipo: 'Emprendimiento',
    titulo: 'Inscribe tu emprendimiento',
    bajada:
      'Abrimos la convocatoria para apoyar y visibilizar proyectos con ganas de crecer. Seleccionamos hasta 10 emprendimientos. Resultados el 23 de octubre.',
    fecha: 'Inscripciones hasta el 20 de oct',
    precio: null,
    imagen: '/eventos/convocatoria-emprendimiento.jpg',
    cta: { etiqueta: 'Inscribirse ahora', href: '/emprendimiento/' },
  },
];
