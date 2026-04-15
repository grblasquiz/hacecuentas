/** Estimar costo de envío por peso volumétrico */

export interface Inputs {
  pesoReal: number;
  largo: number;
  ancho: number;
  alto: number;
  costoPorKg: number;
}

export interface Outputs {
  pesoVolumetrico: number;
  pesoFacturable: number;
  costoEnvio: number;
  detalle: string;
}

export function costoEnvioPaquete(i: Inputs): Outputs {
  const pesoReal = Number(i.pesoReal);
  const largo = Number(i.largo);
  const ancho = Number(i.ancho);
  const alto = Number(i.alto);
  const costoPorKg = Number(i.costoPorKg);

  if (isNaN(pesoReal) || pesoReal <= 0) throw new Error('Ingresá el peso real del paquete');
  if (isNaN(largo) || largo <= 0) throw new Error('Ingresá el largo del paquete');
  if (isNaN(ancho) || ancho <= 0) throw new Error('Ingresá el ancho del paquete');
  if (isNaN(alto) || alto <= 0) throw new Error('Ingresá el alto del paquete');
  if (isNaN(costoPorKg) || costoPorKg <= 0) throw new Error('Ingresá el costo por kg');

  // Factor volumétrico estándar IATA: 5000
  const pesoVolumetrico = (largo * ancho * alto) / 5000;
  const pesoFacturable = Math.max(pesoReal, pesoVolumetrico);
  const costoEnvio = pesoFacturable * costoPorKg;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const factorUsado = pesoFacturable === pesoReal ? 'peso real' : 'peso volumétrico';
  const detalle =
    `Peso real: ${pesoReal.toFixed(1)} kg. Peso volumétrico: ${pesoVolumetrico.toFixed(1)} kg ` +
    `(${largo}×${ancho}×${alto}cm / 5000). Se cobra por ${factorUsado}: ${pesoFacturable.toFixed(1)} kg. ` +
    `Costo estimado: $${fmt.format(costoEnvio)}.`;

  return {
    pesoVolumetrico: Number(pesoVolumetrico.toFixed(1)),
    pesoFacturable: Number(pesoFacturable.toFixed(1)),
    costoEnvio: Math.round(costoEnvio),
    detalle,
  };
}
