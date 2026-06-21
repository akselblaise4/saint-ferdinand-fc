export interface PlayerStats {
  speed: number;
  shooting: number;
  passing: number;
  defense: number;
  physical: number;
  dribbling: number;
}

export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  age: number;
  nationality: string;
  stats: PlayerStats;
}

export const defaultPlayers: Player[] = [
  { id: 1, name: "Mateo López", number: 9, position: "DEL", age: 25, nationality: "ES", stats: { speed: 88, shooting: 92, passing: 78, defense: 30, physical: 75, dribbling: 85 } },
  { id: 2, name: "Pablo Torres", number: 10, position: "MED", age: 27, nationality: "ES", stats: { speed: 82, shooting: 76, passing: 94, defense: 55, physical: 70, dribbling: 90 } },
  { id: 3, name: "Carlos Ruiz", number: 4, position: "DEF", age: 29, nationality: "ES", stats: { speed: 70, shooting: 45, passing: 78, defense: 92, physical: 88, dribbling: 65 } },
  { id: 4, name: "Ana Martínez", number: 1, position: "POR", age: 24, nationality: "ES", stats: { speed: 45, shooting: 30, passing: 65, defense: 85, physical: 78, dribbling: 35 } },
  { id: 5, name: "Lucas Fernández", number: 7, position: "DEL", age: 22, nationality: "AR", stats: { speed: 94, shooting: 84, passing: 72, defense: 25, physical: 68, dribbling: 91 } },
  { id: 6, name: "Diego Sánchez", number: 6, position: "MED", age: 26, nationality: "ES", stats: { speed: 76, shooting: 72, passing: 88, defense: 70, physical: 80, dribbling: 74 } },
  { id: 7, name: "Jorge Ramírez", number: 3, position: "DEF", age: 30, nationality: "MX", stats: { speed: 68, shooting: 40, passing: 70, defense: 90, physical: 85, dribbling: 60 } },
  { id: 8, name: "Sergio Díaz", number: 8, position: "MED", age: 23, nationality: "ES", stats: { speed: 80, shooting: 68, passing: 82, defense: 60, physical: 74, dribbling: 78 } },
  { id: 9, name: "Raúl Gómez", number: 11, position: "DEL", age: 28, nationality: "ES", stats: { speed: 86, shooting: 88, passing: 70, defense: 28, physical: 72, dribbling: 80 } },
  { id: 10, name: "Manuel Castro", number: 2, position: "DEF", age: 27, nationality: "ES", stats: { speed: 82, shooting: 38, passing: 72, defense: 86, physical: 82, dribbling: 62 } },
  { id: 11, name: "Álvaro Herrera", number: 5, position: "MED", age: 25, nationality: "ES", stats: { speed: 74, shooting: 60, passing: 84, defense: 78, physical: 76, dribbling: 70 } },
  { id: 12, name: "David Moreno", number: 12, position: "POR", age: 31, nationality: "ES", stats: { speed: 40, shooting: 25, passing: 60, defense: 82, physical: 75, dribbling: 30 } },
];
