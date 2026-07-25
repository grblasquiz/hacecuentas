export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vidaMediaDecaimientoRadiactivo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n0 = Number(i.n0); const vm = Number(i.vm); const t = Number(i.t);
  if (!n0 || !vm || t === undefined || Number.isNaN(t)) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  if (vm <= 0) throw new Error(__lang === 'en' ? 'Half-life must be greater than zero' : 'La vida media tiene que ser mayor a cero');
  const vidas = t / vm;
  const fraccion = Math.pow(0.5, vidas);
  const restante = n0 * fraccion;
  const pct = fraccion * 100;
  const resumen = __lang === 'en'
    ? `After ${vidas.toFixed(2)} half-lives, ${restante.toPrecision(4)} remains — ${pct.toFixed(2)}% of the original ${n0}.`
    : `Después de ${vidas.toFixed(2)} vidas medias quedan ${restante.toPrecision(4)} — el ${pct.toFixed(2)}% de los ${n0} iniciales.`;
  const agotado = vidas >= 7;
  const _insight = {
    title: __lang === 'en' ? (agotado ? 'Practically decayed' : 'Still active') : (agotado ? 'Prácticamente agotado' : 'Todavía activo'),
    text: __lang === 'en'
      ? `**${pct.toFixed(2)}%** of the sample is left after ${vidas.toFixed(2)} half-lives.${agotado ? ' Past 7 half-lives less than 1% remains, which is the usual operational threshold for treating a source as spent.' : ` It would take ${(vm * 7).toPrecision(4)} time units in total to drop below 1%.`}`
      : `Queda el **${pct.toFixed(2)}%** de la muestra después de ${vidas.toFixed(2)} vidas medias.${agotado ? ' Pasadas 7 vidas medias queda menos del 1%, que es el umbral operativo habitual para considerar agotada una fuente.' : ` Harían falta ${(vm * 7).toPrecision(4)} unidades de tiempo en total para bajar del 1%.`}`,
    tone: 'neutral',
    icon: '☢️',
  };
  return { restante: restante.toPrecision(4), fraccion: pct.toFixed(2) + '%', vidas: vidas.toFixed(2), resumen, _insight };
}
