/** Cuota mensual jardín maternal/preescolar comparativa AR/MX/CL/UY/ES */
export interface Inputs { pais: string; tipoJardin: string; horasDiarias: number; incluyeAlmuerzo: boolean; }
export interface Outputs { cuotaMensualLocal: number; cuotaMensualUsd: number; matriculaAnualLocal: number; costoAnualTotalUsd: number; explicacion: string; }
export function preescolarJardinCuotaMensualComparativaPaises(i: Inputs): Outputs {
  const pais = String(i.pais || '').toUpperCase();
  const tipo = String(i.tipoJardin || '').toLowerCase();
  const horas = Number(i.horasDiarias) || 4;
  const almuerzo = !!i.incluyeAlmuerzo;
  // Cuotas promedio 2026 en moneda local + tipo de cambio aprox a USD
  const data: Record<string, { base: number; tc: number; simbolo: string }> = {
    'AR': { base: 220000, tc: 1250, simbolo: 'ARS' },
    'MX': { base: 4500, tc: 18, simbolo: 'MXN' },
    'CL': { base: 280000, tc: 950, simbolo: 'CLP' },
    'UY': { base: 12000, tc: 40, simbolo: 'UYU' },
    'ES': { base: 380, tc: 1, simbolo: 'EUR' },
  };
  const multTipo: Record<string, number> = { 'publico': 0.2, 'comunitario': 0.5, 'privado': 1, 'bilingue': 1.6, 'internacional': 2.4 };
  const d = data[pais] ?? data['AR'];
  const mt = multTipo[tipo] ?? 1;
  const factorHoras = horas <= 4 ? 1 : horas <= 6 ? 1.4 : 1.8;
  const factorAlmuerzo = almuerzo ? 1.15 : 1;
  const cuota = d.base * mt * factorHoras * factorAlmuerzo;
  const matricula = cuota * 1.5;
  const usd = cuota / d.tc;
  const anualUsd = (cuota * 10 + matricula) / d.tc;
  return {
    cuotaMensualLocal: Number(cuota.toFixed(0)),
    cuotaMensualUsd: Number(usd.toFixed(2)),
    matriculaAnualLocal: Number(matricula.toFixed(0)),
    costoAnualTotalUsd: Number(anualUsd.toFixed(2)),
    explicacion: `Jardín ${tipo} ${horas}h en ${pais}: cuota $${cuota.toLocaleString('es-AR')} ${d.simbolo} (~USD ${usd.toFixed(0)}/mes). Anual con matrícula: USD ${anualUsd.toFixed(0)}.`,
  };
}
