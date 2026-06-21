"use client";

import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { PlayerStats } from "./players-data";

const labelMap: Record<string, string> = {
  speed: "Velocidad",
  shooting: "Tiro",
  passing: "Pase",
  defense: "Defensa",
  physical: "Físico",
  dribbling: "Regate",
};

export function RadarChart({ stats }: { stats: PlayerStats }) {
  const data = Object.entries(stats).map(([key, value]) => ({
    subject: labelMap[key] || key,
    value,
    fullMark: 100,
  }));

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 600 }}
            tickSize={6}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke="#D42030"
            fill="#D42030"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
