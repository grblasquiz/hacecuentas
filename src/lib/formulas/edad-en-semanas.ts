/** Edad en semanas, días y horas */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { semanas: number; dias: number; horas: number; proximoHito: string; mensaje: string; }

export function edadEnSemanas(i: Inputs): Outputs {
  const nacimiento = new Date(i.fechaNacimiento + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(nacimiento.getTime())) throw new Error('Ingresá una fecha válida');
  if (nacimiento > hoy) throw new Error('La fecha de nacimiento no puede ser futura');

  const diffMs = hoy.getTime() - nacimiento.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(dias / 7);
  const horas = dias * 24;

  // Find next milestone
  const hitos = [1000, 2000, 5000, 7500, 10000, 15000, 20000, 25000, 30000];
  let proximoHito = '';
  for (const h of hitos) {
    if (h > dias) {
      const diasFaltan = h - dias;
      const fechaHito = new Date(nacimiento.getTime() + h * 24 * 60 * 60 * 1000);
      proximoHito = `Día ${h.toLocaleString()}: faltan ${diasFaltan} días (${fechaHito.toLocaleDateString('es-AR')})`;
      break;
    }
  }
  if (!proximoHito) proximoHito = '¡Ya superaste los 30,000 días de vida!';

  const anos = Math.floor(dias / 365.25);

  return {
    semanas, dias, horas, proximoHito,
    mensaje: `Tenés ${anos} años = ${semanas.toLocaleString()} semanas = ${dias.toLocaleString()} días = ~${horas.toLocaleString()} horas de vida.`
  };
}