export function formatPlayerName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function formatPlayerPosition(position: string): string {
  const map: Record<string, string> = {
    GK: "Portero",
    goalkeeper: "Portero",
    portero: "Portero",
    DEF: "Defensa",
    defender: "Defensa",
    defensa: "Defensa",
    MID: "Centrocampista",
    midfielder: "Centrocampista",
    centrocampista: "Centrocampista",
    FW: "Delantero",
    forward: "Delantero",
    delantero: "Delantero",
    LB: "Lateral Izq.",
    RB: "Lateral Der.",
    CB: "Central",
    CDM: "Medio Centro",
    CM: "Centrocampista",
    CAM: "Media Punta",
    LW: "Extremo Izq.",
    RW: "Extremo Der.",
    ST: "Delantero Centro",
  };
  return map[position] || position;
}

export function formatAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
