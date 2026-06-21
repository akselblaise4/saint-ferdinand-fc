import { getCopaData } from "@/lib/loadData";
import PlantillaClient from "./PlantillaClient";

const LOCKER_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAKsViQ5xRCWa_hVzrRSi7eW5b_-g9b8005-XnR8kA76B8JGrNrULY_Q2uEK8VnnTJg3QBOczE4oMXewxDjshmLp6HPggh9dx7J7yuTaaGgvC7DV002DAW3s2CHz9A-RUZNHk0XjU-GHNxT9MypBLJSD1I5GVHx11pvvaBKuO3h2g6G48sx8S-6AuZ7i8gKomLhXW9ObRkDC5T44d4KGvsGd_LGkYru7rXSVK7wfxD_Ho7h-blcQLc-Bpx5fS76WbTDPq__5q5LKeg";

export default function PlantillaPage() {
  const data = getCopaData();

  const saintsId = "-OqC_DyMZey8vTF5Shq5";
  const saints = data.saints;
  const allPlayers = (data as any).players?.items || [];
  const saintsPlayers = allPlayers.filter((p: any) => p.teamId === saintsId);
  const scorersMap = new Map<string, number>();
  for (const s of (data as any).topScorers?.saints || []) {
    scorersMap.set(s.playerName, s.goals);
  }

  const stats = saints?.season?.stats || saints?.latest?.stats;

  return (
    <>
      <section className="relative h-[614px] flex items-end bg-inverse-surface overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-transparent to-transparent z-10" />
          <img src={LOCKER_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-20 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap">
          <h1 className="font-display-lg text-display-lg text-surface mb-4 uppercase">
            First Team <span className="text-primary-container">Plantilla</span>
          </h1>
          <p className="font-body-lg text-body-lg text-surface-variant max-w-2xl">
            El corazón de Saint Ferdinand FC. {saintsPlayers.length} jugadores · {data.event?.title} · {stats?.played || 0} partidos
          </p>
        </div>
      </section>

      <PlantillaClient players={saintsPlayers} scorersMap={scorersMap} />

      <section className="bg-surface-container-low py-section-gap border-t border-secondary-container">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12 md:mb-16">
            <h2 className="font-headline-lg text-headline-lg uppercase mb-2">Team Overview</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Temporada {data.event?.title}. Datos de rendimiento actualizados.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-container p-8 flex flex-col justify-between h-56 md:h-64 hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-3xl">sports_soccer</span>
                <span className="text-on-surface-variant font-label-sm uppercase">Goles</span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg leading-none">{stats?.goalsFor ?? 0}</div>
                <div className="text-primary font-label-lg uppercase tracking-wider mt-2">
                  {stats?.goalsFor && stats?.played ? `${(stats.goalsFor / stats.played).toFixed(1)} por partido` : "—"}
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-container p-8 flex flex-col justify-between h-56 md:h-64 hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-3xl">shield</span>
                <span className="text-on-surface-variant font-label-sm uppercase">Victorias</span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg leading-none">{stats?.wins ?? 0}</div>
                <div className="text-primary font-label-lg uppercase tracking-wider mt-2">
                  {stats?.played ? `${((stats.wins / stats.played) * 100).toFixed(0)}% tasa de éxito` : "—"}
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-lowest border border-surface-container p-8 flex flex-col justify-between h-56 md:h-64 hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
                <span className="text-on-surface-variant font-label-sm uppercase">Eficiencia</span>
              </div>
              <div>
                <div className="font-display-lg text-display-lg leading-none">{stats?.efficiency ?? 0}%</div>
                <div className="text-primary font-label-lg uppercase tracking-wider mt-2">
                  Pts: {stats?.points ?? 0} · DG: {stats?.goalDiff != null ? (stats.goalDiff > 0 ? "+" : "") + stats.goalDiff : "0"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
