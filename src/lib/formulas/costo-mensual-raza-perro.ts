/**
 * Costo mensual de perro por raza (ARG, abril 2026).
 */
export interface Inputs { raza: string; calidadAlimento: string; paseador: string; }
export interface Outputs {
  costoMensual: number; alimentoMensual: number; vetMensual: number;
  accesoriosMensual: number; paseadorMensual: number; costoAnual: number;
  _insight?: any; _chart?: any;
}

const RAZAS: Record<string, { comidaMin: number; comidaMax: number; tamano: string }> = {
  'labrador-retriever': { comidaMin: 300, comidaMax: 450, tamano: 'grande' },
  'golden-retriever': { comidaMin: 280, comidaMax: 420, tamano: 'grande' },
  'bulldog-frances': { comidaMin: 130, comidaMax: 200, tamano: 'pequeno' },
  'bulldog-ingles': { comidaMin: 220, comidaMax: 320, tamano: 'mediano' },
  'pastor-aleman': { comidaMin: 320, comidaMax: 480, tamano: 'grande' },
  'beagle': { comidaMin: 170, comidaMax: 250, tamano: 'mediano' },
  'caniche-poodle': { comidaMin: 200, comidaMax: 350, tamano: 'mediano' },
  'chihuahua': { comidaMin: 30, comidaMax: 70, tamano: 'toy' },
  'rottweiler': { comidaMin: 400, comidaMax: 600, tamano: 'grande' },
  'yorkshire-terrier': { comidaMin: 40, comidaMax: 80, tamano: 'toy' },
  'boxer': { comidaMin: 280, comidaMax: 420, tamano: 'grande' },
  'dachshund-salchicha': { comidaMin: 100, comidaMax: 180, tamano: 'pequeno' },
  'husky-siberiano': { comidaMin: 250, comidaMax: 400, tamano: 'grande' },
  'shih-tzu': { comidaMin: 80, comidaMax: 140, tamano: 'pequeno' },
  'pitbull': { comidaMin: 250, comidaMax: 400, tamano: 'mediano' },
};

export function costoMensualRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'beagle');
  const calidad = String(inputs.calidadAlimento || 'premium');
  const usaPaseador = String(inputs.paseador || 'no') === 'si';
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  const precioKg = calidad === 'super_premium' ? 25000 : calidad === 'premium' ? 15000 : 9000;
  const gramosDia = (r.comidaMin + r.comidaMax) / 2;
  const alimentoMes = (gramosDia / 1000) * 30 * precioKg;

  const vetMes = r.tamano === 'grande' ? 30000 : r.tamano === 'mediano' ? 22000 : 18000;
  const accesoriosMes = r.tamano === 'grande' ? 15000 : 10000;
  const paseadorMes = usaPaseador ? 130000 : 0;

  const total = alimentoMes + vetMes + accesoriosMes + paseadorMes;

  const rTotal = Math.round(total);
  const rAlim = Math.round(alimentoMes);
  const rAnual = Math.round(total * 12);
  const fmtN = (n: number) => n.toLocaleString('es-AR');
  const razaLabel = raza.replace(/-/g, ' ');

  const slices = [
    { label: 'Alimento', value: rAlim },
    { label: 'Veterinario', value: vetMes },
    { label: 'Accesorios', value: accesoriosMes },
  ];
  if (paseadorMes > 0) slices.push({ label: 'Paseador', value: paseadorMes });

  const rubros = slices.slice();
  const mayor = rubros.reduce((a, b) => (b.value > a.value ? b : a), rubros[0]);
  const pctMayor = rTotal > 0 ? Math.round((mayor.value / rTotal) * 100) : 0;
  const pctPaseador = rTotal > 0 ? Math.round((paseadorMes / rTotal) * 100) : 0;

  return {
    costoMensual: rTotal,
    alimentoMensual: rAlim,
    vetMensual: vetMes,
    accesoriosMensual: accesoriosMes,
    paseadorMensual: paseadorMes,
    costoAnual: rAnual,
    _insight: {
      title: usaPaseador ? 'El paseador pesa fuerte' : `Cuánto cuesta un ${razaLabel}`,
      text: usaPaseador
        ? `Tener un **${razaLabel}** con paseador sale **$${fmtN(rTotal)}/mes** (**$${fmtN(rAnual)}** al año). Solo el **paseador** se lleva **$${fmtN(paseadorMes)}** (**${pctPaseador}%** del total): si podés sacarlo a pasear vos algunos días, ahí está el mayor ahorro posible.`
        : `Mantener un **${razaLabel}** cuesta **$${fmtN(rTotal)}/mes** (**$${fmtN(rAnual)}** al año). El gasto que más pesa es **${mayor.label}** con **$${fmtN(mayor.value)}** (**${pctMayor}%**). ${r.tamano === 'grande' ? 'Al ser una raza grande, comida y veterinario suben respecto a un perro chico.' : 'Es una raza de mantenimiento contenido en comida y veterinario.'}`,
      tone: usaPaseador ? 'warn' : 'neutral',
      icon: '🐶',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: '$' + fmtN(rTotal),
      centerLabel: 'Total/mes',
      ariaLabel: `Desglose del costo mensual del ${razaLabel}: alimento ${fmtN(rAlim)}, veterinario ${fmtN(vetMes)}, accesorios ${fmtN(accesoriosMes)}${paseadorMes > 0 ? `, paseador ${fmtN(paseadorMes)}` : ''}.`,
    },
  };
}
