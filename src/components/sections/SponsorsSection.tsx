const sponsors = [
  { name: "Nike" },
  { name: "Coca-Cola" },
  { name: "Mahou" },
  { name: "Movistar" },
  { name: "Iberdrola" },
  { name: "Renfe" },
];

export default function SponsorsSection() {
  return (
    <section className="py-12 md:py-16 bg-ivory">
      <div className="container">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Patrocinadores oficiales</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {sponsors.map((s) => (
            <div key={s.name} className="flex items-center justify-center h-10 md:h-12 opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0">
              <span className="text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent mt-8" />
      </div>
    </section>
  );
}
