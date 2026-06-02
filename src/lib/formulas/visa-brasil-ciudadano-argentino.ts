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
  _insight?: any;
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
    return {
      documentosNecesarios: "Pasaporte + visa larga duración",
      requiereVisa: "Sí - estadía >90 días",
      observaciones: obs,
      _insight: {
        title: 'Necesitás visa',
        text: `Una estadía de **${dias} días** supera los 90 de turismo, así que **necesitás visa de larga duración** sin importar la nacionalidad. Gestionala en el consulado antes de viajar.`,
        tone: 'warn',
        icon: '🛂',
      },
    };
  }
  if (MERCOSUR.includes(nac)) {
    return {
      documentosNecesarios: "DNI vigente (tarjeta) o pasaporte",
      requiereVisa: "No (Mercosur)",
      observaciones: obs,
      _insight: {
        title: 'Sin visa por Mercosur',
        text: `Siendo **${nac}** y por **${dias} días**, entrás a Brasil **sin visa** por el acuerdo Mercosur: te alcanza con el **DNI vigente** (tarjeta) o pasaporte.`,
        tone: 'good',
        icon: '🛂',
      },
    };
  }
  if (CON_VISA.includes(nac)) {
    return {
      documentosNecesarios: "Pasaporte + eVisa USD 80",
      requiereVisa: "Sí - eVisa online desde 2025",
      observaciones: obs,
      _insight: {
        title: 'Tramitá la eVisa',
        text: `Siendo **${nac}**, desde 2025 necesitás **eVisa** (≈ **USD 80**) para entrar a Brasil, aun por solo ${dias} días. Se tramita online antes de viajar.`,
        tone: 'warn',
        icon: '🛂',
      },
    };
  }
  return {
    documentosNecesarios: "Pasaporte vigente",
    requiereVisa: "No (turismo <90 días)",
    observaciones: obs,
    _insight: {
      title: 'Sin visa para turismo',
      text: `Para una estadía turística de **${dias} días** (menos de 90), entrás **sin visa** con **pasaporte vigente**. Verificá la vigencia mínima requerida al ingresar.`,
      tone: 'good',
      icon: '🛂',
    },
  };
}
