"use client";

import { useState } from "react";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import PageHero from "@/components/sections/PageHero";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <PageEnter>
      <PageHero title="Contacto" subtitle="Ponte en contacto con Saint Ferdinand FC" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <ScrollReveal>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-club-red">Contáctanos</span>
                <h2 className="mt-2 font-display text-5xl text-club-black md:text-6xl">ESCRÍBENOS</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  ¿Quieres contactar con el club? Déjanos tu mensaje y te responderemos lo antes posible.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { icon: "📍", label: "Dirección", value: "Madrid, España" },
                    { icon: "📧", label: "Email", value: "contacto@saintferdinandfc.com" },
                    { icon: "📱", label: "Teléfono", value: "+34 600 000 000" },
                    { icon: "🕐", label: "Horario", value: "Lun–Vie 10:00–18:00" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-club-red-muted text-lg">{c.icon}</div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                        <p className="text-sm font-medium text-foreground">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</label>
                    <input required className="mt-1.5 flex h-11 w-full rounded-lg border bg-background px-4 text-sm shadow-sm transition-colors focus:border-club-red focus:outline-none focus:ring-1 focus:ring-club-red" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                    <input type="email" required className="mt-1.5 flex h-11 w-full rounded-lg border bg-background px-4 text-sm shadow-sm transition-colors focus:border-club-red focus:outline-none focus:ring-1 focus:ring-club-red" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asunto</label>
                  <input required className="mt-1.5 flex h-11 w-full rounded-lg border bg-background px-4 text-sm shadow-sm transition-colors focus:border-club-red focus:outline-none focus:ring-1 focus:ring-club-red" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mensaje</label>
                  <textarea rows={5} required className="mt-1.5 flex w-full rounded-lg border bg-background px-4 py-3 text-sm shadow-sm transition-colors focus:border-club-red focus:outline-none focus:ring-1 focus:ring-club-red" />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg club-gradient text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:shadow-primary/30 active:scale-[0.98]"
                >
                  {sent ? "✓ Mensaje enviado" : "Enviar mensaje"}
                </button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </PageEnter>
  );
}
