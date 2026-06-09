import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function ganancias4taCategoria2026(i: Inputs): Outputs {
  const b=Number(i.sueldoBruto)||0; const cf=Number(i.cargasFamiliares)||0;
  const aportes=Math.min(b, BASE_IMPONIBLE_MAXIMA_APORTES)*0.17; const neto=b-aportes;
  const ingresoAnual=neto*13; const mni=1800000; const cargaFam=cf*900000;
  const baseImponible=Math.max(0, ingresoAnual-mni-cargaFam);
  let imp=0;
  const tramos=[[1000000,0.05],[2000000,0.09],[3000000,0.12],[5000000,0.15],[8000000,0.19],[12000000,0.23],[20000000,0.27],[40000000,0.31],[Infinity,0.35]];
  let restante=baseImponible; let ant=0;
  for (const [tope,tasa] of tramos){ const seg=Math.min(restante, (tope as number)-ant); if (seg<=0) break; imp+=seg*(tasa as number); restante-=seg; ant=tope as number; if(restante<=0) break; }
  const impMensual=Math.round(imp/13);
  const alicEf=ingresoAnual>0?(imp/ingresoAnual*100).toFixed(2):'0';
  const enMano=Math.round(neto-impMensual);
  const paga=impMensual>0;
  const _insight = paga
    ? {
        title: 'Retención de 4ta categoría',
        text: `Con un bruto de **$${Math.round(b).toLocaleString('es-AR')}/mes**, te retienen **$${impMensual.toLocaleString('es-AR')}** por Ganancias (alícuota efectiva **${alicEf}%**). Tu sueldo en mano queda en **$${enMano.toLocaleString('es-AR')}**.`,
        tone: 'warn',
        icon: '💸',
      }
    : {
        title: 'No pagás Ganancias',
        text: `Con un bruto de **$${Math.round(b).toLocaleString('es-AR')}/mes**, tu ingreso anual no supera el mínimo no imponible más deducciones, así que tu retención es **$0** y cobrás **$${enMano.toLocaleString('es-AR')}** en mano.`,
        tone: 'good',
        icon: '✅',
      };
  const _chart = b>0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo en mano', value: Math.max(0, enMano) },
      { label: 'Aportes (17%)', value: Math.round(aportes) },
      { label: 'Ganancias', value: impMensual },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(b).toLocaleString('es-AR'),
    centerLabel: 'Bruto/mes',
    ariaLabel: 'Composición del sueldo bruto mensual: en mano, aportes y retención de Ganancias',
  } : undefined;
  return { impuestoMensual:`$${impMensual.toLocaleString('es-AR')}`, alicuotaEfectiva:`${alicEf}%`, sueldoNeto:`$${enMano.toLocaleString('es-AR')}`, _insight, ...(_chart?{_chart}:{}) };
}
