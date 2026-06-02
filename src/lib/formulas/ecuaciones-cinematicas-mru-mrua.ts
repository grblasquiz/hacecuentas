export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function ecuacionesCinematicasMruMrua(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v0 = Number(i.v0) || 0; const a = Number(i.a) || 0;
  const t = Number(i.t) || 0; const d0 = Number(i.d) || 0;
  if (!a || !t) throw new Error(__lang === 'en' ? 'Enter a and t' : 'Ingresá a y t');
  const v = v0 + a * t;
  const d = v0 * t + 0.5 * a * t * t;
  const resumen = __lang === 'en'
    ? `With v₀=${v0} and a=${a} m/s²: in ${t}s → v=${v.toFixed(1)} m/s and d=${d.toFixed(1)} m.`
    : `Con v₀=${v0} y a=${a} m/s²: en ${t}s → v=${v.toFixed(1)} m/s y d=${d.toFixed(1)} m.`;
  const acelera = a > 0;
  const _insight = {
    title: __lang === 'en' ? 'The movement' : 'El movimiento',
    text: __lang === 'en'
      ? `Starting at **${v0} m/s** and ${acelera ? 'accelerating' : 'decelerating'} at **${a} m/s²**, after **${t}s** the object reaches **${v.toFixed(2)} m/s** having travelled **${d.toFixed(2)} m**. ${v < 0 ? 'Negative final velocity: it reversed direction.' : ''}`.trim()
      : `Partiendo de **${v0} m/s** y ${acelera ? 'acelerando' : 'frenando'} a **${a} m/s²**, tras **${t}s** el móvil llega a **${v.toFixed(2)} m/s** habiendo recorrido **${d.toFixed(2)} m**. ${v < 0 ? 'Velocidad final negativa: invirtió el sentido.' : ''}`.trim(),
    tone: 'neutral',
    icon: '🚀',
  };
  return { vFinal: v.toFixed(2) + ' m/s', distancia: d.toFixed(2) + ' m', resumen, _insight };
}
