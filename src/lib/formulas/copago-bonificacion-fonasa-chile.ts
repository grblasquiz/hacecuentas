/** Copago y bonificación de Fonasa por tramo y modalidad (Chile) 2026.
 *  Fuentes: Fonasa (nuevo.fonasa.gob.cl), Superintendencia de Salud, Arancel MLE 2026.
 *  Modelo:
 *   - MAI (red pública): Copago Cero vigente desde sep-2022 para todos los tramos A/B/C/D →
 *     bonificación 100%, copago 0% de la prestación institucional.
 *   - MLE (libre elección, prestadores privados en convenio): Fonasa bonifica una parte del
 *     valor y el afiliado paga el copago; la bonificación depende del NIVEL del prestador
 *     (1/2/3), no del tramo. El tramo A no accede a la MLE. */
import { fmtCLP } from '../data/chile-2026.ts';

// Copago Cero MAI (Modalidad de Atención Institucional) — Fonasa, vigente desde sep-2022.
// En la red pública el copago es 0% para todos los tramos (bonificación 100%).
const BONIF_MAI = 1.0; // 100%

// Bonificación referencial de la MLE por nivel del prestador (fracción del valor de la
// prestación que cubre Fonasa). Aproximación orientativa: el nivel 1 (arancel base, más
// económico) es el que más bonifica; a mayor nivel, el prestador cobra más sobre el mismo
// arancel y el copago sube. El valor exacto depende del código de prestación y del arancel
// MLE 2026 (Resolución Exenta N°347/2026). Fuente: Fonasa "Conoce el valor de tu bono".
const BONIF_MLE: Record<string, number> = {
  '1': 0.6, // Nivel 1 — arancel base, mayor bonificación
  '2': 0.45, // Nivel 2 — intermedio
  '3': 0.3, // Nivel 3 — prestador más caro, menor bonificación relativa
};

const NIVEL_MLE_DEFAULT = '1';

export interface Inputs {
  valorPrestacion: number;
  tramo?: string; // 'A' | 'B' | 'C' | 'D'
  modalidad?: string; // 'MAI' | 'MLE'
  nivelMle?: string; // '1' | '2' | '3' (solo aplica en MLE)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorPrestacion) || 0;
  const tramo = (i.tramo || 'B').toUpperCase();
  const modalidad = (i.modalidad || 'MAI').toUpperCase();
  const nivel = String(i.nivelMle || NIVEL_MLE_DEFAULT);

  if (valor <= 0) throw new Error('Ingresá el valor (arancel) de la prestación en pesos');
  if (!['A', 'B', 'C', 'D'].includes(tramo)) throw new Error('Elegí un tramo válido (A, B, C o D)');
  if (!['MAI', 'MLE'].includes(modalidad)) throw new Error('Elegí una modalidad válida (MAI o MLE)');

  // El tramo A no accede a la Modalidad de Libre Elección (compra de bonos).
  if (modalidad === 'MLE' && tramo === 'A') {
    throw new Error('El tramo A no accede a la Modalidad de Libre Elección (MLE). Corresponde atención institucional (MAI) con Copago Cero.');
  }

  let fraccionBonif: number;
  let detalleModo: string;

  if (modalidad === 'MAI') {
    fraccionBonif = BONIF_MAI; // Copago Cero para todos los tramos
    detalleModo = `Modalidad institucional (MAI, red pública): rige el Copago Cero, Fonasa cubre el 100% de la prestación y no pagás copago, sin importar tu tramo (A, B, C o D).`;
  } else {
    fraccionBonif = BONIF_MLE[nivel] ?? BONIF_MLE[NIVEL_MLE_DEFAULT];
    detalleModo = `Modalidad libre elección (MLE, prestador privado en convenio, nivel ${nivel}): Fonasa bonifica una parte del valor y vos pagás el copago. La bonificación depende del nivel del prestador, no del tramo.`;
  }

  const bonificacion = valor * fraccionBonif;
  const copago = valor - bonificacion;
  const porcentajeCopago = valor > 0 ? (copago / valor) * 100 : 0;

  const _insight = {
    title: copago <= 0 ? 'No pagás copago' : 'Tu copago estimado',
    text: copago <= 0
      ? `En la modalidad institucional (MAI), por una prestación de **${fmtCLP(valor)}** Fonasa cubre el 100% y tu copago es **${fmtCLP(0)}** gracias al Copago Cero.`
      : `Por una prestación de **${fmtCLP(valor)}** en la MLE (nivel ${nivel}), Fonasa bonifica **${fmtCLP(bonificacion)}** y pagás de tu bolsillo un copago de **${fmtCLP(copago)}** (${porcentajeCopago.toFixed(0)}%).`,
    tone: copago <= 0 ? 'positive' : 'neutral',
    icon: '🏥',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Bonifica Fonasa', value: Math.round(bonificacion) },
      { label: 'Copago (vos)', value: Math.round(copago) },
    ],
    ariaLabel: `Fonasa bonifica ${fmtCLP(bonificacion)} y tu copago es ${fmtCLP(copago)} sobre un valor de ${fmtCLP(valor)}.`,
  };

  return {
    copago: fmtCLP(copago),
    bonificacion: fmtCLP(bonificacion),
    porcentajeCopago: `${porcentajeCopago.toFixed(0)}%`,
    detalle: `${detalleModo} Valor prestación ${fmtCLP(valor)} → bonificación ${fmtCLP(bonificacion)} + copago ${fmtCLP(copago)}.`,
    _insight,
    _chart,
  };
}
