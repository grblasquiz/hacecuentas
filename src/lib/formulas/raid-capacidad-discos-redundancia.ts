export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function raidCapacidadDiscosRedundancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t=String(i.tipo||'0'); const n=Math.floor(Number(i.n)||0); const tb=Number(i.tb)||0;
  let util=0; let tol='0';
  if (t==='0') { util=n*tb; tol='0'; }
  else if (t==='1') { util=tb; tol=`${n-1}`; }
  else if (t==='5') { util=(n-1)*tb; tol='1'; }
  else if (t==='6') { util=(n-2)*tb; tol='2'; }
  else if (t==='10') { util=(n/2)*tb; tol='1+'; }
  const resumen = __lang === 'en'
    ? `RAID ${t} with ${n}×${tb}TB: ${util.toFixed(1)}TB usable, tolerates ${tol} failure(s).`
    : `RAID ${t} con ${n}×${tb}TB: ${util.toFixed(1)}TB útil, tolera ${tol} fallo(s).`;

  const total = n * tb;
  const perdido = Math.max(0, total - util);
  const efPct = total > 0 ? (util / total) * 100 : 0;

  // --- Insight (bilingüe) ---
  const noFault = t === '0';
  const lowEff = efPct <= 55 && !noFault;
  const insightTone: 'good' | 'warn' | 'neutral' = noFault ? 'warn' : (lowEff ? 'neutral' : 'good');
  const insightText = __lang === 'en'
    ? (noFault
        ? `RAID ${t} uses **100%** of the space (${util.toFixed(1)} TB), but tolerates **zero failures** — one dead disk wipes everything.`
        : lowEff
          ? `RAID ${t} gives **${util.toFixed(1)} TB usable** out of ${total.toFixed(1)} TB (${efPct.toFixed(0)}% efficiency): you trade **${perdido.toFixed(1)} TB** for tolerating ${tol} disk failure(s).`
          : `RAID ${t} balances well: **${util.toFixed(1)} TB usable** (${efPct.toFixed(0)}% of total) while tolerating **${tol} disk failure(s)**.`)
    : (noFault
        ? `RAID ${t} aprovecha el **100%** del espacio (${util.toFixed(1)} TB), pero **no tolera fallas**: con un solo disco roto perdés todo.`
        : lowEff
          ? `RAID ${t} te da **${util.toFixed(1)} TB útiles** de ${total.toFixed(1)} TB (${efPct.toFixed(0)}% de aprovechamiento): cambiás **${perdido.toFixed(1)} TB** por tolerar ${tol} disco(s) fallando.`
          : `RAID ${t} equilibra bien: **${util.toFixed(1)} TB útiles** (${efPct.toFixed(0)}% del total) tolerando **${tol} disco(s)** fallando.`);

  const _insight = {
    title: __lang === 'en' ? 'Usable space vs. redundancy' : 'Espacio útil vs. redundancia',
    text: insightText,
    tone: insightTone,
    icon: '💽',
  };

  // --- Donut: útil + redundancia = total bruto ---
  const _chart = perdido > 0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Usable' : 'Útil', value: Number(util.toFixed(2)) },
      { label: __lang === 'en' ? 'Redundancy' : 'Redundancia', value: Number(perdido.toFixed(2)) },
    ],
    suffix: ' TB',
    centerValue: `${util.toFixed(1)} TB`,
    centerLabel: __lang === 'en' ? 'usable' : 'útiles',
    ariaLabel: __lang === 'en'
      ? `Of ${total.toFixed(1)} TB raw, ${util.toFixed(1)} TB usable and ${perdido.toFixed(1)} TB for redundancy`
      : `De ${total.toFixed(1)} TB brutos, ${util.toFixed(1)} TB útiles y ${perdido.toFixed(1)} TB de redundancia`,
  } : undefined;

  return { util:`${util.toFixed(1)} TB`, tolerancia:tol, resumen, _insight, ...(_chart ? { _chart } : {}) };
}
