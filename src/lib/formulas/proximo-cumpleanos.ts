export interface Inputs { fechaNacimiento: string; }
export interface Outputs { diasFaltan: number; diaSemana: string; edadCumplir: number; mensaje: string; }
const DIAS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export function proximoCumpleanos(i: Inputs): Outputs {
  const nac = new Date(i.fechaNacimiento);
  const hoy = new Date();
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  let proxAnio = hoy.getFullYear();
  let prox = new Date(proxAnio, nac.getMonth(), nac.getDate());
  if (prox.getTime() <= hoy.getTime()) { proxAnio++; prox = new Date(proxAnio, nac.getMonth(), nac.getDate()); }
  const diasFaltan = Math.ceil((prox.getTime() - hoy.getTime()) / 86400000);
  const edadCumplir = proxAnio - nac.getFullYear();
  const diaSemana = DIAS[prox.getDay()];
  const horasFaltan = diasFaltan * 24;
  const msg = `Faltan ${diasFaltan} días (${horasFaltan} horas) para tu cumpleaños #${edadCumplir}. Cae un ${diaSemana}, ${prox.toLocaleDateString('es-AR')}.`;
  return { diasFaltan, diaSemana, edadCumplir, mensaje: msg };
}
