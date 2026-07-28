import { getCalculatorDisclaimer } from '../disclaimers';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Volumen diario de leche de fórmula por peso y edad.
 *
 * Criterio unificado con `formula-leche-bebe-litros-mes-edad-marca.ts` (SAP / AAP):
 * 150 / 140 / 130 / 120 / 110 ml/kg/día según la edad, con tope de ~1.000 ml/día.
 *
 * ANTES esta fórmula usaba 90 / 75 / 60 ml/kg/día: subalimentaba ~40 %
 * (un recién nacido de 3,5 kg daba ~315 ml/día cuando el estándar son ~525 ml/día).
 * No tocar estos valores sin fuente pediátrica oficial.
 */
const TABLA_EDAD: Array<{ mesMax: number; mlKgDia: number; tomas: number }> = [
  { mesMax: 1, mlKgDia: 150, tomas: 8 },
  { mesMax: 2, mlKgDia: 140, tomas: 7 },
  { mesMax: 4, mlKgDia: 130, tomas: 6 },
  { mesMax: 6, mlKgDia: 120, tomas: 5 },
  { mesMax: Infinity, mlKgDia: 110, tomas: 5 },
];

/** Tope de volumen diario: por encima de ~1 L/día no se aumenta por peso. */
const ML_MAX_DIA = 1000;
const ML_POR_ONZA = 29.5735;

const ADVERTENCIA =
  'Es una referencia orientativa, no una indicación médica: quien define cuánto tiene que tomar tu bebé es el pediatra, siguiendo su percentilo de peso y su curva de crecimiento. ' +
  'Cada bebé regula su apetito: no fuerces el biberón ni lo limites si pide más. ' +
  'La lactancia materna es a demanda y no se mide en ml — esta cuenta aplica sólo a leche de fórmula. ' +
  'Consultá al pediatra ante bajo peso, vómitos, rechazo del alimento, prematurez o cualquier condición de salud.';

export function onzasBiberonPesoBebeDia(i: Inputs): Outputs {
  const p = Number(i.peso);
  const mRaw = Number(i.edadMes);
  const m = Number.isFinite(mRaw) && mRaw >= 0 ? mRaw : 0; // 0 meses (recién nacido) es un valor válido
  const disclaimer = getCalculatorDisclaimer({ slug: 'onzas-biberon-peso-bebe-dia', category: 'salud' }, 'es');

  if (!Number.isFinite(p) || p <= 0) {
    return {
      mlDia: '—',
      porToma: '—',
      resumen: 'Ingresá el peso del bebé en kg para calcular.',
      advertencia: ADVERTENCIA,
      disclaimer,
    };
  }

  const fila = TABLA_EDAD.find((f) => m <= f.mesMax) ?? TABLA_EDAD[TABLA_EDAD.length - 1];
  const mlkg = fila.mlKgDia;
  const tomas = fila.tomas;

  const mlTeorico = p * mlkg;
  const mlDia = Math.min(mlTeorico, ML_MAX_DIA);
  const topeAplicado = mlTeorico > ML_MAX_DIA;
  const porToma = mlDia / tomas;
  const onzasDia = mlDia / ML_POR_ONZA;
  const onzasToma = porToma / ML_POR_ONZA;

  return {
    mlDia: `${mlDia.toFixed(0)} ml/día`,
    porToma: `${porToma.toFixed(0)} ml/toma`,
    onzasDia: `${onzasDia.toFixed(1)} oz/día`,
    onzasToma: `${onzasToma.toFixed(1)} oz/toma`,
    referencia: `${mlkg} ml/kg/día (SAP / AAP)`,
    resumen: `${p} kg a ${m} m: ~${mlDia.toFixed(0)} ml/día en ${tomas} tomas de ~${porToma.toFixed(0)} ml.`,
    advertencia: ADVERTENCIA,
    disclaimer,
    _insight: {
      title: 'Cuánta fórmula por día',
      text:
        `Para un bebé de **${p} kg** a los **${m} meses**, la referencia pediátrica (SAP / AAP) es **${mlkg} ml/kg/día**: ` +
        `unos **${mlDia.toFixed(0)} ml/día** (~${onzasDia.toFixed(1)} oz), repartidos en **${tomas} tomas** de unos ${porToma.toFixed(0)} ml (~${onzasToma.toFixed(1)} oz).` +
        (topeAplicado ? ` Se aplicó el tope de ${ML_MAX_DIA} ml/día: por encima de ~1 litro diario el volumen no sigue subiendo con el peso.` : '') +
        ` ${ADVERTENCIA}`,
      tone: 'warn',
      icon: '🍼',
    },
  };
}
