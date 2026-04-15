/** Dosis y presentación de antipulgas según peso de mascota */
export interface Inputs {
  especie: string;
  pesoKg: number;
  tipoProducto?: string;
}
export interface Outputs {
  presentacion: string;
  frecuencia: string;
  costoMensual: number;
  alerta: string;
  detalle: string;
}

interface RangoPeso {
  min: number;
  max: number;
  label: string;
}

const RANGOS_PERRO_PIPETA: RangoPeso[] = [
  { min: 2, max: 10, label: '2-10 kg' },
  { min: 10, max: 20, label: '10-20 kg' },
  { min: 20, max: 40, label: '20-40 kg' },
  { min: 40, max: 60, label: '40-60 kg' },
];

const RANGOS_PERRO_COMPRIMIDO: RangoPeso[] = [
  { min: 2, max: 4, label: '2-4 kg (XS)' },
  { min: 4, max: 10, label: '4-10 kg (S)' },
  { min: 10, max: 25, label: '10-25 kg (M)' },
  { min: 25, max: 50, label: '25-50 kg (L)' },
  { min: 50, max: 70, label: '50-70 kg (XL)' },
];

const RANGOS_GATO_PIPETA: RangoPeso[] = [
  { min: 0.5, max: 4, label: '< 4 kg' },
  { min: 4, max: 8, label: '4-8 kg' },
];

const RANGOS_GATO_COMPRIMIDO: RangoPeso[] = [
  { min: 1.2, max: 2.8, label: '1,2-2,8 kg' },
  { min: 2.8, max: 6.25, label: '2,8-6,25 kg' },
  { min: 6.25, max: 12.5, label: '6,25-12,5 kg' },
];

function encontrarRango(peso: number, rangos: RangoPeso[]): string {
  for (const r of rangos) {
    if (peso >= r.min && peso < r.max) return r.label;
    if (peso === r.max) return r.label; // peso exacto en el límite superior
  }
  // Si excede, usar el último rango
  if (peso >= rangos[rangos.length - 1].max) return rangos[rangos.length - 1].label + ' (consultar vet, puede necesitar 2 dosis)';
  if (peso < rangos[0].min) return 'Muy chico para este producto. Consultar veterinario.';
  return rangos[rangos.length - 1].label;
}

export function dosisAntipulgasPesoMascota(i: Inputs): Outputs {
  const especie = String(i.especie || 'perro');
  const peso = Number(i.pesoKg);
  const tipo = String(i.tipoProducto || 'pipeta');

  if (!peso || peso <= 0 || peso > 80) throw new Error('Ingresá el peso de la mascota (0,5-80 kg)');

  let presentacion = '';
  let frecuencia = '';
  let costoMensual = 0;
  let alerta = '';

  if (especie === 'gato') {
    alerta = 'NUNCA uses un producto de PERRO en gato. La permetrina es MORTAL para gatos. Comprá solo productos específicos para gatos.';

    if (tipo === 'pipeta') {
      presentacion = `Pipeta para GATO ${encontrarRango(peso, RANGOS_GATO_PIPETA)} (Frontline Plus Gato, Revolution Gato, Advantage Gato).`;
      frecuencia = 'Cada 30 días.';
      costoMensual = 7000;
    } else if (tipo === 'comprimido') {
      presentacion = `Comprimido/spot-on para GATO ${encontrarRango(peso, RANGOS_GATO_COMPRIMIDO)} (Bravecto Gato, NexGard Combo Gato).`;
      frecuencia = 'Bravecto gato: cada 90 días. NexGard Combo: cada 30 días.';
      costoMensual = 9000;
    } else {
      presentacion = 'Collar Seresto para gato (talle < 8 kg). No usar collares genéricos en gatos.';
      frecuencia = 'Cada 8 meses.';
      costoMensual = 5500;
    }
  } else {
    // Perro
    if (tipo === 'pipeta') {
      presentacion = `Pipeta para perro ${encontrarRango(peso, RANGOS_PERRO_PIPETA)} (Frontline Plus, Advantage, Revolution).`;
      frecuencia = 'Cada 30 días. No bañar 48 h antes ni después.';
      costoMensual = peso <= 10 ? 7000 : peso <= 25 ? 9000 : 12000;
    } else if (tipo === 'comprimido') {
      presentacion = `Comprimido oral para perro ${encontrarRango(peso, RANGOS_PERRO_COMPRIMIDO)} (NexGard cada 30 días o Bravecto cada 90 días).`;
      frecuencia = 'NexGard/Simparica: cada 30 días. Bravecto: cada 90 días.';
      costoMensual = peso <= 10 ? 10000 : peso <= 25 ? 14000 : 18000;
    } else {
      presentacion = peso > 8
        ? 'Collar Seresto para perro > 8 kg o Scalibor (talle único).'
        : 'Collar Seresto para perro < 8 kg.';
      frecuencia = 'Seresto: cada 8 meses. Scalibor: cada 6 meses.';
      costoMensual = 6000;
    }
  }

  return {
    presentacion,
    frecuencia,
    costoMensual,
    alerta,
    detalle: `${especie === 'gato' ? 'Gato' : 'Perro'} de ${peso} kg → ${presentacion} ${frecuencia} Costo estimado: ~$${costoMensual.toLocaleString('es-AR')}/mes.${alerta ? ' ⚠️ ' + alerta : ''}`,
  };
}
