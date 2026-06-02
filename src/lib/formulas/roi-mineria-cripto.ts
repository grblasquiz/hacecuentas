/** ROI de minería de criptomonedas según hashrate y costo eléctrico */

export interface Inputs {
  hashrateThS: number;
  consumoWatts: number;
  costoKwhUsd: number;
  recompensaDiariaUsd: number;
  costoEquipo: number;
  dificultadCambioMensual: number;
}

export interface Outputs {
  ingresoDiario: number;
  costoDiarioElectricidad: number;
  gananciaDiaria: number;
  gananciaMensual: number;
  gananciaAnual: number;
  diasRoi: number;
  roiAnualPorc: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function roiMineriaCripto(i: Inputs): Outputs {
  const hashrate = Number(i.hashrateThS);
  const watts = Number(i.consumoWatts);
  const costoKwh = Number(i.costoKwhUsd);
  const recompensaDiaria = Number(i.recompensaDiariaUsd);
  const costoEquipo = Number(i.costoEquipo) || 0;
  const dificultadCambio = Number(i.dificultadCambioMensual) || 0;

  if (!hashrate || hashrate <= 0) throw new Error('Ingresá el hashrate del equipo');
  if (!watts || watts <= 0) throw new Error('Ingresá el consumo en watts');
  if (!costoKwh || costoKwh <= 0) throw new Error('Ingresá el costo de electricidad por kWh');
  if (!recompensaDiaria || recompensaDiaria <= 0) throw new Error('Ingresá la recompensa diaria estimada en USD');

  // Costo eléctrico diario: watts * 24h / 1000 * costoKwh
  const costoDiarioElectricidad = (watts * 24 / 1000) * costoKwh;
  const ingresoDiario = recompensaDiaria;
  const gananciaDiaria = ingresoDiario - costoDiarioElectricidad;

  // Ganancia mensual/anual con ajuste de dificultad
  let gananciaMensual = 0;
  let gananciaAnual = 0;
  const difFactor = 1 + dificultadCambio / 100;

  for (let m = 0; m < 12; m++) {
    const ingresoMes = ingresoDiario * 30 * Math.pow(difFactor, -m);
    const costoMes = costoDiarioElectricidad * 30;
    const gMes = ingresoMes - costoMes;
    gananciaAnual += gMes;
    if (m === 0) gananciaMensual = gMes;
  }

  // ROI: días para recuperar inversión
  const diasRoi = gananciaDiaria > 0 && costoEquipo > 0
    ? Math.ceil(costoEquipo / gananciaDiaria)
    : gananciaDiaria <= 0 ? -1 : 0;

  const roiAnualPorc = costoEquipo > 0 ? (gananciaAnual / costoEquipo) * 100 : 0;

  const eficiencia = (watts / (hashrate * 1000)).toFixed(2); // J/GH

  const formula = `Ganancia diaria = $${ingresoDiario.toFixed(2)} - $${costoDiarioElectricidad.toFixed(2)} = $${gananciaDiaria.toFixed(2)}/día`;
  const explicacion = gananciaDiaria <= 0
    ? `Con ${hashrate} TH/s consumiendo ${watts}W a $${costoKwh}/kWh, el costo eléctrico ($${costoDiarioElectricidad.toFixed(2)}/día) supera el ingreso ($${ingresoDiario.toFixed(2)}/día). La minería no es rentable con estos parámetros.`
    : `Con ${hashrate} TH/s consumiendo ${watts}W a $${costoKwh}/kWh, ganás $${gananciaDiaria.toFixed(2)}/día neto ($${gananciaMensual.toFixed(0)}/mes). Eficiencia: ${eficiencia} J/GH.${costoEquipo > 0 ? ` ROI del equipo ($${costoEquipo.toLocaleString()}) en ${diasRoi} días (~${Math.round(diasRoi / 30)} meses). Retorno anual: ${roiAnualPorc.toFixed(1)}%.` : ''}${dificultadCambio > 0 ? ` Considerando +${dificultadCambio}% de dificultad mensual, ganancia anual: $${Math.round(gananciaAnual).toLocaleString()}.` : ''}`;

  const margen = ingresoDiario > 0 ? (gananciaDiaria / ingresoDiario) * 100 : 0;
  const insight = {
    title: gananciaDiaria > 0 ? 'Minería rentable' : 'Minería no rentable',
    text: gananciaDiaria > 0
      ? `La electricidad se come **$${costoDiarioElectricidad.toFixed(2)}/día** de tus $${ingresoDiario.toFixed(2)} de recompensa, dejándote **$${gananciaDiaria.toFixed(2)}/día** netos (margen ${margen.toFixed(0)}%).${costoEquipo > 0 ? ` Recuperás el equipo en **${diasRoi} días** (~${Math.round(diasRoi / 30)} meses).` : ''}${dificultadCambio > 0 ? ' Ojo: con la dificultad subiendo cada mes, ese margen se achica con el tiempo.' : ''}`
      : `A $${costoKwh}/kWh el costo eléctrico (**$${costoDiarioElectricidad.toFixed(2)}/día**) supera la recompensa (**$${ingresoDiario.toFixed(2)}/día**): perdés $${Math.abs(gananciaDiaria).toFixed(2)} por día encendido. Necesitás electricidad más barata o un equipo más eficiente para que cierre.`,
    tone: (gananciaDiaria > 0 ? 'good' : 'warn') as 'good' | 'warn' | 'neutral',
    icon: '⛏️',
  };

  const out: Outputs = {
    ingresoDiario: Number(ingresoDiario.toFixed(2)),
    costoDiarioElectricidad: Number(costoDiarioElectricidad.toFixed(2)),
    gananciaDiaria: Number(gananciaDiaria.toFixed(2)),
    gananciaMensual: Math.round(gananciaMensual),
    gananciaAnual: Math.round(gananciaAnual),
    diasRoi: Math.max(0, diasRoi),
    roiAnualPorc: Number(roiAnualPorc.toFixed(2)),
    formula,
    explicacion,
    _insight: insight,
  };

  // Donut sólo si es rentable: la recompensa diaria se reparte en costo eléctrico + ganancia neta
  if (gananciaDiaria > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Ganancia neta', value: Number(gananciaDiaria.toFixed(2)) },
        { label: 'Costo electricidad', value: Number(costoDiarioElectricidad.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: '$' + ingresoDiario.toFixed(2),
      centerLabel: 'Recompensa/día',
      ariaLabel: `Recompensa diaria de $${ingresoDiario.toFixed(2)} repartida en ganancia neta de $${gananciaDiaria.toFixed(2)} y costo de electricidad de $${costoDiarioElectricidad.toFixed(2)}.`,
    };
  }

  return out;
}
