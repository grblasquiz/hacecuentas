export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function derivadaPolinomioCoeficientes(i: Inputs): Outputs {
  const s=String(i.coefs||''); const cs=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (cs.length===0) return { derivada:'—', resumen:'Ingresá coeficientes.' };
  const n=cs.length-1;
  const dc:number[]=[]; for (let k=0;k<n;k++) dc.push(cs[k]*(n-k));
  const terms=dc.map((c,k)=>{ const exp=n-1-k; if (c===0) return ''; const sign=c<0?'-':(k===0?'':'+'); const abs=Math.abs(c); const x=exp===0?'':(exp===1?'x':`x^${exp}`); return `${sign}${abs===1&&exp>0?'':abs}${x}`; }).filter(Boolean).join('');
  const orig=cs.map((c,k)=>{ const exp=n-k; if (c===0) return ''; const sign=c<0?'-':(k===0?'':'+'); const abs=Math.abs(c); const x=exp===0?'':(exp===1?'x':`x^${exp}`); return `${sign}${abs===1&&exp>0?'':abs}${x}`; }).filter(Boolean).join('') || '0';
  const der = terms || '0';
  const _insight = {
    title: 'Del polinomio a su derivada',
    text: `La derivada de **f(x) = ${orig}** (grado ${n}) es **f'(x) = ${der}**. La regla de la potencia baja cada exponente en 1 y lo multiplica como coeficiente; el término independiente se anula.`,
    tone: 'neutral',
    icon: '📐',
  };
  return { derivada:der, resumen:`d/dx = ${der}.`, _insight };
}
