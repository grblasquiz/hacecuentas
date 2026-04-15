/** Calorías en bebidas alcohólicas */
export interface Inputs { tipoBebida?: string; cantidadMl: number; }
export interface Outputs { calorias: number; gramosAlcohol: number; equivalenteCaminar: string; detalle: string; }

export function caloriasBebidaAlcohol(i: Inputs): Outputs {
  const tipo = String(i.tipoBebida || 'cerveza');
  const ml = Number(i.cantidadMl);

  if (!ml || ml <= 0) throw new Error('Ingresá la cantidad en ml');

  // Datos: [graduación %, kcal/100ml, nombre]
  const bebidas: Record<string, { grad: number; kcal100: number; nombre: string }> = {
    'cerveza':       { grad: 0.05, kcal100: 43,  nombre: 'Cerveza' },
    'vino-tinto':    { grad: 0.13, kcal100: 85,  nombre: 'Vino tinto' },
    'vino-blanco':   { grad: 0.12, kcal100: 82,  nombre: 'Vino blanco' },
    'champagne':     { grad: 0.12, kcal100: 76,  nombre: 'Champagne/Espumante' },
    'whisky':        { grad: 0.40, kcal100: 231, nombre: 'Whisky' },
    'gin':           { grad: 0.40, kcal100: 231, nombre: 'Gin' },
    'vodka':         { grad: 0.40, kcal100: 231, nombre: 'Vodka' },
    'fernet':        { grad: 0.07, kcal100: 105, nombre: 'Fernet con Coca' },
  };

  const b = bebidas[tipo] || bebidas.cerveza;

  const calorias = Math.round((ml * b.kcal100) / 100);
  const gramosAlc = Number((ml * b.grad * 0.789).toFixed(1)); // densidad etanol
  const minCaminar = Math.round(calorias / 5); // ~5 kcal/min caminando

  let caminataStr: string;
  if (minCaminar < 60) {
    caminataStr = `${minCaminar} minutos caminando`;
  } else {
    const hs = Math.floor(minCaminar / 60);
    const mins = minCaminar % 60;
    caminataStr = `${hs} h ${mins} min caminando`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    calorias,
    gramosAlcohol: gramosAlc,
    equivalenteCaminar: caminataStr,
    detalle: `${fmt.format(ml)} ml de ${b.nombre} = ${fmt.format(calorias)} kcal y ${gramosAlc} g de alcohol. Para quemar esas calorías necesitás ~${caminataStr}.`,
  };
}
