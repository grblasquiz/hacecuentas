/** Calorías extra por trimestre de embarazo — Mifflin-St Jeor + ACOG */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  trimestre: string;
  actividad?: string;
}
export interface Outputs {
  caloriasTotal: number;
  caloriasExtra: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function caloriasEmbarazoTrimestre(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const trimestre = String(i.trimestre || '2');
  const actividad = String(i.actividad || 'ligero');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso previo al embarazo');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura en cm');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Mifflin-St Jeor para mujeres
  const bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;

  const factores: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
  };
  const factor = factores[actividad] || 1.375;
  const tdee = bmr * factor;

  // Calorías extra por trimestre (ACOG)
  const extras: Record<string, number> = {
    '1': 0,
    '2': 340,
    '3': 450,
  };
  const extra = extras[trimestre] || 0;

  const total = Math.round(tdee + extra);
  const triNames: Record<string, string> = {
    '1': 'primer',
    '2': 'segundo',
    '3': 'tercer',
  };

  const detalle =
    `BMR base: ${Math.round(bmr)} kcal | ` +
    `TDEE pre-embarazo: ${Math.round(tdee)} kcal | ` +
    `Extra ${triNames[trimestre] || ''} trimestre: +${extra} kcal | ` +
    `Total recomendado: ${total} kcal/día.`;

  const fmt = new Intl.NumberFormat('es-AR');
  const triNombre = triNames[trimestre] || 'segundo';

  // Composición exacta del total: reposo (BMR) + actividad + extra del trimestre
  const bmrR = Math.round(bmr);
  const actividadR = total - bmrR - extra; // se deriva para que las porciones sumen el total exacto

  const out: Outputs = {
    caloriasTotal: total,
    caloriasExtra: extra,
    detalle,
    _insight: {
      title: 'Tu requerimiento del trimestre',
      text: extra === 0
        ? `En el **primer trimestre** todavía no se suman calorías extra (ACOG): tu objetivo se mantiene en **${fmt.format(total)} kcal/día**, igual que tu TDEE pre-embarazo.`
        : `Para el **${triNombre} trimestre** sumás **+${extra} kcal** sobre tu gasto pre-embarazo, llegando a **${fmt.format(total)} kcal/día**. De ese total, **~${fmt.format(bmrR)} kcal** son sólo tu metabolismo en reposo.`,
      tone: 'neutral',
      icon: '🤰',
    },
  };

  // Donut: reposo + actividad + extra suman el total
  const slices = [
    { label: 'Metabolismo basal', value: bmrR },
    { label: 'Actividad física', value: actividadR },
  ];
  if (extra > 0) slices.push({ label: `Extra ${triNombre} trim.`, value: extra });

  out._chart = {
    type: 'doughnut',
    slices,
    prefix: '',
    centerValue: fmt.format(total),
    centerLabel: 'kcal/día',
    ariaLabel: `Total de ${fmt.format(total)} kcal diarias: ${fmt.format(bmrR)} de metabolismo basal, ${fmt.format(actividadR)} de actividad y ${extra} extra del trimestre`,
  };

  return out;
}
