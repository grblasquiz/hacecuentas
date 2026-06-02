/**
 * Calculadora de Candy Bar por Personas.
 */
export interface CandyBarPersonasInputs { invitados:number; nivel:string; }
export interface CandyBarPersonasOutputs { kgGolosinas:number; frascos:number; gramosPorPersona:number; costoEstimado:number; _insight?:any; }
export function candyBarPersonas(inputs: CandyBarPersonasInputs): CandyBarPersonasOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gramos = 180;
  let precioKg = 10;
  if (nivel === 'simple') { gramos = 150; precioKg = 8; }
  else if (nivel === 'premium') { gramos = 220; precioKg = 20; }
  const kgGolosinas = (inv * gramos) / 1000;
  let frascos = 8;
  if (inv >= 30) frascos = 10;
  if (inv >= 60) frascos = 12;
  if (inv >= 100) frascos = 15;
  const kgFinal = Number(kgGolosinas.toFixed(1));
  const costoFinal = Number((kgGolosinas * precioKg).toFixed(0));
  const nivelNombre = nivel === 'simple' ? 'simple' : nivel === 'premium' ? 'premium' : 'estándar';

  const _insight = {
    title: 'Tu candy bar en números',
    text: `Para **${inv} invitados** vas a necesitar **${kgFinal} kg** de golosinas (**${gramos} g por persona**, nivel ${nivelNombre}) repartidos en unos **${frascos} frascos**. Presupuestá alrededor de **$${costoFinal.toLocaleString('es-AR')}** y comprá un poco de más: siempre rinde la variedad por sobre la cantidad justa.`,
    tone: 'neutral',
    icon: '🍬'
  };

  return {
    kgGolosinas: kgFinal,
    frascos,
    gramosPorPersona: gramos,
    costoEstimado: costoFinal,
    _insight,
  };
}
