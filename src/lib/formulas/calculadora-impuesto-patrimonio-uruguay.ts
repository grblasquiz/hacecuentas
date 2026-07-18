/**
 * Impuesto al Patrimonio de personas físicas — Uruguay (DGI, patrimonio al 31/12).
 *
 * Se calcula sobre el PATRIMONIO NETO fiscal (activos gravados − pasivos
 * computables). Sólo tributan quienes superan el mínimo no imponible (MNI):
 * $6.653.000 por persona en 2026, o $13.306.000 si se liquida por núcleo
 * familiar. Para RESIDENTES, tras la reducción gradual (Ley 19.438), la tasa es
 * ÚNICA del 0,10% sobre el excedente del MNI. (Los NO residentes que no tributan
 * IRNR mantienen la escala progresiva 0,7%–1,5%.)
 *
 * impuesto (residente) = max(0, patrimonioNeto − MNI) × 0,10%
 *
 * ⚠️ Orientativo. La liquidación real incluye el ajuar y muebles de la
 * casa-habitación (ficto) y la deducción del 50% de la vivienda del
 * contribuyente (tope = MNI), que acá no se calculan. Verificá con la DGI.
 *
 * Fuente: DGI — Tasas del Impuesto al Patrimonio personas físicas.
 */
import { IP_PATRIMONIO_UY, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Total de activos gravados (inmuebles a valor catastral, autos, saldos, etc.), en pesos. */
  activos: number;
  /** Pasivos / deudas computables, en pesos. */
  pasivos: number;
  /** Forma de declaración. */
  tipoDeclaracion: 'persona' | 'nucleo';
}

export interface Outputs {
  impuesto: string;
  patrimonioNeto: string;
  minimoNoImponible: string;
  excedente: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const activos = Math.max(0, Number(i.activos) || 0);
  const pasivos = Math.max(0, Number(i.pasivos) || 0);
  const esNucleo = i.tipoDeclaracion === 'nucleo';

  const mni = esNucleo ? IP_PATRIMONIO_UY.mniNucleoFamiliar : IP_PATRIMONIO_UY.mniPersonaFisica;
  const patrimonioNeto = Math.max(0, activos - pasivos);
  const excedente = Math.max(0, patrimonioNeto - mni);
  const impuesto = excedente * IP_PATRIMONIO_UY.tasaResidente;
  const exento = excedente <= 0;

  const detalle = exento
    ? `Patrimonio neto ${fmtUYU(patrimonioNeto)} (activos ${fmtUYU(activos)} − pasivos ${fmtUYU(pasivos)}). ` +
      `No supera el mínimo no imponible ${esNucleo ? 'del núcleo familiar' : ''} de ${fmtUYU(mni)}: EXENTO, no pagás Impuesto al Patrimonio.`
    : `Patrimonio neto ${fmtUYU(patrimonioNeto)} (activos ${fmtUYU(activos)} − pasivos ${fmtUYU(pasivos)}). ` +
      `Excedente sobre el MNI de ${fmtUYU(mni)} = ${fmtUYU(excedente)}. ` +
      `Impuesto (residente, 0,10%) = ${fmtUYU(impuesto)}.`;

  return {
    impuesto: fmtUYU(impuesto),
    patrimonioNeto: fmtUYU(patrimonioNeto),
    minimoNoImponible: fmtUYU(mni),
    excedente: fmtUYU(excedente),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏛️',
      tone: 'info' as const,
      text: exento
        ? `Con un patrimonio neto de **${fmtUYU(patrimonioNeto)}** no superás el mínimo no imponible de **${fmtUYU(mni)}**${esNucleo ? ' (núcleo familiar)' : ''}: **no pagás** Impuesto al Patrimonio ni tenés que declararlo.`
        : `Sobre el excedente de **${fmtUYU(excedente)}** por encima del MNI (${fmtUYU(mni)}), pagás **${fmtUYU(impuesto)}** al año (tasa residente 0,10%). ` +
          `Ojo: la liquidación real suma el ajuar de la casa-habitación y descuenta el 50% de tu vivienda (tope = MNI), que acá no se calculan.`,
    },
    _table: {
      title: 'Impuesto al Patrimonio de persona física (residente) — 2026',
      headers: ['Patrimonio neto', '¿Supera el MNI ($6.653.000)?', 'Impuesto (0,10% del excedente)'],
      rows: [5000000, 6653000, 10000000, 20000000, 50000000].map((neto) => {
        const exc = Math.max(0, neto - IP_PATRIMONIO_UY.mniPersonaFisica);
        return [fmtUYU(neto), exc <= 0 ? 'No — exento' : 'Sí', exc <= 0 ? '—' : fmtUYU(exc * IP_PATRIMONIO_UY.tasaResidente)];
      }),
      note:
        'MNI 2026: $6.653.000 por persona; $13.306.000 por núcleo familiar. Residentes: 0,10% sobre el excedente. No residentes (sin IRNR): escala progresiva 0,7%–1,5%. Estimación orientativa; no incluye ajuar ni deducción de vivienda. Verificá en la DGI.',
    },
  };
}
