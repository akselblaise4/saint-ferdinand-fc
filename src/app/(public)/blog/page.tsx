import { getCopaData } from "@/lib/loadData";

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDFef9o9-Xqszly-_LqEJ_JWKLFBAOWGMtnMNLf1MkSCPpsNqyCFEdayR7BpzXAK_qRLCQyRbgSDH66FrYqqrY2D6LQJWjldKl_c7yqP4AczM__lZ2wbJ0kDnZRX94qR_l-CWXBepNq0ubnPL-FDGMCxO3XKv0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAtGNZWTEaYJwMpqGDCqFrQNfBrhCRsSPEZ6B5uGq06_PQC3R03k8X91TgndFYPQ-52PpNmO6MOHkFQll58ISgRR4Wv2Mwh9vJTMqQkRF7P_g",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAG1zETlIJO5tIyPT9hYqidLt2ppqhYOLlzgQzMwxB6tICYYJYXeR6dCUxl1M_EqgqYb8RYRHCKBcXhTG5sMRSLhWLLnMbHp5BF7qB5pY2AYqo",
];

const CATEGORIES = ["Todas", "Partidos", "Club", "Academia"];

export default function BlogPage() {
  const data = getCopaData();
  const posts = (data.media?.all || [])
    .filter(m => m.type === "news")
    .slice(0, 12)
    .map((m, i) => ({
      title: m.title || "Noticias Saint Ferdinand",
      date: m.timestamp
        ? new Date(m.timestamp).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "",
      img: m.url || fallbackImages[i % fallbackImages.length],
      url: m.urlDrive || m.url,
      category: CATEGORIES[(i % (CATEGORIES.length - 1)) + 1],
    }));

  return (
    <>

      <header className="relative h-[70vh] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={fallbackImages[0]} alt="" className="w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-[5s]" />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-16 md:pb-20">
          <div className="max-w-2xl">
            <span className="font-label-lg text-label-lg uppercase tracking-[0.2em] text-primary mb-4 block">Medios</span>
            <h1 className="font-display-xl text-display-xl text-on-surface uppercase mb-6 leading-[0.9]">
              Noticias <br /><span className="text-primary">del Club</span>
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-md leading-relaxed">
              Lo último sobre Saint Ferdinand FC: partidos, fichajes, academia y más.
            </p>
          </div>
        </div>
      </header>

      <main>

        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {posts.map((p, i) => (
                <div
                  key={p.title + i}
                  className={i === 0
                    ? "md:col-span-12 group cursor-pointer"
                    : "md:col-span-4 group cursor-pointer"
                  }
                >
                  <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <div className={`relative overflow-hidden bg-surface-container-lowest border border-surface-container-high h-full flex flex-col ${i === 0 ? "md:flex-row" : ""}`}>
                      <div className={`relative overflow-hidden ${i === 0 ? "md:w-3/5 h-64 md:h-auto" : "w-full h-52"}`}>
                        <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col p-6 md:p-8">
                        <span className="font-label-sm text-label-sm uppercase text-primary mb-2">{p.category}</span>
                        <h2 className="font-headline-md text-headline-md uppercase mb-3 group-hover:text-primary transition-colors">{p.title}</h2>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-container-high">
                          <span className="font-body-sm text-body-sm text-secondary">{p.date}</span>
                          <span className="material-symbols-outlined text-primary text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </a>
                  </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
