/** Número de escalones, huella y contrahuella óptimas para una altura dada.
 *  Regla de Blondel: huella + 2 × contrahuella ≈ 63 cm. */
export interface Inputs {
  altura: number; // altura a salvar en cm
  largoDisponible?: number; // cm horizontales disponibles
  contrahuellaDeseada?: number; // cm, opcional
}
export interface Outputs {
  cantidadEscalones: number;
  contrahuella: number;
  huella: number;
  blondel: number;
  largoEscalera: number;
  anguloGrados: number;
  comodidad: string;
  resumen: string;
}

export function escalerasPasos(i: Inputs): Outputs {
  const altura = Number(i.altura);
  const largo = Number(i.largoDisponible) || 0;
  const contraDeseada = Number(i.contrahuellaDeseada) || 17;
  if (!altura || altura <= 0) throw new Error('Ingresá la altura total a salvar (cm)');
  if (altura > 600) throw new Error('Altura demasiado grande (máx 600 cm)');
  if (contraDeseada < 14 || contraDeseada > 20) throw new Error('La contrahuella ideal está entre 14 y 20 cm');

  // Cantidad de escalones (redondear al entero más cercano)
  const cantidad = Math.round(altura / contraDeseada);
  if (cantidad < 2) throw new Error('Se necesitan al menos 2 escalones');

  // Contrahuella real
  const contrahuella = altura / cantidad;

  // Huella según Blondel: h + 2c = 63 → h = 63 - 2c
  const huella = 63 - 2 * contrahuella;
  const blondel = huella + 2 * contrahuella;

  // Número de huellas = escalones - 1 (la última huella es el piso superior)
  const huellas = cantidad - 1;
  const largoEscalera = huellas * huella;

  // Ángulo de la escalera
  const angulo = Math.atan(altura / largoEscalera) * (180 / Math.PI);

  // Comodidad
  let comodidad = '';
  if (angulo < 20) comodidad = 'Muy cómoda (rampa suave)';
  else if (angulo < 30) comodidad = 'Cómoda (edificios públicos, residencial amplio)';
  else if (angulo < 38) comodidad = 'Estándar residencial';
  else if (angulo < 45) comodidad = 'Pendiente fuerte (ático, aceptable)';
  else comodidad = 'Muy empinada (solo escaleras de emergencia)';

  // Chequeo largo disponible
  if (largo > 0 && largoEscalera > largo) {
    throw new Error(`No entra en ${largo} cm. Se requieren ${Math.ceil(largoEscalera)} cm. Aumentá contrahuella.`);
  }

  return {
    cantidadEscalones: cantidad,
    contrahuella: Number(contrahuella.toFixed(2)),
    huella: Number(huella.toFixed(2)),
    blondel: Number(blondel.toFixed(2)),
    largoEscalera: Number(largoEscalera.toFixed(2)),
    anguloGrados: Number(angulo.toFixed(2)),
    comodidad,
    resumen: `${cantidad} escalones con contrahuella ${contrahuella.toFixed(1)} cm y huella ${huella.toFixed(1)} cm. Ángulo ${angulo.toFixed(1)}°.`,
  };
}
