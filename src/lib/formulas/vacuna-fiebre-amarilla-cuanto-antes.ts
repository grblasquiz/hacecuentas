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
}
export function vacunaFiebreAmarillaCuantoAntes(i: VacunaFiebreAmarillaCuantoAntesInputs): VacunaFiebreAmarillaCuantoAntesOutputs {
  const dias = Number(i.fechaViaje);
  const obl = String(i.destinoObligatorio || "si") === "si";
  const tiene = String(i.tieneDosis || "no") === "si";
  if (isNaN(dias) || dias < 0) throw new Error("Días inválidos");
  if (tiene) {
    return { tiempoRestante: "Ya vacunado - inmunidad vigente", diasAntes: 0, validezInternacional: "Válido de por vida (OMS 2016)" };
  }
  if (dias < 10) {
    return {
      tiempoRestante: obl ? "URGENTE - NO TE ALCANZA el tiempo (<10 días)" : "Insuficiente - aplicá si es preventiva",
      diasAntes: dias,
      validezInternacional: "NO válido internacionalmente si <10 días"
    };
  }
  return {
    tiempoRestante: "Vacunate YA - tenés margen suficiente",
    diasAntes: dias,
    validezInternacional: "Válido de por vida (una sola dosis según OMS 2016)"
  };
}
