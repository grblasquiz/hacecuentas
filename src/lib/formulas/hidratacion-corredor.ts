/** Hidratación recomendada para corredores */
export interface Inputs { pesoKg: number; distanciaKm: number; temperaturaC: number; ritmoMinKm: number; }
export interface Outputs {
  aguaTotalMl: number;
  aguaPorHoraMl: number;
  sodioMg: number;
  detalle: string;
  _insight?: any;
}

export function hidratacionCorredor(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  const dist = Number(i.distanciaKm);
  const temp = Number(i.temperaturaC);
  const ritmo = Number(i.ritmoMinKm);
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en km');
  if (isNaN(temp)) throw new Error('Ingresá la temperatura en °C');
  if (!ritmo || ritmo <= 0) throw new Error('Ingresá tu ritmo en min/km');

  // Factor temperatura: 0.7 (frío) a 1.5 (muy caluroso)
  let factorTemp = 1.0;
  if (temp < 10) factorTemp = 0.7;
  else if (temp < 15) factorTemp = 0.8;
  else if (temp < 20) factorTemp = 0.9;
  else if (temp < 25) factorTemp = 1.0;
  else if (temp < 30) factorTemp = 1.2;
  else if (temp < 35) factorTemp = 1.3;
  else factorTemp = 1.5;

  // Factor ritmo: más rápido = más calor
  let factorRitmo = 1.0;
  if (ritmo < 4) factorRitmo = 1.3;
  else if (ritmo < 5) factorRitmo = 1.2;
  else if (ritmo < 6) factorRitmo = 1.1;
  else if (ritmo < 7) factorRitmo = 1.0;
  else factorRitmo = 0.8;

  const factorPeso = peso / 75;

  // Tasa base 700 ml/h
  const tasaSudoracion = 700 * factorTemp * factorRitmo * factorPeso;

  // Tiempo estimado en horas
  const tiempoMin = dist * ritmo;
  const tiempoH = tiempoMin / 60;

  const aguaTotal = Math.round(tasaSudoracion * tiempoH);
  const aguaPorHora = Math.round(tasaSudoracion);

  // Sodio: ~500 mg por litro de sudor
  const sodio = Math.round((aguaTotal / 1000) * 500);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const sudaAlto = aguaPorHora >= 1000;
  const tiradaLarga = tiempoH >= 1;
  const tone = (sudaAlto || (tiradaLarga && temp >= 25)) ? 'warn' : 'good';
  const _insight = {
    title: 'Plan de hidratación en carrera',
    text: tiradaLarga
      ? `Vas a perder ~**${fmt.format(aguaPorHora)} ml/h** de sudor durante ~${Math.floor(tiempoH)}h ${Math.round((tiempoH % 1) * 60)}min. No esperes a tener sed: tomá **150-250 ml cada 15-20 min**${sudaAlto || temp >= 25 ? ` y reponé los **${fmt.format(sodio)} mg de sodio** con sales o bebida isotónica para no descompensarte` : ''}.`
      : `Para una salida corta de ~${Math.round(tiempoMin)} min con ~**${fmt.format(aguaPorHora)} ml/h** de sudoración, te alcanza con **${fmt.format(aguaTotal)} ml** de agua; los electrolitos no son críticos en tiradas tan breves.`,
    tone,
    icon: '🏃',
  };

  return {
    aguaTotalMl: aguaTotal,
    aguaPorHoraMl: aguaPorHora,
    sodioMg: sodio,
    detalle: `Para ${fmt.format(dist)} km a ${ritmo} min/km con ${temp}°C, necesitás ~${fmt.format(aguaTotal)} ml de agua (${fmt.format(aguaPorHora)} ml/h) y ~${fmt.format(sodio)} mg de sodio. Tiempo estimado: ${Math.floor(tiempoH)}h ${Math.round((tiempoH % 1) * 60)}min.`,
    _insight,
  };
}
