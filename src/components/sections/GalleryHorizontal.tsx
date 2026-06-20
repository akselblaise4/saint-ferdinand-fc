"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Album {
  id: string;
  thumbnail?: string | null;
  url?: string | null;
  urlDrive?: string | null;
  title?: string | null;
  timestamp?: number | { seconds: number } | string | null;
  type?: string;
  evt?: string;
  date?: string | null;
  dateOnly?: string | null;
  matchDriveUrl?: string | null;
}

interface GalleryHorizontalProps {
  albums: Album[];
}

gsap.registerPlugin(useGSAP);

const fallbackImages = [
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
  "https://images.unsplash.com/photo-1574629810360-3efdf89e8b56?w=800&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
  "https://images.unsplash.com/photo-1560272564-c83b4b6b39df?w=800&q=80",
  "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&q=80",
];

export default function GalleryHorizontal({ albums }: GalleryHorizontalProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const items: Album[] = albums.length >= 4 ? albums : fallbackImages.map((url, i) => ({
    id: `fallback-${i}`,
    thumbnail: url,
    url: null,
    urlDrive: "#",
    title: `Saint Ferdinand FC`,
    timestamp: null,
  }));

  useGSAP(
    () => {
      if (!trackRef.current || !sectionRef.current) return;

      const track = trackRef.current;
      const totalWidth = track.scrollWidth;

      gsap.to(track, {
        x: () => -(totalWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: "top top",
          end: () => `+=${totalWidth - window.innerWidth}`,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-club-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-club-black/30 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />

      <div className="sticky top-0 z-20 mx-auto max-w-6xl px-6 pt-16 md:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">Galería</p>
        <h2 className="mt-1 font-display text-3xl text-white md:text-4xl">Momentos</h2>
      </div>

      <div className="relative mt-8 md:mt-12">
        <div
          ref={trackRef}
          className="flex gap-4 pl-6 md:pl-12 will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map((item) => {
            const src = item.thumbnail || item.url || fallbackImages[0];
            const label =
              item.title ||
              (typeof item.timestamp === "number"
                ? new Date(item.timestamp * 1000).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                  })
                : typeof item.timestamp === "object" && item.timestamp?.seconds
                  ? new Date(item.timestamp.seconds * 1000).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    })
                  : "");

            return (
              <a
                key={item.id}
                href={item.urlDrive || "#"}
                target={item.urlDrive ? "_blank" : undefined}
                rel={item.urlDrive ? "noopener noreferrer" : undefined}
                className="group relative flex h-[50vh] w-[70vw] shrink-0 cursor-pointer items-end overflow-hidden rounded-2xl md:h-[60vh] md:w-[45vw]"
              >
                <img
                  src={src}
                  alt={label}
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 w-full p-6 md:p-8">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm">
                    Álbum
                  </span>
                  {label && (
                    <p className="mt-3 text-lg font-bold text-white">{label}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="flex items-center gap-2 text-xs text-white/20">
          <span className="inline-block h-px w-8 bg-white/20" />
          <span>Desliza horizontalmente</span>
        </div>
      </div>
    </section>
  );
}
