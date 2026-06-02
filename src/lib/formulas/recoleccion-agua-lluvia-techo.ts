/** Litros de agua de lluvia recolectables por mes según techo */
export interface Inputs { superficieTechoM2: number; precipitacionMensualMm: number; coeficienteEscurrimiento: number; }
export interface Outputs { litrosMes: number; litrosAnio: number; tanqueRecomendadoL: number; detalle: string; _insight?: any; }

export function recoleccionAguaLluviaTecho(i: Inputs): Outputs {
  const superficie = Number(i.superficieTechoM2);
  const precipitacion = Number(i.precipitacionMensualMm);
  const coef = Number(i.coeficienteEscurrimiento);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie del techo');
  if (precipitacion < 0) throw new Error('La precipitación no puede ser negativa');
  if (!coef || coef <= 0 || coef > 1) throw new Error('El coeficiente debe estar entre 0,1 y 1');

  const litrosMes = superficie * precipitacion * coef;
  const litrosAnio = litrosMes * 12;
  const tanqueRecomendado = Math.ceil(litrosMes * 0.5 / 100) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Equivalencia práctica: bidones de 200 L cargados al año
  const bidones = Math.round(litrosAnio / 200);
  const insight = {
    title: 'Cuánta agua junta tu techo',
    text: `Con ${fmt.format(superficie)} m² de techo y ${fmt.format(precipitacion)} mm de lluvia al mes, juntás unos **${fmt.format(Math.round(litrosMes))} litros por mes** y **${fmt.format(Math.round(litrosAnio))} litros al año** (equivale a ${fmt.format(bidones)} bidones de 200 L). El tanque recomendado para acumular es de **${fmt.format(tanqueRecomendado)} litros**.`,
    tone: 'good' as const,
    icon: '🌧️',
  };

  return {
    litrosMes: Number(litrosMes.toFixed(0)),
    litrosAnio: Number(litrosAnio.toFixed(0)),
    tanqueRecomendadoL: tanqueRecomendado,
    detalle: `${fmt.format(superficie)} m² × ${fmt.format(precipitacion)} mm × ${coef} = ${fmt.format(litrosMes)} litros/mes (${fmt.format(litrosAnio)} L/año). Tanque recomendado: ${fmt.format(tanqueRecomendado)} litros.`,
    _insight: insight,
  };
}
