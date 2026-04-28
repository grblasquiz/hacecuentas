export interface Inputs {
  categoria_profesional: 'camarero' | 'ayudante_cocina' | 'jefe_rango' | 'recepcionista' | 'gobernanta' | 'cocinero' | 'encargado_sector';
  provincia: 'madrid' | 'barcelona' | 'malaga' | 'valencia' | 'palma_mallorca' | 'sevilla' | 'bilbao' | 'otras';
  tipo_jornada: 'completa' | 'parcial_30' | 'parcial_20';
  tiene_nocturnidad: boolean;
  trabajados_festivos_mes: number;
  antiguedad_anos: number;
  pagas_extraordinarias: boolean;
}

export interface Outputs {
  salario_base_mensual: number;
  plus_nocturnidad: number;
  plus_festivos: number;
  plus_antiguedad: number;
  bruto_total_mensual: number;
  cotizacion_seguridad_social: number;
  retencion_irpf: number;
  neto_mensual: number;
  anual_bruto_equivalente: number;
  anual_neto_equivalente: number;
  salario_minimo_vigente: number;
  desglose_retencion: string;
}

export function compute(i: Inputs): Outputs {
  // CCNH 2024-2026 salarios base mensuales por categoría y provincia (€)
  // Fuente: BOE 2024, Acuerdo Sectorial Hostelería
  const salarios: { [key: string]: { [key: string]: number } } = {
    camarero: {
      madrid: 1380,
      barcelona: 1350,
      malaga: 1310,
      valencia: 1330,
      palma_mallorca: 1360,
      sevilla: 1320,
      bilbao: 1340,
      otras: 1345
    },
    ayudante_cocina: {
      madrid: 1280,
      barcelona: 1245,
      malaga: 1210,
      valencia: 1230,
      palma_mallorca: 1260,
      sevilla: 1220,
      bilbao: 1240,
      otras: 1245
    },
    jefe_rango: {
      madrid: 1550,
      barcelona: 1510,
      malaga: 1470,
      valencia: 1490,
      palma_mallorca: 1530,
      sevilla: 1480,
      bilbao: 1510,
      otras: 1510
    },
    recepcionista: {
      madrid: 1400,
      barcelona: 1370,
      malaga: 1330,
      valencia: 1350,
      palma_mallorca: 1380,
      sevilla: 1340,
      bilbao: 1360,
      otras: 1365
    },
    gobernanta: {
      madrid: 1480,
      barcelona: 1450,
      malaga: 1410,
      valencia: 1430,
      palma_mallorca: 1460,
      sevilla: 1420,
      bilbao: 1440,
      otras: 1445
    },
    cocinero: {
      madrid: 1420,
      barcelona: 1395,
      malaga: 1355,
      valencia: 1375,
      palma_mallorca: 1405,
      sevilla: 1365,
      bilbao: 1385,
      otras: 1385
    },
    encargado_sector: {
      madrid: 1620,
      barcelona: 1580,
      malaga: 1540,
      valencia: 1560,
      palma_mallorca: 1600,
      sevilla: 1550,
      bilbao: 1570,
      otras: 1580
    }
  };

  // Factor prorrateo jornada (CCNH art. 30)
  const factorJornada: { [key: string]: number } = {
    completa: 1.0,    // 40h/semana
    parcial_30: 0.75, // 30h/semana = 75%
    parcial_20: 0.5   // 20h/semana = 50%
  };

  // 1. Obtener salario base (CCNH 2024-2026)
  const salarioBase = salarios[i.categoria_profesional][i.provincia] || salarios[i.categoria_profesional]['otras'];
  const salarioBaseProrrateo = salarioBase * factorJornada[i.tipo_jornada];

  // 2. Plus de nocturnidad (CCNH art. 27: 15% del base)
  const plusNocturnidad = i.tiene_nocturnidad ? salarioBaseProrrateo * 0.15 : 0;

  // 3. Plus de festivos (CCNH art. 28: 50% del salario diario por cada festivo)
  // Salario diario = base / 30
  const salarioDiario = salarioBaseProrrateo / 30;
  const plusFestivos = salarioDiario * 0.5 * Math.min(i.trabajados_festivos_mes, 10);

  // 4. Plus de antigüedad (CCNH art. 33: 1% acumulativo desde año 1, máximo 20%)
  const antigüedadPorc = Math.min(i.antiguedad_anos * 0.01, 0.20);
  const plusAntiguedad = salarioBaseProrrateo * antigüedadPorc;

  // 5. Bruto mensual total
  const brutoTotal = salarioBaseProrrateo + plusNocturnidad + plusFestivos + plusAntiguedad;

  // 6. Cotización Seguridad Social (2026: 6,35% contingencias comunes, TGSS)
  const cotizacionSS = brutoTotal * 0.0635;

  // 7. IRPF 2026 (tramos AEAT - soltero, sin hijos, sin deducciones especiales)
  // Fuente: Agencia Tributaria 2026
  let irpf = 0;
  const brutomensual = brutoTotal;
  let tramoPorcentaje = 0;
  let cuotaFija = 0;
  let exceso = 0;

  if (brutomensual <= 560) {
    irpf = 0;
    tramoPorcentaje = 0;
  } else if (brutomensual <= 1100) {
    cuotaFija = 50.4;
    tramoPorcentaje = 0.09;
    exceso = brutomensual - 560;
    irpf = cuotaFija + exceso * tramoPorcentaje;
  } else if (brutomensual <= 1500) {
    cuotaFija = 104.28;
    tramoPorcentaje = 0.12;
    exceso = brutomensual - 1100;
    irpf = cuotaFija + exceso * tramoPorcentaje;
  } else if (brutomensual <= 2000) {
    cuotaFija = 154.28;
    tramoPorcentaje = 0.15;
    exceso = brutomensual - 1500;
    irpf = cuotaFija + exceso * tramoPorcentaje;
  } else if (brutomensual <= 2500) {
    cuotaFija = 229.28;
    tramoPorcentaje = 0.19;
    exceso = brutomensual - 2000;
    irpf = cuotaFija + exceso * tramoPorcentaje;
  } else {
    cuotaFija = 324.28;
    tramoPorcentaje = 0.21;
    exceso = brutomensual - 2500;
    irpf = cuotaFija + exceso * tramoPorcentaje;
  }

  irpf = Math.round(irpf * 100) / 100;

  // 8. Neto mensual
  const netoMensual = Math.round((brutoTotal - cotizacionSS - irpf) * 100) / 100;

  // 9. Anuales (14 pagas: 12 mensuales + 2 extraordinarias repartidas)
  const factorPagas = i.pagas_extraordinarias ? 14 : 12;
  const anualbrutEquiv = Math.round(brutoTotal * factorPagas * 100) / 100;
  const anualnetoEquiv = Math.round(netoMensual * factorPagas * 100) / 100;

  // 10. SMI 2026 (referencia: RD 2025, Gobierno España = 1.260€)
  const smi2026 = 1260;

  // 11. Desglose retención detallado
  let desglose = '';
  desglose += `Bruto mensual: ${brutoTotal.toFixed(2)}€\n`;
  desglose += `Cotización SS (6,35%): −${cotizacionSS.toFixed(2)}€\n`;
  desglose += `Tramo IRPF (${(tramoPorcentaje * 100).toFixed(0)}%): −${irpf.toFixed(2)}€\n`;
  desglose += `Neto: ${netoMensual.toFixed(2)}€`;

  return {
    salario_base_mensual: Math.round(salarioBaseProrrateo * 100) / 100,
    plus_nocturnidad: Math.round(plusNocturnidad * 100) / 100,
    plus_festivos: Math.round(plusFestivos * 100) / 100,
    plus_antiguedad: Math.round(plusAntiguedad * 100) / 100,
    bruto_total_mensual: Math.round(brutoTotal * 100) / 100,
    cotizacion_seguridad_social: Math.round(cotizacionSS * 100) / 100,
    retencion_irpf: irpf,
    neto_mensual: netoMensual,
    anual_bruto_equivalente: anualbrutEquiv,
    anual_neto_equivalente: anualnetoEquiv,
    salario_minimo_vigente: smi2026,
    desglose_retencion: desglose
  };
}
