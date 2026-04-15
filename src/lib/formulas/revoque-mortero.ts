/** Cemento, cal y arena para revocar X m² de pared */
export interface Inputs {
  m2: number;
  tipoRevoque?: string; // grueso | fino | impermeable | completo
  espesor?: number; // cm (si no se ingresa usamos estándar)
  desperdicio?: number;
}
export interface Outputs {
  cementoKg: number;
  cementoBolsas: number;
  calKg: number;
  calBolsas: number;
  arenaM3: number;
  arenaTon: number;
  aguaL: number;
  volumenMorteroM3: number;
  tipo: string;
  resumen: string;
}

const TIPOS: Record<string, { nombre: string; espesor: number; cementoKg: number; calKg: number; arena: number; agua: number }> = {
  grueso: { nombre: 'Revoque grueso (1:1:6 cem:cal:arena)', espesor: 1.5, cementoKg: 200, calKg: 100, arena: 1.0, agua: 220 },
  fino: { nombre: 'Revoque fino (1:3 cem:arena fina o a la cal)', espesor: 0.5, cementoKg: 350, calKg: 0, arena: 1.0, agua: 200 },
  impermeable: { nombre: 'Revoque impermeable (1:3 cem:arena + hidrófugo)', espesor: 1.5, cementoKg: 400, calKg: 0, arena: 1.0, agua: 200 },
  completo: { nombre: 'Revoque completo (grueso 1.5 cm + fino 0.5 cm)', espesor: 2.0, cementoKg: 275, calKg: 75, arena: 1.0, agua: 210 },
};

export function revoqueMortero(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  const tipo = String(i.tipoRevoque || 'completo');
  const espCustom = Number(i.espesor) || 0;
  const desp = Number(i.desperdicio) || 10;
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m² de pared');
  if (!TIPOS[tipo]) throw new Error('Tipo de revoque no válido');

  const t = TIPOS[tipo];
  const espesor = espCustom > 0 ? espCustom : t.espesor;
  // Volumen = m² × espesor (cm → m)
  const volM3 = m2 * (espesor / 100);
  const factor = 1 + desp / 100;

  const cemento = volM3 * t.cementoKg * factor;
  const cal = volM3 * t.calKg * factor;
  const arena = volM3 * t.arena * factor;
  const agua = volM3 * t.agua;

  return {
    cementoKg: Math.round(cemento),
    cementoBolsas: Math.ceil(cemento / 50),
    calKg: Math.round(cal),
    calBolsas: cal > 0 ? Math.ceil(cal / 25) : 0, // bolsas de cal de 25 kg
    arenaM3: Number(arena.toFixed(2)),
    arenaTon: Number(((arena * 1550) / 1000).toFixed(2)),
    aguaL: Math.round(agua),
    volumenMorteroM3: Number(volM3.toFixed(3)),
    tipo: t.nombre,
    resumen: `Para ${m2} m² de ${t.nombre.toLowerCase()} (${espesor} cm) necesitás ${Math.ceil(cemento / 50)} bolsas de cemento${cal > 0 ? ', ' + Math.ceil(cal / 25) + ' bolsas de cal' : ''} y ${arena.toFixed(2)} m³ de arena.`,
  };
}
