interface NewsItem {
  title: string;
  date: string;
  tag: string;
  url: string;
}

interface NewsSectionProps {
  items: NewsItem[];
}

export default function NewsSection({ items }: NewsSectionProps) {
  if (!items.length) return null;
  const featured = items[0];
  const side = items.slice(1, 4);

  return (
    <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex justify-between items-end mb-stack-lg">
        <div>
          <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] mb-2 block">NOTICIAS</span>
          <h2 className="font-display-lg text-display-lg italic uppercase">Últimas Noticias</h2>
        </div>
        <a href="/blog" className="font-label-caps text-label-caps text-primary border-b border-primary pb-1 hover:opacity-70 transition-opacity hidden md:block">
          VER TODAS
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <a href={featured.url || "#"} target="_blank" rel="noopener noreferrer" className="md:col-span-7 group cursor-pointer overflow-hidden">
          <div className="aspect-[16/9] overflow-hidden">
            <div className="w-full h-full bg-surface-low group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="pt-6">
            <span className="font-label-caps text-[10px] text-primary-container mb-2 block">{featured.tag}</span>
            <h3 className="font-headline-md text-headline-md group-hover:text-primary transition-colors mb-4 uppercase">
              {featured.title}
            </h3>
            <p className="font-body-md text-on-surface-variant">{featured.date}</p>
          </div>
        </a>

        <div className="md:col-span-5 space-y-gutter">
          {side.map((item) => (
            <a key={item.title} href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="flex gap-4 group">
              <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-surface-low group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-label-caps text-[10px] text-on-surface-variant mb-1">{item.tag}</span>
                <h4 className="font-headline-md text-[20px] leading-tight group-hover:text-primary transition-colors uppercase">{item.title}</h4>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
