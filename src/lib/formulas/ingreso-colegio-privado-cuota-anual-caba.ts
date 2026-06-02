export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ingresoColegioPrivadoCuotaAnualCaba(i: Inputs): Outputs {
  const n=String(i.nivel||'primaria'); const t=String(i.tipoColegio||'bilinguie');
  const base={'bilinguie_premium':1200000,'bilinguie':650000,'tradicional':350000,'no_tradicional':500000}[t];
  const multNivel={'inicial':0.85,'primaria':1,'secundaria':1.15}[n];
  const cm=base*multNivel; const anual=cm*10+cm*1.5; // 10 cuotas + extras aprox
  const cuotasAnio = cm * 10;
  const extrasAnio = cm * 1.5;
  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');

  const tipoTxt = ({'bilinguie_premium':'bilingüe premium','bilinguie':'bilingüe','tradicional':'tradicional','no_tradicional':'no tradicional'}[t]) || 'bilingüe';
  const _insight = {
    title: 'Lo que cuesta el año escolar',
    text: `Un colegio **${tipoTxt}** de ${n} ronda **${fmt(cm)}/mes** de cuota. Sumando las 10 cuotas y los extras (matrícula, uniformes, cooperadora, viajes), el año te sale aprox. **${fmt(anual)}** — los extras pesan cerca de **${fmt(extrasAnio)}** más allá de la cuota.`,
    tone: 'warn',
    icon: '🎒'
  };

  // DONUT: el costo anual se reparte en cuotas + extras
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: '10 cuotas', value: Math.round(cuotasAnio) },
      { label: 'Extras (matrícula, etc.)', value: Math.round(extrasAnio) }
    ],
    prefix: '$',
    centerValue: fmt(anual),
    centerLabel: 'Total anual',
    ariaLabel: `Costo anual de ${fmt(anual)}: ${fmt(cuotasAnio)} en cuotas y ${fmt(extrasAnio)} en extras`
  };

  return { cuotaMensual:`$${Math.round(cm).toLocaleString('es-AR')}/mes`, anualEstimado:`$${Math.round(anual).toLocaleString('es-AR')}`, extras:'Matricula, uniformes, cooperadora, viajes, libros extras.', _insight, _chart };
}
