/** Esperanza de vida del gato por raza, estilo de vida y castración */
export interface Inputs {
  raza: string;
  estiloVida?: string;
  castrado?: boolean;
  edadActual?: number;
}
export interface Outputs {
  esperanzaAnos: string;
  anosRestantes: string;
  etapaActual: string;
  detalle: string;
}

interface DatosRaza {
  min: number;
  max: number;
  notas: string;
}

const RAZAS: Record<string, DatosRaza> = {
  mestizo: { min: 14, max: 18, notas: 'Mayor diversidad genética, muy longevo' },
  siames: { min: 15, max: 20, notas: 'Una de las razas más longevas' },
  persa: { min: 12, max: 17, notas: 'Braquicéfalo, predisposición PKD' },
  maine_coon: { min: 12, max: 16, notas: 'Riesgo de cardiomiopatía hipertrófica' },
  ragdoll: { min: 12, max: 17, notas: 'Tendencia a HCM en algunas líneas' },
  bengala: { min: 12, max: 16, notas: 'Activo y generalmente saludable' },
  britanico: { min: 12, max: 17, notas: 'Tendencia a obesidad, controlar peso' },
  abisinio: { min: 14, max: 17, notas: 'Amiloidosis renal en algunas líneas' },
  birmano: { min: 14, max: 18, notas: 'Robusta y longeva' },
  burmes: { min: 16, max: 20, notas: 'Muy longeva, excelente salud general' },
  ruso_azul: { min: 15, max: 20, notas: 'Longeva y saludable' },
  sphynx: { min: 12, max: 15, notas: 'Riesgo HCM, piel sensible' },
  scottish_fold: { min: 12, max: 15, notas: 'Osteocondrodisplasia (articulaciones)' },
  noruego_bosque: { min: 14, max: 16, notas: 'GSD IV en algunas líneas' },
  oriental: { min: 15, max: 20, notas: 'Similar al Siamés en longevidad' },
  manx: { min: 12, max: 15, notas: 'Síndrome de Manx (columna)' },
  exotico: { min: 12, max: 16, notas: 'Similar al Persa, braquicéfalo' },
  otro: { min: 13, max: 17, notas: 'Estimación genérica' },
};

function etapaVida(edad: number): string {
  if (edad < 0.5) return 'Gatito';
  if (edad < 2) return 'Junior';
  if (edad < 7) return 'Adulto joven';
  if (edad < 11) return 'Adulto maduro';
  if (edad < 15) return 'Senior';
  return 'Geriátrico';
}

export function esperanzaVidaGatoRazaIndoor(i: Inputs): Outputs {
  const raza = String(i.raza || 'mestizo');
  const estilo = String(i.estiloVida || 'indoor');
  const castrado = i.castrado !== false;
  const edadActual = i.edadActual ? Number(i.edadActual) : null;

  const datos = RAZAS[raza] || RAZAS.otro;
  let min = datos.min;
  let max = datos.max;

  // Ajuste por estilo de vida
  if (estilo === 'outdoor') {
    min = Math.max(3, Math.round(min * 0.35));
    max = Math.max(5, Math.round(max * 0.4));
  } else if (estilo === 'mixto') {
    min = Math.round(min * 0.85);
    max = Math.round(max * 0.9);
  }

  // Ajuste por castración
  if (!castrado) {
    min = Math.max(min - 2, 2);
    max = Math.max(max - 2, 4);
  }

  const esperanzaAnos = `${min}-${max} años`;

  let anosRestantes = '';
  let etapaActual = '';
  if (edadActual !== null && edadActual >= 0) {
    const restMin = Math.max(0, min - edadActual);
    const restMax = Math.max(0, max - edadActual);
    if (restMax <= 0) {
      anosRestantes = `Tu gato ya superó la esperanza promedio — ¡felicitaciones! Cada año extra es un regalo. Chequeos veterinarios cada 6 meses.`;
    } else {
      anosRestantes = `~${restMin}-${restMax} años más de vida estimados.`;
    }
    etapaActual = `${etapaVida(edadActual)} (${edadActual} años)`;
  } else {
    anosRestantes = 'Ingresá la edad actual para estimar años restantes.';
    etapaActual = 'No especificada.';
  }

  const razaLabel = raza.replace(/_/g, ' ');
  const estiloLabel = estilo === 'indoor' ? 'indoor' : estilo === 'outdoor' ? 'outdoor' : 'mixto';

  return {
    esperanzaAnos,
    anosRestantes,
    etapaActual,
    detalle: `Gato ${razaLabel} ${estiloLabel}${castrado ? ' castrado' : ' entero'}: esperanza ${esperanzaAnos}. ${datos.notas}. ${anosRestantes}`,
  };
}
