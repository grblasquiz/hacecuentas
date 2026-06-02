/** Cafeína por método */
export interface Inputs { metodo: string; mlTaza: number; tazasPorDia: number; }
export interface Outputs { cafeinaPorTaza: number; cafeinaDiaria: number; porcentajeLimite: number; evaluacion: string; equivalencias: string; _insight?: any; _chart?: any; }

export function cafeinaPorMetodoTaza(i: Inputs): Outputs {
  const m = String(i.metodo);
  const ml = Number(i.mlTaza);
  const tazas = Number(i.tazasPorDia);
  if (!ml || ml <= 0) throw new Error('Ingresá ml');
  if (!isFinite(tazas) || tazas < 0) throw new Error('Ingresá tazas');

  const mgPorMl: Record<string, number> = {
    espresso: 2.1, ristretto: 2.5, lungo: 1.6,
    v60: 0.6, french_press: 0.65, aeropress: 0.7,
    moka: 1.0, cold_brew_concentrado: 1.0, cold_brew_listo: 0.5,
    instantaneo: 0.25, descafeinado: 0.01,
  };
  const mg = (mgPorMl[m] ?? 0.6) * ml;
  const diaria = mg * tazas;
  const pct = (diaria / 400) * 100;

  let eval_ = '';
  if (diaria < 100) eval_ = 'Bajo consumo';
  else if (diaria < 200) eval_ = 'Moderado — seguro';
  else if (diaria < 400) eval_ = 'Alto — dentro del límite FDA';
  else if (diaria < 600) eval_ = 'Excedido — reducí';
  else eval_ = 'Excesivo — riesgo de taquicardia, ansiedad, insomnio';

  const equiv = `${(diaria / 80).toFixed(1)} espressos o ${(diaria / 150).toFixed(1)} V60 estándar`;

  const diariaR = Number(diaria.toFixed(0));
  const pctR = Number(pct.toFixed(0));
  const tone = diaria < 200 ? 'good' : diaria < 400 ? 'neutral' : 'warn';
  const text = diaria < 400
    ? `Con esa rutina tomás **${diariaR} mg/día** de cafeína, el **${pctR}%** del límite de 400 mg. ${diaria < 200 ? 'Margen cómodo.' : 'Estás dentro, pero sin mucho colchón.'}`
    : `Tomás **${diariaR} mg/día**, el **${pctR}%** del límite de 400 mg. Pasaste el tope: bajá una taza o cambiá a un método más liviano para evitar nervios e insomnio.`;
  const _insight = { title: 'Tu cafeína diaria', text, tone, icon: '☕' };

  const _chart = {
    type: 'scale',
    marker: diariaR,
    markerLabel: `${diariaR} mg`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 100, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Moderado', max: 200, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Límite FDA', max: 400, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Excedido', max: 600, color: '#f97316', colorDark: '#ea580c' },
      { nombre: 'Excesivo', max: Math.max(800, Math.floor(diariaR / 100) * 100 + 100), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Escala de cafeína diaria: ${diariaR} mg sobre un límite seguro de 400 mg`,
  };

  return {
    cafeinaPorTaza: Number(mg.toFixed(0)),
    cafeinaDiaria: diariaR,
    porcentajeLimite: pctR,
    evaluacion: eval_,
    equivalencias: equiv,
    _insight,
    _chart,
  };
}
