export interface Inputs {
  invitados: number;
  momento: string;
  apetito: string;
  hayNinos: string;
  porcentajeNinos: number;
}

export interface Outputs {
  totalEmpanadas: number;
  totalDocenas: number;
  docenasRedondeadas: number;
  empPorPersona: number;
  variedades: string;
}

// Empanadas por persona según ocasión y apetito
// Fuente: estándares de catering gastronómico argentino
const EMP_POR_PERSONA: Record<string, Record<string, number>> = {
  plato_principal: { bajo: 4, moderado: 5, alto: 6 },
  entrada:         { bajo: 2, moderado: 3, alto: 3 },
  picada:          { bajo: 2, moderado: 3, alto: 4 },
};

// Distribución de variedades (proporciones sobre docenas totales)
const VARIEDADES = [
  { nombre: "Carne",          prop: 0.40 },
  { nombre: "Pollo",          prop: 0.25 },
  { nombre: "Jamón y queso",  prop: 0.20 },
  { nombre: "Verdura/Humita", prop: 0.15 },
];

export function compute(i: Inputs): Outputs {
  const invitados = Math.max(0, Math.floor(Number(i.invitados) || 0));
  const momento   = i.momento  || "plato_principal";
  const apetito   = i.apetito  || "moderado";
  const hayNinos  = i.hayNinos || "no";

  if (invitados <= 0) {
    return {
      totalEmpanadas:   0,
      totalDocenas:     0,
      docenasRedondeadas: 0,
      empPorPersona:    0,
      variedades:       "Ingresá la cantidad de invitados.",
    };
  }

  // Porcentaje de niños (solo si hayNinos === "si")
  const pctNinos = hayNinos === "si"
    ? Math.min(100, Math.max(0, Number(i.porcentajeNinos) || 0))
    : 0;

  const fracNinos   = pctNinos / 100;
  const fracAdultos = 1 - fracNinos;

  const adultos = invitados * fracAdultos;
  const ninos   = invitados * fracNinos;

  // Empanadas por persona base
  const tablaOcasion = EMP_POR_PERSONA[momento] ?? EMP_POR_PERSONA["plato_principal"];
  const empBase      = tablaOcasion[apetito]    ?? tablaOcasion["moderado"];

  // Niños comen ~50% que un adulto
  const totalEmpanadas = Math.round(adultos * empBase + ninos * (empBase / 2));

  const totalDocenas       = totalEmpanadas / 12;
  const docenasRedondeadas = Math.ceil(totalDocenas);

  // Distribución de variedades sobre docenas redondeadas
  // Se ajusta el último ítem para que la suma cierre exacto
  let asignadas = 0;
  const lineas: string[] = [];

  VARIEDADES.forEach((v, idx) => {
    let docVar: number;
    if (idx === VARIEDADES.length - 1) {
      // Último: toma el resto para que no haya desfase por redondeo
      docVar = Math.max(0, docenasRedondeadas - asignadas);
    } else {
      docVar = Math.round(docenasRedondeadas * v.prop);
    }
    asignadas += docVar;
    lineas.push(`${v.nombre}: ${docVar} doc. (${docVar * 12} emp.)`);
  });

  const variedades = lineas.join(" | ");

  return {
    totalEmpanadas,
    totalDocenas:        Math.round(totalDocenas * 100) / 100,
    docenasRedondeadas,
    empPorPersona:       empBase,
    variedades,
  };
}
