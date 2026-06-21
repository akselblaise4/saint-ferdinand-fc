import type { Player } from "@/types/football";

interface SquadSectionProps {
  players: Player[];
}

const posStyles: Record<string, { label: string; bg: string; text: string }> = {
  GK: { label: "POR", bg: "bg-amber-50", text: "text-amber-700" },
  RB: { label: "LD", bg: "bg-blue-50", text: "text-blue-700" },
  CB: { label: "DFC", bg: "bg-indigo-50", text: "text-indigo-700" },
  LB: { label: "LI", bg: "bg-blue-50", text: "text-blue-700" },
  CM: { label: "MC", bg: "bg-emerald-50", text: "text-emerald-700" },
  CAM: { label: "MCO", bg: "bg-emerald-50", text: "text-emerald-700" },
  CDM: { label: "MCD", bg: "bg-emerald-50", text: "text-emerald-700" },
  LW: { label: "EI", bg: "bg-purple-50", text: "text-purple-700" },
  RW: { label: "ED", bg: "bg-purple-50", text: "text-purple-700" },
  ST: { label: "DC", bg: "bg-red-50", text: "text-red" },
  CF: { label: "DC", bg: "bg-red-50", text: "text-red" },
};

export default function SquadSection({ players }: SquadSectionProps) {
  const sorted = [...players].sort((a, b) => (a.number || 99) - (b.number || 99));

  return (
    <section id="plantilla" className="py-12 md:py-20 bg-ivory">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red mb-1">Primer equipo</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-[#111] uppercase tracking-[-0.02em]">Plantilla</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {sorted.map((player) => {
            const ps = posStyles[player.position] || { label: player.position, bg: "bg-smoke", text: "text-muted-foreground" };
            return (
              <div
                key={player.id}
                className="group bg-white rounded-lg border border-[#C8D4E0] p-4 md:p-5 hover:border-red/30 transition-colors"
              >
                <div className="aspect-square rounded-md bg-[#EEF5FC] flex items-center justify-center mb-3 overflow-hidden">
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl md:text-4xl font-bold font-display text-[#001838] opacity-30">
                        {player.number || "?"}
                      </span>
                    </div>
                  )}
                </div>

                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.08em] ${ps.bg} ${ps.text}`}>
                  {ps.label}
                </span>

                <h3 className="text-sm font-bold text-[#001838] mt-1.5 leading-tight">
                  {player.name}
                </h3>

                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                  {player.age && <span>{player.age} años</span>}
                  {player.nationality && (
                    <>
                      <span>·</span>
                      <span>{player.nationality}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
