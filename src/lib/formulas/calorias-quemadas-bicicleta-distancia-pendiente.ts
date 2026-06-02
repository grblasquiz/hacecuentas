/** Calorías quemadas en bicicleta según distancia, ritmo y pendiente */
export interface Inputs {
  peso: number; // kg (ciclista)
  distancia: number; // km
  ritmo?: string; // 'recreativo' | 'moderado' | 'intenso' | 'competicion'
  pendiente?: number | string; // % medio del recorrido (negativo = descenso); opcional
}
export interface Outputs {
  caloriasTotal: number;
  caloriasPorKm: number;
  desnivelAcumulado: string;
  tiempoEstimado: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

interface DatoRitmo {
  nombre: string;
  velocidad: number; // km/h
  met: number;
}

// MET del Compendium of Physical Activities (Ainsworth) según velocidad media.
const RITMOS: Record<string, DatoRitmo> = {
  recreativo: { nombre: 'recreativo (≤15 km/h)', velocidad: 15, met: 6.0 },
  moderado: { nombre: 'moderado (16-19 km/h)', velocidad: 18, met: 8.0 },
  intenso: { nombre: 'intenso (20-25 km/h)', velocidad: 22, met: 10.0 },
  competicion: { nombre: 'competición (>25 km/h)', velocidad: 28, met: 14.0 },
};

export function caloriasQuemadasBicicletaDistanciaPendiente(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const distancia = Number(i.distancia);
  const ritmo = RITMOS[String(i.ritmo || 'moderado')] || RITMOS['moderado'];

  // pendiente es opcional: el form manda '' cuando queda vacío → tratar como 0 (llano).
  const rawPend = i.pendiente;
  const pendiente =
    rawPend === '' || rawPend === null || rawPend === undefined || isNaN(Number(rawPend))
      ? 0
      : Number(rawPend);

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!distancia || distancia <= 0) throw new Error('Ingresá la distancia en km');

  // Tiempo a partir del ritmo elegido
  const horas = distancia / ritmo.velocidad;

  // Gasto en llano: Calorías = MET × peso (kg) × tiempo (horas), con 1 MET = 1 kcal/kg/h.
  const base = ritmo.met * peso * horas;

  // Ajuste por pendiente — componente gravitatoria con modelo físico:
  // subir exige trabajo extra contra la gravedad W = m·g·desnivel, que el cuerpo
  // entrega con ~24% de eficiencia mecánica. Bajar ahorra parte del esfuerzo.
  const PESO_BICI = 9; // kg: bici + equipo + hidratación
  const EFICIENCIA = 0.24; // eficiencia metabólica → mecánica del pedaleo
  const G = 9.81; // m/s²
  const J_POR_KCAL = 4184;
  const masaTotal = peso + PESO_BICI;
  const desnivel = distancia * 1000 * (pendiente / 100); // metros (con signo)

  let extra = 0;
  let total = base;
  if (desnivel > 0) {
    extra = (masaTotal * G * desnivel) / EFICIENCIA / J_POR_KCAL;
    total = base + extra;
  } else if (desnivel < 0) {
    // En descenso la gravedad ayuda; el gasto cae pero nunca a cero (frenado, postura).
    const ahorro = Math.min(0.45, Math.abs(pendiente) * 0.045); // hasta -45% a partir de -10%
    total = base * (1 - ahorro);
  }

  const totalR = Math.round(total);
  const extraR = Math.round(extra);
  const baseR = Math.round(base);
  const kcalKm = total / distancia;
  const tiempoMin = Math.round(horas * 60);
  const desnivelR = Math.round(desnivel);

  const fmtN = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const desnivelTxt =
    desnivelR > 0
      ? `+${fmtN.format(desnivelR)} m de subida`
      : desnivelR < 0
        ? `${fmtN.format(desnivelR)} m de bajada`
        : 'terreno llano';
  const ritmoCorto = ritmo.nombre.split(' ')[0];

  let insText: string;
  if (desnivelR > 0) {
    insText = `Recorriste **${distancia} km** en ~${tiempoMin} min subiendo un ${pendiente}% (${desnivelTxt}). Quemaste **${fmtN.format(totalR)} kcal** (${kcalKm.toFixed(1)}/km): la subida sumó **${fmtN.format(extraR)} kcal** extra sobre el llano.`;
  } else if (desnivelR < 0) {
    insText = `Bajando un ${Math.abs(pendiente)}% la gravedad te ayuda: **${distancia} km** a ritmo ${ritmoCorto} queman ~**${fmtN.format(totalR)} kcal** (${kcalKm.toFixed(1)}/km), menos que en llano.`;
  } else {
    insText = `**${distancia} km** en llano a ritmo ${ritmoCorto} (~${tiempoMin} min) queman **${fmtN.format(totalR)} kcal**, unas ${kcalKm.toFixed(1)} kcal por km.`;
  }

  const out: Outputs = {
    caloriasTotal: totalR,
    caloriasPorKm: Number(kcalKm.toFixed(1)),
    desnivelAcumulado: desnivelTxt,
    tiempoEstimado: `~${tiempoMin} min (${ritmo.velocidad} km/h)`,
    resumen: `**${distancia} km** a ritmo ${ritmo.nombre} con pendiente ${pendiente}%: **${fmtN.format(totalR)} kcal** en ~${tiempoMin} min (${kcalKm.toFixed(1)} kcal/km).`,
    _insight: {
      title: 'Lo que quemaste sobre la bici',
      text: insText,
      tone: 'good',
      icon: '🚴',
    },
  };

  // Gráfico sólo cuando hay subida real: desglose llano vs extra por trepar.
  if (extra >= 1) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Pedaleo en llano', value: baseR },
        { label: 'Extra por subir', value: extraR },
      ],
      prefix: '',
      centerValue: `${fmtN.format(totalR)} kcal`,
      centerLabel: 'total',
      ariaLabel: `Desglose del gasto: ${baseR} kcal de pedaleo en llano más ${extraR} kcal extra por la subida.`,
    };
  }

  return out;
}
