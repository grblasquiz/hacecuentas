/**
 * Reajuste de la mesada pensional Colombia 2026 (Colpensiones y fondos privados, nómina de enero).
 * Regla: mesadas equivalentes a 1 SMLMV suben con el salario mínimo (SMLMV 2026 = $1.750.905);
 * mesadas superiores a 1 SMLMV suben el IPC certificado de 2025 = 5,1%, con piso en el SMLMV 2026
 * (ninguna pensión puede quedar por debajo del mínimo legal). Datos importados de la data país.
 */
import { COLOMBIA_2026, REAJUSTE_PENSIONAL_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  mesada_2025: number;
  mesadas_anio: '13' | '14';
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const R = REAJUSTE_PENSIONAL_2026;
  const smlmv2026 = COLOMBIA_2026.smlmv;
  const mesada2025 = Number(i.mesada_2025);
  if (!Number.isFinite(mesada2025) || mesada2025 <= 0) throw new Error('Ingresa tu mesada pensional de 2025');

  const mesadasAnio = i.mesadas_anio === '14' ? 14 : 13;
  const eraMinima = mesada2025 <= R.smlmv2025;

  let nueva: number;
  let regla: string;
  if (eraMinima) {
    nueva = smlmv2026;
    regla = `Tu mesada era de 1 SMLMV (o menos): sube con el salario mínimo al valor 2026, ${fmtCOP(smlmv2026)}.`;
  } else {
    const conIpc = mesada2025 * (1 + R.ipc2025Pct / 100);
    nueva = Math.max(conIpc, smlmv2026);
    regla = conIpc >= smlmv2026
      ? `Tu mesada supera 1 SMLMV: sube el IPC 2025 (${R.ipc2025Pct.toLocaleString('es-CO')}%).`
      : `Con el IPC quedaba por debajo del mínimo: se ajusta al piso legal de ${fmtCOP(smlmv2026)} (SMLMV 2026).`;
  }

  const nuevaR = Math.round(nueva);
  const aumentoMensual = nuevaR - mesada2025;
  const pctEfectivo = (aumentoMensual / mesada2025) * 100;
  const aumentoAnual = aumentoMensual * mesadasAnio;

  const _insight = {
    title: `Tu mesada 2026: ${fmtCOP(nuevaR)}`,
    text: `${regla} Pasas de **${fmtCOP(mesada2025)}** a **${fmtCOP(nuevaR)}**: **${fmtCOP(aumentoMensual)} más por mesada** (+${pctEfectivo.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%). Con ${mesadasAnio} mesadas al año, recibes **${fmtCOP(aumentoAnual)} adicionales en 2026**. El reajuste es automático desde la nómina de enero: no requiere ningún trámite.`,
    tone: 'good',
    icon: '👵',
  };

  const _chart = {
    type: 'bar',
    labels: ['Mesada 2025', 'Mesada 2026'],
    values: [Math.round(mesada2025), nuevaR],
    prefix: '$',
    ariaLabel: `Mesada 2025 ${fmtCOP(mesada2025)} frente a mesada 2026 ${fmtCOP(nuevaR)}.`,
  };

  return {
    mesada_2026: fmtCOP(nuevaR),
    aumento_mensual: fmtCOP(aumentoMensual),
    porcentaje_aplicado: `${pctEfectivo.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`,
    plata_extra_anual: `${fmtCOP(aumentoAnual)} (${mesadasAnio} mesadas)`,
    detalle: eraMinima
      ? `Mesada de 1 SMLMV: ${fmtCOP(mesada2025)} → ${fmtCOP(smlmv2026)} (sube con el salario mínimo 2026).`
      : `${fmtCOP(mesada2025)} × (1 + ${R.ipc2025Pct.toLocaleString('es-CO')}%) = ${fmtCOP(mesada2025 * (1 + R.ipc2025Pct / 100))}${nuevaR > Math.round(mesada2025 * (1 + R.ipc2025Pct / 100)) ? ` → piso SMLMV ${fmtCOP(smlmv2026)}` : ''}.`,
    _insight,
    _chart,
  };
}
