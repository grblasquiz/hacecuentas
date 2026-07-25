export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tiroParabolicoAlcanceAltura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v0 = Number(i.v0); const ang = Number(i.angulo); const g = Number(i.g) || 9.81;
  if (!v0 || ang === undefined || Number.isNaN(ang)) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  if (ang < 0 || ang > 90) throw new Error(__lang === 'en' ? 'Angle must be between 0 and 90 degrees' : 'El ángulo tiene que estar entre 0 y 90 grados');
  const rad = (ang * Math.PI) / 180;
  const vx = v0 * Math.cos(rad);
  const vy = v0 * Math.sin(rad);
  const t = (2 * vy) / g;
  const alcance = (v0 * v0 * Math.sin(2 * rad)) / g;
  const altura = (v0 * v0 * Math.pow(Math.sin(rad), 2)) / (2 * g);
  const complementario = 90 - ang;
  const resumen = __lang === 'en'
    ? `Range ${alcance.toFixed(2)} m, peak height ${altura.toFixed(2)} m, ${t.toFixed(2)} s in the air (horizontal ${vx.toFixed(2)} m/s, vertical ${vy.toFixed(2)} m/s).`
    : `Alcance ${alcance.toFixed(2)} m, altura máxima ${altura.toFixed(2)} m, ${t.toFixed(2)} s en el aire (horizontal ${vx.toFixed(2)} m/s, vertical ${vy.toFixed(2)} m/s).`;
  const optimo = Math.abs(ang - 45) < 0.5;
  const _insight = {
    title: __lang === 'en' ? (optimo ? 'Maximum range angle' : 'Projectile trajectory') : (optimo ? 'Ángulo de alcance máximo' : 'Trayectoria del proyectil'),
    text: __lang === 'en'
      ? `${optimo ? 'At 45° the range is as far as this launch speed can reach on level ground.' : `Launching at ${complementario.toFixed(1)}° instead would land at the exact same ${alcance.toFixed(2)} m — complementary angles share their range — but with a very different flight path.`} Range scales with v₀², so a 10% faster launch buys 21% more distance.`
      : `${optimo ? 'A 45° el alcance es lo más lejos que puede llegar esta velocidad de salida en terreno plano.' : `Lanzar a ${complementario.toFixed(1)}° caería exactamente a los mismos ${alcance.toFixed(2)} m — los ángulos complementarios comparten alcance — pero con una trayectoria muy distinta.`} El alcance escala con v₀², así que un 10% más de velocidad da un 21% más de distancia.`,
    tone: 'neutral',
    icon: '🏹',
  };
  return {
    alcance: alcance.toFixed(2),
    altura: altura.toFixed(2) + ' m',
    tiempo: t.toFixed(2) + ' s',
    componentes: `vx ${vx.toFixed(2)} m/s · vy ${vy.toFixed(2)} m/s`,
    resumen, _insight,
  };
}
