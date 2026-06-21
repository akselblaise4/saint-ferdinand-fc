import { getCopaData } from "@/lib/loadData";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import PageHero from "@/components/sections/PageHero";

const fallbackImages = [
  "/images/stadium-crowd.jpg",
  "/images/player-action.jpg",
  "/images/stadium-night.jpg",
  "/images/training.jpg",
  "/images/player-red.jpg",
  "/images/stadium-sunset.jpg",
];

export default function BlogPage() {
  const data = getCopaData();
  const posts = (data.media?.all || []).filter(m => m.type === "news").slice(0, 9).map((m, i) => ({
    title: m.title || "Noticias USS Liga Premier",
    date: m.timestamp ? new Date(m.timestamp).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" }) : "",
    img: fallbackImages[i % fallbackImages.length],
    url: m.urlDrive || m.url,
  }));

  return (
    <>
      <PageHero
        title="Noticias"
        subtitle={`${posts.length} artículos`}
      />

      <ScrollReveal delay={0.1}>
        <section className="py-12 md:py-16">
          <StaggerGrid className="mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.title}>
                <a href={p.url || "#"} target={p.url ? "_blank" : undefined} rel="noopener noreferrer"
                  className="group flex flex-col border border-border bg-surface-container-lowest transition-colors hover:bg-surface-container">
                  <div className="relative h-44 overflow-hidden">
                    <img src={p.img} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-3 border border-white/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                      Galería
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-sm font-semibold text-on-surface">{p.title}</h2>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-on-surface-variant">
                      <span>{p.date}</span>
                    </div>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </ScrollReveal>
    </>
  );
}
