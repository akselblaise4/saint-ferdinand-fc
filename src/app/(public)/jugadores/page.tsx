import { getCopaData } from "@/lib/loadData";

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAEuIMnQkKYsuLIwLzitQiYg5BxqQ7swbXSQLrLEBJ5EY5TU0Hv70kvSLPgbM4_XiCIrJdrPh-3-c1EdfIsoVawVtm3P3nhMQA_dG-Nz8MD2u3FtQfcVT-gOgl_GV4z-JFqhzcXHDXWuG_wQfQvCk5liaV4p8VH91sftE51zuQ587ylwO8WNfrl7jMLyT7MoXO_s54cB1t5GH6o0OfeqjN-JXmA-s1Q2WqVjEtDz0KznQlVGpMPAHdCFtS2uYDOB340GKkZ3zbRKF0";

export default function JugadoresPage() {
  const data = getCopaData();
  const players = (data.players as any)?.items || [];
  const scorersMap = new Map<string, number>();
  for (const s of (data as any).topScorers?.saints || []) {
    scorersMap.set(s.playerName, s.goals);
  }
  const sorted = [...(players as any[])].sort((a, b) => (scorersMap.get(b.name) || 0) - (scorersMap.get(a.name) || 0));

  return (
    <>

      <header className="relative h-[65vh] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-16">
          <span className="font-label-lg text-label-lg uppercase tracking-[0.2em] text-primary mb-4 block">Plantilla</span>
          <h1 className="font-display-xl text-display-xl text-on-surface uppercase mb-6 leading-[0.9]">
            Jugadores <br /><span className="text-primary">Saint Ferdinand</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{sorted.length} jugadores en plantilla</p>
        </div>
      </header>

      <main>
        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {sorted.map((player: any, i: number) => {
                const name = player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : player.name;
                const goals = scorersMap.get(player.name) || 0;
                const initial = (player.firstName?.[0] || player.name?.[0] || "?").toUpperCase();

                return (
                  <div
                    key={player.id}
                    className="bg-surface-container-lowest border border-surface-container-high p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 group"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 border border-surface-container-high bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500">
                      <span className="font-headline-lg text-headline-lg">{initial}</span>
                    </div>
                    <p className="font-headline-sm text-headline-sm uppercase mb-2 leading-tight">{name}</p>
                    <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                      {goals > 0 ? (
                        <>
                          <span className="text-primary font-headline-sm text-headline-sm">{goals}</span>
                          <span>goles</span>
                        </>
                      ) : (
                        <span>Sin goles</span>
                      )}
                      <span className="w-1 h-1 bg-secondary" />
                      <span>#{i + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
