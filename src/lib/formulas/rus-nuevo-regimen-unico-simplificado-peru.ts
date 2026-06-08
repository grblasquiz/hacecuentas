/** Nuevo RUS Perú — categoría y cuota mensual según ingresos y compras. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  ingresosMensuales: number;
  comprasMensuales?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosMensuales) || 0;
  const compras = Number(i.comprasMensuales) || 0;
  if (ingresos <= 0) throw new Error('Ingresá tus ingresos mensuales');

  // Nuevo RUS — 2 categorías vigentes:
  //   Cat 1: ingresos Y compras hasta S/ 5.000 cada uno → cuota S/ 20.
  //   Cat 2: ingresos Y compras hasta S/ 8.000 cada uno → cuota S/ 50.
  // Si ingresos o compras superan S/ 8.000 mensuales (o S/ 96.000 anuales),
  // no podés estar en el Nuevo RUS y debés pasar al Régimen Especial o MYPE.
  const LIM_CAT1 = 5000;
  const LIM_CAT2 = 8000;
  const tope = Math.max(ingresos, compras);

  let categoria: string;
  let cuota: number;
  let fueraRus = false;

  if (tope <= LIM_CAT1) {
    categoria = 'Categoría 1';
    cuota = 20;
  } else if (tope <= LIM_CAT2) {
    categoria = 'Categoría 2';
    cuota = 50;
  } else {
    categoria = 'Fuera del Nuevo RUS';
    cuota = 0;
    fueraRus = true;
  }

  const cuotaAnual = cuota * 12;

  const _insight = {
    title: fueraRus ? 'Superás el límite del Nuevo RUS' : `Te corresponde la ${categoria}`,
    text: fueraRus
      ? `Con **${fmtPEN(ingresos)}** de ingresos y **${fmtPEN(compras)}** de compras al mes superás el tope de **${fmtPEN(LIM_CAT2)}** del Nuevo RUS. Tenés que pasar al **Régimen Especial (RER)** o al **Régimen MYPE Tributario**. Consultá con un contador qué régimen te conviene.`
      : `Con **${fmtPEN(ingresos)}** de ingresos y **${fmtPEN(compras)}** de compras al mes estás en la **${categoria}**: cuota fija de **${fmtPEN(cuota)}** al mes (**${fmtPEN(cuotaAnual)}** al año). La cuota del Nuevo RUS reemplaza al IGV y al Impuesto a la Renta; no presentás declaración mensual de IGV.`,
    tone: fueraRus ? 'warn' : 'good',
    icon: '🧾',
  };
  const _chart = fueraRus ? undefined : {
    type: 'scale',
    value: tope,
    min: 0,
    max: LIM_CAT2,
    markers: [
      { label: 'Cat 1 (S/ 20)', value: LIM_CAT1 },
      { label: 'Cat 2 (S/ 50)', value: LIM_CAT2 },
    ],
    prefix: 'S/ ',
    ariaLabel: `Tu mayor monto (ingresos o compras) es ${fmtPEN(tope)}; ${categoria}, cuota ${fmtPEN(cuota)}.`,
  };

  return {
    categoria,
    cuota: fueraRus ? 'No aplica' : fmtPEN(cuota),
    cuotaAnual: fueraRus ? 'No aplica' : fmtPEN(cuotaAnual),
    detalle: fueraRus
      ? `Ingresos ${fmtPEN(ingresos)} / compras ${fmtPEN(compras)} superan el tope de ${fmtPEN(LIM_CAT2)} → debés cambiar de régimen.`
      : `Mayor monto entre ingresos (${fmtPEN(ingresos)}) y compras (${fmtPEN(compras)}) = ${fmtPEN(tope)} → ${categoria}, cuota ${fmtPEN(cuota)}/mes.`,
    _insight,
    _chart,
  };
}
