/** Conversor: metro cuadrado ↔ ladrillo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLadrillosPorMetroCuadrado(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 65.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros cuadrados'; toLabel = 'ladrillos';
  } else {
    r = v / factor;
    fromLabel = 'ladrillos'; toLabel = 'metros cuadrados';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Estimación de obra',
    text: d === 'ida'
      ? 'Para **' + v + ' m²** de pared vas a necesitar unos **' + rTxt + ' ladrillos** comunes (≈ 65 por m² en pared de 0,15 m). Sumá un **5–10 % extra** por roturas y cortes.'
      : '**' + v + ' ladrillos** alcanzan para cubrir aprox. **' + rTxt + ' m²** de pared. Es una guía: el rinde real cambia con el espesor del muro y el grosor de la junta.',
    tone: 'neutral',
    icon: '🧱'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'ladrillos'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
