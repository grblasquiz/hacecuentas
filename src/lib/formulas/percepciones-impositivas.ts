import type { FormulaResult } from './types';

export function percepcionesImpositivas(v: Record<string, number>): FormulaResult {
  const base = Number(v.baseImponible);
  const alicuota = Number(v.alicuota);
  const previas = Number(v.otrasPercepciones || 0);
  if (!Number.isFinite(base) || base < 0 || !Number.isFinite(alicuota) || alicuota < 0 || alicuota > 100 || !Number.isFinite(previas) || previas < 0) throw new Error('Ingresá una base válida, una alícuota entre 0% y 100% y percepciones previas no negativas.');
  const percepcionCalculada = base * alicuota / 100;
  const percepcionesTotales = percepcionCalculada + previas;
  const totalConPercepciones = base + percepcionesTotales;
  const tasaEfectiva = base === 0 ? 0 : percepcionesTotales / base * 100;
  return { percepcionCalculada, percepcionesTotales, totalConPercepciones, tasaEfectiva, detalle: `Sobre una base de ${base.toFixed(2)}, una alícuota de ${alicuota.toFixed(2)}% genera ${percepcionCalculada.toFixed(2)}. Verificá régimen, base y cómputo en la norma aplicable.` };
}
