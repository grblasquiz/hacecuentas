/** Arena y grava (piedra) para hormigón según volumen */
export interface Inputs {
  m3: number;
  dosificacion?: string;
  desperdicio?: number;
}
export interface Outputs {
  arenaM3: number;
  gravaM3: number;
  cementoKg: number;
  cementoBolsas: number;
  aguaL: number;
  arenaTon: number;
  gravaTon: number;
  tipo: string;
  resumen: string;
}

// Dosificaciones típicas (parts) por m³ de hormigón
const DOSIFICACIONES: Record<string, { nombre: string; cemento: number; arena: number; grava: number; agua: number }> = {
  '1_3_3': { nombre: '1:3:3 (hormigón de baja resistencia, contrapisos)', cemento: 250, arena: 0.55, grava: 0.55, agua: 175 },
  '1_2_3': { nombre: '1:2:3 (hormigón estándar H-21, losas)', cemento: 350, arena: 0.50, grava: 0.75, agua: 180 },
  '1_2_4': { nombre: '1:2:4 (hormigón común H-17, platea)', cemento: 300, arena: 0.50, grava: 0.80, agua: 180 },
  '1_15_25': { nombre: '1:1,5:2,5 (alta resistencia H-25)', cemento: 400, arena: 0.45, grava: 0.70, agua: 180 },
  '1_1_2': { nombre: '1:1:2 (muy alta resistencia H-30)', cemento: 450, arena: 0.42, grava: 0.65, agua: 180 },
};

export function arenaGrava(i: Inputs): Outputs {
  const m3 = Number(i.m3);
  const dos = String(i.dosificacion || '1_2_3');
  const desp = Number(i.desperdicio) || 5;
  if (!m3 || m3 <= 0) throw new Error('Ingresá el volumen de hormigón en m³');
  if (!DOSIFICACIONES[dos]) throw new Error('Dosificación no válida');

  const d = DOSIFICACIONES[dos];
  const factor = 1 + desp / 100;
  const arenaM3 = m3 * d.arena * factor;
  const gravaM3 = m3 * d.grava * factor;
  const cementoKg = m3 * d.cemento * factor;
  const aguaL = m3 * d.agua;

  // Densidades típicas: arena 1550 kg/m³, grava 1600 kg/m³
  const arenaTon = (arenaM3 * 1550) / 1000;
  const gravaTon = (gravaM3 * 1600) / 1000;

  return {
    arenaM3: Number(arenaM3.toFixed(2)),
    gravaM3: Number(gravaM3.toFixed(2)),
    cementoKg: Math.round(cementoKg),
    cementoBolsas: Math.ceil(cementoKg / 50),
    aguaL: Math.round(aguaL),
    arenaTon: Number(arenaTon.toFixed(2)),
    gravaTon: Number(gravaTon.toFixed(2)),
    tipo: d.nombre,
    resumen: `Para ${m3} m³ de hormigón (${d.nombre}) necesitás ${arenaM3.toFixed(2)} m³ de arena y ${gravaM3.toFixed(2)} m³ de grava.`,
  };
}
