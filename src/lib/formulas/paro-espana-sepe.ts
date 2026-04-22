/**
 * Calculadora de Prestación por Desempleo Contributiva — SEPE España
 *
 * Regulación: Real Decreto Legislativo 8/2015 (Ley General de la Seguridad Social),
 * Arts. 262-275, modificado por RDL 2/2024.
 *
 * Escala de duración (días cotizados en últimos 6 años → meses de paro):
 *   360-539 d   → 4 meses    (120 días)
 *   540-719 d   → 6 meses    (180 días)
 *   720-899 d   → 8 meses    (240 días)
 *   900-1079 d  → 10 meses   (300 días)
 *   1080-1259 d → 12 meses   (360 días)
 *   1260-1439 d → 14 meses   (420 días)
 *   1440-1619 d → 16 meses   (480 días)
 *   1620-1799 d → 18 meses   (540 días)
 *   1800-1979 d → 20 meses   (600 días)
 *   1980-2159 d → 22 meses   (660 días)
 *   ≥ 2160 d    → 24 meses   (720 días) TOPE
 *
 * Cuantía:
 *   - Primeros 180 días: 70% de la Base Reguladora.
 *   - Desde día 181 hasta fin: 60% (cambio por RDL 2/2024 desde 01/11/2024, antes era 50%).
 *
 * Topes mensuales (IPREM 2026 estimado ≈ 600 €/mes × 1,75 = 1.050 €/m para mínimos,
 * y × 175%, 200%, 225% para máximos según hijos):
 *   Sin hijos: mín 80% IPREM (~560), máx 175% IPREM (~1.050)
 *   Con 1 hijo: mín 107% IPREM (~642), máx 200% IPREM (~1.200)
 *   Con ≥2 hijos: mín 107% IPREM (~642), máx 225% IPREM (~1.350)
 *
 *   (Para 2026 el IPREM oficial lleva años sin actualizarse, ronda 600 €/m.
 *    Estimación Ley PGE 2026; si no se publica, se mantiene el de 2025.)
 */

export interface ParoSepeInputs {
  diasCotizados: number; // días cotizados en los últimos 6 años
  baseReguladora: number; // base reguladora diaria, €/día (media de últimos 180 días)
  hijosACargo: 0 | 1 | 2;
  iprem: number; // IPREM mensual 2026, default 600 €/m
}

export interface ParoSepeOutputs {
  mesesProvision: string;
  diasProvision: string;
  importeMensualPrimeros180: string;
  importeMensualResto: string;
  importeTotal: string;
  topeMensualAplicado: string;
  topesInfo: string;
}

const fmtEUR = (n: number) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function mesesDeProvision(diasCot: number): number {
  if (diasCot < 360) return 0;
  // Cada bloque de 180 días cotizados = 60 días de prestación (2 meses),
  // empezando en 4 meses para 360d, hasta tope 24 meses con ≥2160 d.
  const bloques = Math.floor(diasCot / 180);
  const meses = Math.min(24, 4 + (bloques - 2) * 2);
  return Math.max(4, meses);
}

export function paroEspanaSepe(i: ParoSepeInputs): ParoSepeOutputs {
  const diasCot = Math.max(0, Number(i.diasCotizados) || 0);
  const baseReg = Number(i.baseReguladora);
  const hijos = Math.min(2, Math.max(0, Number(i.hijosACargo) || 0)) as 0 | 1 | 2;
  const iprem = Number(i.iprem) || 600;

  if (!baseReg || baseReg <= 0) {
    throw new Error('Ingresá tu base reguladora diaria (€/día)');
  }
  if (diasCot < 360) {
    throw new Error(
      'Con menos de 360 días cotizados en los últimos 6 años no tenés derecho a paro contributivo. Podrías optar al subsidio asistencial del SEPE.'
    );
  }

  const meses = mesesDeProvision(diasCot);
  const dias = meses * 30;

  // Importe bruto sin topes: baseReg (€/día) × 30 días = base mensual
  const baseMensual = baseReg * 30;
  let brutoPrimeros180 = baseMensual * 0.7;
  let brutoResto = baseMensual * 0.6;

  // Topes mensuales según hijos (IPREM con 6 pagas → factor a mensual usado × 1/12 × meses)
  // Fórmula oficial: IPREM × (100% + complementos) / 12 × 14 pagas
  // Simplificación: mensual = iprem × porcentaje
  let minimo: number, maximo: number;
  if (hijos === 0) {
    minimo = iprem * 0.8;
    maximo = iprem * 1.75;
  } else if (hijos === 1) {
    minimo = iprem * 1.07;
    maximo = iprem * 2.0;
  } else {
    minimo = iprem * 1.07;
    maximo = iprem * 2.25;
  }

  const topeAplicadoPrim = brutoPrimeros180 > maximo || brutoPrimeros180 < minimo;
  brutoPrimeros180 = Math.min(maximo, Math.max(minimo, brutoPrimeros180));
  brutoResto = Math.min(maximo, Math.max(minimo, brutoResto));

  // Total: 180 días (6 meses) al 70% o tope + resto al 60%
  const mesesPrim = Math.min(6, meses);
  const mesesResto = Math.max(0, meses - 6);
  const total = brutoPrimeros180 * mesesPrim + brutoResto * mesesResto;

  return {
    mesesProvision: `${meses} meses`,
    diasProvision: `${dias} días`,
    importeMensualPrimeros180: fmtEUR(brutoPrimeros180) + '/mes',
    importeMensualResto:
      mesesResto > 0 ? fmtEUR(brutoResto) + '/mes' : 'No aplica (prestación ≤ 6 meses)',
    importeTotal: fmtEUR(total),
    topeMensualAplicado: topeAplicadoPrim
      ? `Sí — se aplicó el tope máximo de ${fmtEUR(maximo)}/mes (IPREM × ${hijos === 0 ? 175 : hijos === 1 ? 200 : 225}% por ${hijos} hijos)`
      : 'No — importe dentro de los topes',
    topesInfo: `Mínimo ${fmtEUR(minimo)}/mes — Máximo ${fmtEUR(maximo)}/mes (IPREM 2026: ${fmtEUR(iprem)}/mes)`,
  };
}
