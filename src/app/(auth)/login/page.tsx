"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { BackgroundBeams } from "@/components/football/background-beams";
import { BorderBeam } from "@/components/football/border-beam";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6">
      <BackgroundBeams />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-club-red shadow-lg shadow-club-red/20 mb-4">
            <Shield className="size-8 text-white" />
          </div>
          <h1 className="font-display text-4xl tracking-wide text-white">Acceso Privado</h1>
          <p className="mt-2 text-sm text-muted-foreground">Jugadores y cuerpo técnico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-muted-foreground/30 outline-none transition-all focus:border-club-red/50 focus:ring-1 focus:ring-club-red/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-10 text-sm text-white placeholder:text-muted-foreground/30 outline-none transition-all focus:border-club-red/50 focus:ring-1 focus:ring-club-red/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <button
              type="submit"
              className="relative w-full overflow-hidden rounded-xl bg-club-red px-6 py-3.5 text-sm font-semibold tracking-wider text-white transition-all hover:bg-club-red/90 active:scale-[0.98] shadow-lg shadow-club-red/20"
            >
              <BorderBeam duration={3} size={200} />
              <span className="relative z-10">Iniciar Sesión</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-white transition-colors">
            Volver al sitio
          </a>
        </div>
      </div>
    </div>
  );
}
