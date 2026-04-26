/** Impuesto a pagar según residencia fiscal y país de cliente para nómada digital */
export interface Inputs { paisResidencia: string; paisCliente: string; ingresoAnualUsd: number; tipoEstructura: string; }
export interface Outputs { impuestoEstimadoUsd: number; tasaEfectivaPct: number; ingresoNetoUsd: number; tieneRiesgoDobleImposicion: boolean; explicacion: string; }
export function nomadaDigitalResidenciaFiscalImpuestos(i: Inputs): Outputs {
  const residencia = String(i.paisResidencia || '').toUpperCase();
  const cliente = String(i.paisCliente || '').toUpperCase();
  const ingreso = Number(i.ingresoAnualUsd);
  const estructura = String(i.tipoEstructura || '').toLowerCase();
  if (!ingreso || ingreso <= 0) throw new Error('Ingresá el ingreso anual en USD');
  // Tasa efectiva aprox por residencia fiscal 2026 (incluye income tax + social)
  const tasaResidencia: Record<string, number> = {
    'AR': 0.35, 'UY': 0.07, 'PT': 0.20, 'ES': 0.40, 'MX': 0.25, 'CO': 0.22,
    'PA': 0.05, 'AE': 0.0, 'PY': 0.10, 'GE': 0.01, 'EE': 0.20, 'US': 0.30, 'BR': 0.27, 'CL': 0.18,
  };
  // Multiplicador por estructura
  const multEstructura: Record<string, number> = {
    'persona-fisica': 1, 'monotributo': 0.5, 'sociedad-local': 0.85, 'llc-us': 0.7, 'sociedad-offshore': 0.4,
  };
  const tasa = (tasaResidencia[residencia] ?? 0.25) * (multEstructura[estructura] ?? 1);
  const impuesto = ingreso * tasa;
  const neto = ingreso - impuesto;
  // Riesgo doble imposición si cliente y residencia ambos tienen impuestos altos y no hay CDI
  const cdiPaises = ['AR', 'ES', 'UY', 'BR', 'MX', 'CL', 'US', 'DE', 'FR', 'UK'];
  const riesgo = (tasaResidencia[cliente] ?? 0) > 0.15 && !cdiPaises.includes(cliente);
  return {
    impuestoEstimadoUsd: Number(impuesto.toFixed(0)),
    tasaEfectivaPct: Number((tasa * 100).toFixed(1)),
    ingresoNetoUsd: Number(neto.toFixed(0)),
    tieneRiesgoDobleImposicion: riesgo,
    explicacion: `Residente fiscal ${residencia} con cliente ${cliente}, estructura ${estructura}: tasa efectiva ${(tasa*100).toFixed(1)}% → impuesto USD ${impuesto.toFixed(0)}, neto USD ${neto.toFixed(0)}.`,
  };
}
