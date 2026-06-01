export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function costoMensualAprenderIdiomaOpciones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m=String(i.metodo||'app');
  const c:Record<string,[string,string,string]>={
    app:  ['$0-20',    'Baja (motivación sí)', 'Low (motivation matters)'],
    online:['$100-300','Alta 1:1',             'High 1:1'],
    academia:['$80-200','Media',               'Medium'],
    inmersion:['$1500-3000','Altísima',         'Very high'],
  };
  const [co,efEs,efEn]=c[m]||c.app;
  const ef = __lang === 'en' ? efEn : efEs;
  const resumen = __lang === 'en'
    ? `${m}: ${co}/month, effectiveness ${ef}.`
    : `${m}: ${co}/mes, efectividad ${ef}.`;
  return { mensual:co, efectividad:ef, resumen };
}
