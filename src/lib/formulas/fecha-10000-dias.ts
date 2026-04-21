export interface Inputs { fechaNacimiento: string; }
export interface Outputs { fecha10000: string; fecha20000: string; fecha30000: string; diasVividos: number; mensaje: string; }
export function fecha10000Dias(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  const diasVividos = Math.round((hoy.getTime() - nac.getTime()) / 86400000);
  function fechaHito(d: number): string {
    const f = new Date(nac.getTime() + d * 86400000);
    const pasado = f <= hoy;
    return `${f.toLocaleDateString('es-AR')}${pasado ? ' (¡ya lo cumpliste!)' : ` (faltan ${d - diasVividos} días)`}`;
  }
  const msgs: string[] = [];
  if (diasVividos < 10000) msgs.push(`Te faltan ${10000 - diasVividos} días para el gran hito de 10.000.`);
  else if (diasVividos < 20000) msgs.push(`Ya pasaste los 10.000 días. Próximo hito: 20.000 (faltan ${20000 - diasVividos}).`);
  else if (diasVividos < 30000) msgs.push(`Ya pasaste los 20.000 días. Próximo hito: 30.000 (faltan ${30000 - diasVividos}).`);
  else msgs.push('¡Pasaste los 30.000 días! Sos un/a campeón/a de la longevidad.');
  return { fecha10000: fechaHito(10000), fecha20000: fechaHito(20000), fecha30000: fechaHito(30000), diasVividos, mensaje: msgs[0] };
}
