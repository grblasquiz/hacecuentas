/**
 * Calculadora de IRPF Uruguay 2026 (retención mensual) — Categoría II, rentas del trabajo dependiente.
 *
 * Lógica (DGI / BPS Comunicado R 5/2026):
 *   1) Impuesto primario = escala progresiva por franjas en BPC sobre el nominal mensual.
 *   2) Crédito por deducciones = deduccionesMensuales × (14% si nominal < 15 BPC, si no 8%).
 *      deduccionesMensuales = aportes BPS personales (montepío+FONASA+FRL)
 *        + 20 BPC/año por hijo menor (40 BPC/año si discapacidad), prorrateado a mes
 *        + otras deducciones admitidas (BPS jubilatorio extra, etc.).
 *   3) IRPF = max(0, primario − crédito).
 *
 * Importa la data del país (NO hardcodea tasas/montos).
 */
import {
  URUGUAY_2026,
  fmtUYU,
  impuestoPorFranjasBpc,
  aportesBpsPersonales,
} from '../data/uruguay-2026';

export interface Inputs {
  /** Salario nominal mensual (pesos). */
  nominal: number;
  /** Cantidad de hijos menores a cargo (deducibles, 20 BPC/año c/u). */
  hijos_menores: number;
  /** Cantidad de hijos con discapacidad a cargo (40 BPC/año c/u). */
  hijos_discapacidad: number;
  /** Otras deducciones MENSUALES admitidas en pesos (aportes extra, etc.). */
  otras_deducciones: number;
}

export interface Outputs {
  nominal: number;
  impuesto_primario: number;
  deducciones_mensuales: number;
  credito_deducciones: number;
  tasa_credito: number;
  irpf_mensual: number;
  irpf_anual: number;
  tasa_efectiva: number;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraIrpfUruguay(i: Inputs): Outputs {
  const bpc = URUGUAY_2026.bpc;
  const ded = URUGUAY_2026.irpf.deduccion;

  const nominal = Math.max(0, Number(i.nominal) || 0);
  const hijosMenores = Math.max(0, Math.round(Number(i.hijos_menores) || 0));
  const hijosDiscap = Math.max(0, Math.round(Number(i.hijos_discapacidad) || 0));
  const otras = Math.max(0, Number(i.otras_deducciones) || 0);

  if (nominal <= 0) {
    return {
      nominal: 0,
      impuesto_primario: 0,
      deducciones_mensuales: 0,
      credito_deducciones: 0,
      tasa_credito: 0,
      irpf_mensual: 0,
      irpf_anual: 0,
      tasa_efectiva: 0,
      desglose: '—',
      nota: 'Ingresá tu sueldo nominal mensual para calcular el IRPF.',
    };
  }

  // 1) Impuesto primario: escala progresiva sobre el nominal.
  const impuestoPrimario = impuestoPorFranjasBpc(nominal, URUGUAY_2026.irpf.franjas);

  // 2) Deducciones mensuales.
  // Aportes BPS personales (montepío + FONASA + FRL) — la deducción base de todo dependiente.
  const aportes = aportesBpsPersonales(nominal);
  // Hijos: el monto deducible es ANUAL en BPC → se prorratea a mensual (÷12).
  const deduccionHijosAnual =
    hijosMenores * ded.hijoMenorBpcAnual * bpc +
    hijosDiscap * ded.hijoDiscapacidadBpcAnual * bpc;
  const deduccionHijosMensual = deduccionHijosAnual / 12;
  const deduccionesMensuales = aportes.total + deduccionHijosMensual + otras;

  // 3) Crédito por deducciones a la tasa según nominal.
  const tasaCredito = nominal < ded.umbralBpc * bpc ? ded.tasaBaja : ded.tasaAlta;
  const credito = deduccionesMensuales * tasaCredito;

  const irpfMensual = Math.max(0, impuestoPrimario - credito);
  const irpfAnual = irpfMensual * 12;
  const tasaEfectiva = nominal > 0 ? irpfMensual / nominal : 0;

  const exento = nominal <= URUGUAY_2026.irpf.minimoNoImponibleBpc * bpc;

  const desglose =
    `${fmtUYU(impuestoPrimario)} (primario) − ${fmtUYU(credito)} (crédito ${(tasaCredito * 100).toFixed(0)}% s/deducciones) = ${fmtUYU(irpfMensual)}`;

  const nota = exento
    ? `Tu sueldo está por debajo del mínimo no imponible (7 BPC = ${fmtUYU(URUGUAY_2026.irpf.minimoNoImponibleBpc * bpc)}/mes): no pagás IRPF.`
    : 'El IRPF se retiene mes a mes y se ajusta en la declaración anual (junio). Es una estimación: deducciones reales (alquiler, hijos, aportes a caja profesional) pueden cambiar el resultado.';

  return {
    nominal: Math.round(nominal),
    impuesto_primario: Math.round(impuestoPrimario),
    deducciones_mensuales: Math.round(deduccionesMensuales),
    credito_deducciones: Math.round(credito),
    tasa_credito: tasaCredito,
    irpf_mensual: Math.round(irpfMensual),
    irpf_anual: Math.round(irpfAnual),
    tasa_efectiva: tasaEfectiva,
    desglose,
    nota,
    _insight: {
      type: 'highlight',
      icon: '💡',
      text: irpfMensual > 0
        ? `Con un nominal de ${fmtUYU(nominal)} pagás ${fmtUYU(irpfMensual)} de IRPF por mes (tasa efectiva ${(tasaEfectiva * 100).toFixed(1)}%), unos ${fmtUYU(irpfAnual)} al año. El crédito por deducciones (${fmtUYU(credito)}/mes) reduce tu impuesto primario de ${fmtUYU(impuestoPrimario)}.`
        : `Con un nominal de ${fmtUYU(nominal)} no pagás IRPF: estás por debajo del mínimo no imponible de 7 BPC (${fmtUYU(URUGUAY_2026.irpf.minimoNoImponibleBpc * bpc)}/mes) o el crédito por deducciones cubre el impuesto primario.`,
    },
    _table: {
      title: 'Franjas del IRPF 2026 (escala mensual en BPC)',
      headers: ['Franja (BPC)', 'Tramo mensual (pesos)', 'Tasa marginal'],
      rows: URUGUAY_2026.irpf.franjas.map((f, idx) => {
        const desde = idx === 0 ? 0 : URUGUAY_2026.irpf.franjas[idx - 1].hastaBpc;
        const hastaTxt = f.hastaBpc === Infinity ? 'en adelante' : `${f.hastaBpc} BPC`;
        const desdePesos = fmtUYU(desde * bpc);
        const hastaPesos = f.hastaBpc === Infinity ? '∞' : fmtUYU(f.hastaBpc * bpc);
        return [
          `${desde} – ${hastaTxt}`,
          f.hastaBpc === Infinity ? `desde ${desdePesos}` : `${desdePesos} – ${hastaPesos}`,
          `${(f.tasa * 100).toFixed(0)}%`,
        ];
      }),
      note: `BPC 2026 = ${fmtUYU(bpc)}. Mínimo no imponible = 7 BPC (${fmtUYU(7 * bpc)}/mes). Cada tramo paga su tasa solo sobre la porción del sueldo que cae en él (escala progresiva).`,
    },
  };
}
