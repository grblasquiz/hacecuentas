/**
 * Calculadora de Fiesta de Halloween - Presupuesto.
 */
export interface PresupuestoHalloweenCostumesInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoHalloweenCostumesOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoDecoracion:number;
  costoComidaBebida:number;
  costoDisfracesMaquillaje:number;
  costoDulcesTrickTreat:number;
  costoMusicaShow:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoHalloweenCostumes(inputs: PresupuestoHalloweenCostumesInputs): PresupuestoHalloweenCostumesOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 35;
  if (nivel === 'basico') costoPorInvitado = 15;
  else if (nivel === 'premium') costoPorInvitado = 80;
  const costoTotal = inv * costoPorInvitado;
  const costoDecoracion = Math.round(costoTotal * 0.3);
  const costoComidaBebida = Math.round(costoTotal * 0.3);
  const costoDisfracesMaquillaje = Math.round(costoTotal * 0.2);
  const costoDulcesTrickTreat = Math.round(costoTotal * 0.1);
  const costoMusicaShow = costoTotal - costoDecoracion - costoComidaBebida - costoDisfracesMaquillaje - costoDulcesTrickTreat;
  const nivelLabel = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  return {
    costoTotal,
    costoPorInvitado,
    costoDecoracion,
    costoComidaBebida,
    costoDisfracesMaquillaje,
    costoDulcesTrickTreat,
    costoMusicaShow,
    _insight: {
      title: "Tu fiesta de Halloween en números",
      text: `Armar un Halloween **${nivelLabel}** para **${inv.toLocaleString("es-AR")} invitados** cuesta unos **$${costoTotal.toLocaleString("es-AR")}** (**$${costoPorInvitado}/persona**). Decoración y comida se llevan el **60%**: la decoración DIY es la forma más fácil de recortar sin que se note.`,
      tone: "neutral",
      icon: "🎃",
    },
    _chart: {
      type: "doughnut",
      slices: [
        { label: "Decoración", value: costoDecoracion },
        { label: "Comida y bebida", value: costoComidaBebida },
        { label: "Disfraces y maquillaje", value: costoDisfracesMaquillaje },
        { label: "Dulces", value: costoDulcesTrickTreat },
        { label: "Música y show", value: costoMusicaShow },
      ],
      prefix: "$",
      centerValue: `$${costoTotal.toLocaleString("es-AR")}`,
      centerLabel: "Costo total",
      ariaLabel: "Distribución del presupuesto de la fiesta de Halloween por rubro",
    },
  };
}
