export interface Inputs {
  fechaNacimiento: string;
  fechaConsulta: string;
}

export interface Outputs {
  edadActual: string;
  tablaVacunas: string;
  proximaVacuna: string;
  vacunasAtrasadas: string;
  advertencia: string;
}

interface VacunaEntry {
  nombre: string;
  detalle: string;
  offsetMeses: number; // meses desde el nacimiento
  toleranciaDias: number; // días de gracia para considerar "a término"
}

// Calendario Nacional de Vacunación Argentina 2026
// Fuente: Ministerio de Salud de la Nación / DiCEI
const CALENDARIO: VacunaEntry[] = [
  // Recién nacido (0 meses)
  { nombre: "BCG", detalle: "Tuberculosis (1 dosis, RN)", offsetMeses: 0, toleranciaDias: 30 },
  { nombre: "Hepatitis B (1ª dosis)", detalle: "Dentro de las primeras 12 h de vida", offsetMeses: 0, toleranciaDias: 30 },

  // 2 meses
  { nombre: "Pentavalente (1ª)", detalle: "Difteria, Tétanos, Tos convulsa, Hib, Hep B", offsetMeses: 2, toleranciaDias: 30 },
  { nombre: "Salk IPV (1ª)", detalle: "Polio inactivada", offsetMeses: 2, toleranciaDias: 30 },
  { nombre: "Rotavirus (1ª)", detalle: "Gastroenteritis por rotavirus", offsetMeses: 2, toleranciaDias: 30 },
  { nombre: "Neumococo 13v (1ª)", detalle: "Enfermedad neumocócica", offsetMeses: 2, toleranciaDias: 30 },
  { nombre: "Meningococo B (1ª)", detalle: "Meningococo tipo B", offsetMeses: 2, toleranciaDias: 30 },

  // 4 meses
  { nombre: "Pentavalente (2ª)", detalle: "Difteria, Tétanos, Tos convulsa, Hib, Hep B", offsetMeses: 4, toleranciaDias: 30 },
  { nombre: "Salk IPV (2ª)", detalle: "Polio inactivada", offsetMeses: 4, toleranciaDias: 30 },
  { nombre: "Rotavirus (2ª)", detalle: "Gastroenteritis por rotavirus", offsetMeses: 4, toleranciaDias: 30 },
  { nombre: "Neumococo 13v (2ª)", detalle: "Enfermedad neumocócica", offsetMeses: 4, toleranciaDias: 30 },
  { nombre: "Meningococo B (2ª)", detalle: "Meningococo tipo B", offsetMeses: 4, toleranciaDias: 30 },

  // 6 meses
  { nombre: "Pentavalente (3ª)", detalle: "Difteria, Tétanos, Tos convulsa, Hib, Hep B", offsetMeses: 6, toleranciaDias: 30 },
  { nombre: "Salk IPV (3ª)", detalle: "Polio inactivada", offsetMeses: 6, toleranciaDias: 30 },
  { nombre: "Meningococo ACWY (1ª)", detalle: "Meningococo cuadrivalente", offsetMeses: 6, toleranciaDias: 30 },
  { nombre: "Influenza (1ª dosis)", detalle: "Gripe — 1ª dosis en el primer año de vida", offsetMeses: 6, toleranciaDias: 60 },

  // 7 meses
  { nombre: "Influenza (2ª dosis)", detalle: "Gripe — 2ª dosis, solo en el primer año de vida", offsetMeses: 7, toleranciaDias: 60 },

  // 12 meses
  { nombre: "Neumococo 13v (refuerzo)", detalle: "Refuerzo enfermedad neumocócica", offsetMeses: 12, toleranciaDias: 60 },
  { nombre: "Meningococo B (refuerzo)", detalle: "Refuerzo meningococo tipo B", offsetMeses: 12, toleranciaDias: 60 },
  { nombre: "Triple Viral SRP (1ª)", detalle: "Sarampión, Rubéola, Paperas", offsetMeses: 12, toleranciaDias: 60 },

  // 15 meses
  { nombre: "Meningococo ACWY (2ª)", detalle: "Meningococo cuadrivalente", offsetMeses: 15, toleranciaDias: 60 },
  { nombre: "Varicela (1ª)", detalle: "Varicela", offsetMeses: 15, toleranciaDias: 60 },

  // 18 meses
  { nombre: "Pentavalente (refuerzo)", detalle: "Refuerzo DTP + Hib + Hep B", offsetMeses: 18, toleranciaDias: 60 },
  { nombre: "Sabin OPV (1er refuerzo)", detalle: "Polio oral", offsetMeses: 18, toleranciaDias: 60 },
  { nombre: "Triple Bacteriana Celular (DTP)", detalle: "Difteria, Tétanos, Tos convulsa", offsetMeses: 18, toleranciaDias: 60 },

  // 24 meses
  { nombre: "Hepatitis A (1ª)", detalle: "Hepatitis A", offsetMeses: 24, toleranciaDias: 60 },

  // 5 años (60 meses) — ingreso escolar
  { nombre: "Triple Viral SRP (2ª)", detalle: "Sarampión, Rubéola, Paperas — ingreso escolar", offsetMeses: 60, toleranciaDias: 180 },
  { nombre: "Triple Bacteriana Acelular (dTpa)", detalle: "Refuerzo DTP acelular — ingreso escolar", offsetMeses: 60, toleranciaDias: 180 },
  { nombre: "Sabin OPV (2do refuerzo)", detalle: "Polio oral — ingreso escolar", offsetMeses: 60, toleranciaDias: 180 },
  { nombre: "Varicela (2ª)", detalle: "Varicela — ingreso escolar", offsetMeses: 60, toleranciaDias: 180 },

  // 11 años (132 meses) — adolescencia
  { nombre: "HPV (1ª dosis)", detalle: "Virus del Papiloma Humano — 11 años", offsetMeses: 132, toleranciaDias: 180 },
  { nombre: "HPV (2ª dosis)", detalle: "Virus del Papiloma Humano — 6 meses después de la 1ª", offsetMeses: 138, toleranciaDias: 180 },
  { nombre: "Meningococo ACWY (adolesc.)", detalle: "Refuerzo meningococo cuadrivalente", offsetMeses: 132, toleranciaDias: 180 },
  { nombre: "Triple Bacteriana Acelular (dTpa)", detalle: "Refuerzo adolescencia", offsetMeses: 132, toleranciaDias: 180 },
  { nombre: "Hepatitis B (si esquema incompleto)", detalle: "Completar esquema en adolescentes no vacunados", offsetMeses: 132, toleranciaDias: 365 },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function diffMeses(desde: Date, hasta: Date): number {
  return (
    (hasta.getFullYear() - desde.getFullYear()) * 12 +
    (hasta.getMonth() - desde.getMonth())
  );
}

function edadLegible(nacimiento: Date, consulta: Date): string {
  const totalMeses = diffMeses(nacimiento, consulta);
  if (totalMeses < 0) return "Fecha inválida";
  if (totalMeses < 1) {
    const dias = Math.floor((consulta.getTime() - nacimiento.getTime()) / 86400000);
    return `${dias} día${dias !== 1 ? "s" : ""}`;
  }
  if (totalMeses < 24) {
    const meses = totalMeses;
    return `${meses} mes${meses !== 1 ? "es" : ""}`;
  }
  const anios = Math.floor(totalMeses / 12);
  const mesesResto = totalMeses % 12;
  if (mesesResto === 0) return `${anios} año${anios !== 1 ? "s" : ""}`;
  return `${anios} año${anios !== 1 ? "s" : ""} y ${mesesResto} mes${mesesResto !== 1 ? "es" : ""}`;
}

export function compute(i: Inputs): Outputs {
  // --- Validar fechaNacimiento ---
  const fnStr = i.fechaNacimiento ? String(i.fechaNacimiento).trim() : "";
  if (!fnStr) {
    return {
      edadActual: "",
      tablaVacunas: "",
      proximaVacuna: "",
      vacunasAtrasadas: "",
      advertencia: "Ingresá la fecha de nacimiento del niño/a para generar el calendario.",
    };
  }

  const nacimiento = new Date(fnStr);
  if (isNaN(nacimiento.getTime())) {
    return {
      edadActual: "",
      tablaVacunas: "",
      proximaVacuna: "",
      vacunasAtrasadas: "",
      advertencia: "La fecha de nacimiento ingresada no es válida.",
    };
  }

  // --- Fecha de consulta ---
  const hoyRaw = i.fechaConsulta ? String(i.fechaConsulta).trim() : "";
  const hoy = hoyRaw && !isNaN(new Date(hoyRaw).getTime()) ? new Date(hoyRaw) : new Date();

  // Normalizar a medianoche
  nacimiento.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  if (nacimiento > hoy) {
    return {
      edadActual: "",
      tablaVacunas: "",
      proximaVacuna: "",
      vacunasAtrasadas: "",
      advertencia: "La fecha de nacimiento no puede ser posterior a la fecha de consulta.",
    };
  }

  // Límite: calendario hasta 13 años
  const MESES_MAX = 156; // 13 años
  const mesesVida = diffMeses(nacimiento, hoy);

  const edadActual = edadLegible(nacimiento, hoy);

  // --- Construir tabla ---
  const filas: string[] = [];
  const atrasadas: string[] = [];
  let proximaFecha: Date | null = null;
  let proximaNombre = "";

  // Agrupar por offsetMeses para mostrar juntas las del mismo momento
  // pero las procesamos individualmente
  for (const v of CALENDARIO) {
    // Si el niño ya superó ampliamente el calendario completo, omitir
    if (mesesVida > MESES_MAX + 12) break;

    const fechaVacuna = addMonths(nacimiento, v.offsetMeses);
    fechaVacuna.setHours(0, 0, 0, 0);

    const diffDias = Math.floor(
      (hoy.getTime() - fechaVacuna.getTime()) / 86400000
    );

    let estado: string;
    let emoji: string;

    if (diffDias > v.toleranciaDias) {
      // Fecha ya pasó (con tolerancia)
      estado = "Aplicada (aprox.)";
      emoji = "✅";
    } else if (diffDias >= -60 && diffDias <= v.toleranciaDias) {
      // Dentro de la ventana: próxima o en curso
      if (diffDias >= 0) {
        estado = "Corresponde ahora";
        emoji = "🔔";
      } else {
        estado = `En ${Math.abs(diffDias)} días`;
        emoji = "⏰";
      }
      // Registrar próxima vacuna (la más cercana en el futuro o presente)
      if (
        proximaFecha === null ||
        fechaVacuna.getTime() < proximaFecha.getTime()
      ) {
        proximaFecha = fechaVacuna;
        proximaNombre = v.nombre;
      }
    } else if (diffDias < -60) {
      // Futuro lejano
      estado = "Pendiente";
      emoji = "📅";
    } else {
      estado = "Pendiente";
      emoji = "📅";
    }

    // Detectar atrasadas: ya pasó la tolerancia pero aún en rango de vida del niño
    if (
      diffDias > v.toleranciaDias &&
      v.offsetMeses <= mesesVida &&
      estado === "Aplicada (aprox.)"
    ) {
      // Solo marcamos atrasadas las que "probablemente" no se hayan aplicado
      // usando una ventana muy amplia: si la fecha superó la tolerancia en más de 60 días adicionales
      if (diffDias > v.toleranciaDias + 60) {
        // probablemente ya aplicada, no la marcamos atrasada
      }
    }

    // Marcar explícitamente atrasadas: pasó la tolerancia Y no hubo tiempo de catch-up
    // Usamos: si diffDias entre toleranciaDias y toleranciaDias + 90 → posible atraso
    if (diffDias > v.toleranciaDias && diffDias <= v.toleranciaDias + 90) {
      atrasadas.push(`${v.nombre} (correspondía el ${formatDate(fechaVacuna)})`);
      estado = "⚠️ Posible atraso";
      emoji = "⚠️";
    }

    // Solo mostrar vacunas hasta 13 años
    if (v.offsetMeses <= MESES_MAX) {
      // Edad en que corresponde
      let edadLabel = "";
      if (v.offsetMeses === 0) {
        edadLabel = "Recién nacido";
      } else if (v.offsetMeses < 24) {
        edadLabel = `${v.offsetMeses} meses`;
      } else if (v.offsetMeses % 12 === 0) {
        const anios = v.offsetMeses / 12;
        edadLabel = `${anios} año${anios !== 1 ? "s" : ""}`;
      } else {
        const anios = Math.floor(v.offsetMeses / 12);
        const mesesR = v.offsetMeses % 12;
        edadLabel = `${anios}a ${mesesR}m`;
      }

      filas.push(
        `${emoji} | ${edadLabel} | ${formatDate(fechaVacuna)} | ${v.nombre} | ${v.detalle} | ${estado.replace("⚠️ ", "")}`
      );
    }
  }

  // --- Próxima vacuna ---
  let proximaVacunaStr = "";
  if (proximaFecha !== null) {
    const diffProxima = Math.floor(
      (proximaFecha.getTime() - hoy.getTime()) / 86400000
    );
    if (diffProxima > 0) {
      proximaVacunaStr = `${proximaNombre} — ${formatDate(proximaFecha)} (en ${diffProxima} días)`;
    } else if (diffProxima === 0) {
      proximaVacunaStr = `${proximaNombre} — ¡Hoy corresponde aplicarla!`;
    } else {
      proximaVacunaStr = `${proximaNombre} — ${formatDate(proximaFecha)} (hace ${Math.abs(diffProxima)} días)`;
    }
  } else if (mesesVida > MESES_MAX) {
    proximaVacunaStr = "El niño/a superó el calendario pediátrico estándar (13 años). Consultá el esquema de adultos.";
  } else {
    proximaVacunaStr = "No hay vacunas próximas detectadas en los próximos 60 días.";
  }

  // --- Vacunas atrasadas ---
  const vacunasAtrasadasStr =
    atrasadas.length > 0
      ? atrasadas.join(" | ")
      : "No se detectan atrasos evidentes. Verificá el carnet de vacunación.";

  // --- Tabla como texto (separador |) ---
  const header =
    "Estado | Edad | Fecha | Vacuna | Descripción | Estado detallado";
  const separador = "---|---|---|---|---|---";
  const tablaVacunas = [header, separador, ...filas].join("\n");

  // --- Advertencia general ---
  const advertencia =
    "Esta calculadora es orientativa. Verificá siempre el carnet de vacunación y consultá al pediatra o vacunatorio para confirmar el estado vacunal real de tu hijo/a.";

  return {
    edadActual,
    tablaVacunas,
    proximaVacuna: proximaVacunaStr,
    vacunasAtrasadas: vacunasAtrasadasStr,
    advertencia,
  };
}
