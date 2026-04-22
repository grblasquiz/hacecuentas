/** Ganancia neta Uber driver México — tarifa - comisión 25% - IVA 16% - ISR retenido - gasolina */
export interface Inputs {
  tarifasBrutas: number; // MXN
  propinas: number;
  kmRecorridos: number;
  consumoKmPorLitro: number;
  precioGasolinaLitro: number; // MXN/L
  mantenimientoPorKm: number; // MXN/km
  horasTrabajadas: number;
  rfcRegistrado: boolean; // si tiene RFC, Uber retiene IVA 8% + ISR 2.1%
}

export interface Outputs {
  ingresoBrutoMxn: string;
  comisionUberMxn: string;
  retencionIvaMxn: string;
  retencionIsrMxn: string;
  costoGasolinaMxn: string;
  costoMantenimientoMxn: string;
  gananciaNetaMxn: string;
  gananciaPorHoraMxn: string;
  gananciaNeta: number;
  gananciaPorHora: number;
}

function formatMxn(n: number): string {
  return 'MXN ' + Math.round(n).toLocaleString('es-MX');
}

export function uberDriverMexico(i: Inputs): Outputs {
  const tarifas = Number(i.tarifasBrutas) || 0;
  const propinas = Number(i.propinas) || 0;
  const km = Number(i.kmRecorridos) || 0;
  const consumo = Number(i.consumoKmPorLitro) || 12;
  const precio = Number(i.precioGasolinaLitro) || 24;
  const mantKm = Number(i.mantenimientoPorKm) || 2;
  const horas = Number(i.horasTrabajadas) || 0;
  const rfc = Boolean(i.rfcRegistrado);

  if (tarifas < 0 || km < 0 || horas < 0 || consumo <= 0) {
    throw new Error('Valores inválidos');
  }

  const ingresoBruto = tarifas + propinas;
  const comisionUber = tarifas * 0.25;
  // Retención IVA 8% y ISR 2.1% sobre tarifa si RFC (régimen plataformas tecnológicas)
  // Si no RFC: retención IVA 16% completo + ISR 20% (penalizante)
  const retencionIVA = rfc ? tarifas * 0.08 : tarifas * 0.16;
  const retencionISR = rfc ? tarifas * 0.021 : tarifas * 0.20;

  const litros = km / consumo;
  const costoGas = litros * precio;
  const costoMant = km * mantKm;

  const gananciaNeta = ingresoBruto - comisionUber - retencionIVA - retencionISR - costoGas - costoMant;
  const gananciaHora = horas > 0 ? gananciaNeta / horas : 0;

  return {
    ingresoBrutoMxn: formatMxn(ingresoBruto),
    comisionUberMxn: formatMxn(comisionUber),
    retencionIvaMxn: formatMxn(retencionIVA),
    retencionIsrMxn: formatMxn(retencionISR),
    costoGasolinaMxn: formatMxn(costoGas),
    costoMantenimientoMxn: formatMxn(costoMant),
    gananciaNetaMxn: formatMxn(gananciaNeta),
    gananciaPorHoraMxn: formatMxn(gananciaHora),
    gananciaNeta: Math.round(gananciaNeta),
    gananciaPorHora: Math.round(gananciaHora),
  };
}
