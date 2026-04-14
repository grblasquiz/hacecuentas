/** Presupuesto de viaje: gasto total por días y categoría */
export interface Inputs {
  dias: number;
  transporte: number;
  hospedajePorNoche: number;
  comidaPorDia: number;
  actividadesPorDia?: number;
  extrasPorDia?: number;
  personas?: number;
}
export interface Outputs {
  totalTransporte: number;
  totalHospedaje: number;
  totalComida: number;
  totalActividades: number;
  totalExtras: number;
  totalGeneral: number;
  totalPorPersona: number;
  gastoPorDia: number;
}

export function presupuestoViaje(i: Inputs): Outputs {
  const dias = Number(i.dias);
  const transp = Number(i.transporte) || 0;
  const hosp = Number(i.hospedajePorNoche) || 0;
  const comida = Number(i.comidaPorDia) || 0;
  const actv = Number(i.actividadesPorDia) || 0;
  const extras = Number(i.extrasPorDia) || 0;
  const personas = Number(i.personas) || 1;
  if (!dias || dias <= 0) throw new Error('Ingresá los días');

  const tHosp = hosp * (dias - 1 > 0 ? dias - 1 : dias); // noches = días - 1 para viaje típico
  const tComida = comida * dias;
  const tActv = actv * dias;
  const tExtras = extras * dias;

  const total = transp + tHosp + tComida + tActv + tExtras;
  const perPerson = total / personas;
  const porDia = total / dias;

  return {
    totalTransporte: Math.round(transp),
    totalHospedaje: Math.round(tHosp),
    totalComida: Math.round(tComida),
    totalActividades: Math.round(tActv),
    totalExtras: Math.round(tExtras),
    totalGeneral: Math.round(total),
    totalPorPersona: Math.round(perPerson),
    gastoPorDia: Math.round(porDia),
  };
}
