const values = [
  {
    title: "Pasión",
    desc: "El rojo que corre por nuestras venas. Cada partido es una batalla, cada minuto una oportunidad.",
  },
  {
    title: "Honor",
    desc: "El blanco de nuestra camiseta representa la pureza del deporte y el respeto por el juego.",
  },
  {
    title: "Familia",
    desc: "Más que un club, un hogar. La afición es el alma que impulsa cada victoria.",
  },
  {
    title: "Grandeza",
    desc: "Nacidos para competir. Forjados en la lucha. Destinados a la gloria.",
  },
];

export default function ClubIdentitySection() {
  return (
    <section id="club" className="py-12 md:py-20 bg-ivory">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red mb-1">Nuestra esencia</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-[#111] uppercase tracking-[-0.02em]">Rojo & Blanco</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="p-6 md:p-8 rounded-lg bg-white border border-[#C8D4E0] hover:border-red/30 transition-colors">
              <h3 className="text-xl font-bold font-display text-[#001838] uppercase tracking-[0.03em] mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
