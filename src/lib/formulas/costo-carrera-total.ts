/** Calculadora Costo Total Carrera */
export interface Inputs { cuotaMensual: number; matriculaAnual: number; materialesMes: number; transporteMes: number; duracionAnos: number; }
export interface Outputs { costoTotal: number; costoAnual: number; costoMensual: number; desglose: string; }

export function costoCarreraTotal(i: Inputs): Outputs {
  const cuota = Number(i.cuotaMensual);
  const matricula = Number(i.matriculaAnual);
  const materiales = Number(i.materialesMes);
  const transporte = Number(i.transporteMes);
  const anos = Number(i.duracionAnos);
  if (anos <= 0) throw new Error('La duración debe ser mayor a 0');

  const meses = anos * 12;
  const costoMensual = cuota + materiales + transporte;
  const costoAnual = costoMensual * 12 + matricula;
  const costoTotal = costoAnual * anos;

  const cuotaTotal = cuota * meses;
  const matriculaTotal = matricula * anos;
  const materialesTotal = materiales * meses;
  const transporteTotal = transporte * meses;

  return {
    costoTotal: Number(costoTotal.toFixed(0)),
    costoAnual: Number(costoAnual.toFixed(0)),
    costoMensual: Number(costoMensual.toFixed(0)),
    desglose: `Cuotas: $${cuotaTotal.toFixed(0)} | Matrículas: $${matriculaTotal.toFixed(0)} | Materiales: $${materialesTotal.toFixed(0)} | Transporte: $${transporteTotal.toFixed(0)}`,
  };
}
