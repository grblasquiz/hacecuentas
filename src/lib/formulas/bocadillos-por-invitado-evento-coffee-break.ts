export interface Inputs {
  invitados: number;
  duracion: string;
  momento: string;
  incluirFrutas: string;
}

export interface Outputs {
  bocadillosTotales: number;
  medialunas: number;
  sandwiches: number;
  masasSecas: number;
  tortaPorciones: number;
  frutasKg: number;
  cafeLitros: number;
  jugoLitros: number;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  const invitados = Math.round(Number(i.invitados) || 0);

  if (invitados <= 0) {
    return {
      bocadillosTotales: 0,
      medialunas: 0,
      sandwiches: 0,
      masasSecas: 0,
      tortaPorciones: 0,
      frutasKg: 0,
      cafeLitros: 0,
      jugoLitros: 0,
      resumen: "Ingresá un número de invitados válido.",
    };
  }

  // Factor de bocadillos por persona según duración (estándar de catering)
  const FACTOR_CORTO = 4;      // hasta 30 min
  const FACTOR_ESTANDAR = 5;   // 30-60 min
  const FACTOR_EXTENDIDO = 6;  // 60-90 min

  let factorBocadillos: number;
  let labelDuracion: string;
  switch (i.duracion) {
    case "corto":
      factorBocadillos = FACTOR_CORTO;
      labelDuracion = "hasta 30 min";
      break;
    case "extendido":
      factorBocadillos = FACTOR_EXTENDIDO;
      labelDuracion = "60–90 min";
      break;
    case "estandar":
    default:
      factorBocadillos = FACTOR_ESTANDAR;
      labelDuracion = "30–60 min";
      break;
  }

  // Proporción dulce/salado según momento del día
  // Mañana: 60% dulces, 40% salados
  // Tarde:  40% dulces, 60% salados
  let propDulce: number;
  let propSalado: number;
  let labelMomento: string;
  if (i.momento === "tarde") {
    propDulce = 0.40;
    propSalado = 0.60;
    labelMomento = "tarde";
  } else {
    propDulce = 0.60;
    propSalado = 0.40;
    labelMomento = "mañana";
  }

  // Totales
  const bocadillosTotales = invitados * factorBocadillos;
  const totalDulces = bocadillosTotales * propDulce;
  const totalSalados = bocadillosTotales * propSalado;

  // Distribución dulces
  // 50% medialunas/facturas, 30% masas secas/cookies, 20% torta/budín
  const PROP_MEDIALUNAS = 0.50;
  const PROP_MASAS = 0.30;
  const PROP_TORTA = 0.20;

  const medialunas = Math.ceil(totalDulces * PROP_MEDIALUNAS);
  const masasSecas = Math.ceil(totalDulces * PROP_MASAS);
  const tortaPorciones = Math.ceil(totalDulces * PROP_TORTA);

  // Distribución salados: 100% sandwiches mini
  const sandwiches = Math.ceil(totalSalados);

  // Bebidas y frutas
  // Café: ~60 ml por persona (1 taza estándar)
  const CAFE_ML_POR_PERSONA = 0.06; // litros
  // Jugo/agua: ~80 ml por persona
  const JUGO_ML_POR_PERSONA = 0.08; // litros
  // Frutas: ~40 g por persona
  const FRUTAS_KG_POR_PERSONA = 0.04;

  const cafeLitros = parseFloat((invitados * CAFE_ML_POR_PERSONA).toFixed(1));
  const jugoLitros = parseFloat((invitados * JUGO_ML_POR_PERSONA).toFixed(1));
  const frutasKg = i.incluirFrutas === "si"
    ? parseFloat((invitados * FRUTAS_KG_POR_PERSONA).toFixed(2))
    : 0;

  // Resumen textual
  const frutasTexto = i.incluirFrutas === "si"
    ? ` | Frutas: ${frutasKg} kg`
    : " | Sin fuente de frutas";

  const resumen =
    `${invitados} personas | Coffee break de ${labelDuracion} (${labelMomento}) | ` +
    `${factorBocadillos} bocadillos/persona | ` +
    `Dulces: ${Math.round(totalDulces)} | Salados: ${Math.round(totalSalados)}` +
    frutasTexto +
    ` | Café: ${cafeLitros} L | Jugos/agua: ${jugoLitros} L`;

  return {
    bocadillosTotales,
    medialunas,
    sandwiches,
    masasSecas,
    tortaPorciones,
    frutasKg,
    cafeLitros,
    jugoLitros,
    resumen,
  };
}
