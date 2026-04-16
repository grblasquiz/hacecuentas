/** Calculadora de Distancia Focal Equivalente */
export interface Inputs { focalReal: number; sensorOrigen: string; sensorDestino: string; }
export interface Outputs { focalEquivalente: number; focalFF: number; anguloCampo: number; tipo: string; }

export function distanciaFocalEquivalente(i: Inputs): Outputs {
  const focal = Number(i.focalReal);
  const cropOrigen = Number(i.sensorOrigen);
  const cropDestino = Number(i.sensorDestino);
  if (!focal || focal <= 0) throw new Error('Ingresá la distancia focal');
  if (!cropOrigen) throw new Error('Seleccioná el sensor origen');
  if (!cropDestino) throw new Error('Seleccioná el sensor destino');

  const focalFF = focal * cropOrigen;
  const focalEquivalente = focalFF / cropDestino;

  // Horizontal angle of view (for full frame equivalent)
  // Using 36mm sensor width
  const anguloCampo = 2 * Math.atan(36 / (2 * focalFF)) * (180 / Math.PI);

  let tipo: string;
  if (focalFF < 20) tipo = 'Ultra gran angular — paisajes extremos, arquitectura';
  else if (focalFF < 35) tipo = 'Gran angular — paisajes, interiores, street';
  else if (focalFF < 50) tipo = 'Angular moderado — reportaje, street photography';
  else if (focalFF <= 60) tipo = 'Normal — se acerca a la visión humana, versátil';
  else if (focalFF < 85) tipo = 'Tele corto — retratos de medio cuerpo';
  else if (focalFF < 135) tipo = 'Tele medio — retratos, deportes cercanos';
  else if (focalFF < 300) tipo = 'Teleobjetivo — deportes, fauna, eventos';
  else tipo = 'Super teleobjetivo — fauna lejana, astronomía';

  return {
    focalEquivalente: Number(focalEquivalente.toFixed(1)),
    focalFF: Number(focalFF.toFixed(1)),
    anguloCampo: Number(anguloCampo.toFixed(1)),
    tipo,
  };
}
