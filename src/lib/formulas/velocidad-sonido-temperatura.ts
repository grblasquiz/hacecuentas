/** Velocidad del sonido en aire
 *  Aire seco: c = 331.3 + 0.6·T (m/s), con T en °C
 *  Corrección por humedad: el aire húmedo es menos denso → c aumenta levemente.
 */
export interface Inputs {
  temperatura: number; // °C
  humedad?: number; // %
}
export interface Outputs {
  velocidad: string;
  velocidadKmh: string;
  machReferencia: string;
  tiempoPorKm: string;
  comentario: string;
}

export function velocidadSonidoTemperatura(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  if (isNaN(T) || T < -80 || T > 80) throw new Error('Temperatura fuera de rango (-80 a 80 °C)');
  const H = Number(i.humedad ?? 0);
  if (isNaN(H) || H < 0 || H > 100) throw new Error('Humedad debe estar entre 0 y 100 %');

  // Base aire seco
  const cSeco = 331.3 + 0.6 * T;

  // Corrección por humedad (aproximación de Cramer simplificada):
  // A 20°C, de 0 % a 100 % RH, c aumenta ~0.4 m/s.
  // Factor ~0.004 × (H/100) × (1 + T/273) para escalar con temperatura.
  const correccionHumedad = 0.004 * (H / 100) * cSeco;
  const c = cSeco + correccionHumedad;

  const cKmh = c * 3.6;
  const mach1 = c; // Mach 1 es por definición c
  const tiempoKm = 1000 / c; // segundos

  let comentario = '';
  if (T <= 0) comentario = 'Aire frío: el sonido viaja más lento. En montaña invernal esperá tiempos de eco más largos.';
  else if (T <= 20) comentario = 'Condiciones estándar. A 20 °C el sonido viaja a ~343 m/s.';
  else if (T <= 35) comentario = 'Aire cálido: el sonido se propaga más rápido. En días calurosos los truenos se escuchan más cerca de lo que están.';
  else comentario = 'Aire muy cálido: velocidad del sonido elevada, útil para estimar Mach en aviación con ISA+desviación.';

  return {
    velocidad: `${c.toFixed(2)} m/s`,
    velocidadKmh: `${cKmh.toFixed(1)} km/h`,
    machReferencia: `Mach 1 = ${mach1.toFixed(1)} m/s`,
    tiempoPorKm: `${tiempoKm.toFixed(3)} s por km (eco ida+vuelta ≈ ${(2 * tiempoKm).toFixed(2)} s)`,
    comentario,
  };
}
