export interface NavLink {
  href: string;
  label: string;
  description?: string;
  sublinks?: NavLink[];
}

export const publicNav: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/plantilla", label: "Plantilla", description: "Jugadores y cuerpo técnico" },
  { href: "/partidos", label: "Partidos", description: "Calendario y resultados" },
  { href: "/clasificacion", label: "Clasificación", description: "Tabla de posiciones" },
  {
    href: "/club",
    label: "Club",
    description: "Historia, instalaciones y más",
    sublinks: [
      { href: "/club/historia", label: "Historia" },
      { href: "/club/instalaciones", label: "Instalaciones" },
      { href: "/club/directiva", label: "Directiva" },
    ],
  },
  { href: "/galeria", label: "Galería" },
  { href: "/blog", label: "Noticias" },
  { href: "/contacto", label: "Contacto" },
];

export const adminNav: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/plantilla", label: "Plantilla" },
  { href: "/admin/partidos", label: "Partidos" },
  { href: "/admin/clasificacion", label: "Clasificación" },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/blog", label: "Noticias" },
  { href: "/admin/config", label: "Configuración" },
];

export const footerLinks = {
  club: [
    { href: "/club", label: "Sobre el club" },
    { href: "/club/historia", label: "Historia" },
    { href: "/club/instalaciones", label: "Instalaciones" },
    { href: "/club/directiva", label: "Directiva" },
  ],
  equipo: [
    { href: "/plantilla", label: "Plantilla" },
    { href: "/partidos", label: "Partidos" },
    { href: "/clasificacion", label: "Clasificación" },
    { href: "/estadisticas", label: "Estadísticas" },
  ],
  contenido: [
    { href: "/galeria", label: "Galería" },
    { href: "/blog", label: "Noticias" },
    { href: "/contacto", label: "Contacto" },
  ],
  legal: [
    { href: "/aviso-legal", label: "Aviso Legal" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/cookies", label: "Cookies" },
  ],
} as const;

export const positions = [
  { id: "GK", label: "Porteros", order: 0 },
  { id: "DEF", label: "Defensas", order: 1 },
  { id: "MID", label: "Centrocampistas", order: 2 },
  { id: "FW", label: "Delanteros", order: 3 },
] as const;

export const formations = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "3-4-3",
  "5-3-2",
  "4-1-4-1",
] as const;
