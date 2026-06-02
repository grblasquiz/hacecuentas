export interface FrecuenciaCorteFiltroRcInputs { r: number; c: number; unidadC: string; tipo: string; }
export interface FrecuenciaCorteFiltroRcOutputs { fc: string; fc2: string; fc10: string; fc100: string; atenuacionEnFc: string; resumen: string; _insight?: any; }

const MU: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6 };

function fmtHz(f: number): string {
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
  return f.toFixed(1) + ' Hz';
}

export function frecuenciaCorteFiltroRc(i: FrecuenciaCorteFiltroRcInputs): FrecuenciaCorteFiltroRcOutputs {
  const r = Number(i.r); const c = Number(i.c) * (MU[i.unidadC] ?? 1e-9);
  if (!r || r <= 0 || !c || c <= 0) throw new Error('Ingresá R y C');
  const fc = 1 / (2 * Math.PI * r * c);

  const tipo = String(i.tipo || '').toLowerCase();
  const esPasaBajos = tipo.includes('baj');
  const esPasaAltos = tipo.includes('alt');
  const banda = esPasaBajos
    ? `Deja pasar lo que está **por debajo de ${fmtHz(fc)}** y atenúa lo de arriba`
    : esPasaAltos
    ? `Deja pasar lo que está **por encima de ${fmtHz(fc)}** y atenúa lo de abajo`
    : `Marca la transición de banda en **${fmtHz(fc)}**`;

  return {
    fc: fmtHz(fc), fc2: fmtHz(fc * 2), fc10: fmtHz(fc * 10), fc100: fmtHz(fc * 100),
    atenuacionEnFc: '-3 dB (70.7%)',
    resumen: `fc = ${fmtHz(fc)} (${i.tipo}). Atenuación -3 dB en fc, -20 dB/década fuera de banda.`,
    _insight: {
      title: 'Tu frecuencia de corte',
      text: `Con R = ${r} Ω y C = ${i.c} ${i.unidadC}, la frecuencia de corte es **${fmtHz(fc)}**. ${banda}: justo en fc la señal cae a -3 dB (70,7% de amplitud) y luego desciende a -20 dB por década.`,
      tone: 'neutral',
      icon: '📡',
    },
  };
}
