/** Evaluar si tomás suficiente agua por día */
export interface Inputs {
  peso: number;
  vasosAgua: number;
  actividadFisica?: string;
  clima?: string;
}
export interface Outputs {
  aguaRecomendada: number;
  aguaConsumida: number;
  porcentajeCubierto: number;
  estado: string;
  detalle: string;
}

export function evaluacionHidratacion(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const vasos = Number(i.vasosAgua);
  const actividad = String(i.actividadFisica || 'moderado');
  const clima = String(i.clima || 'templado');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (isNaN(vasos) || vasos < 0) throw new Error('Ingresá la cantidad de vasos');

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
  if (porcentaje < 50) estado = '🔴 Deshidratación significativa — necesitás tomar mucha más agua';
  else if (porcentaje < 70) estado = '🟠 Hidratación insuficiente — aumentá el consumo';
  else if (porcentaje < 90) estado = '🟡 Casi suficiente — falta un poco más';
  else if (porcentaje <= 110) estado = '🟢 Hidratación óptima — muy bien';
  else estado = '🔵 Exceso — no es grave pero no hace falta tanto';

  const vasosRecomendados = Math.ceil(aguaRecomendada / 250);
  const vasosFaltantes = Math.max(0, vasosRecomendados - vasos);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    aguaRecomendada,
    aguaConsumida,
    porcentajeCubierto: porcentaje,
    estado,
    detalle: `Necesitás ~${fmt.format(aguaRecomendada)} ml/día (${vasosRecomendados} vasos). Tomás ${fmt.format(aguaConsumida)} ml (${vasos} vasos) = ${porcentaje}%. ${vasosFaltantes > 0 ? `Te faltan ~${vasosFaltantes} vasos.` : '¡Estás cubriendo tu necesidad!'}`,
  };
}
