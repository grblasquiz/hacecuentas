/** Calculadora de BTU necesarios para aire acondicionado según ambiente */
export interface Inputs {
  metrosCuadrados: number;
  alturaTecho?: number;
  orientacion?: string;
  aislacion?: string;
  personas?: number;
}
export interface Outputs {
  btuNecesarios: number;
  frigoriasNecesarias: number;
  equipoSugerido: string;
  detalle: string;
}

export function tamanoAireAcondicionadoBtuHabitacion(i: Inputs): Outputs {
  const m2 = Number(i.metrosCuadrados);
  const altura = Number(i.alturaTecho) || 2.6;
  const orientacion = i.orientacion || 'este_oeste';
  const aislacion = i.aislacion || 'normal';
  const personas = Number(i.personas) || 2;

  if (!m2 || m2 <= 0) throw new Error('Ingresá los metros cuadrados del ambiente');
  if (m2 > 200) throw new Error('Para ambientes mayores a 200 m² consultá con un profesional');

  // Base: 600 BTU por m²
  let btu = m2 * 600;

  // Ajuste por altura (referencia: 2.6m)
  btu *= altura / 2.6;

  // Ajuste por orientación
  const factorOrientacion: Record<string, number> = {
    sur: 1.0,
    este_oeste: 1.10,
    norte: 1.20,
  };
  btu *= factorOrientacion[orientacion] || 1.10;

  // Ajuste por aislación
  const factorAislacion: Record<string, number> = {
    buena: 0.90,
    normal: 1.0,
    mala: 1.25,
  };
  btu *= factorAislacion[aislacion] || 1.0;

  // Personas extra (base 2, +400 BTU por persona extra)
  if (personas > 2) {
    btu += (personas - 2) * 400;
  }

  // Redondear al equipo comercial más cercano
  const equiposComerciales = [6000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];
  const equipoRedondeado = equiposComerciales.find(e => e >= btu) || equiposComerciales[equiposComerciales.length - 1];

  const frigorias = Math.round(equipoRedondeado / 4);

  const equipoNombre = equipoRedondeado <= 9000
    ? `${(equipoRedondeado / 1000).toFixed(0)}.000 BTU (ideal para ambientes chicos)`
    : equipoRedondeado <= 18000
    ? `${(equipoRedondeado / 1000).toFixed(0)}.000 BTU (tamaño estándar residencial)`
    : `${(equipoRedondeado / 1000).toFixed(0)}.000 BTU (para ambientes grandes)`;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    btuNecesarios: equipoRedondeado,
    frigoriasNecesarias: frigorias,
    equipoSugerido: equipoNombre,
    detalle: `Para ${m2} m² con techo de ${altura} m, orientación ${orientacion} y aislación ${aislacion}: necesitás ${fmt.format(Math.round(btu))} BTU (cálculo exacto). Equipo comercial recomendado: ${fmt.format(equipoRedondeado)} BTU = ${fmt.format(frigorias)} frigorías.`,
  };
}
