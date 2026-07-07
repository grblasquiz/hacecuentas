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
  _insight?: any;
  _chart?: any;
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
      insTitleLow: 'Te falta agua',
      insTitleOk: 'Buena hidratación',
      insTitleExc: 'Estás pasado',
      insTextLow: (p: number, falt: number) => `Cubrís solo el **${p}%** de tu necesidad diaria: te faltan unos **${falt} vasos** para llegar al nivel óptimo.`,
      insTextOk: (p: number) => `Cubrís el **${p}%** de tu necesidad diaria: estás en zona **óptima** de hidratación. Mantené el ritmo.`,
      insTextExc: (p: number) => `Cubrís el **${p}%** de tu necesidad: tomás más agua de la necesaria. No es grave, pero no hace falta forzar.`,
      segBajo: 'Bajo',
      segJusto: 'Justo',
      segOptimo: 'Óptimo',
      segExceso: 'Exceso',
      gaugeAria: 'Porcentaje de la necesidad diaria de agua cubierto, de zona baja a exceso.',
      markerLbl: 'cubierto',
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
      insTitleLow: 'You need more water',
      insTitleOk: 'Well hydrated',
      insTitleExc: 'You\'re overdoing it',
      insTextLow: (p: number, falt: number) => `You're covering only **${p}%** of your daily needs: you still need about **${falt} more glasses** to reach the optimal level.`,
      insTextOk: (p: number) => `You're covering **${p}%** of your daily needs: you're in the **optimal** hydration zone. Keep it up.`,
      insTextExc: (p: number) => `You're covering **${p}%** of your needs: you're drinking more water than required. Not harmful, but no need to push it.`,
      segBajo: 'Low',
      segJusto: 'Fair',
      segOptimo: 'Optimal',
      segExceso: 'Excess',
      gaugeAria: 'Percentage of your daily water needs covered, from low to excess.',
      markerLbl: 'covered',
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

  let _insight: any;
  if (porcentaje < 90) {
    _insight = {
      title: T.insTitleLow,
      text: T.insTextLow(porcentaje, vasosFaltantes),
      tone: 'warn',
      icon: '💧',
    };
  } else if (porcentaje <= 110) {
    _insight = {
      title: T.insTitleOk,
      text: T.insTextOk(porcentaje),
      tone: 'good',
      icon: '💧',
    };
  } else {
    _insight = {
      title: T.insTitleExc,
      text: T.insTextExc(porcentaje),
      tone: 'neutral',
      icon: '💧',
    };
  }

  const _chart = {
    type: 'scale',
    marker: porcentaje,
    markerLabel: `${porcentaje}% ${T.markerLbl}`,
    min: 0,
    segments: [
      { nombre: T.segBajo, max: 70, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: T.segJusto, max: 90, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: T.segOptimo, max: 110, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: T.segExceso, max: Math.max(130, porcentaje + 5), color: '#3b82f6', colorDark: '#2563eb' },
    ],
    ariaLabel: T.gaugeAria,
  };

  return {
    aguaRecomendada,
    aguaConsumida,
    porcentajeCubierto: porcentaje,
    estado,
    detalle,
    _insight,
    _chart,
  };
}
