export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoSuenoBebeHorasEdad(i: Inputs): Outputs {
  const m = Number(i.edadMeses) || 0;
  // NSF / AASM 2015-2016 Consensus + OMS 2019 guidelines
  // Ranges below use the recommended midpoint; reported as typical value
  let tot: number, n: number, s: string, rangoEdad: string;
  if (m < 3) {
    // 0-2 meses (0-3 months): NSF 14-17h
    tot = 16; n = 9; s = '4-5 siestas cortas'; rangoEdad = '0-3 meses';
  } else if (m < 12) {
    // 3-11 meses: NSF 12-15h
    tot = 14; n = 11; s = '2-3 siestas'; rangoEdad = '3-11 meses';
  } else if (m < 24) {
    // 12-23 meses: NSF 11-14h
    tot = 13; n = 11; s = '1-2 siestas'; rangoEdad = '1-2 años';
  } else if (m < 60) {
    // 24-59 meses (2-4 años): NSF 10-13h
    tot = 12; n = 11; s = '0-1 siesta'; rangoEdad = '2-4 años';
  } else if (m < 156) {
    // 5-12 años (60-155 meses): NSF 9-11h para 6-13; 10-13h para 3-5
    tot = 10; n = 10; s = 'Sin siesta'; rangoEdad = '5-12 años';
  } else if (m < 204) {
    // 13-16 años (156-203 meses): NSF 8-10h
    tot = 9; n = 9; s = 'Sin siesta'; rangoEdad = '13-16 años';
  } else {
    // 17+ años: NSF 8-10h teens / 7-9h adultos
    tot = 8; n = 8; s = 'Sin siesta'; rangoEdad = '17+ años';
  }
  const siestaHoras = Math.max(0, tot - n);
  const años = m >= 24 ? `${Math.floor(m / 12)} años` : `${m} meses`;
  const _insight = {
    title: 'Sueño recomendado',
    text: `A los **${años}** lo ideal son **${tot}h** de sueño al día: **${n}h** de noche y unas **${siestaHoras}h** de siestas (${s}). Dormir menos de lo recomendado afecta el desarrollo, el humor y el rendimiento.`,
    tone: 'good',
    icon: '😴',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueño nocturno', value: n },
      { label: 'Siestas', value: siestaHoras },
    ],
    centerValue: tot + 'h',
    centerLabel: 'Total/día',
    ariaLabel: `Sueño diario recomendado: ${tot} horas, de las cuales ${n} de noche y ${siestaHoras} en siestas`,
  };
  const out: any = {
    horasTotales: tot + 'h',
    noche: n + 'h',
    siestas: s,
    resumen: `${años} (${rangoEdad}): ${tot}h total, ${n}h noche, ${s}.`,
    _insight,
    _chart,
  };
  return out;
}
