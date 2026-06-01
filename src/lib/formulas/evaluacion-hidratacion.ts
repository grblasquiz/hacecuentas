/** Evaluar si tomás suficiente agua por día */
export interface Inputs {
  peso: number;
  vasosAgua: number;
  actividadFisica?: string;
  clima?: string;
  __lang?: string;
}
export interface Outputs {
  aguaRecomendada: number;
  aguaConsumida: number;
  porcentajeCubierto: number;
  estado: string;
  detalle: string;
}

export function evaluacionHidratacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      errorVasos: 'Ingresá la cantidad de vasos',
      estado50: '🔴 Deshidratación significativa — necesitás tomar mucha más agua',
      estado70: '🟠 Hidratación insuficiente — aumentá el consumo',
      estado90: '🟡 Casi suficiente — falta un poco más',
      estado110: '🟢 Hidratación óptima — muy bien',
      estadoExceso: '🔵 Exceso — no es grave pero no hace falta tanto',
      cubierto: '¡Estás cubriendo tu necesidad!',
    },
    en: {
      errorPeso: 'Enter your weight',
      errorVasos: 'Enter the number of glasses',
      estado50: '🔴 Significant dehydration — you need to drink much more water',
      estado70: '🟠 Insufficient hydration — increase your intake',
      estado90: '🟡 Almost enough — just a bit more',
      estado110: '🟢 Optimal hydration — great job',
      estadoExceso: '🔵 Excess — not harmful, but you don\'t need that much',
      cubierto: 'You\'re meeting your daily needs!',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const vasos = Number(i.vasosAgua);
  const actividad = String(i.actividadFisica || 'moderado');
  const clima = String(i.clima || 'templado');

  if (!peso || peso <= 0) throw new Error(T.errorPeso);
  if (isNaN(vasos) || vasos < 0) throw new Error(T.errorVasos);

  // Base: 35 ml/kg
  let base = peso * 35;

  // Factor actividad
  if (actividad === 'moderado') base *= 1.15;
  else if (actividad === 'intenso') base *= 1.30;

  // Factor clima
  if (clima === 'frio') base *= 0.90;
  else if (clima === 'caluroso') base *= 1.15;

  const aguaRecomendada = Math.round(base);
  const aguaConsumida = vasos * 250;
  const porcentaje = Math.round((aguaConsumida / aguaRecomendada) * 100);

  let estado = '';
  if (porcentaje < 50) estado = T.estado50;
  else if (porcentaje < 70) estado = T.estado70;
  else if (porcentaje < 90) estado = T.estado90;
  else if (porcentaje <= 110) estado = T.estado110;
  else estado = T.estadoExceso;

  const vasosRecomendados = Math.ceil(aguaRecomendada / 250);
  const vasosFaltantes = Math.max(0, vasosRecomendados - vasos);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle = __lang === 'en'
    ? `You need ~${fmt.format(aguaRecomendada)} ml/day (${vasosRecomendados} glasses). You're drinking ${fmt.format(aguaConsumida)} ml (${vasos} glasses) = ${porcentaje}%. ${vasosFaltantes > 0 ? `You still need ~${vasosFaltantes} more glasses.` : T.cubierto}`
    : `Necesitás ~${fmt.format(aguaRecomendada)} ml/día (${vasosRecomendados} vasos). Tomás ${fmt.format(aguaConsumida)} ml (${vasos} vasos) = ${porcentaje}%. ${vasosFaltantes > 0 ? `Te faltan ~${vasosFaltantes} vasos.` : T.cubierto}`;

  return {
    aguaRecomendada,
    aguaConsumida,
    porcentajeCubierto: porcentaje,
    estado,
    detalle,
  };
}
