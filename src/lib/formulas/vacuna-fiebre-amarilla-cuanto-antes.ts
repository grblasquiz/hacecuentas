/**
 * Calculadora Fiebre Amarilla: cuándo aplicarla
 */
export interface VacunaFiebreAmarillaCuantoAntesInputs {
  fechaViaje: number;
  destinoObligatorio: string;
  tieneDosis: string;
}
export interface VacunaFiebreAmarillaCuantoAntesOutputs {
  tiempoRestante: string;
  diasAntes: number;
  validezInternacional: string;
  _insight?: any;
  _chart?: any;
}

// Gauge: anticipación en días respecto del umbral de 10 días (la dosis tarda 10 días en dar inmunidad válida).
function gaugeDias(dias: number) {
  return {
    type: 'scale',
    marker: dias,
    markerLabel: `${dias} día${dias === 1 ? '' : 's'} de margen`,
    min: 0,
    segments: [
      { nombre: 'No alcanza', max: 10, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Válido (≥10 días)', max: Math.max(30, dias + 1), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Margen de ${dias} días frente al umbral de 10 días que la vacuna necesita para dar inmunidad válida internacionalmente.`,
  };
}

export function vacunaFiebreAmarillaCuantoAntes(i: VacunaFiebreAmarillaCuantoAntesInputs): VacunaFiebreAmarillaCuantoAntesOutputs {
  const dias = Number(i.fechaViaje);
  const obl = String(i.destinoObligatorio || "si") === "si";
  const tiene = String(i.tieneDosis || "no") === "si";
  if (isNaN(dias) || dias < 0) throw new Error("Días inválidos");
  if (tiene) {
    return {
      tiempoRestante: "Ya vacunado - inmunidad vigente",
      diasAntes: 0,
      validezInternacional: "Válido de por vida (OMS 2016)",
      _insight: {
        title: 'Ya estás cubierto',
        text: 'Tenés la dosis aplicada: la inmunidad de la fiebre amarilla es **de por vida** con una sola dosis (OMS 2016). Tu certificado internacional sigue **vigente** sin necesidad de revacunarte.',
        tone: 'good',
        icon: '✅',
      },
    };
  }
  if (dias < 10) {
    return {
      tiempoRestante: obl ? "URGENTE - NO TE ALCANZA el tiempo (<10 días)" : "Insuficiente - aplicá si es preventiva",
      diasAntes: dias,
      validezInternacional: "NO válido internacionalmente si <10 días",
      _insight: {
        title: obl ? 'No llegás a tiempo' : 'Margen insuficiente',
        text: `Faltan **${dias} día${dias === 1 ? '' : 's'}** para el viaje y la vacuna necesita **10 días** para dar inmunidad válida. ` + (obl
          ? 'Como el destino la **exige**, sin esos 10 días el certificado **no es válido** y pueden negarte el ingreso: aplicala igual y consultá si podés reprogramar.'
          : 'No vas a estar protegido a tiempo; aplicala de todos modos por prevención post-viaje.'),
        tone: 'warn',
        icon: '⚠️',
      },
      _chart: gaugeDias(dias),
    };
  }
  return {
    tiempoRestante: "Vacunate YA - tenés margen suficiente",
    diasAntes: dias,
    validezInternacional: "Válido de por vida (una sola dosis según OMS 2016)",
    _insight: {
      title: 'Llegás con margen',
      text: `Tenés **${dias} día${dias === 1 ? '' : 's'}** antes del viaje, por encima de los **10 días** que la vacuna tarda en hacer efecto. Vacunate cuanto antes y el certificado queda **válido de por vida**.`,
      tone: 'good',
      icon: '🟢',
    },
    _chart: gaugeDias(dias),
  };
}
