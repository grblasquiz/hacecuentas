export interface Inputs {
  adultos: number;
  ninos: number;
  intensidad: string; // 'liviano' | 'estandar' | 'abundante'
  incluye_pollo: string; // 'si' | 'no'
  incluye_achuras: string; // 'si' | 'no'
}

export interface Outputs {
  total_kg: number;
  tira_kg: number;
  vacio_kg: number;
  chorizo_cant: number;
  morcilla_cant: number;
  pollo_kg: number;
  achuras_kg: number;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const intensidad = i.intensidad || "estandar";
  const conPollo = i.incluye_pollo === "si";
  const conAchuras = i.incluye_achuras === "si";

  if (adultos === 0 && ninos === 0) {
    return {
      total_kg: 0,
      tira_kg: 0,
      vacio_kg: 0,
      chorizo_cant: 0,
      morcilla_cant: 0,
      pollo_kg: 0,
      achuras_kg: 0,
      resumen: "Ingresá al menos un comensal.",
    };
  }

  // Raciones brutas en gramos (peso crudo a comprar)
  // Fuente: referencia estándar de parrilleros argentinos
  const RACION_ADULTO: Record<string, number> = {
    liviano: 350,
    estandar: 450,
    abundante: 550,
  };
  const RACION_NINO: Record<string, number> = {
    liviano: 200,
    estandar: 250,
    abundante: 300,
  };

  const racionAdulto = RACION_ADULTO[intensidad] ?? 450;
  const racionNino = RACION_NINO[intensidad] ?? 250;

  const total_kg =
    (adultos * racionAdulto + ninos * racionNino) / 1000;

  // Distribución porcentual base
  // Pollo: 25%, Achuras: 20%, Tira: 25%, Vacío: 20%, Embutidos: 10%
  // Sin pollo: +5% tira, +5% vacío (distribuye el 25% de pollo)
  // Sin achuras: +10% tira, +10% vacío (distribuye el 20% de achuras)
  let pctTira = 0.25;
  let pctVacio = 0.20;
  let pctEmbutidos = 0.10;
  let pctPollo = conPollo ? 0.25 : 0.0;
  let pctAchuras = conAchuras ? 0.20 : 0.0;

  if (!conPollo) {
    // Redistribuir 25% de pollo: 12.5% a tira, 12.5% a vacío
    pctTira += 0.125;
    pctVacio += 0.125;
  }
  if (!conAchuras) {
    // Redistribuir 20% de achuras: 10% a tira, 10% a vacío
    pctTira += 0.10;
    pctVacio += 0.10;
  }

  const tira_kg = parseFloat((total_kg * pctTira).toFixed(3));
  const vacio_kg = parseFloat((total_kg * pctVacio).toFixed(3));
  const pollo_kg = parseFloat((total_kg * pctPollo).toFixed(3));
  const achuras_kg = parseFloat((total_kg * pctAchuras).toFixed(3));

  // Embutidos: 60% chorizos (~100g/u), 40% morcillas (~120g/u)
  const embutidos_kg = total_kg * pctEmbutidos;
  const chorizo_kg = embutidos_kg * 0.6;
  const morcilla_kg = embutidos_kg * 0.4;
  const PESO_CHORIZO_G = 100; // gramos por unidad cruda
  const PESO_MORCILLA_G = 120; // gramos por unidad cruda
  const chorizo_cant = Math.ceil((chorizo_kg * 1000) / PESO_CHORIZO_G);
  const morcilla_cant = Math.ceil((morcilla_kg * 1000) / PESO_MORCILLA_G);

  const totalComensales = adultos + ninos;
  const intensidadLabel: Record<string, string> = {
    liviano: "liviano",
    estandar: "estándar",
    abundante: "abundante",
  };

  let resumen =
    `Para ${totalComensales} comensal${totalComensales !== 1 ? "es" : ""} ` +
    `(${adultos} adulto${adultos !== 1 ? "s" : ""}` +
    (ninos > 0 ? ` + ${ninos} niño${ninos !== 1 ? "s" : ""}` : "") +
    `), asado ${intensidadLabel[intensidad] ?? "estándar"}: ` +
    `${total_kg.toFixed(2)} kg totales. ` +
    `Tira: ${tira_kg.toFixed(2)} kg | Vacío: ${vacio_kg.toFixed(2)} kg | ` +
    `Chorizos: ${chorizo_cant} u | Morcillas: ${morcilla_cant} u` +
    (conPollo ? ` | Pollo: ${pollo_kg.toFixed(2)} kg` : "") +
    (conAchuras ? ` | Achuras: ${achuras_kg.toFixed(2)} kg` : "") +
    ".";

  return {
    total_kg: parseFloat(total_kg.toFixed(3)),
    tira_kg,
    vacio_kg,
    chorizo_cant,
    morcilla_cant,
    pollo_kg,
    achuras_kg,
    resumen,
  };
}
