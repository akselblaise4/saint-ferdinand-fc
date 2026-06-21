"use client";

import { motion } from "framer-motion";

export default function ClubPage() {
  const values = [
    {
      icon: "favorite",
      title: "Pasión",
      desc: "El fuego interno que impulsa a nuestros atletas a trascender sus límites físicos en cada partido.",
    },
    {
      icon: "shield",
      title: "Honor",
      desc: "Mantener el prestigio del club mediante una conducta impecable e integridad inquebrantable dentro y fuera de la cancha.",
    },
    {
      icon: "diversity_3",
      title: "Unión",
      desc: "La fuerza colectiva de nuestra plantilla y comunidad global, forjada en una sola e indivisible.",
    },
    {
      icon: "diamond",
      title: "Excelencia",
      desc: "Una búsqueda incansable de la perfección técnica y la maestría estratégica en cada aspecto del juego.",
    },
  ];

  const timeline = [
    {
      year: "2024",
      label: "El Génesis",
      title: "Fundación 2024",
      desc: "El club se inaugura oficialmente con la visión de redefinir el panorama deportivo de lujo. Se presenta el escudo, símbolo de fuerza y herencia.",
    },
    {
      year: "2024",
      label: "El Debut",
      title: "Primera Temporada Profesional",
      desc: "Saint Ferdinand FC pisa el césped por primera vez, estableciendo de inmediato una reputación de fútbol disciplinado de élite.",
    },
    {
      year: "2025",
      label: "Consolidación",
      title: "Consolidación 2025",
      desc: "Refuerzos estratégicos y la maduración de nuestra filosofía conducen a una posición de privilegio en el campeonato y clasificación europea.",
    },
    {
      year: "2026",
      label: "La Era",
      title: "Tercera Temporada 2026",
      desc: "Consolidación como potencia global. Expansión del complejo deportivo para acoger el creciente talento de la cantera.",
    },
  ];

  return (
    <>
      {/* ─── HERO ─── */}
      <header className="relative h-[85vh] flex items-end overflow-hidden pt-20 bg-on-surface">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
          <div className="w-full h-full bg-on-surface" />
        </div>
        <div className="relative z-20 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-24">
          <div className="max-w-2xl">
            <span className="font-label-lg text-label-lg uppercase tracking-[0.2em] text-primary mb-4 block">Identidad</span>
            <h1 className="font-display-xl text-display-xl text-on-surface uppercase mb-6 leading-[0.9]">
              Más allá del <br />
              <span className="text-primary">Juego Hermoso</span>
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-md leading-relaxed">
              Saint Ferdinand FC representa la cúspide de la disciplina deportiva y el lujo minimalista. Un club fundado sobre los principios de la excelencia atlética y la pureza estética.
            </p>
          </div>
        </div>
      </header>

      {/* ─── DNA & VALUES ─── */}
      <section className="py-section-gap bg-surface">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-16 md:mb-20">
            <div className="md:col-span-6">
              <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">
                Nuestro ADN & Valores Fundamentales
              </h2>
            </div>
            <div className="md:col-span-6 flex items-center">
              <p className="font-body-md text-body-md text-secondary border-t border-secondary-container pt-4 w-full">
                No solo competimos; curamos un legado. Nuestros valores son los pilares arquitectónicos de nuestra institución, guiando cada pase, cada gol y cada decisión dentro del ecosistema Saint Ferdinand.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group p-8 md:p-10 bg-surface-container-lowest border border-surface-container-high transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-8 w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500">
                  <span className="material-symbols-outlined text-3xl">{v.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md uppercase mb-4 tracking-tight">{v.title}</h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECHNICAL SHEET BENTO ─── */}
      <section className="py-section-gap bg-surface-container-low overflow-hidden relative">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <h2 className="font-headline-lg text-headline-lg uppercase mb-12 md:mb-16 text-center">
            Ficha Institucional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Main Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2 bg-surface-container-lowest p-8 md:p-12 border border-surface-container-high flex flex-col justify-between"
            >
              <div>
                <span className="font-label-sm text-label-sm uppercase text-primary tracking-[0.3em] mb-4 block">
                  Identidad Oficial
                </span>
                <h3 className="font-display-lg text-display-lg uppercase mb-8 leading-none">
                  Saint Ferdinand <br />Football Club
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-8 md:gap-12 border-t border-surface-container-high pt-8 md:pt-12">
                <div>
                  <p className="font-label-sm text-label-sm uppercase text-secondary mb-2">Fundación</p>
                  <p className="font-headline-md text-headline-md">MARZO 2024</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm uppercase text-secondary mb-2">Ubicación</p>
                  <p className="font-headline-md text-headline-md">MADRID</p>
                </div>
              </div>
            </motion.div>

            {/* Colors Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-primary p-8 md:p-12 flex flex-col justify-between text-on-primary"
            >
              <span className="font-label-sm text-label-sm uppercase tracking-[0.3em] opacity-70 mb-4 block">
                Paleta del Club
              </span>
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-surface border border-white/20" />
                  <div>
                    <p className="font-label-lg text-label-lg uppercase">Blanco Puro</p>
                    <p className="text-sm opacity-60 font-body-md">#FFFFFF</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#b5000b] border border-white/20" />
                  <div>
                    <p className="font-label-lg text-label-lg uppercase">Rojo Heritage</p>
                    <p className="text-sm opacity-60 font-body-md">#B5000B</p>
                  </div>
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md uppercase mt-8 md:mt-12 leading-tight">
                La Sangre y La Luz
              </h4>
            </motion.div>

            {/* Stadium Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high"
            >
              <div className="w-full aspect-square bg-surface-container flex items-center justify-center mb-6 overflow-hidden">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">stadium</span>
              </div>
              <p className="font-label-sm text-label-sm uppercase text-primary mb-2">Capacidad del Estadio</p>
              <p className="font-headline-md text-headline-md mb-2">45,000 ASIENTOS</p>
              <p className="font-body-md text-body-md text-secondary">
                Un santuario de excelencia deportiva, diseñado con estética minimalista futurista.
              </p>
            </motion.div>

            {/* President & Staff */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-gutter"
            >
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high flex flex-col justify-center">
                <p className="font-label-sm text-label-sm uppercase text-secondary mb-1">Presidente</p>
                <p className="font-headline-md text-headline-md uppercase">Ferdinand von Lux</p>
              </div>
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high flex flex-col justify-center">
                <p className="font-label-sm text-label-sm uppercase text-secondary mb-1">Director Deportivo</p>
                <p className="font-headline-md text-headline-md uppercase">Marco Ferrera</p>
              </div>
              <div className="md:col-span-2 bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high flex items-center justify-between">
                <div>
                  <p className="font-label-sm text-label-sm uppercase text-secondary">Complejo Deportivo</p>
                  <p className="font-headline-md text-headline-md uppercase">La Ciudadela Blanca</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-primary">location_on</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="py-section-gap bg-surface overflow-hidden">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16 md:mb-24">
            <span className="font-label-lg text-label-lg uppercase tracking-[0.4em] text-primary mb-4 block">Crónicas</span>
            <h2 className="font-display-lg text-display-lg uppercase">Camino a la Gloria</h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary/20 -translate-x-1/2" />
            <div className="space-y-16 md:space-y-32">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-center justify-between md:justify-normal ${
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Year */}
                  <div className={`hidden md:block w-1/2 ${
                    i % 2 === 0 ? "pr-12 text-right pl-0" : "pl-12 text-left pr-0"
                  }`}>
                    <h3 className="font-display-lg text-display-lg text-primary opacity-10">{item.year}</h3>
                  </div>
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full z-10 border-4 border-surface ring-8 ring-primary/5" />
                  {/* Content */}
                  <div className={`w-full md:w-12/12 md:max-w-[50%] pl-12 md:pl-0 ${
                    i % 2 === 0 ? "md:pl-0 md:pr-12 md:text-left" : "md:pl-12 md:text-left"
                  }`}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-surface-container-lowest p-6 md:p-10 border border-surface-container-high"
                    >
                      <span className="font-label-sm text-label-sm text-primary uppercase mb-2 block">{item.label}</span>
                      <h4 className="font-headline-md text-headline-md uppercase mb-4">{item.title}</h4>
                      <p className="font-body-md text-body-md text-secondary leading-relaxed">{item.desc}</p>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
