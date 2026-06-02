export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function deepWorkCalNewportHorasMaximoDiario(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;

  const out:Outputs={ resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.` };

  // Cal Newport sostiene que un experto rinde como máximo ~4 h de deep work por día.
  const horas=r;
  if(horas>0){
    let tone:'good'|'warn'|'neutral'='neutral'; let txt='';
    if(horas>4){
      tone='warn';
      txt=`Te salen **${horas.toFixed(2)} h** diarias de trabajo profundo. Según Cal Newport, ni los expertos sostienen más de **~4 h/día** de concentración real; arriba de eso suele haber multitasking disfrazado o agotamiento.`;
    } else if(horas>=2){
      tone='good';
      txt=`**${horas.toFixed(2)} h** diarias de deep work es un objetivo sólido y sostenible: está dentro del techo de **~4 h/día** que Newport considera el máximo realista para concentración de alto nivel.`;
    } else {
      tone='neutral';
      txt=`Te quedan **${horas.toFixed(2)} h** diarias para trabajo profundo. Es un arranque razonable; Newport sugiere construir el hábito de a poco hasta acercarte al techo de **~4 h/día**.`;
    }
    out._insight={ title:'Tu techo de trabajo profundo', text:txt, tone, icon:'🧠' };
  }
  return out;
}
