export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; cft: string; cuotaMensual: string; totalPagado: string; _insight?: any; _chart?: any; }
export function cftPrestamoPersonalComparativa(i: Inputs): Outputs {
  const m=Number(i.montoPrestamo)||0; const t=Number(i.tnaPorcentaje)||0; const n=Number(i.plazoMeses)||1; const com=Number(i.comisionesYSeguros)||0;
  const iMen=t/100/12; const cuotaBase=m*iMen*((1+iMen)**n)/((1+iMen)**n-1);
  const cuota=cuotaBase+com; const total=cuota*n;
  const cft=((total/m)**(12/n)-1)*100;

  const capitalR = Math.round(m);
  const totalR = Math.round(total);
  const costoR = Math.max(0, totalR - capitalR);
  const ars = (v: number) => '$' + v.toLocaleString('es-AR');
  const cftPct = Math.round(cft);
  const insightTone = cftPct >= 100 ? 'warn' : cftPct >= 60 ? 'neutral' : 'good';

  const _insight = {
    title: 'Lo que realmente pagás',
    text: `Por un préstamo de **${ars(capitalR)}** a ${n} meses terminás pagando **${ars(totalR)}** en cuotas de ${ars(Math.round(cuota))}: **${ars(costoR)}** son intereses y comisiones. El CFT es de **${cftPct}% anual**, el número clave para comparar entre bancos.`,
    tone: insightTone as 'good' | 'warn' | 'neutral',
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital prestado', value: capitalR },
      { label: 'Intereses y comisiones', value: costoR },
    ],
    prefix: '$',
    centerValue: ars(totalR),
    centerLabel: 'total a pagar',
    ariaLabel: `Composición del total a pagar de ${ars(totalR)}: capital prestado más intereses y comisiones`,
  };

  return {
    cft:`${cft.toFixed(0)}% aprox`,
    cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`,
    totalPagado:`$${Math.round(total).toLocaleString('es-AR')}`,
    _insight,
    _chart,
  };
}
