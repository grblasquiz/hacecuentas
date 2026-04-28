// Calculadora IRNR No Residentes — Alquiler de Vivienda España 2026
// Fuente: RDLeg 5/2004 (LIRNR), AEAT sede electrónica

export interface Inputs {
  zona_fiscal: 'ue_eee' | 'no_ue';        // UE/EEE → 19%, resto → 24%
  renta_anual_bruta: number;              // Renta bruta total anual en €
  modo_calculo: 'anual' | 'trimestral';   // Si es trimestral, renta_anual_bruta es ya del trimestre
  gastos_deducibles: number;              // Solo aplicable si zona_fiscal = 'ue_eee'
  porcentaje_propiedad: number;           // 1-100, porcentaje del inmueble en propiedad
}

export interface Outputs {
  tipo_gravamen: number;                  // Porcentaje (19 o 24)
  renta_tributable_anual: number;         // Base imponible anual en €
  cuota_anual: number;                    // Cuota íntegra anual en €
  cuota_trimestral: number;               // Cuota por trimestre en €
  ahorro_gastos: number;                  // Ahorro fiscal por gastos deducidos en €
  plazo_presentacion: string;             // Texto con los 4 plazos
  aviso_regimen: string;                  // Descripción del régimen aplicado
}

export function compute(i: Inputs): Outputs {
  // --- Constantes IRNR 2026 (art. 25 LIRNR) ---
  const TIPO_UE_EEE = 0.19;   // Residentes UE, Islandia, Noruega, Liechtenstein
  const TIPO_RESTO = 0.24;    // Resto del mundo

  // --- Validaciones y normalización ---
  const rentaBruta = Math.max(0, i.renta_anual_bruta ?? 0);
  const gastos = Math.max(0, i.gastos_deducibles ?? 0);
  const pctPropiedad = Math.min(100, Math.max(1, i.porcentaje_propiedad ?? 100)) / 100;
  const esUE = i.zona_fiscal === 'ue_eee';
  const esTrimestral = i.modo_calculo === 'trimestral';

  // Si el modo es trimestral, extrapolamos a anual para cálculos internos
  // y luego dividimos de nuevo; así la interfaz es coherente
  const rentaBrutaAnual = esTrimestral ? rentaBruta * 4 : rentaBruta;
  const gastosAnuales = esTrimestral ? gastos * 4 : gastos;

  // --- Tipo de gravamen ---
  const tipoGravamen = esUE ? TIPO_UE_EEE : TIPO_RESTO;

  // --- Base imponible (art. 24 LIRNR) ---
  // UE/EEE: renta × %propiedad − gastos deducibles proporcionales
  // Resto:  renta × %propiedad (sin deducción alguna)
  const rentaPropietario = rentaBrutaAnual * pctPropiedad;
  const gastosPropietario = esUE ? Math.min(gastosAnuales * pctPropiedad, rentaPropietario) : 0;
  // La base imponible no puede ser negativa (no se permite compensar pérdidas entre trimestres en IRNR sin EP)
  const baseImponibleAnual = Math.max(0, rentaPropietario - gastosPropietario);

  // --- Cuotas ---
  const cuotaAnual = baseImponibleAnual * tipoGravamen;
  const cuotaTrimestral = cuotaAnual / 4;

  // --- Ahorro por gastos deducidos ---
  // Solo tiene sentido para UE/EEE; para el resto es siempre 0
  const ahorroGastos = esUE ? gastosPropietario * tipoGravamen : 0;

  // --- Plazos de presentación modelo 210 ---
  const plazoPresentacion =
    '1.º trim. (ene-mar): 1-20 abril | ' +
    '2.º trim. (abr-jun): 1-20 julio | ' +
    '3.º trim. (jul-sep): 1-20 octubre | ' +
    '4.º trim. (oct-dic): 1-20 enero (año siguiente)';

  // --- Aviso de régimen ---
  let avisoRegimen: string;
  if (esUE) {
    avisoRegimen =
      'Régimen UE/EEE — tipo del 19 %. Gastos directamente relacionados con ' +
      'la obtención del rendimiento son deducibles (IBI, comunidad, seguros, ' +
      'reparaciones, intereses hipotecarios, amortización 3 % del valor de construcción). ' +
      'Modelo 210, clave de renta 01.';
  } else {
    avisoRegimen =
      'Régimen general (países fuera de la UE/EEE) — tipo del 24 %. La base imponible ' +
      'es la renta bruta sin deducción de gastos, con independencia de los costes ' +
      'reales soportados. Modelo 210, clave de renta 01. Verifica si existe convenio ' +
      'de doble imposición entre España y tu país de residencia.';
  }

  // --- Redondeo a 2 decimales (céntimos de euro) ---
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    tipo_gravamen: tipoGravamen * 100,
    renta_tributable_anual: round2(baseImponibleAnual),
    cuota_anual: round2(cuotaAnual),
    cuota_trimestral: round2(cuotaTrimestral),
    ahorro_gastos: round2(ahorroGastos),
    plazo_presentacion: plazoPresentacion,
    aviso_regimen: avisoRegimen,
  };
}
