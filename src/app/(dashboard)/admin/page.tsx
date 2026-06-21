"use client";

import { useState } from "react";
import {
  Users,
  Calendar,
  Goal,
  AlertTriangle,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  present: boolean;
  goals: number;
  yellows: number;
  reds: number;
}

const initialPlayers: Player[] = [
  { id: 1, name: "Mateo López", number: 9, position: "DEL", present: true, goals: 14, yellows: 2, reds: 0 },
  { id: 2, name: "Pablo Torres", number: 10, position: "MED", present: true, goals: 6, yellows: 3, reds: 0 },
  { id: 3, name: "Carlos Ruiz", number: 4, position: "DEF", present: false, goals: 1, yellows: 5, reds: 1 },
  { id: 4, name: "Ana Martínez", number: 1, position: "POR", present: true, goals: 0, yellows: 1, reds: 0 },
  { id: 5, name: "Lucas Fernández", number: 7, position: "DEL", present: true, goals: 9, yellows: 1, reds: 0 },
  { id: 6, name: "Diego Sánchez", number: 6, position: "MED", present: false, goals: 5, yellows: 4, reds: 0 },
  { id: 7, name: "Jorge Ramírez", number: 3, position: "DEF", present: true, goals: 0, yellows: 6, reds: 0 },
  { id: 8, name: "Sergio Díaz", number: 8, position: "MED", present: true, goals: 3, yellows: 2, reds: 0 },
];

const statsCards = [
  { label: "Jugadores", value: "24", icon: Users, change: "+2", trend: "up" },
  { label: "Próximo Partido", value: "Dom 16:00", icon: Calendar, change: "vs ATM", trend: "up" },
  { label: "Goles Totales", value: "42", icon: Goal, change: "+3", trend: "up" },
  { label: "Amonestaciones", value: "18", icon: AlertTriangle, change: "+1", trend: "down" },
];

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [activeTab, setActiveTab] = useState<"asistencia" | "goles" | "amonestaciones">("asistencia");

  const toggleAttendance = (id: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, present: !p.present } : p)));
  };

  const adjustGoals = (id: number, delta: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, goals: Math.max(0, p.goals + delta) } : p)));
  };

  const adjustYellows = (id: number, delta: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, yellows: Math.max(0, p.yellows + delta) } : p)));
  };

  const presentCount = players.filter((p) => p.present).length;

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-white/[0.06] bg-surface-low/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 md:px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-club-red">
              <span className="font-display text-sm text-white">SFC</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Admin Panel</h1>
              <p className="text-[10px] text-muted-foreground">Gestión del equipo</p>
            </div>
          </div>
          <a
            href="/"
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-all hover:border-white/[0.15] hover:text-white"
          >
            Salir
          </a>
        </div>
      </div>

      <div className="px-5 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl border border-white/[0.06] bg-card p-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${card.trend === "up" ? "text-emerald-400" : "text-club-red"}`}>
                    {card.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {card.change}
                  </span>
                </div>
                <div className="mt-3 font-display text-3xl text-white">{card.value}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{card.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {(["asistencia", "goles", "amonestaciones"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-club-red text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab === "asistencia" ? "Asistencia" : tab === "goles" ? "Goles" : "Amonestaciones"}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-12 gap-0 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Jugador</div>
            <div className="col-span-1">POS</div>
            {activeTab === "asistencia" && <div className="col-span-3 text-center">Asistencia</div>}
            {activeTab === "goles" && <div className="col-span-3 text-center">Goles</div>}
            {activeTab === "amonestaciones" && (
              <>
                <div className="col-span-2 text-center">T. Amarillas</div>
                <div className="col-span-2 text-center">T. Rojas</div>
              </>
            )}
            <div className="col-span-4" />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {players.map((player) => (
              <div key={player.id} className="grid grid-cols-12 gap-0 items-center px-4 py-3 text-sm hover:bg-white/[0.02] transition-colors">
                <div className="col-span-1 font-display text-lg text-white">{player.number}</div>
                <div className="col-span-3 font-medium text-white">{player.name}</div>
                <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{player.position}</div>
                {activeTab === "asistencia" && (
                  <div className="col-span-3 flex justify-center">
                    <button
                      onClick={() => toggleAttendance(player.id)}
                      className={`rounded-lg border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                        player.present
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-white/[0.08] bg-white/[0.03] text-muted-foreground"
                      }`}
                    >
                      {player.present ? "Presente" : "Ausente"}
                    </button>
                  </div>
                )}
                {activeTab === "goles" && (
                  <div className="col-span-3 flex items-center justify-center gap-2">
                    <button onClick={() => adjustGoals(player.id, -1)} className="flex size-6 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground hover:border-club-red/30 hover:text-club-red transition-all"><Minus className="size-3" /></button>
                    <span className="font-display text-lg text-white tabular-nums w-6 text-center">{player.goals}</span>
                    <button onClick={() => adjustGoals(player.id, 1)} className="flex size-6 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground hover:border-club-red/30 hover:text-club-red transition-all"><Plus className="size-3" /></button>
                  </div>
                )}
                {activeTab === "amonestaciones" && (
                  <>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <button onClick={() => adjustYellows(player.id, -1)} className="flex size-6 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground hover:border-amber-400/30 hover:text-amber-400 transition-all"><Minus className="size-3" /></button>
                      <span className="font-display text-lg text-amber-400 tabular-nums w-6 text-center">{player.yellows}</span>
                      <button onClick={() => adjustYellows(player.id, 1)} className="flex size-6 items-center justify-center rounded-lg border border-white/[0.08] text-muted-foreground hover:border-amber-400/30 hover:text-amber-400 transition-all"><Plus className="size-3" /></button>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="font-display text-lg text-club-red tabular-nums">{player.reds}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.06] bg-card px-5 py-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              {presentCount} Presentes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white/[0.15]" />
              {players.length - presentCount} Ausentes
            </span>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {players.reduce((sum, p) => sum + p.goals, 0)} Goles Totales
          </div>
        </div>
      </div>
    </div>
  );
}
