/**
 * Calculadora Visa Brasil
 */
export interface VisaBrasilCiudadanoArgentinoInputs {
  nacionalidad: string;
  diasEstadia: number;
  esMenorEdad: string;
}
export interface VisaBrasilCiudadanoArgentinoOutputs {
  documentosNecesarios: string;
  requiereVisa: string;
  observaciones: string;
}
const MERCOSUR = ["argentino", "chileno", "uruguayo", "paraguayo", "boliviano", "colombiano", "peruano", "venezolano"];
const CON_VISA = ["estadounidense", "canadiense", "australiano"];
export function visaBrasilCiudadanoArgentino(i: VisaBrasilCiudadanoArgentinoInputs): VisaBrasilCiudadanoArgentinoOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const dias = Number(i.diasEstadia);
  const menor = String(i.esMenorEdad || "no") === "si";
  if (!dias || dias <= 0) throw new Error("Días inválidos");
  let obs = menor ? "Menor: autorización de ambos padres apostillada." : "Llevar pasaje de vuelta y comprobante de alojamiento.";
  if (dias > 90) {
    return { documentosNecesarios: "Pasaporte + visa larga duración", requiereVisa: "Sí - estadía >90 días", observaciones: obs };
  }
  if (MERCOSUR.includes(nac)) {
    return { documentosNecesarios: "DNI vigente (tarjeta) o pasaporte", requiereVisa: "No (Mercosur)", observaciones: obs };
  }
  if (CON_VISA.includes(nac)) {
    return { documentosNecesarios: "Pasaporte + eVisa USD 80", requiereVisa: "Sí - eVisa online desde 2025", observaciones: obs };
  }
  return { documentosNecesarios: "Pasaporte vigente", requiereVisa: "No (turismo <90 días)", observaciones: obs };
}
