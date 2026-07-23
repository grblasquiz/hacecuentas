/** Teorema de Tales y triángulos semejantes: cuarto proporcional y altura por sombra */
export interface Inputs {
  modo?: string;
  a?: number;
  b?: number;
  c?: number;
  alturaPersona?: number;
  sombraPersona?: number;
  sombraObjeto?: number;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  razon: number;
  _insight?: any;
}

export function teoremaTalesTriangulosSemejantes(i: Inputs): Outputs {
  const modo = String(i.modo || 'sombra');

  if (modo === 'proporcion') {
    const a = Number(i.a) || 0;
    const b = Number(i.b) || 0;
    const c = Number(i.c) || 0;
    if (a <= 0 || b <= 0 || c <= 0)
      throw new Error('Ingresá los tres segmentos conocidos con valores positivos');
    // a/b = c/x  →  x = b·c/a
    const x = (b * c) / a;
    const razon = a / b;
    const xR = Number(x.toFixed(4));
    const razonR = Number(razon.toFixed(4));
    return {
      resultado: xR,
      formula: `${a}/${b} = ${c}/x → x = (${b} × ${c}) / ${a} = ${xR}`,
      razon: razonR,
      _insight: {
        title: 'Cuarto proporcional',
        text: `Por el teorema de Tales, el segmento que faltaba mide **${xR.toLocaleString('es-AR')}**. La razón de proporcionalidad es ${a}/${b} = **${razonR.toLocaleString('es-AR')}**: verificalo dividiendo ${c}/${xR.toLocaleString('es-AR')}, que da lo mismo.`,
        tone: 'neutral',
        icon: '📏',
      },
    };
  }

  if (modo === 'sombra') {
    const hp = Number(i.alturaPersona) || 0;
    const sp = Number(i.sombraPersona) || 0;
    const so = Number(i.sombraObjeto) || 0;
    if (hp <= 0) throw new Error('Ingresá la altura de la persona (o vara de referencia) con un valor positivo');
    if (sp <= 0) throw new Error('Ingresá la sombra de la persona con un valor positivo (no puede ser cero: dividirías por cero)');
    if (so <= 0) throw new Error('Ingresá la sombra del objeto con un valor positivo');
    // Semejanza: alturaObjeto / sombraObjeto = alturaPersona / sombraPersona
    const h = (hp * so) / sp;
    const razon = hp / sp;
    const hR = Number(h.toFixed(4));
    const razonR = Number(razon.toFixed(4));
    return {
      resultado: hR,
      formula: `H = (${hp} × ${so}) / ${sp} = ${hR}`,
      razon: razonR,
      _insight: {
        title: 'Altura por sombra',
        text: `El objeto mide **${hR.toLocaleString('es-AR')} m** de alto. Los triángulos que forman el sol, la persona y el objeto son semejantes: cada metro de sombra equivale a **${razonR.toLocaleString('es-AR')} m** de altura en este momento del día. Medí las dos sombras a la misma hora para que la proporción valga.`,
        tone: 'neutral',
        icon: '📏',
      },
    };
  }

  throw new Error('Elegí un modo válido: proporción de Tales o altura por sombra');
}
