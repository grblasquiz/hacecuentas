/**
 * Amortización anticipada de hipoteca (España) — sistema francés (cuota constante).
 * Compara las DOS opciones al aportar un extra: reducir PLAZO o reducir CUOTA,
 * y cuánto ahorras en intereses con cada una. En España la amortización anticipada
 * de vivienda habitual no puede llevar comisión salvo el límite legal (Ley 5/2019).
 * Fórmula pura en euros (es-ES).
 */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  capitalPendiente: number | string;
  tipoInteresAnual: number | string;
  plazoRestanteMeses: number | string;
  importeAmortizacion: number | string;
  modo?: string; // 'plazo' | 'cuota'
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function cuotaFrancesa(P: number, r: number, n: number): number {
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

export function compute(i: Inputs): Outputs {
  const P = Number(i.capitalPendiente) || 0;
  const tipoAnual = Number(i.tipoInteresAnual) || 0;
  const n = Math.round(Number(i.plazoRestanteMeses) || 0);
  const amort = Number(i.importeAmortizacion) || 0;
  const modo = i.modo === 'cuota' ? 'cuota' : 'plazo';

  if (P <= 0 || n <= 0) throw new Error('Introduce el capital pendiente y el plazo restante en meses');
  if (tipoAnual < 0) throw new Error('El tipo de interés no puede ser negativo');
  if (amort <= 0 || amort >= P) throw new Error('El importe a amortizar debe ser mayor que 0 y menor que el capital pendiente');

  const r = tipoAnual / 100 / 12;
  const cuotaActual = cuotaFrancesa(P, r, n);
  const interesesAntes = cuotaActual * n - P;

  const nuevoCapital = P - amort;

  // Opción A — reducir CUOTA (mismo plazo n)
  const nuevaCuota = cuotaFrancesa(nuevoCapital, r, n);
  const interesesDespuesCuota = nuevaCuota * n - nuevoCapital;
  const ahorroReduciendoCuota = interesesAntes - interesesDespuesCuota;
  const alivioMensual = cuotaActual - nuevaCuota;

  // Opción B — reducir PLAZO (misma cuota)
  let nuevoPlazo = n;
  if (r === 0) {
    nuevoPlazo = Math.ceil(nuevoCapital / cuotaActual);
  } else {
    // n = -ln(1 - P·r/cuota) / ln(1+r)
    const arg = 1 - (nuevoCapital * r) / cuotaActual;
    nuevoPlazo = arg <= 0 ? n : Math.ceil(-Math.log(arg) / Math.log(1 + r));
  }
  if (nuevoPlazo > n) nuevoPlazo = n;
  const mesesQuitados = n - nuevoPlazo;
  const interesesDespuesPlazo = cuotaActual * nuevoPlazo - nuevoCapital;
  const ahorroReduciendoPlazo = interesesAntes - interesesDespuesPlazo;

  const plazoGanaPorMas = ahorroReduciendoPlazo - ahorroReduciendoCuota;
  const recomendacion = ahorroReduciendoPlazo >= ahorroReduciendoCuota
    ? `Reducir plazo ahorra ${fmtEur(plazoGanaPorMas)} más en intereses que reducir cuota. Elígelo si puedes seguir pagando la cuota actual.`
    : `Con estos datos, reducir cuota ahorra más. Suele pasar solo con tipos muy bajos.`;

  const primario = modo === 'cuota' ? nuevaCuota : nuevoPlazo;

  const _insight = {
    title: modo === 'cuota' ? 'Reducir cuota: alivio en el mes' : 'Reducir plazo: máximo ahorro',
    text: modo === 'cuota'
      ? `Amortizando **${fmtEur(amort)}** y manteniendo el plazo, tu cuota baja de **${fmtEur(cuotaActual)}** a **${fmtEur(nuevaCuota)}** (${fmtEur(alivioMensual)} menos al mes) y ahorras **${fmtEur(ahorroReduciendoCuota)}** en intereses. Reducir plazo ahorraría ${fmtEur(ahorroReduciendoPlazo)}: más, pero sin bajar la cuota.`
      : `Amortizando **${fmtEur(amort)}** y manteniendo la cuota de ${fmtEur(cuotaActual)}, acortas la hipoteca **${mesesQuitados} meses** (de ${n} a ${nuevoPlazo}) y ahorras **${fmtEur(ahorroReduciendoPlazo)}** en intereses. Reducir cuota ahorraría solo ${fmtEur(ahorroReduciendoCuota)}.`,
    tone: 'good',
    icon: '🏦',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Ahorro reduciendo plazo', value: Math.round(ahorroReduciendoPlazo) },
      { label: 'Ahorro reduciendo cuota', value: Math.round(ahorroReduciendoCuota) },
    ],
    ariaLabel: `Ahorro en intereses: reduciendo plazo ${fmtEur(ahorroReduciendoPlazo)}, reduciendo cuota ${fmtEur(ahorroReduciendoCuota)}.`,
  };

  return {
    cuotaActual: fmtEur(cuotaActual),
    nuevaCuota: fmtEur(nuevaCuota),
    alivioMensual: fmtEur(alivioMensual),
    nuevoPlazoMeses: `${nuevoPlazo} meses (${(Math.round((nuevoPlazo / 12) * 10) / 10).toLocaleString('es-ES')} años)`,
    mesesQuitados: `${mesesQuitados} meses`,
    ahorroReduciendoPlazo: fmtEur(ahorroReduciendoPlazo),
    ahorroReduciendoCuota: fmtEur(ahorroReduciendoCuota),
    recomendacion,
    detalle: `Capital pendiente ${fmtEur(P)} a ${tipoAnual}% (${n} meses). Cuota actual ${fmtEur(cuotaActual)}. Amortizas ${fmtEur(amort)} → capital ${fmtEur(nuevoCapital)}. Reducir plazo: ${nuevoPlazo} meses, ahorro ${fmtEur(ahorroReduciendoPlazo)}. Reducir cuota: ${fmtEur(nuevaCuota)}/mes, ahorro ${fmtEur(ahorroReduciendoCuota)}.`,
    _insight,
    _chart,
  };
}
