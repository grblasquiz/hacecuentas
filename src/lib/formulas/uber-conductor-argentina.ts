/** Ganancia neta Uber conductor Argentina — tarifa - comisión 25% - IVA 21% - IIBB - combustible - mantenimiento */
export interface Inputs {
  tarifasBrutas: number; // ARS totales del viaje (cobrado a pasajero)
  propinas: number; // ARS
  kmRecorridos: number;
  consumoKmPorLitro: number; // km/L
  precioNaftaLitro: number; // ARS
  mantenimientoPorKm: number; // ARS/km (aceite, gomas, frenos)
  horasTrabajadas: number;
  regimenFiscal: 'monotributo' | 'responsableInscripto' | 'ninguno';
  alicuotaIIBB: number; // % (ej: 3 para CABA)
}

export interface Outputs {
  ingresoBrutoArs: string;
  comisionUberArs: string;
  ivaArs: string;
  iibbArs: string;
  costoNaftaArs: string;
  costoMantenimientoArs: string;
  gananciaNetaArs: string;
  gananciaPorHoraArs: string;
  gananciaNeta: number;
  gananciaPorHora: number;
  _insight?: any;
  _chart?: any;
}

function formatArs(n: number): string {
  const rounded = Math.round(n);
  return 'ARS ' + rounded.toLocaleString('es-AR');
}

export function uberConductorArgentina(i: Inputs): Outputs {
  const tarifas = Number(i.tarifasBrutas) || 0;
  const propinas = Number(i.propinas) || 0;
  const km = Number(i.kmRecorridos) || 0;
  const consumo = Number(i.consumoKmPorLitro) || 10;
  const precioNafta = Number(i.precioNaftaLitro) || 1500;
  const mantKm = Number(i.mantenimientoPorKm) || 80;
  const horas = Number(i.horasTrabajadas) || 0;
  const regimen = i.regimenFiscal || 'monotributo';
  const iibbPct = Number(i.alicuotaIIBB) || 0;

  if (tarifas < 0 || km < 0 || horas < 0 || consumo <= 0) {
    throw new Error('Valores inválidos: revisá tarifas, km, horas y consumo.');
  }

  const ingresoBruto = tarifas + propinas;
  // Comisión Uber 25% sobre tarifa (no sobre propinas)
  const comisionUber = tarifas * 0.25;
  // IVA 21% solo si responsable inscripto (monotributo exento hasta tope)
  const baseIVA = tarifas - comisionUber;
  const iva = regimen === 'responsableInscripto' ? baseIVA * 0.21 : 0;
  // Ingresos brutos provincial (sobre tarifas, no propinas)
  const iibb = tarifas * (iibbPct / 100);
  // Nafta
  const litros = consumo > 0 ? km / consumo : 0;
  const costoNafta = litros * precioNafta;
  // Mantenimiento
  const costoMant = km * mantKm;

  const gananciaNeta = ingresoBruto - comisionUber - iva - iibb - costoNafta - costoMant;
  const gananciaHora = horas > 0 ? gananciaNeta / horas : 0;

  const margenPct = ingresoBruto > 0 ? (gananciaNeta / ingresoBruto) * 100 : 0;
  const tone = gananciaNeta <= 0 ? 'warn' : margenPct < 40 ? 'warn' : 'good';
  const insText = gananciaNeta <= 0
    ? `Con estos números **perdés plata**: de **${formatArs(ingresoBruto)}** facturados, comisión, impuestos y costos del auto se llevan más de lo que entra (**${formatArs(gananciaNeta)}** neto).`
    : horas > 0
    ? `De **${formatArs(ingresoBruto)}** facturados te quedan **${formatArs(gananciaNeta)}** netos (**${margenPct.toFixed(0)}%**), o sea **${formatArs(gananciaHora)}/hora** tras comisión, impuestos, nafta y mantenimiento.`
    : `De **${formatArs(ingresoBruto)}** facturados te quedan **${formatArs(gananciaNeta)}** netos (**${margenPct.toFixed(0)}%**) después de comisión, impuestos, nafta y mantenimiento.`;
  const _insight = { title: 'Tu ganancia real', text: insText, tone, icon: '🚗' };

  const out: Outputs = {
    ingresoBrutoArs: formatArs(ingresoBruto),
    comisionUberArs: formatArs(comisionUber),
    ivaArs: formatArs(iva),
    iibbArs: formatArs(iibb),
    costoNaftaArs: formatArs(costoNafta),
    costoMantenimientoArs: formatArs(costoMant),
    gananciaNetaArs: formatArs(gananciaNeta),
    gananciaPorHoraArs: formatArs(gananciaHora),
    gananciaNeta: Math.round(gananciaNeta),
    gananciaPorHora: Math.round(gananciaHora),
    _insight,
  };

  // Donut: bruto = neto + comisión + IVA + IIBB + nafta + mantenimiento (sólo si neto >= 0)
  if (gananciaNeta >= 0 && ingresoBruto > 0) {
    const slices = [
      { label: 'Ganancia neta', value: Math.round(gananciaNeta) },
      { label: 'Comisión Uber', value: Math.round(comisionUber) },
      { label: 'IVA', value: Math.round(iva) },
      { label: 'IIBB', value: Math.round(iibb) },
      { label: 'Nafta', value: Math.round(costoNafta) },
      { label: 'Mantenimiento', value: Math.round(costoMant) },
    ].filter((s) => s.value > 0);
    out._chart = {
      type: 'doughnut',
      slices,
      prefix: 'ARS ',
      centerValue: formatArs(ingresoBruto),
      centerLabel: 'facturado',
      ariaLabel: `Cómo se reparte lo facturado: ganancia neta y costos (comisión, impuestos, nafta y mantenimiento)`,
    };
  }

  return out;
}
