/**
 * Calculadora de Fiesta de Graduación - Presupuesto.
 */
export interface PresupuestoGraduacionInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoGraduacionOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonFiesta:number;
  costoViajeEgresados:number;
  costoVestuarioGraduacion:number;
  costoFotoVideo:number;
  costoAnuarioEgresados:number;
  costoOtros:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoGraduacion(inputs: PresupuestoGraduacionInputs): PresupuestoGraduacionOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 80;
  if (nivel === 'basico') costoPorInvitado = 35;
  else if (nivel === 'premium') costoPorInvitado = 180;
  const costoTotal = inv * costoPorInvitado;
  const costoSalonFiesta = Math.round(costoTotal * 0.4);
  const costoViajeEgresados = Math.round(costoTotal * 0.25);
  const costoVestuarioGraduacion = Math.round(costoTotal * 0.1);
  const costoFotoVideo = Math.round(costoTotal * 0.1);
  const costoAnuarioEgresados = Math.round(costoTotal * 0.08);
  const costoOtros = costoTotal - costoSalonFiesta - costoViajeEgresados - costoVestuarioGraduacion - costoFotoVideo - costoAnuarioEgresados;
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonFiesta,
    costoViajeEgresados,
    costoVestuarioGraduacion,
    costoFotoVideo,
    costoAnuarioEgresados,
    costoOtros,
    _insight: {
      title: "Tu graduación en números",
      text: `Festejar la graduación de **${inv.toLocaleString("es-AR")} ${inv === 1 ? "persona" : "egresados/invitados"}** en nivel **${nivelLabel}** sale unos **$${costoTotal.toLocaleString("es-AR")}** (**$${costoPorInvitado}/persona**). Entre salón y viaje de egresados se va el **65%**: definir esos dos primero ordena el resto del presupuesto.`,
      tone: "neutral",
      icon: "🎓",
    },
    _chart: {
      type: "doughnut",
      slices: [
        { label: "Salón / fiesta", value: costoSalonFiesta },
        { label: "Viaje de egresados", value: costoViajeEgresados },
        { label: "Vestuario", value: costoVestuarioGraduacion },
        { label: "Foto y video", value: costoFotoVideo },
        { label: "Anuario", value: costoAnuarioEgresados },
        { label: "Otros", value: costoOtros },
      ],
      prefix: "$",
      centerValue: `$${costoTotal.toLocaleString("es-AR")}`,
      centerLabel: "Costo total",
      ariaLabel: "Distribución del presupuesto de graduación por rubro",
    },
  };
}
