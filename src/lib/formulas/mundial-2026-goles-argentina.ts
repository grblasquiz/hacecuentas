/** Mundial 2026 - Goles Argentina para repetir título */
export interface Inputs { partidosProyectados: number; golesMessi: number; golesAlvarez: number; golesLautaro: number; }
export interface Outputs { golesTotales: string; promedio: string; comparacion: string; chance: string; _insight?: any; _chart?: any; }

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
  let tone: 'good' | 'warn' | 'neutral';
  if (partidos < 7) { chance = `Para ser campeón hay que jugar 7 partidos. Proyectados: ${partidos}.`; tone = 'neutral'; }
  else if (total >= 15) { chance = `65-70%: goles suficientes históricamente para ganar el Mundial.`; tone = 'good'; }
  else if (total >= 11) { chance = `40-50%: en zona de campeones recientes (España 2010 con 8, Francia 2018 con 14).`; tone = 'neutral'; }
  else { chance = `<30%: ningún campeón del S.XXI ganó con menos de 11 goles (excepto España 2010).`; tone = 'warn'; }

  const _insight = {
    title: 'Goles para repetir título',
    text: partidos < 7
      ? `**${total} goles** proyectados en ${partidos} partidos (${prom.toFixed(2)}/partido). Ojo: el campeón juega **7 partidos**, así que esta proyección se queda corta de un torneo completo.`
      : total >= 15
        ? `**${total} goles** proyectados (${prom.toFixed(2)}/partido): por encima de los 15 de Qatar 2022. Pegada de sobra para repetir el título.`
        : total >= 11
          ? `**${total} goles** proyectados (${prom.toFixed(2)}/partido): en la zona de campeones recientes, pero sin margen. Habrá que afinar la puntería.`
          : `Solo **${total} goles** proyectados (${prom.toFixed(2)}/partido): por debajo de lo que ganó cualquier campeón del siglo (salvo España 2010). Falta gol.`,
    tone,
    icon: total >= 15 ? '🏆' : total >= 11 ? '⚽' : '📉',
  };

  const slices = [
    { label: 'Messi', value: m },
    { label: 'Álvarez', value: a },
    { label: 'Lautaro', value: l },
    { label: 'Resto del plantel', value: otros },
  ].filter((s) => s.value > 0);
  const _chart = total > 0 ? {
    type: 'doughnut',
    slices,
    prefix: '',
    centerValue: String(total),
    centerLabel: 'goles',
    ariaLabel: `Goles proyectados de Argentina: ${total} en total, con ${tridente} del tridente (Messi ${m}, Álvarez ${a}, Lautaro ${l}) y ${otros} del resto del plantel.`,
  } : undefined;

  return {
    golesTotales: `${total} goles proyectados (${tridente} del tridente + ${otros} del resto)`,
    promedio: `${prom.toFixed(2)} goles por partido`,
    comparacion: comp,
    chance,
    _insight,
    _chart,
  };
}
