export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dilucionC1v1C2v2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c1 = Number(i.c1); const c2 = Number(i.c2); const v2 = Number(i.v2);
  if (!c1 || !c2 || !v2) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  if (c2 > c1) throw new Error(__lang === 'en' ? 'Final concentration must be lower than the stock' : 'La concentración final debe ser menor que la de la solución madre');
  const v1 = (c2 * v2) / c1;
  const solvente = v2 - v1;
  const factor = c1 / c2;
  const resumen = __lang === 'en'
    ? `Take ${v1.toFixed(2)} mL of the stock and make up to ${v2} mL with solvent (${solvente.toFixed(2)} mL). Dilution 1:${factor.toFixed(1)}.`
    : `Tomá ${v1.toFixed(2)} mL de la solución madre y llevá a ${v2} mL con solvente (${solvente.toFixed(2)} mL). Dilución 1:${factor.toFixed(1)}.`;
  const chico = v1 < 1;
  const _insight = {
    title: __lang === 'en' ? (chico ? 'Consider a serial dilution' : 'Ready to prepare') : (chico ? 'Conviene dilución seriada' : 'Listo para preparar'),
    text: __lang === 'en'
      ? `You need **${v1.toFixed(2)} mL** of stock in a final volume of ${v2} mL (factor ${factor.toFixed(1)}×).${chico ? ' Measuring under 1 mL with a graduated cylinder is unreliable — split it into two steps (e.g. 1:10 then 1:10) or use a micropipette.' : ' Use a volumetric pipette and make up to the mark, do not just add the solvent volume.'}`
      : `Necesitás **${v1.toFixed(2)} mL** de solución madre en un volumen final de ${v2} mL (factor ${factor.toFixed(1)}×).${chico ? ' Medir menos de 1 mL con probeta no es confiable: hacelo en dos pasos (por ejemplo 1:10 y otra vez 1:10) o usá micropipeta.' : ' Usá pipeta aforada y completá hasta el aforo, no sumes el volumen de solvente a ojo.'}`,
    tone: chico ? 'warning' : 'neutral',
    icon: '🧪',
  };
  return { v1: v1.toFixed(2), solvente: solvente.toFixed(2) + ' mL', factor: '1:' + factor.toFixed(1), resumen, _insight };
}
