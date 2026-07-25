export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function molalidadSolucion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const masa = Number(i.masa); const mm = Number(i.mm); const kg = Number(i.kg);
  if (!masa || !mm || !kg) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const n = masa / mm;
  const m = n / kg;
  const resumen = __lang === 'en'
    ? `${n.toFixed(3)} mol of solute in ${kg} kg of solvent = ${m.toFixed(3)} mol/kg (${m.toFixed(2)} molal).`
    : `${n.toFixed(3)} mol de soluto en ${kg} kg de solvente = ${m.toFixed(3)} mol/kg (solución ${m.toFixed(2)} molal).`;
  const concentrada = m >= 1;
  const _insight = {
    title: __lang === 'en' ? (concentrada ? 'Concentrated solution' : 'Dilute solution') : (concentrada ? 'Solución concentrada' : 'Solución diluida'),
    text: __lang === 'en'
      ? `Molality **${m.toFixed(3)} mol/kg**. Unlike molarity, this value does not change with temperature because it uses solvent **mass**, not solution volume.${concentrada ? ' Above ~1 mol/kg molality and molarity differ noticeably.' : ' At this dilution molality and molarity are nearly equal in water.'}`
      : `Molalidad **${m.toFixed(3)} mol/kg**. A diferencia de la molaridad, este valor no cambia con la temperatura porque usa **masa** de solvente, no volumen de solución.${concentrada ? ' Por encima de ~1 mol/kg, molalidad y molaridad ya difieren de forma notoria.' : ' A esta dilución, en agua, molalidad y molaridad son casi iguales.'}`,
    tone: 'neutral',
    icon: '⚗️',
  };
  return { molalidad: m.toFixed(3), moles: n.toFixed(4) + ' mol', resumen, _insight };
}
