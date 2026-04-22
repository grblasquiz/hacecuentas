/** Ganancia neta Uber driver Chile — tarifa - comisión 25% + gas + peajes + mantenimiento */
export interface Inputs {
  tarifasBrutas: number; // CLP
  propinas: number;
  kmRecorridos: number;
  consumoKmPorLitro: number;
  precioBencinaLitro: number; // CLP/L
  mantenimientoPorKm: number; // CLP/km
  peajesPeriodo: number; // CLP
  horasTrabajadas: number;
  emiteBoletaHonorarios: boolean; // retención 14,5% provisional
}

export interface Outputs {
  ingresoBrutoClp: string;
  comisionUberClp: string;
  retencionBoletaClp: string;
  costoBencinaClp: string;
  costoMantenimientoClp: string;
  peajesClp: string;
  gananciaNetaClp: string;
  gananciaPorHoraClp: string;
  gananciaNeta: number;
  gananciaPorHora: number;
}

function formatClp(n: number): string {
  return 'CLP $' + Math.round(n).toLocaleString('es-CL');
}

export function uberDriverChile(i: Inputs): Outputs {
  const tarifas = Number(i.tarifasBrutas) || 0;
  const propinas = Number(i.propinas) || 0;
  const km = Number(i.kmRecorridos) || 0;
  const consumo = Number(i.consumoKmPorLitro) || 11;
  const precio = Number(i.precioBencinaLitro) || 1300;
  const mantKm = Number(i.mantenimientoPorKm) || 120;
  const peajes = Number(i.peajesPeriodo) || 0;
  const horas = Number(i.horasTrabajadas) || 0;
  const boleta = Boolean(i.emiteBoletaHonorarios);

  if (tarifas < 0 || km < 0 || horas < 0 || consumo <= 0) {
    throw new Error('Valores inválidos');
  }

  const ingresoBruto = tarifas + propinas;
  const comisionUber = tarifas * 0.25;
  // Boleta honorarios 2026 Chile: 14,5% retención provisional (SII incrementó al 15% escalonado)
  const retencion = boleta ? (tarifas - comisionUber) * 0.145 : 0;

  const litros = km / consumo;
  const costoBencina = litros * precio;
  const costoMant = km * mantKm;

  const gananciaNeta = ingresoBruto - comisionUber - retencion - costoBencina - costoMant - peajes;
  const gananciaHora = horas > 0 ? gananciaNeta / horas : 0;

  return {
    ingresoBrutoClp: formatClp(ingresoBruto),
    comisionUberClp: formatClp(comisionUber),
    retencionBoletaClp: formatClp(retencion),
    costoBencinaClp: formatClp(costoBencina),
    costoMantenimientoClp: formatClp(costoMant),
    peajesClp: formatClp(peajes),
    gananciaNetaClp: formatClp(gananciaNeta),
    gananciaPorHoraClp: formatClp(gananciaHora),
    gananciaNeta: Math.round(gananciaNeta),
    gananciaPorHora: Math.round(gananciaHora),
  };
}
