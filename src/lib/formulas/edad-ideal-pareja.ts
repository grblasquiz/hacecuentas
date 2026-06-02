/** Edad ideal de tu pareja — fórmula half-your-age-plus-seven */
export interface Inputs { edad: number; }
export interface Outputs { edadMinima: number; edadMaxima: number; mensaje: string; _insight?: any; }

export function edadIdealPareja(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edad));
  if (!edad || edad < 14) throw new Error('Ingresá una edad válida (mínimo 14)');

  const minima = Math.round(edad / 2 + 7);
  const maxima = Math.round((edad - 7) * 2);
  const rango = maxima - minima;

  const msg = `Con ${edad} años, el rango ideal según la fórmula va de ${minima} a ${maxima} años (rango de ${rango} años). ` +
    (rango <= 10 ? 'Rango acotado — típico de gente joven.' :
     rango <= 30 ? 'Rango amplio — tenés bastante margen.' :
     'Rango muy amplio — a esta edad la diferencia importa menos.');

  const minOut = Math.max(14, minima);
  const maxOut = Math.max(minima, maxima);

  return {
    edadMinima: minOut,
    edadMaxima: maxOut,
    mensaje: msg,
    _insight: {
      title: 'Tu rango "socialmente aceptable"',
      text: `Con **${edad} años**, la regla del "mitad de tu edad más 7" sugiere parejas de **${minOut} a ${maxOut} años** (un margen de **${maxOut - minOut} años**). ${rango <= 10 ? 'Es un rango acotado, típico a edades jóvenes.' : rango <= 30 ? 'Tenés bastante margen.' : 'A esta edad la diferencia de edad pesa mucho menos.'} Es una guía cultural, no una regla científica.`,
      tone: 'neutral',
      icon: '💞',
    },
  };
}
