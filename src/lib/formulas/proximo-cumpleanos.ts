export interface Inputs { fechaNacimiento: string; }
export interface Outputs { diasFaltan: number; diaSemana: string; edadCumplir: number; mensaje: string; }
const DIAS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export function proximoCumpleanos(i: Inputs): Outputs {
  // Parse date parts manually to avoid UTC-vs-local timezone shift
  const parts = i.fechaNacimiento.split('-');
  if (parts.length !== 3) throw new Error('Ingresá una fecha válida');
  const [nacAnio, nacMes, nacDia] = parts.map(Number);
  if (!nacAnio || !nacMes || !nacDia || nacMes < 1 || nacMes > 12 || nacDia < 1 || nacDia > 31) throw new Error('Ingresá una fecha válida');
  const hoy = new Date();
  let proxAnio = hoy.getFullYear();
  let prox = new Date(proxAnio, nacMes - 1, nacDia);
  if (prox.getTime() <= hoy.getTime()) { proxAnio++; prox = new Date(proxAnio, nacMes - 1, nacDia); }
  const diasFaltan = Math.ceil((prox.getTime() - hoy.getTime()) / 86400000);
  const edadCumplir = proxAnio - nacAnio;
  const diaSemana = DIAS[prox.getDay()];
  const horasFaltan = diasFaltan * 24;
  const msg = `Faltan ${diasFaltan} días (${horasFaltan} horas) para tu cumpleaños #${edadCumplir}. Cae un ${diaSemana}, ${prox.toLocaleDateString('es-AR')}.`;
  return { diasFaltan, diaSemana, edadCumplir, mensaje: msg };
}
