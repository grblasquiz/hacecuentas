/** Cafeína por método */
export interface Inputs { metodo: string; mlTaza: number; tazasPorDia: number; }
export interface Outputs { cafeinaPorTaza: number; cafeinaDiaria: number; porcentajeLimite: number; evaluacion: string; equivalencias: string; }

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

  return {
    cafeinaPorTaza: Number(mg.toFixed(0)),
    cafeinaDiaria: Number(diaria.toFixed(0)),
    porcentajeLimite: Number(pct.toFixed(0)),
    evaluacion: eval_,
    equivalencias: equiv,
  };
}
