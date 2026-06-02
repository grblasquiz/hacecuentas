/**
 * Calculadora de Fiesta de Fin de Año Empresa - Presupuesto.
 */
export interface PresupuestoFiestaFinAnoEmpresaInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoFiestaFinAnoEmpresaOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonCatering:number;
  costoShowAnimacion:number;
  costoFotoVideo:number;
  costoRegalosSorteos:number;
  costoDecoracion:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoFiestaFinAnoEmpresa(inputs: PresupuestoFiestaFinAnoEmpresaInputs): PresupuestoFiestaFinAnoEmpresaOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 100;
  if (nivel === 'basico') costoPorInvitado = 50;
  else if (nivel === 'premium') costoPorInvitado = 220;
  const costoTotal = inv * costoPorInvitado;
  const costoSalonCatering = Math.round(costoTotal * 0.5);
  const costoShowAnimacion = Math.round(costoTotal * 0.15);
  const costoFotoVideo = Math.round(costoTotal * 0.1);
  const costoRegalosSorteos = Math.round(costoTotal * 0.15);
  const costoDecoracion = costoTotal - costoSalonCatering - costoShowAnimacion - costoFotoVideo - costoRegalosSorteos;
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonCatering,
    costoShowAnimacion,
    costoFotoVideo,
    costoRegalosSorteos,
    costoDecoracion,
    _insight: {
      title: "Tu fiesta de empresa en números",
      text: `Una fiesta **${nivelLabel}** para **${inv.toLocaleString("es-AR")} invitados** cuesta unos **$${costoTotal.toLocaleString("es-AR")}** (**$${costoPorInvitado}/persona**). El **50%** se va en salón y catering, así que ese contrato es donde más se negocia y donde más podés ahorrar.`,
      tone: "neutral",
      icon: "🎉",
    },
    _chart: {
      type: "doughnut",
      slices: [
        { label: "Salón y catering", value: costoSalonCatering },
        { label: "Show y animación", value: costoShowAnimacion },
        { label: "Regalos y sorteos", value: costoRegalosSorteos },
        { label: "Foto y video", value: costoFotoVideo },
        { label: "Decoración", value: costoDecoracion },
      ],
      prefix: "$",
      centerValue: `$${costoTotal.toLocaleString("es-AR")}`,
      centerLabel: "Costo total",
      ariaLabel: "Distribución del presupuesto de la fiesta de fin de año por rubro",
    },
  };
}
