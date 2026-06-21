"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>

      <header className="relative h-[60vh] flex items-end overflow-hidden pt-20 bg-surface-container-low">
        <div className="relative z-10 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-16 md:pb-20">
          <span className="font-label-lg text-label-lg uppercase tracking-[0.2em] text-primary mb-4 block">Contacto</span>
          <h1 className="font-display-xl text-display-xl text-on-surface uppercase mb-6 leading-[0.9]">
            Hablemos
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-md">
            Ponte en contacto con Saint Ferdinand FC. Estaremos encantados de atenderte.
          </p>
        </div>
      </header>

      <main>
        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-section-gap">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-5"
              >
                <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Información</h2>
                <div className="space-y-6">
                  {[
                    { icon: "location_on", label: "Dirección", value: "Madrid, España" },
                    { icon: "mail", label: "Email", value: "contacto@saintferdinandfc.com" },
                    { icon: "call", label: "Teléfono", value: "+34 600 000 000" },
                    { icon: "schedule", label: "Horario", value: "Lun–Vie 10:00–18:00" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined">{c.icon}</span>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm uppercase text-secondary">{c.label}</p>
                        <p className="font-body-md text-body-md">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="md:col-span-7"
              >
                <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Envíanos un mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div>
                      <label className="font-label-sm text-label-sm uppercase text-secondary block mb-2">Nombre</label>
                      <input required className="w-full bg-surface-container-lowest border border-surface-container-high px-4 py-3 font-body-md text-body-md uppercase placeholder:text-secondary/40 focus:outline-none focus:border-primary transition-colors" placeholder="TU NOMBRE" />
                    </div>
                    <div>
                      <label className="font-label-sm text-label-sm uppercase text-secondary block mb-2">Email</label>
                      <input type="email" required className="w-full bg-surface-container-lowest border border-surface-container-high px-4 py-3 font-body-md text-body-md uppercase placeholder:text-secondary/40 focus:outline-none focus:border-primary transition-colors" placeholder="TU EMAIL" />
                    </div>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm uppercase text-secondary block mb-2">Asunto</label>
                    <input required className="w-full bg-surface-container-lowest border border-surface-container-high px-4 py-3 font-body-md text-body-md uppercase placeholder:text-secondary/40 focus:outline-none focus:border-primary transition-colors" placeholder="ASUNTO" />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm uppercase text-secondary block mb-2">Mensaje</label>
                    <textarea rows={5} required className="w-full bg-surface-container-lowest border border-surface-container-high px-4 py-3 font-body-md text-body-md uppercase placeholder:text-secondary/40 focus:outline-none focus:border-primary transition-colors resize-none" placeholder="ESCRIBE TU MENSAJE..." />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary font-label-lg text-label-lg uppercase py-4 tracking-[0.15em] transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-[0.99] flex items-center justify-center gap-3"
                  >
                    {sent ? (
                      <>✓ Mensaje enviado</>
                    ) : (
                      <>Enviar <span className="material-symbols-outlined text-xl">send</span></>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
