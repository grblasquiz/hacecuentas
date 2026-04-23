/** Mundial 2026 - Goles Argentina para repetir título */
export interface Inputs { partidosProyectados: number; golesMessi: number; golesAlvarez: number; golesLautaro: number; }
export interface Outputs { golesTotales: string; promedio: string; comparacion: string; chance: string; }

export function mundial2026GolesArgentina(i: Inputs): Outputs {
  const partidos = Number(i.partidosProyectados);
  const m = Number(i.golesMessi) || 0;
  const a = Number(i.golesAlvarez) || 0;
  const l = Number(i.golesLautaro) || 0;
  if (!partidos || partidos < 3 || partidos > 7) throw new Error('Partidos fuera de rango (3-7)');
  const tridente = m + a + l;
  // 35% adicional por aportes de mediocampo/defensa (patrón Qatar 2022)
  const otros = Math.round(tridente * 0.35);
  const total = tridente + otros;
  const prom = total / partidos;
  const prom2022 = 15 / 7;
  const diff = prom - prom2022;
  let comp: string;
  if (diff > 0.3) comp = `Mejor que Qatar 2022 (${prom2022.toFixed(2)}/partido). Ofensiva récord.`;
  else if (Math.abs(diff) <= 0.3) comp = `Similar a Qatar 2022 (${prom2022.toFixed(2)}/partido). Promedio campeón.`;
  else comp = `Por debajo de Qatar 2022 (${prom2022.toFixed(2)}/partido). Hay margen para subir.`;

  let chance: string;
  if (partidos < 7) chance = `Para ser campeón hay que jugar 7 partidos. Proyectados: ${partidos}.`;
  else if (total >= 15) chance = `65-70%: goles suficientes históricamente para ganar el Mundial.`;
  else if (total >= 11) chance = `40-50%: en zona de campeones recientes (España 2010 con 8, Francia 2018 con 14).`;
  else chance = `<30%: ningún campeón del S.XXI ganó con menos de 11 goles (excepto España 2010).`;

  return {
    golesTotales: `${total} goles proyectados (${tridente} del tridente + ${otros} del resto)`,
    promedio: `${prom.toFixed(2)} goles por partido`,
    comparacion: comp,
    chance,
  };
}
