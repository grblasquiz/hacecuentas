export interface Inputs { fechaNacimiento: string; }
export interface Outputs { diasVividos: number; hitos: string; mensaje: string; }
export function edadEnDias(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  if (nac > hoy) throw new Error('La fecha debe ser anterior a hoy');
  const dias = Math.floor((hoy.getTime() - nac.getTime()) / 86400000);
  const hitosArr = [1000,5000,10000,15000,20000,25000,30000];
  const hitos = hitosArr.map(h => {
    if (dias >= h) {
      const f = new Date(nac.getTime() + h * 86400000);
      return `✓ ${h.toLocaleString('es-AR')} días — cumplido el ${f.toLocaleDateString('es-AR')}`;
    }
    const f = new Date(nac.getTime() + h * 86400000);
    return `○ ${h.toLocaleString('es-AR')} días — ${f.toLocaleDateString('es-AR')} (faltan ${h - dias} días)`;
  }).join('\n');
  const pct = Math.round(dias / 30000 * 100);
  const msg = `Viviste ${dias.toLocaleString('es-AR')} días. Eso es el ${pct}% de 30.000 días (~82 años).`;
  return { diasVividos: dias, hitos, mensaje: msg };
}
