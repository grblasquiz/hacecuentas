/** Calculadora Número de Oxidación — suma = carga total */
export interface Inputs { oxidacionConocida1: number; cantidadElem1: number; oxidacionConocida2: number; cantidadElem2: number; cantidadIncognita: number; cargaTotal: number; __lang?: string; }
export interface Outputs { oxidacionDesconocida: string; verificacion: string; interpretacion: string; formula: string; _insight?: any; }

export function numeroOxidacionElemento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorAtoms: 'La cantidad de átomos del desconocido debe ser mayor a 0',
      oxidized: (oxX: number) => `El elemento perdió ${oxX} electrones (estado oxidado).`,
      reduced: (abs: number) => `El elemento ganó ${abs} electrones (estado reducido).`,
      neutral: 'El elemento está en su estado elemental (oxidación 0).',
      insTitle: 'Estado de oxidación',
      insOx: (s: string) => `El número de oxidación buscado es **${s}**: el elemento cedió electrones (se oxidó) para que la suma cuadre con la carga total.`,
      insRed: (s: string) => `El número de oxidación buscado es **${s}**: el elemento captó electrones (se redujo) para que la suma iguale la carga total.`,
      insNeu: 'El número de oxidación buscado es **0**: el elemento queda en su estado elemental, sin ganar ni perder electrones.',
    },
    en: {
      errorAtoms: 'The number of unknown atoms must be greater than 0',
      oxidized: (oxX: number) => `The element lost ${oxX} electrons (oxidized state).`,
      reduced: (abs: number) => `The element gained ${abs} electrons (reduced state).`,
      neutral: 'The element is in its elemental state (oxidation 0).',
      insTitle: 'Oxidation state',
      insOx: (s: string) => `The unknown oxidation number is **${s}**: the element gave up electrons (oxidized) so the sum matches the total charge.`,
      insRed: (s: string) => `The unknown oxidation number is **${s}**: the element took in electrons (reduced) so the sum equals the total charge.`,
      insNeu: 'The unknown oxidation number is **0**: the element stays in its elemental state, neither gaining nor losing electrons.',
    },
  } as const)[__lang];

  const ox1 = Number(i.oxidacionConocida1);
  const n1 = Number(i.cantidadElem1);
  const ox2 = Number(i.oxidacionConocida2);
  const n2 = Number(i.cantidadElem2);
  const nx = Number(i.cantidadIncognita);
  const carga = Number(i.cargaTotal);
  if (nx <= 0) throw new Error(T.errorAtoms);

  // carga = n1*ox1 + n2*ox2 + nx*oxX → oxX = (carga - n1*ox1 - n2*ox2) / nx
  const sumaConocida = n1 * ox1 + n2 * ox2;
  const oxX = (carga - sumaConocida) / nx;

  const signo = oxX > 0 ? '+' : '';
  const verificacionSuma = sumaConocida + nx * oxX;

  let interp: string;
  if (oxX > 0) interp = T.oxidized(oxX);
  else if (oxX < 0) interp = T.reduced(Math.abs(oxX));
  else interp = T.neutral;

  const oxFmt = `${signo}${Number.isInteger(oxX) ? oxX : oxX.toFixed(2)}`;
  const insText = oxX > 0 ? T.insOx(oxFmt) : oxX < 0 ? T.insRed(oxFmt) : T.insNeu;
  const _insight = {
    title: T.insTitle,
    text: insText,
    tone: 'neutral' as const,
    icon: '⚗️',
  };

  return {
    oxidacionDesconocida: oxFmt,
    verificacion: `${n1}×(${ox1}) + ${n2}×(${ox2}) + ${nx}×(${signo}${oxX}) = ${verificacionSuma} ✓`,
    interpretacion: interp,
    formula: `${carga} = ${n1}×(${ox1}) + ${n2}×(${ox2}) + ${nx}×x → x = ${oxFmt}`,
    _insight,
  };
}
