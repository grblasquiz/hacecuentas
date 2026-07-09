export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cuotaCreditoHipotecarioUvaBancoNacion(i: Inputs): Outputs {
  const m=Number(i.monto)||0; const p=Number(i.plazoAnios)||0; const tna=(Number(i.tnaReal)||0)/100;
  const n=p*12; const i_m=tna/12;
  const cuota=i_m===0?m/n:m*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=cuota*n;
  const intereses=Math.max(0, total-m);

  const fmt=(x:number)=>'$'+Math.round(x).toLocaleString('es-AR');
  const sobre = m>0 ? (intereses/m)*100 : 0;
  const _insight = {
    title: 'Costo del crédito',
    text: `La cuota inicial es **${fmt(cuota)}/mes** y a lo largo de ${p} años pagás **${fmt(total)}**, de los cuales **${fmt(intereses)}** son intereses (**${sobre.toFixed(0)}%** sobre el capital). En UVA, además, la cuota se ajusta por inflación.`,
    tone: 'warn',
    icon: '🏠',
  };

  const out: Outputs = {
    cuotaInicial:'$'+cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    totalPagar:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen:`$${m.toLocaleString('es-AR')} × ${p} años @ ${(tna*100).toFixed(1)}%: cuota $${cuota.toFixed(0)}/mes.`,
    _insight,
  };

  // Donut: el total a pagar = capital + intereses
  if (intereses > 0 && m > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Capital', value: Math.round(m) },
        { label: 'Intereses', value: Math.round(intereses) },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Total a pagar',
      ariaLabel: `El total a pagar de ${fmt(total)} se compone de ${fmt(m)} de capital y ${fmt(intereses)} de intereses`,
    };
  }

  return out;
}

/**
 * Cronograma año a año (sistema francés a la tasa real, en UVA / pesos
 * constantes). Muestra cuota, interés y capital amortizado por año más el
 * saldo de capital restante. Contrato A4 (Calculator.astro).
 * Números formateados es-AR. Devuelve null si los inputs no son válidos.
 */
export function schedule(
  i: Inputs
): { headers: string[]; rows: (string | number)[][] } | null {
  const monto = Number(i.monto) || 0;
  const p = Number(i.plazoAnios) || 0;
  const tna = (Number(i.tnaReal) || 0) / 100;
  if (monto <= 0 || p <= 0 || tna <= 0) return null;

  const n = p * 12;
  const iMes = tna / 12;
  const cuota =
    iMes === 0 ? monto / n : (monto * iMes * Math.pow(1 + iMes, n)) / (Math.pow(1 + iMes, n) - 1);

  const lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const headers =
    lang === 'en' ? ['Year', 'Monthly payment', 'Yearly interest', 'Yearly principal', 'Balance'] :
    lang === 'pt' ? ['Ano', 'Parcela mensal', 'Juros do ano', 'Capital do ano', 'Saldo'] :
    ['Año', 'Cuota mensual', 'Interés del año', 'Capital del año', 'Saldo'];

  const f = (x: number) => Math.round(x).toLocaleString('es-AR');
  const rows: (string | number)[][] = [];
  const years = Math.min(Math.round(p), 40);
  let saldo = monto;
  for (let y = 1; y <= years; y++) {
    let interesAnio = 0;
    let capitalAnio = 0;
    for (let mm = 1; mm <= 12; mm++) {
      const gm = (y - 1) * 12 + mm;
      if (gm > n) break;
      const interes = saldo * iMes;
      const capital = cuota - interes;
      interesAnio += interes;
      capitalAnio += capital;
      saldo = Math.max(0, saldo - capital);
    }
    rows.push([y, f(cuota), f(interesAnio), f(capitalAnio), f(saldo)]);
  }
  return { headers, rows };
}
