export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function guarderiaJardinMaternalCostoCabaMensual(i: Inputs): Outputs {
  const t=String(i.tipo||'privado_tradicional'); const h=String(i.horario||'jornada_completa');
  const base={'publico':0,'privado_comunitario':120000,'privado_tradicional':500000,'bilingüe':1000000}[t];
  const mult=h==='jornada_completa'?1:0.65;
  const costo=base*mult;
  const inc=h==='jornada_completa'?'Desayuno + almuerzo + merienda. Actividades.':'Desayuno o merienda. Actividades.';
  const fmtAr=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const jornada=h==='jornada_completa'?'jornada completa':'media jornada';
  const anual=costo*10; // ciclo lectivo ~10 meses
  let _insight:any;
  if(t==='publico'){
    _insight={ title:'Opción gratuita', text:'El jardín maternal **público de CABA no tiene costo**, pero la demanda supera los cupos: anotate apenas abra la inscripción para no quedar en lista de espera.', tone:'good', icon:'🏫' };
  } else if(t==='bilingüe'){
    _insight={ title:'El tramo más caro', text:`Un maternal bilingüe a ${jornada} ronda **${fmtAr(costo)}/mes**, cerca de **${fmtAr(anual)}** en el ciclo lectivo. Sumá matrícula y materiales: es la opción más onerosa de CABA.`, tone:'warn', icon:'💸' };
  } else {
    _insight={ title:'Costo mensual estimado', text:`Un jardín ${t==='privado_comunitario'?'comunitario':'privado'} a ${jornada} sale aprox. **${fmtAr(costo)}/mes** (~${fmtAr(anual)} al año). Reservá el cupo con anticipación y consultá si la matrícula va aparte.`, tone:'neutral', icon:'👶' };
  }
  return { costoMensual:t==='publico'?'Gratis':fmtAr(costo), incluye:inc, observacion:t==='publico'?'Gratuito pero lista de espera':'Privado: verificar inscripción anticipada', _insight };
}
