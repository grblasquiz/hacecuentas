export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function creditoUniversitarioProgresarMonto2026(i: Inputs): Outputs {
  const n=String(i.nivel||'superior'); const l=String(i.lineaProgresar||'b');
  const base={'obligatorio':40000,'superior':80000,'trabajo':70000}[n] ?? 80000;
  const mult={'a':1,'b':1,'c':1}[l] ?? 1;
  const monto=base*mult;
  const anual=monto*10;
  const nivelLabel={'obligatorio':'Nivel obligatorio','superior':'Nivel superior','trabajo':'Línea trabajo'}[n] ?? 'Nivel superior';
  const _insight={
    title:'Cuánto cobrás con Progresar',
    text:`Para **${nivelLabel.toLowerCase()}** te corresponden **$${monto.toLocaleString('es-AR')}/mes** durante 10 meses al año, unos **$${anual.toLocaleString('es-AR')}** anuales. Recordá que el 20% se retiene hasta acreditar la condición académica.`,
    tone:'neutral' as 'neutral',
    icon:'🎓'
  };
  return { montoMensual:`$${monto.toLocaleString('es-AR')} (10 meses/año)`, requisitos:'Ingresos familiares <3 SMVM, regularidad estudios, edad según línea.', tramite:'mi.ANSES + IVE (Informe Valoración Estudios).', _insight };
}
