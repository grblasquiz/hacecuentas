/**
 * Aporte FONASA Uruguay 2026 — tasa personal del trabajador (3%, 4,5%, 6% u 8%).
 *
 * Lógica (BPS):
 *   - Base de cálculo: 2,5 BPC = $17.160 (2,5 × 6.864).
 *       nominal ≤ 2,5 BPC → tasa base 3%.
 *       nominal > 2,5 BPC → tasa base 4,5% (3% + 1,5%).
 *   - +1,5% si tiene hijos menores a cargo.
 *   - +1,5% si tiene cónyuge/concubino a cargo (sin cobertura SNIS propia).
 *   Combinaciones: 3% / 4,5% / 6% / 7,5% / 8% según familia y nivel salarial.
 *
 *   aporte mensual = nominal × tasa FONASA.
 *
 * Importa la BPC de la data del país.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Salario nominal mensual (pesos). */
  nominal_mensual: number;
  /** Hijos menores a cargo. */
  hijos_a_cargo: 'si' | 'no';
  /** Cónyuge/concubino a cargo sin cobertura SNIS propia. */
  conyuge_a_cargo: 'si' | 'no';
}

export interface Outputs {
  tasa_fonasa: number;
  aporte_mensual: number;
  supera_tope: string;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

// Tope nominal sobre el que se aplica FONASA (referencial — ver NOTA).
const TOPE_NOMINAL = 185917;

export function fonasaAporteUruguay(i: Inputs): Outputs {
  const bpc = URUGUAY_2026.bpc;
  const umbral = 2.5 * bpc; // $17.160

  const nominal = Math.max(0, Number(i.nominal_mensual) || 0);
  const conHijos = i.hijos_a_cargo === 'si';
  const conConyuge = i.conyuge_a_cargo === 'si';

  if (nominal <= 0) {
    return {
      tasa_fonasa: 0,
      aporte_mensual: 0,
      supera_tope: '—',
      desglose: '—',
      nota: 'Ingresá tu sueldo nominal mensual para calcular el aporte FONASA.',
    };
  }

  // Tasa base según la base de cálculo (2,5 BPC).
  let tasa = nominal > umbral ? 0.045 : 0.03;
  if (conHijos) tasa += 0.015;
  if (conConyuge) tasa += 0.015;

  const aporte = nominal * tasa;
  const superaTope = nominal > TOPE_NOMINAL ? 'Sí' : 'No';

  const partes = [`${nominal > umbral ? '4,5%' : '3%'} (base${nominal > umbral ? ' > 2,5 BPC' : ' ≤ 2,5 BPC'})`];
  if (conHijos) partes.push('+1,5% hijos');
  if (conConyuge) partes.push('+1,5% cónyuge');

  const desglose =
    `Tasa FONASA = ${partes.join(' ')} = ${(tasa * 100).toLocaleString('de-DE')}%. ` +
    `Aporte = ${fmtUYU(nominal)} × ${(tasa * 100).toLocaleString('de-DE')}% = ${fmtUYU(aporte)}.`;

  const nota =
    `La base de cálculo es 2,5 BPC (${fmtUYU(umbral)}): por encima la tasa pasa de 3% a 4,5%. ` +
    `Cada familiar a cargo suma 1,5%. El cónyuge computa solo si no tiene cobertura SNIS propia. ` +
    `El tope nominal sobre el que se aplica FONASA (≈ ${fmtUYU(TOPE_NOMINAL)}) es una referencia y se actualiza por BPS; verificá el valor vigente.`;

  return {
    tasa_fonasa: tasa,
    aporte_mensual: Math.round(aporte),
    supera_tope: superaTope,
    desglose,
    nota,
    _insight: {
      type: 'highlight',
      icon: '🏥',
      text: `Con un nominal de ${fmtUYU(nominal)} aportás ${fmtUYU(aporte)} por mes a FONASA (tasa ${(tasa * 100).toLocaleString('de-DE')}%), unos ${fmtUYU(aporte * 12)} al año. Si el año cerrás con aportes por encima del tope de salud, parte se devuelve (devolución FONASA).`,
    },
    _table: {
      title: 'Tasas FONASA 2026 según base de cálculo y familia a cargo',
      headers: ['Situación', 'Hasta 2,5 BPC', 'Más de 2,5 BPC'],
      rows: [
        ['Solo trabajador', '3,0%', '4,5%'],
        ['Con hijos (sin cónyuge)', '3,0%', '6,0%'],
        ['Con cónyuge (sin hijos)', '4,5% *', '6,0%'],
        ['Con cónyuge e hijos', '5,0% *', '8,0%'],
      ],
      note: `Base de cálculo = 2,5 BPC = ${fmtUYU(umbral)} (BPC 2026 = ${fmtUYU(bpc)}). Esta calculadora aplica el régimen general: 3% / 4,5% base + 1,5% por hijos + 1,5% por cónyuge. (*) Para tramos bajos con cónyuge, BPS aplica adicionales específicos; el caso más común de IRPF/dependencia usa las tasas de la columna "Más de 2,5 BPC". Fuente: BPS.`,
    },
  };
}
