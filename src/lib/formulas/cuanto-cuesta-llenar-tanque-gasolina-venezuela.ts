/**
 * Cuánto cuesta llenar el tanque de gasolina en Venezuela 2026.
 *
 * Venezuela tiene gasolina subsidiada hasta un cupo mensual (~USD 0,10/L con
 * Carnet de la Patria) y gasolina "internacional" sobre el cupo o sin él
 * (~USD 0,50/L, pago en divisas). Esta calc cuenta los litros del tanque al
 * precio subsidiado si todavía hay cupo, o al internacional si ya se agotó.
 *
 * Modelo (simplificado): si el usuario indica que YA usó el cupo del mes, todo
 * el tanque va a precio internacional; si no, todo el tanque va a precio
 * subsidiado (el cruce fino contra el cupo restante lo hace la calc del cupo).
 *
 * Precios y cupos: NO se hardcodean — se leen de src/lib/data/venezuela-2026.ts.
 *   Fuentes: CNN Español, Bloomberg Línea, Reporte Confidencial.
 */
import { VENEZUELA_2026, usdToVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  litros?: number;   // litros del tanque
  cupoUsado?: string; // 'no' (queda cupo → subsidiado) | 'si' (cupo agotado → internacional)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function cuantoCuestaLlenarTanqueGasolinaVenezuela(i: Inputs): Outputs {
  const c = VENEZUELA_2026.combustible;
  const litros = Math.max(0, Number(i.litros) || 0);
  if (!litros) throw new Error('Ingresá cuántos litros tiene tu tanque');

  const cupoUsado = String(i.cupoUsado || 'no') === 'si';
  const precioUsdLitro = cupoUsado ? c.precioInternacionalUsdLitro : c.precioSubsidiadoUsdLitro;
  const tipo = cupoUsado ? 'internacional' : 'subsidiada';

  const costoUsd = litros * precioUsdLitro;
  const costoVesBcv = usdToVes(costoUsd, 'bcv');

  // Comparativa: cuánto saldría al OTRO precio.
  const costoUsdSubs = litros * c.precioSubsidiadoUsdLitro;
  const costoUsdInter = litros * c.precioInternacionalUsdLitro;
  const ahorroUsd = costoUsdInter - costoUsdSubs; // lo que ahorra el subsidio

  const narrativa =
    `Llenar un tanque de ${litros.toLocaleString('de-DE')} litros a precio ${tipo} ` +
    `(${fmtUSD(precioUsdLitro)}/L) cuesta ${fmtUSD(costoUsd)} ≈ ${fmtVES(costoVesBcv)}. ` +
    (cupoUsado
      ? `Si todavía tuvieras cupo subsidiado, te saldría solo ${fmtUSD(costoUsdSubs)}: el subsidio te ahorra ${fmtUSD(ahorroUsd)} por tanque.`
      : `Sin cupo subsidiado, el mismo tanque costaría ${fmtUSD(costoUsdInter)}: el subsidio te ahorra ${fmtUSD(ahorroUsd)} por tanque.`);

  return {
    // Titular: costo del tanque en USD y Bs.
    costoTanque: `${fmtUSD(costoUsd)} · ${fmtVES(costoVesBcv)}`,
    precioPorLitro: `${fmtUSD(precioUsdLitro)} / litro (${tipo})`,
    costoDolares: Number(costoUsd.toFixed(2)),
    costoBolivares: Number(costoVesBcv.toFixed(2)),
    ahorroVsInternacional: `${fmtUSD(ahorroUsd)} por tanque`,
    _insight: {
      type: 'highlight',
      icon: '⛽',
      text: narrativa,
    },
    _table: {
      title: `Costo de llenar ${litros.toLocaleString('de-DE')} litros en Venezuela`,
      headers: ['Tipo de gasolina', 'Precio por litro', 'Costo del tanque (USD)', 'Costo del tanque (Bs.)'],
      rows: [
        ['Subsidiada (con cupo)', fmtUSD(c.precioSubsidiadoUsdLitro), fmtUSD(costoUsdSubs), fmtVES(usdToVes(costoUsdSubs, 'bcv'))],
        ['Internacional (sin cupo)', fmtUSD(c.precioInternacionalUsdLitro), fmtUSD(costoUsdInter), fmtVES(usdToVes(costoUsdInter, 'bcv'))],
      ],
      note: 'La gasolina subsidiada (~USD 0,10/L) aplica hasta el cupo mensual del Sistema Patria (120 L auto / 60 L moto). Sobre el cupo o sin Carnet de la Patria rige el precio internacional (~USD 0,50/L), pagado en divisas. Conversión a bolívares a la tasa BCV; los precios oficiales se publican en USD.',
    },
  };
}
