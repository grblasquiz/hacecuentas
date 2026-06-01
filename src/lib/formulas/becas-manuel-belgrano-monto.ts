export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function becasManuelBelgranoMonto(i: Inputs): Outputs {
  const c=String(i.carrera||'salud');
  const m: Record<string,number> = { salud:70000, cyt:60000, ing:75000, otra:50000 };
  const v=m[c]||50000;
  const carreraTxt: Record<string,string> = { salud:'Salud', cyt:'Ciencia y Tecnología', ing:'Ingeniería', otra:'tu carrera' };
  return {
    monto:'$'+v.toLocaleString('es-AR'),
    requisitos:'Ingreso ≤3 SMVM, promedio aprobado, carrera estratégica',
    resumen:`Beca Belgrano ${c}: $${v.toLocaleString('es-AR')}/mes.`,
    _insight: {
      title: 'Tu estímulo mensual',
      text: `La beca Manuel Belgrano para **${carreraTxt[c] || 'tu carrera'}** otorga **$${v.toLocaleString('es-AR')}/mes**. Recordá que es excluyente tener ingreso familiar **≤3 SMVM** y promedio aprobado en una carrera considerada estratégica.`,
      tone: 'good',
      icon: '🎓',
    },
  };
}
