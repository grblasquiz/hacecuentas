/** Calorías extra durante lactancia según tipo y TDEE base */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  tipoLactancia?: string;
  actividad?: string;
}
export interface Outputs {
  caloriasTotal: number;
  caloriasExtra: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function caloriasLactanciaProduccionLeche(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const tipo = String(i.tipoLactancia || 'exclusiva');
  const actividad = String(i.actividad || 'ligero');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso actual');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura en cm');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Mifflin-St Jeor mujer
  const bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;

  const factores: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
  };
  const factor = factores[actividad] || 1.375;
  const tdee = bmr * factor;

  // Extra por lactancia
  const extra = tipo === 'exclusiva' ? 500 : 280;
  const total = Math.round(tdee + extra);
  const tipoLabel = tipo === 'exclusiva' ? 'exclusiva' : 'parcial';

  const detalle =
    `BMR: ${Math.round(bmr)} kcal | ` +
    `TDEE base: ${Math.round(tdee)} kcal | ` +
    `Extra lactancia ${tipoLabel}: +${extra} kcal | ` +
    `Total recomendado: ${total} kcal/día. ` +
    `Mínimo recomendado con lactancia exclusiva: 1.800 kcal/día.`;

  // Base derivada del total para que las porciones sumen exacto el total mostrado
  const tdeeBase = total - extra;
  const fmt = new Intl.NumberFormat('es-AR');
  const bajoMinimo = tipo === 'exclusiva' && total < 1800;

  const _insight = {
    title: bajoMinimo ? 'Por debajo del mínimo sugerido' : 'Energía extra para producir leche',
    text: bajoMinimo
      ? `Tu total da **${fmt.format(total)} kcal/día**, por debajo del **mínimo de 1.800 kcal** recomendado en lactancia exclusiva. Comer de menos puede afectar tu energía y la producción de leche: consultá con un profesional.`
      : `La lactancia ${tipoLabel} suma **+${extra} kcal/día** sobre tu gasto base de ${fmt.format(tdeeBase)} kcal, para un total de **${fmt.format(total)} kcal/día**. Ese extra cubre la energía que tu cuerpo invierte en producir leche.`,
    tone: bajoMinimo ? 'warn' : 'good',
    icon: '🤱',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Gasto base (TDEE)', value: tdeeBase },
      { label: `Extra lactancia ${tipoLabel}`, value: extra },
    ],
    prefix: '',
    centerValue: fmt.format(total),
    centerLabel: 'kcal/día',
    ariaLabel: `Total de ${fmt.format(total)} kcal por día: ${fmt.format(tdeeBase)} de gasto base más ${extra} extra por lactancia ${tipoLabel}.`,
  };

  return {
    caloriasTotal: total,
    caloriasExtra: extra,
    detalle,
    _insight,
    _chart,
  };
}
