export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function costoMensualAprenderIdiomaOpciones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=String(i.metodo||'app');
  const c:Record<string,[string,string,string,string]>={
    app:  ['$0-20',    'Baja (motivación sí)', 'Low (motivation matters)', 'Baixa (motivação importa)'],
    online:['$100-300','Alta 1:1',             'High 1:1',                'Alta 1:1'],
    academia:['$80-200','Media',               'Medium',                  'Média'],
    inmersion:['$1500-3000','Altísima',         'Very high',              'Altíssima'],
  };
  const [co,efEs,efEn,efPt]=c[m]||c.app;
  const ef = __lang === 'en' ? efEn : __lang === 'pt' ? efPt : efEs;
  const resumen = __lang === 'en'
    ? `${m}: ${co}/month, effectiveness ${ef}.`
    : __lang === 'pt'
    ? `${m}: ${co}/mês, efetividade ${ef}.`
    : `${m}: ${co}/mes, efectividad ${ef}.`;
  return { mensual:co, efectividad:ef, resumen };
}
