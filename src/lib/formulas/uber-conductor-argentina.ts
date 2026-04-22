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

  return {
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
  };
}
