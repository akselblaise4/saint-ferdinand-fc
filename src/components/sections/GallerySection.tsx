import type { MediaItem } from "@/types/football";

interface GallerySectionProps {
  albums: MediaItem[];
}

export default function GallerySection({ albums }: GallerySectionProps) {
  const display = albums.length > 0 ? albums.slice(0, 7) : [];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red mb-1">Galería multimedia</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-[#111] uppercase tracking-[-0.02em]">Galería</h2>
        </div>

        {display.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {display.map((album, i) => (
              <div
                key={album.id || i}
                className={`group rounded-lg overflow-hidden bg-white border border-[#C8D4E0] hover:border-red/30 transition-colors ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <div className={`${i === 0 ? "aspect-[4/3]" : "aspect-square"} bg-[#EEF5FC] flex items-center justify-center overflow-hidden`}>
                  {album.thumbnail ? (
                    <img src={album.thumbnail} alt={album.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/40">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                    </svg>
                  )}
                </div>
                {album.title && (
                  <div className="p-2 md:p-3">
                    <p className="text-[11px] font-bold text-[#001838] truncate">{album.title}</p>
                    {album.date && <p className="text-[9px] text-muted-foreground">{album.date}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Próximamente — nuevas imágenes</p>
          </div>
        )}
      </div>
    </section>
  );
}
