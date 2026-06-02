/**
 * Comida diaria del perro por raza.
 */
export interface Inputs { raza: string; pesoActual: number; edad: string; actividad: string; }
export interface Outputs { gramosDia: number; gramosMin: number; gramosMax: number; comidasDia: number; kgMes: number; _insight?: any; _chart?: any; }

const RAZAS: Record<string, { comidaMin: number; comidaMax: number }> = {
  'labrador-retriever': { comidaMin: 300, comidaMax: 450 },
  'golden-retriever': { comidaMin: 280, comidaMax: 420 },
  'bulldog-frances': { comidaMin: 130, comidaMax: 200 },
  'bulldog-ingles': { comidaMin: 220, comidaMax: 320 },
  'pastor-aleman': { comidaMin: 320, comidaMax: 480 },
  'beagle': { comidaMin: 170, comidaMax: 250 },
  'caniche-poodle': { comidaMin: 200, comidaMax: 350 },
  'chihuahua': { comidaMin: 30, comidaMax: 70 },
  'rottweiler': { comidaMin: 400, comidaMax: 600 },
  'yorkshire-terrier': { comidaMin: 40, comidaMax: 80 },
  'boxer': { comidaMin: 280, comidaMax: 420 },
  'dachshund-salchicha': { comidaMin: 100, comidaMax: 180 },
  'husky-siberiano': { comidaMin: 250, comidaMax: 400 },
  'shih-tzu': { comidaMin: 80, comidaMax: 140 },
  'pitbull': { comidaMin: 250, comidaMax: 400 },
};

export function comidaDiariaRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'labrador-retriever');
  const peso = Number(inputs.pesoActual);
  const edad = String(inputs.edad || 'adulto');
  const actividad = String(inputs.actividad || 'media');
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let min = r.comidaMin;
  let max = r.comidaMax;

  if (edad === 'cachorro') { min *= 1.4; max *= 1.6; }
  else if (edad === 'senior') { min *= 0.85; max *= 0.9; }

  if (actividad === 'alta') { min *= 1.2; max *= 1.3; }
  else if (actividad === 'baja') { min *= 0.85; max *= 0.9; }

  const promedio = (min + max) / 2;
  const comidasDia = edad === 'cachorro' ? 3 : 2;
  const kgMes = (promedio * 30) / 1000;

  const gramosDia = Math.round(promedio);
  const razaTxt = raza.replace(/-/g, ' ');
  const _insight = {
    title: 'Su ración diaria',
    text: `Un ${razaTxt} de **${peso} kg** (${edad}, actividad ${actividad}) necesita unos **${gramosDia} g** de balanceado por día —entre **${Math.round(min)}** y **${Math.round(max)} g** según la marca—, repartidos en **${comidasDia} comidas**. Eso son cerca de **${Number(kgMes.toFixed(1))} kg al mes**. Ajustá dentro del rango mirando su condición corporal: tiene que tener cintura y costillas que se palpen sin verse.`,
    tone: 'neutral',
    icon: '🐶',
  };

  // Donut: la ración diaria repartida en comidas (suman gramosDia exacto)
  const slices = [];
  let acumulado = 0;
  const base = Math.floor(gramosDia / comidasDia);
  for (let k = 0; k < comidasDia; k++) {
    const esUltima = k === comidasDia - 1;
    const val = esUltima ? gramosDia - acumulado : base;
    acumulado += val;
    slices.push({ label: `Comida ${k + 1}`, value: val });
  }
  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '',
    centerValue: `${gramosDia} g`,
    centerLabel: 'por día',
    ariaLabel: `Ración diaria de ${gramosDia} gramos repartida en ${comidasDia} comidas`,
  };

  return {
    gramosDia,
    gramosMin: Math.round(min),
    gramosMax: Math.round(max),
    comidasDia,
    kgMes: Number(kgMes.toFixed(1)),
    _insight,
    _chart,
  };
}
