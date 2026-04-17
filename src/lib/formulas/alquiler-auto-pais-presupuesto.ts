/**
 * Calculadora de alquiler de auto por país - presupuesto total.
 * Tarifas promedio 2026 en USD para categoría compacto.
 */

export interface AlquilerAutoPaisPresupuestoInputs {
  pais: string;
  dias: number;
  categoria: string;
  seguroTotal: string;
  kmPorDia: number;
}

export interface AlquilerAutoPaisPresupuestoOutputs {
  totalUSD: number;
  porDia: number;
  desglose: string;
  recomendacion: string;
}

type PaisData = {
  base: number;
  cdw: number;
  naftaLitro: number;
  impuestos: number;
  peajesPorDia: number;
  parkingPorDia: number;
};

const DATOS: Record<string, PaisData> = {
  usa: { base: 45, cdw: 25, naftaLitro: 0.9, impuestos: 0.18, peajesPorDia: 5, parkingPorDia: 10 },
  espana: { base: 35, cdw: 18, naftaLitro: 1.7, impuestos: 0.21, peajesPorDia: 6, parkingPorDia: 12 },
  italia: { base: 40, cdw: 22, naftaLitro: 1.85, impuestos: 0.22, peajesPorDia: 8, parkingPorDia: 15 },
  chile: { base: 40, cdw: 15, naftaLitro: 1.3, impuestos: 0.19, peajesPorDia: 4, parkingPorDia: 6 },
  uruguay: { base: 50, cdw: 18, naftaLitro: 1.8, impuestos: 0.22, peajesPorDia: 3, parkingPorDia: 7 },
  brasil: { base: 35, cdw: 15, naftaLitro: 1.1, impuestos: 0.17, peajesPorDia: 4, parkingPorDia: 8 },
  portugal: { base: 30, cdw: 18, naftaLitro: 1.75, impuestos: 0.23, peajesPorDia: 5, parkingPorDia: 10 },
  mexico: { base: 30, cdw: 25, naftaLitro: 1.15, impuestos: 0.16, peajesPorDia: 4, parkingPorDia: 6 },
  colombia: { base: 35, cdw: 15, naftaLitro: 1.0, impuestos: 0.19, peajesPorDia: 3, parkingPorDia: 5 },
  francia: { base: 45, cdw: 20, naftaLitro: 1.8, impuestos: 0.2, peajesPorDia: 7, parkingPorDia: 15 },
};

const MULT_CATEGORIA: Record<string, number> = {
  economico: 0.85,
  compacto: 1.0,
  intermedio: 1.25,
  suv: 1.7,
};

const CONSUMO_L_100KM: Record<string, number> = {
  economico: 5.5,
  compacto: 6.5,
  intermedio: 7.5,
  suv: 10,
};

export function alquilerAutoPaisPresupuesto(
  inputs: AlquilerAutoPaisPresupuestoInputs,
): AlquilerAutoPaisPresupuestoOutputs {
  const d = DATOS[inputs.pais] ?? DATOS.usa;
  const dias = Math.max(1, Number(inputs.dias) || 1);
  const kmDia = Math.max(0, Number(inputs.kmPorDia) || 0);
  const multCat = MULT_CATEGORIA[inputs.categoria] ?? 1;
  const consumo = CONSUMO_L_100KM[inputs.categoria] ?? 6.5;

  const tarifaDiaria = d.base * multCat;
  const subtotalBase = tarifaDiaria * dias;
  const seguro = inputs.seguroTotal === 'si' ? d.cdw * dias : 0;
  const impuestos = (subtotalBase + seguro) * d.impuestos;

  const kmTotales = kmDia * dias;
  const litros = (kmTotales * consumo) / 100;
  const nafta = litros * d.naftaLitro;

  const peajes = d.peajesPorDia * dias;
  const parking = d.parkingPorDia * dias;

  const total = subtotalBase + seguro + impuestos + nafta + peajes + parking;
  const totalUSD = Math.round(total);
  const porDia = Math.round(total / dias);

  const desglose =
    `Alquiler: USD ${Math.round(subtotalBase)} · ` +
    `Seguro: USD ${Math.round(seguro)} · ` +
    `Impuestos: USD ${Math.round(impuestos)} · ` +
    `Nafta: USD ${Math.round(nafta)} · ` +
    `Peajes: USD ${peajes} · ` +
    `Parking: USD ${parking}`;

  let recomendacion = '';
  if (inputs.seguroTotal === 'no') {
    recomendacion = 'Ojo: sin CDW quedás expuesto a franquicias de USD 1.000+. Considerá seguro externo (RentalCover ~USD 10/día).';
  } else if (porDia > 90) {
    recomendacion = 'Costo alto: buscá retirar fuera del aeropuerto y comparar en Rentalcars para ahorrar 20-30%.';
  } else if (dias >= 7) {
    recomendacion = 'Pedí descuento por alquiler semanal — varias agencias aplican tarifa menor desde 7 días.';
  } else {
    recomendacion = 'Buen presupuesto. Confirmá en 2-3 agencias antes de reservar: los precios varían hasta 40%.';
  }

  return {
    totalUSD,
    porDia,
    desglose,
    recomendacion,
  };
}
