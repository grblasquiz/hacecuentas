export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoMensualAprenderIdiomaOpciones(i: Inputs): Outputs {
  const m=String(i.metodo||'app');
  const c:Record<string,[string,string]>={app:['$0-20','Baja (motivación sí)'],online:['$100-300','Alta 1:1'],academia:['$80-200','Media'],inmersion:['$1500-3000','Altísima']};
  const [co,ef]=c[m]||c.app;
  return { mensual:co, efectividad:ef, resumen:`${m}: ${co}/mes, efectividad ${ef}.` };
}
