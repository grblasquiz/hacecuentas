import { DESEMPLEO_PISO, DESEMPLEO_TECHO } from './smvm-ar-2026';

export const DESEMPLEO_PORCENTAJE = 0.75;

/** Régimen general. Art. 118, Ley 24.013 y art. 2, Resolución 4/2026. */
export function calcularDesempleoGeneral(mejorNeto: number, mesesAportados: number) {
  const duracion = mesesAportados >= 36 ? 12 : mesesAportados >= 24 ? 8 : mesesAportados >= 12 ? 4 : mesesAportados >= 6 ? 2 : 0;
  const base = mejorNeto * DESEMPLEO_PORCENTAJE;
  const aplicarTopes = (monto: number) => Math.min(DESEMPLEO_TECHO, Math.max(DESEMPLEO_PISO, monto));
  const inicial = mejorNeto > 0 && duracion > 0 ? aplicarTopes(base) : 0;
  const cuotas = Array.from({ length: duracion }, (_, i) =>
    inicial === 0 ? 0 : aplicarTopes(inicial * (i < 4 ? 1 : i < 8 ? 0.85 : 0.70)));
  const total = cuotas.reduce((suma, cuota) => suma + cuota, 0);
  return { duracion, base, inicial, total };
}
