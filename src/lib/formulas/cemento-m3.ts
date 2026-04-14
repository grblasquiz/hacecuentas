/** Cemento, arena, piedra por m³ de hormigón */
export interface Inputs {
  m3: number;
  dosificacion?: string;
  desperdicio?: number;
}
export interface Outputs {
  cementoKg: number;
  cementoBolsas: number;
  arenaM3: number;
  piedraM3: number;
  aguaL: number;
  tipoHormigon: string;
}

const DOSIFICACIONES: Record<string, {
  nombre: string;
  cementoKg: number;
  arena: number;
  piedra: number;
  aguaL: number;
}> = {
  "h13": { nombre: "H-13 (contrapiso, veredas)", cementoKg: 250, arena: 0.55, piedra: 0.75, aguaL: 180 },
  "h17": { nombre: "H-17 (platea, losas livianas)", cementoKg: 300, arena: 0.50, piedra: 0.75, aguaL: 180 },
  "h21": { nombre: "H-21 (losa, zapata, columna estándar)", cementoKg: 350, arena: 0.50, piedra: 0.75, aguaL: 180 },
  "h25": { nombre: "H-25 (estructura, columnas resistentes)", cementoKg: 400, arena: 0.45, piedra: 0.75, aguaL: 180 },
  "h30": { nombre: "H-30 (alta resistencia, puentes, torres)", cementoKg: 450, arena: 0.45, piedra: 0.75, aguaL: 180 },
};

export function cementoM3(i: Inputs): Outputs {
  const m3 = Number(i.m3);
  const dosif = String(i.dosificacion || 'h21');
  const desperd = Number(i.desperdicio) || 5;
  if (!m3 || m3 <= 0) throw new Error('Ingresá los m³');
  if (!DOSIFICACIONES[dosif]) throw new Error('Dosificación no válida');

  const d = DOSIFICACIONES[dosif];
  const factor = 1 + desperd / 100;

  const cementoKg = m3 * d.cementoKg * factor;
  const arenaM3 = m3 * d.arena * factor;
  const piedraM3 = m3 * d.piedra * factor;
  const aguaL = m3 * d.aguaL;

  return {
    cementoKg: Math.round(cementoKg),
    cementoBolsas: Math.ceil(cementoKg / 50),
    arenaM3: Number(arenaM3.toFixed(2)),
    piedraM3: Number(piedraM3.toFixed(2)),
    aguaL: Math.round(aguaL),
    tipoHormigon: d.nombre,
  };
}
