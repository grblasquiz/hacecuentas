/** Estimación de costo de seguro de viaje */
export interface SeguroViajeInputs {
  destino?: string;
  dias: number;
  edad: number;
  cobertura?: string;
  viajeros?: number;
}
export interface SeguroViajeOutputs {
  costoEstimadoUSD: number;
  costoTotalUSD: number;
  costoPorDia: number;
  detalle: string;
}

// Costo base por día en USD según destino
const BASE_DIA: Record<string, number> = {
  europa: 3.5,
  eeuu: 5.0,
  latam: 2.5,
  asia: 3.0,
  mundial: 4.5,
  argentina: 1.5,
};

// Multiplicador por nivel de cobertura
const MULT_COB: Record<string, { mult: number; nombre: string }> = {
  basica: { mult: 0.7, nombre: 'Básica (USD 30.000)' },
  media: { mult: 1.0, nombre: 'Media (USD 60.000)' },
  premium: { mult: 1.8, nombre: 'Premium (USD 150.000+)' },
};

function factorEdad(edad: number): number {
  if (edad <= 17) return 0.85;
  if (edad <= 40) return 1.0;
  if (edad <= 59) return 1.2;
  if (edad <= 69) return 1.6;
  if (edad <= 79) return 2.2;
  return 3.0;
}

export function seguroViajeCoberturaEstimacion(inputs: SeguroViajeInputs): SeguroViajeOutputs {
  const destino = String(inputs.destino || 'europa');
  const dias = Number(inputs.dias);
  const edad = Number(inputs.edad);
  const cobertura = String(inputs.cobertura || 'media');
  const viajeros = Number(inputs.viajeros) || 1;

  if (!dias || dias <= 0) throw new Error('Ingresá los días de viaje');
  if (edad < 0 || edad > 99) throw new Error('Ingresá una edad válida');
  if (!BASE_DIA[destino]) throw new Error('Destino no válido');
  if (!MULT_COB[cobertura]) throw new Error('Nivel de cobertura no válido');

  const baseDia = BASE_DIA[destino];
  const multCob = MULT_COB[cobertura].mult;
  const fEdad = factorEdad(edad);

  // Descuento por viajes largos
  const descLargo = dias > 30 ? 0.85 : dias > 15 ? 0.92 : 1.0;

  const costoDia = Number((baseDia * multCob * fEdad * descLargo).toFixed(2));
  const costoPersona = Number((costoDia * dias).toFixed(2));
  const costoTotal = Number((costoPersona * viajeros).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const destinoNombres: Record<string, string> = {
    europa: 'Europa/Schengen',
    eeuu: 'EE.UU./Canadá',
    latam: 'Latinoamérica',
    asia: 'Asia/Oceanía',
    mundial: 'Cobertura mundial',
    argentina: 'Argentina',
  };

  return {
    costoEstimadoUSD: costoPersona,
    costoTotalUSD: costoTotal,
    costoPorDia: costoDia,
    detalle: `Seguro de viaje a ${destinoNombres[destino]}, ${dias} días, ${edad} años, cobertura ${MULT_COB[cobertura].nombre}: ~USD ${fmt.format(costoDia)}/día × ${dias} días = USD ${fmt.format(costoPersona)}/persona.${viajeros > 1 ? ` Total ${viajeros} viajeros: USD ${fmt.format(costoTotal)}.` : ''} Precio referencial — compará en aseguratuviaje.com.`,
  };
}
