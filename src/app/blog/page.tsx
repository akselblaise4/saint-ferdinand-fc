import Image from "next/image";
import { getCopaData } from "@/lib/loadData";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";

const fallbackImages = [
  "/images/stadium-crowd.jpg", "/images/player-action.jpg", "/images/stadium-night.jpg",
  "/images/training.jpg", "/images/player-red.jpg", "/images/stadium-sunset.jpg",
];

export default function BlogPage() {
  const data = getCopaData();
  const posts = data.media.all.filter(m => m.type === "news").slice(0, 9).map((m, i) => ({
    title: m.title || "Noticias USS Liga Premier",
    excerpt: `Galería de fotos de ${m.title?.toLowerCase() || "la fecha"}`,
    date: m.timestamp ? new Date(m.timestamp).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" }) : "",
    author: "Copa Fácil",
    cat: "Galería",
    read: `${m.title?.includes("Fecha") ? "3" : "2"} min`,
    img: fallbackImages[i % fallbackImages.length],
    url: m.urlDrive || m.url,
  }));

  return (
    <PageEnter>
      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-club-black pt-20">
        <Image src="/images/stadium-night.jpg" alt="" fill className="absolute inset-0 object-cover opacity-25" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-club-black via-club-black/70 to-club-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="text-2xl">📰</span>
            </div>
            <div>
              <h1 className="font-display text-6xl leading-none tracking-tight text-white md:text-8xl">Noticias</h1>
              <p className="mt-2 text-sm text-white/40">{posts.length} artículos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── POSTS ── */}
      <ScrollReveal delay={0.1}>
        <section className="py-16 md:py-24">
          <StaggerGrid className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.title}>
                <a href={p.url || "#"} target={p.url ? "_blank" : undefined} rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
                  <div className="relative flex h-48 items-end overflow-hidden">
                    <Image src={p.img} alt={p.title} fill className="absolute inset-0 object-cover transition-all duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                    <span className="relative mb-4 ml-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                      {p.cat}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-sm font-bold leading-snug transition-colors group-hover:text-primary">{p.title}</h2>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{p.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                      <span>{p.author}</span>
                      <div className="flex items-center gap-2">
                        <span>{p.date}</span>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">{p.read}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </ScrollReveal>
    </PageEnter>
  );
}
