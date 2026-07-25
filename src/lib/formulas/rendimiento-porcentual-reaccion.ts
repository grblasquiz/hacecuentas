export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function rendimientoPorcentualReaccion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const real = Number(i.real); const teorico = Number(i.teorico);
  if (!real || !teorico) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const pct = (real / teorico) * 100;
  const perdida = teorico - real;
  const imposible = pct > 100;
  const resumen = __lang === 'en'
    ? `Percent yield ${pct.toFixed(1)}%. ${imposible ? 'Above 100% — the product is almost certainly wet or impure.' : `${perdida.toFixed(3)} units of product were lost in the reaction and work-up.`}`
    : `Rendimiento ${pct.toFixed(1)}%. ${imposible ? 'Por encima de 100%: casi seguro el producto está húmedo o impuro.' : `Se perdieron ${perdida.toFixed(3)} unidades de producto entre la reacción y la purificación.`}`;
  let tone = 'neutral';
  if (imposible) tone = 'warning';
  else if (pct >= 70) tone = 'positive';
  else if (pct < 30) tone = 'warning';
  const _insight = {
    title: __lang === 'en'
      ? (imposible ? 'Yield above 100% — check the sample' : pct >= 70 ? 'Good yield' : pct >= 50 ? 'Acceptable yield' : 'Low yield')
      : (imposible ? 'Rendimiento mayor a 100% — revisá la muestra' : pct >= 70 ? 'Buen rendimiento' : pct >= 50 ? 'Rendimiento aceptable' : 'Rendimiento bajo'),
    text: __lang === 'en'
      ? (imposible
          ? `A yield of **${pct.toFixed(1)}%** is physically impossible. Dry the product to constant weight and check its purity before re-weighing — residual solvent and moisture are the usual cause.`
          : `You recovered **${pct.toFixed(1)}%** of the theoretical maximum. In a multi-step route yields multiply: three steps at this level would give an overall ${(Math.pow(pct / 100, 3) * 100).toFixed(1)}%.`)
      : (imposible
          ? `Un rendimiento de **${pct.toFixed(1)}%** es físicamente imposible. Secá el producto a peso constante y verificá pureza antes de volver a pesar: solvente residual y humedad son la causa habitual.`
          : `Recuperaste el **${pct.toFixed(1)}%** del máximo teórico. En una ruta de varias etapas los rendimientos se multiplican: tres pasos a este nivel darían un ${(Math.pow(pct / 100, 3) * 100).toFixed(1)}% global.`),
    tone,
    icon: '📊',
  };
  return { porcentaje: pct.toFixed(1), perdida: perdida.toFixed(3), resumen, _insight };
}
