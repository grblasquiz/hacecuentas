/** Esperanza de vida en años según raza y peso */
export interface Inputs {
  raza?: string;
  pesoKg?: number;
  edadActual?: number; // años
  castrado?: boolean;
}
export interface Outputs {
  esperanzaVida: number;
  esperanzaMin: number;
  esperanzaMax: number;
  etapaActual: string;
  anosRestantes: number;
  factorPeso: string;
  resumen: string;
}

interface RazaInfo { nombre: string; min: number; max: number; }

const RAZAS: Record<string, RazaInfo> = {
  mestizo_pequeno: { nombre: 'Mestizo pequeño (<10 kg)', min: 13, max: 16 },
  mestizo_mediano: { nombre: 'Mestizo mediano (10-25 kg)', min: 12, max: 15 },
  mestizo_grande: { nombre: 'Mestizo grande (>25 kg)', min: 10, max: 13 },
  chihuahua: { nombre: 'Chihuahua', min: 14, max: 17 },
  yorkshire: { nombre: 'Yorkshire terrier', min: 13, max: 16 },
  maltes: { nombre: 'Maltés', min: 12, max: 15 },
  poodle_toy: { nombre: 'Caniche toy', min: 14, max: 17 },
  poodle_estandar: { nombre: 'Caniche estándar', min: 12, max: 15 },
  dachshund: { nombre: 'Dachshund (Salchicha)', min: 12, max: 16 },
  beagle: { nombre: 'Beagle', min: 12, max: 15 },
  cocker: { nombre: 'Cocker Spaniel', min: 12, max: 14 },
  jack_russell: { nombre: 'Jack Russell', min: 13, max: 16 },
  border_collie: { nombre: 'Border Collie', min: 12, max: 15 },
  golden: { nombre: 'Golden Retriever', min: 10, max: 12 },
  labrador: { nombre: 'Labrador Retriever', min: 10, max: 12 },
  pastor_aleman: { nombre: 'Pastor Alemán', min: 9, max: 13 },
  bulldog_ingles: { nombre: 'Bulldog Inglés', min: 8, max: 10 },
  bulldog_frances: { nombre: 'Bulldog Francés', min: 10, max: 12 },
  boxer: { nombre: 'Bóxer', min: 9, max: 12 },
  rottweiler: { nombre: 'Rottweiler', min: 9, max: 10 },
  doberman: { nombre: 'Dóberman', min: 10, max: 13 },
  gran_danes: { nombre: 'Gran Danés', min: 7, max: 10 },
  san_bernardo: { nombre: 'San Bernardo', min: 8, max: 10 },
  mastin_napolitano: { nombre: 'Mastín napolitano', min: 7, max: 9 },
  husky: { nombre: 'Husky Siberiano', min: 12, max: 15 },
  dalmata: { nombre: 'Dálmata', min: 11, max: 13 },
  shih_tzu: { nombre: 'Shih Tzu', min: 12, max: 16 },
  pomerania: { nombre: 'Pomerania', min: 12, max: 16 },
  schnauzer_mini: { nombre: 'Schnauzer miniatura', min: 12, max: 15 },
  pug: { nombre: 'Pug/Carlino', min: 12, max: 15 },
  akita: { nombre: 'Akita Inu', min: 10, max: 13 },
  chow_chow: { nombre: 'Chow Chow', min: 9, max: 12 },
};

export function esperanzaVidaPerroRaza(i: Inputs): Outputs {
  const raza = String(i.raza || 'mestizo_mediano');
  const peso = Number(i.pesoKg) || 0;
  const edad = Number(i.edadActual) || 0;
  const castrado = i.castrado === true;

  if (!RAZAS[raza]) throw new Error('Raza no válida');
  let r = RAZAS[raza];

  // Si no hay raza específica pero hay peso, ajustar categoría mestizo
  if (raza.startsWith('mestizo') && peso > 0) {
    if (peso < 10) r = RAZAS.mestizo_pequeno;
    else if (peso < 25) r = RAZAS.mestizo_mediano;
    else r = RAZAS.mestizo_grande;
  }

  let min = r.min;
  let max = r.max;

  // Castración agrega aproximadamente 1-1.5 años en promedio por menor incidencia de cáncer
  if (castrado) { min += 1; max += 1.5; }

  const prom = (min + max) / 2;

  let etapa = '';
  if (edad === 0) etapa = 'Edad no ingresada';
  else if (edad < 1) etapa = 'Cachorro';
  else if (edad < 3) etapa = 'Joven adulto';
  else if (edad < prom * 0.5) etapa = 'Adulto joven';
  else if (edad < prom * 0.75) etapa = 'Adulto';
  else if (edad < prom) etapa = 'Adulto senior';
  else etapa = 'Geriátrico';

  const restantes = Math.max(0, prom - edad);

  // Factor peso (perros grandes envejecen más rápido)
  let factorPeso = '';
  if (peso === 0) factorPeso = 'Peso no ingresado';
  else if (peso < 10) factorPeso = 'Pequeño (vida larga)';
  else if (peso < 25) factorPeso = 'Mediano (vida estándar)';
  else if (peso < 45) factorPeso = 'Grande (vida moderada)';
  else factorPeso = 'Gigante (vida corta — envejecen rápido)';

  return {
    esperanzaVida: Number(prom.toFixed(1)),
    esperanzaMin: min,
    esperanzaMax: Number(max.toFixed(1)),
    etapaActual: etapa,
    anosRestantes: Number(restantes.toFixed(1)),
    factorPeso,
    resumen: `${r.nombre}: esperanza de vida ${min}-${max.toFixed(1)} años (promedio ${prom.toFixed(1)}).${edad > 0 ? ` Tu perro (${edad} años) está en etapa: ${etapa}.` : ''}`,
  };
}
