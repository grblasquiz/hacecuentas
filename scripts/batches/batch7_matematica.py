"""Batch 7 — Matemática (30 calcs)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _helper import spec

SPECS = []


def T(fn, body):
    return f"""export interface Inputs {{ [k: string]: number | string; }}
export interface Outputs {{ [k: string]: string | number; }}
export function {fn}(i: Inputs): Outputs {{
{body}
}}
"""


def tc(s):
    p = s.split('-'); return p[0] + ''.join(x[:1].upper() + x[1:] for x in p[1:])


def M(slug, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, body):
    SPECS.append(spec(slug, "matematica", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


# 1. Ecuación cuadrática
M("ecuacion-cuadratica-raices-discriminante", "📐", "Ecuación cuadrática (raíces y discriminante)",
  "Resuelve ax²+bx+c=0 con fórmula general y discriminante.",
  "x = (-b ± √(b²-4ac)) / 2a",
  [("a","a","number",None),("b","b","number",None),("c","c","number",None)],
  [("x1","Raíz x1",None),("x2","Raíz x2",None),("disc","Discriminante",None),("resumen","Interpretación",None)],
  ["a=1, b=-5, c=6","x1=3, x2=2"], "x1=3, x2=2",
  [("¿Discriminante?","D=b²-4ac. >0 dos reales, =0 una doble, <0 complejas."),
   ("¿Complejas?","Si D<0, x=(-b ± i√|D|)/2a."),
   ("¿Factorizar?","Si raíces r1,r2 enteras: a(x-r1)(x-r2)."),
   ("¿Vértice?","x_v=-b/2a; y_v=f(x_v). Parábola."),
   ("¿Aplicación?","Trayectorias, optimización cuadrática, áreas.")],
  """  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  const d=b*b-4*a*c;
  let x1:any, x2:any;
  if (a===0) return { x1:'—', x2:(-c/b).toFixed(3), disc:d.toFixed(2), resumen:'Lineal, no cuadrática.' };
  if (d<0) { x1=`${(-b/(2*a)).toFixed(3)} + ${(Math.sqrt(-d)/(2*a)).toFixed(3)}i`; x2=`${(-b/(2*a)).toFixed(3)} - ${(Math.sqrt(-d)/(2*a)).toFixed(3)}i`; }
  else { x1=((-b+Math.sqrt(d))/(2*a)).toFixed(3); x2=((-b-Math.sqrt(d))/(2*a)).toFixed(3); }
  return { x1, x2, disc:d.toFixed(2), resumen:`D=${d.toFixed(2)} ${d>0?'(dos reales)':d===0?'(raíz doble)':'(complejas)'}.` };""")

# 2. Sistema 2x2
M("sistema-ecuaciones-2x2-cramer", "📊", "Sistema 2x2 (Cramer)",
  "Resuelve ax+by=e, cx+dy=f con determinantes de Cramer.",
  "x=(ed-bf)/(ad-bc), y=(af-ec)/(ad-bc)",
  [("a","a","number",None),("b","b","number",None),("c","c","number",None),("d","d","number",None),("e","e","number",None),("f","f","number",None)],
  [("x","x",None),("y","y",None),("det","Determinante",None),("resumen","Interpretación",None)],
  ["x+y=5, 2x+3y=13","x=2, y=3"], "x=2, y=3",
  [("¿Cramer?","Método directo con determinantes para sistemas lineales cuadrados."),
   ("¿Sin solución?","Si det=0 y sistema inconsistente: rectas paralelas."),
   ("¿Infinitas?","Si det=0 y consistente: rectas coincidentes."),
   ("¿3x3?","Extensión directa con determinantes 3x3."),
   ("¿Gauss?","Alternativa más eficiente para sistemas grandes.")],
  """  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0; const e=Number(i.e)||0; const f=Number(i.f)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return { x:'—', y:'—', det:'0', resumen:'Sistema singular: sin solución única.' };
  return { x:((e*d-b*f)/det).toFixed(3), y:((a*f-e*c)/det).toFixed(3), det:det.toFixed(2), resumen:`Solución única: x=${((e*d-b*f)/det).toFixed(2)}, y=${((a*f-e*c)/det).toFixed(2)}.` };""")

# 3. Distancia entre 2 puntos
M("distancia-dos-puntos-plano-cartesiano", "📏", "Distancia entre dos puntos (plano)",
  "Distancia euclídea entre P1(x1,y1) y P2(x2,y2) en 2D.",
  "d = √((x2-x1)² + (y2-y1)²)",
  [("x1","x1","number",None),("y1","y1","number",None),("x2","x2","number",None),("y2","y2","number",None)],
  [("d","Distancia",None),("resumen","Interpretación",None)],
  ["P1(1,2), P2(4,6)","d=5"], "d=5",
  [("¿En 3D?","d=√((x2-x1)²+(y2-y1)²+(z2-z1)²)."),
   ("¿Punto medio?","M=((x1+x2)/2, (y1+y2)/2)."),
   ("¿Pendiente?","m=(y2-y1)/(x2-x1)."),
   ("¿Ángulo?","θ=arctan((y2-y1)/(x2-x1))."),
   ("¿Aplicación?","GPS, geometría analítica, física.")],
  """  const x1=Number(i.x1)||0; const y1=Number(i.y1)||0; const x2=Number(i.x2)||0; const y2=Number(i.y2)||0;
  const d=Math.sqrt((x2-x1)**2+(y2-y1)**2);
  return { d:d.toFixed(3), resumen:`Distancia entre (${x1},${y1}) y (${x2},${y2}): ${d.toFixed(2)}.` };""")

# 4. Teorema de Pitágoras
M("teorema-pitagoras-hipotenusa-cateto", "📐", "Teorema de Pitágoras",
  "Calcula hipotenusa o cateto faltante en triángulo rectángulo.",
  "c² = a² + b²",
  [("modo","Calcular","select",[("hip","Hipotenusa"),("cat","Cateto")]),("a","Cateto a / hip c","number",None),("b","Cateto b (o cat a)","number",None)],
  [("resultado","Resultado",None),("resumen","Interpretación",None)],
  ["a=3, b=4","c=5"], "c=5",
  [("¿Cuándo aplica?","Solo en triángulos rectángulos (90°)."),
   ("¿Ternas?","3-4-5, 5-12-13, 8-15-17, 7-24-25."),
   ("¿Inversa?","Si a²+b²=c², es rectángulo."),
   ("¿3D?","Diagonal=√(a²+b²+c²)."),
   ("¿Historia?","Atribuido a Pitágoras pero conocido desde babilonios.")],
  """  const a=Number(i.a)||0; const b=Number(i.b)||0;
  const modo=String(i.modo||'hip');
  if (modo==='hip') { const c=Math.sqrt(a*a+b*b); return { resultado:`c=${c.toFixed(3)}`, resumen:`Hipotenusa: √(${a}²+${b}²)=${c.toFixed(2)}.` }; }
  if (a<=b) return { resultado:'—', resumen:'La hipotenusa debe ser mayor que el cateto.' };
  const cat=Math.sqrt(a*a-b*b);
  return { resultado:`cateto=${cat.toFixed(3)}`, resumen:`Cateto faltante: √(${a}²-${b}²)=${cat.toFixed(2)}.` };""")

# 5. Área círculo
M("area-perimetro-circulo-radio", "⭕", "Área y perímetro del círculo",
  "Área (πr²) y perímetro/circunferencia (2πr) del círculo.",
  "A=πr², P=2πr",
  [("r","Radio","number","cm")],
  [("area","Área",None),("perimetro","Perímetro",None),("diametro","Diámetro",None),("resumen","Resumen",None)],
  ["r=5","A=78.54 cm²"], "A=78.54 cm²",
  [("¿Por qué π?","Relación fija entre perímetro y diámetro (~3.14159)."),
   ("¿Área sector?","A=½r²θ (θ en rad)."),
   ("¿Cuerda?","c=2r·sin(θ/2)."),
   ("¿Esfera?","V=4/3πr³, S=4πr²."),
   ("¿Cilindro?","V=πr²h.")],
  """  const r=Number(i.r)||0;
  const a=Math.PI*r*r; const p=2*Math.PI*r;
  return { area:`${a.toFixed(2)} cm²`, perimetro:`${p.toFixed(2)} cm`, diametro:`${(2*r).toFixed(2)} cm`, resumen:`Círculo de radio ${r}: área ${a.toFixed(1)}, perímetro ${p.toFixed(1)}.` };""")

# 6. Área triángulo Herón
M("area-triangulo-heron-tres-lados", "🔺", "Área de triángulo (fórmula de Herón)",
  "Área conociendo solo los 3 lados (a, b, c).",
  "A = √(s(s-a)(s-b)(s-c)), s=(a+b+c)/2",
  [("a","Lado a","number","cm"),("b","Lado b","number","cm"),("c","Lado c","number","cm")],
  [("area","Área",None),("perimetro","Perímetro",None),("s","Semiperímetro",None),("resumen","Resumen",None)],
  ["a=3,b=4,c=5","A=6 cm²"], "A=6 cm²",
  [("¿Cuándo?","Cuando no se conoce altura pero sí los 3 lados."),
   ("¿Triángulo válido?","Cada lado < suma de los otros dos."),
   ("¿Con 2 lados y ángulo?","A=½·a·b·sin(C)."),
   ("¿Equilátero?","A=(√3/4)·a²."),
   ("¿Rectángulo?","A=½·b·h.")],
  """  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a+b<=c||a+c<=b||b+c<=a) return { area:'—', perimetro:'—', s:'—', resumen:'Los lados no forman triángulo válido.' };
  const s=(a+b+c)/2; const A=Math.sqrt(s*(s-a)*(s-b)*(s-c));
  return { area:`${A.toFixed(2)} cm²`, perimetro:`${(a+b+c).toFixed(2)} cm`, s:s.toFixed(2), resumen:`Triángulo ${a},${b},${c}: área ${A.toFixed(2)} cm².` };""")

# 7. Volumen esfera
M("volumen-superficie-esfera-radio", "🔮", "Volumen y superficie de esfera",
  "Volumen (4/3πr³) y superficie (4πr²) de una esfera.",
  "V=4/3πr³, S=4πr²",
  [("r","Radio","number","cm")],
  [("volumen","Volumen",None),("superficie","Superficie",None),("resumen","Resumen",None)],
  ["r=5","V=523.6 cm³"], "V=523.6 cm³",
  [("¿Hemisferio?","V=½·(4/3πr³)."),
   ("¿Casquete?","V=πh²(3r-h)/3."),
   ("¿Diámetro?","d=2r, V=πd³/6."),
   ("¿Planeta?","Tierra: r≈6371 km."),
   ("¿Densidad?","ρ=m/V.")],
  """  const r=Number(i.r)||0;
  const v=(4/3)*Math.PI*r**3; const s=4*Math.PI*r*r;
  return { volumen:`${v.toFixed(2)} cm³`, superficie:`${s.toFixed(2)} cm²`, resumen:`Esfera de radio ${r}: V=${v.toFixed(1)}, S=${s.toFixed(1)}.` };""")

# 8. Volumen cilindro
M("volumen-cilindro-radio-altura", "🥫", "Volumen de cilindro",
  "Volumen y superficie total de cilindro recto.",
  "V=πr²h, S=2πr(r+h)",
  [("r","Radio","number","cm"),("h","Altura","number","cm")],
  [("volumen","Volumen",None),("superficie","Superficie total",None),("resumen","Resumen",None)],
  ["r=3,h=10","V=282.74 cm³"], "V=282.74 cm³",
  [("¿Lateral?","S_lat=2πrh (sin tapas)."),
   ("¿Tanque?","Calcula capacidad en litros: 1 L = 1000 cm³."),
   ("¿Oblicuo?","Mismo V si altura perpendicular."),
   ("¿Hueco?","V=π(R²-r²)h."),
   ("¿Aplicaciones?","Silos, tuberías, latas.")],
  """  const r=Number(i.r)||0; const h=Number(i.h)||0;
  const v=Math.PI*r*r*h; const s=2*Math.PI*r*(r+h);
  return { volumen:`${v.toFixed(2)} cm³ (${(v/1000).toFixed(2)} L)`, superficie:`${s.toFixed(2)} cm²`, resumen:`Cilindro: ${v.toFixed(1)} cm³ = ${(v/1000).toFixed(2)} L.` };""")

# 9. Volumen cono
M("volumen-cono-radio-altura", "🎉", "Volumen de cono",
  "V y S de cono recto circular.",
  "V=⅓πr²h, S=πr(r+√(r²+h²))",
  [("r","Radio base","number","cm"),("h","Altura","number","cm")],
  [("volumen","Volumen",None),("generatriz","Generatriz",None),("superficie","Superficie",None),("resumen","Resumen",None)],
  ["r=3,h=4","V=37.7 cm³"], "V=37.7 cm³",
  [("¿Generatriz?","g=√(r²+h²)."),
   ("¿Tronco?","V=⅓πh(R²+r²+Rr)."),
   ("¿Con cilindro?","V_cono=⅓V_cilindro(igual base/h)."),
   ("¿Aplicaciones?","Embudos, helado, pirámides aprox."),
   ("¿Ángulo?","2·arctan(r/h).")],
  """  const r=Number(i.r)||0; const h=Number(i.h)||0;
  const g=Math.sqrt(r*r+h*h); const v=(1/3)*Math.PI*r*r*h; const s=Math.PI*r*(r+g);
  return { volumen:`${v.toFixed(2)} cm³`, generatriz:`${g.toFixed(2)} cm`, superficie:`${s.toFixed(2)} cm²`, resumen:`Cono r=${r}, h=${h}: V=${v.toFixed(1)}.` };""")

# 10. Progresión aritmética
M("progresion-aritmetica-suma-termino", "➕", "Progresión aritmética (an, Sn)",
  "Calcula término n-ésimo y suma de los primeros n términos.",
  "an=a1+(n-1)d, Sn=n(a1+an)/2",
  [("a1","Primer término","number",None),("d","Diferencia","number",None),("n","Término n","number",None)],
  [("an","an",None),("sn","Sn",None),("resumen","Interpretación",None)],
  ["a1=2, d=3, n=10","a10=29"], "a10=29, S10=155",
  [("¿Aritmética?","Diferencia d constante entre términos."),
   ("¿Media?","Media=(a1+an)/2 = Sn/n."),
   ("¿Ejemplo?","2,5,8,11... (d=3)."),
   ("¿Aplicación?","Cuotas crecientes, series de valores."),
   ("¿Infinita?","No converge salvo d=0.")],
  """  const a1=Number(i.a1)||0; const d=Number(i.d)||0; const n=Number(i.n)||1;
  const an=a1+(n-1)*d; const sn=n*(a1+an)/2;
  return { an:an.toFixed(3), sn:sn.toFixed(3), resumen:`a${n}=${an.toFixed(2)}, S${n}=${sn.toFixed(2)}.` };""")

# 11. Progresión geométrica
M("progresion-geometrica-suma-termino", "✖️", "Progresión geométrica (an, Sn)",
  "Término n-ésimo y suma parcial de PG.",
  "an=a1·r^(n-1), Sn=a1(r^n-1)/(r-1)",
  [("a1","Primer término","number",None),("r","Razón","number",None),("n","Término n","number",None)],
  [("an","an",None),("sn","Sn",None),("resumen","Interpretación",None)],
  ["a1=2, r=3, n=5","a5=162, S5=242"], "a5=162, S5=242",
  [("¿Infinita converge?","Solo si |r|<1: S=a1/(1-r)."),
   ("¿Razón r?","an/an-1 constante."),
   ("¿Aplicación?","Interés compuesto, poblaciones, radioactividad."),
   ("¿Ejemplo?","1,2,4,8,16 (r=2)."),
   ("¿Negativa?","r<0 alterna signos.")],
  """  const a1=Number(i.a1)||0; const r=Number(i.r)||1; const n=Number(i.n)||1;
  const an=a1*Math.pow(r,n-1);
  const sn=r===1?n*a1:a1*(Math.pow(r,n)-1)/(r-1);
  return { an:an.toFixed(3), sn:sn.toFixed(3), resumen:`a${n}=${an.toFixed(2)}, S${n}=${sn.toFixed(2)}.` };""")

# 12. Factorial
M("factorial-numero-n", "!", "Factorial (n!)",
  "n! = n·(n-1)·(n-2)...·1. Base de combinatoria.",
  "n! = n × (n-1)!",
  [("n","n","number",None)],
  [("resultado","n!",None),("resumen","Interpretación",None)],
  ["n=5","120"], "5!=120",
  [("¿0!?","Por convención, 0!=1."),
   ("¿Stirling?","n!≈√(2πn)·(n/e)^n para n grandes."),
   ("¿Negativos?","No definido para enteros negativos."),
   ("¿Combinatoria?","Permutaciones P(n)=n!, C(n,k)=n!/(k!(n-k)!)."),
   ("¿Crece rápido?","20!=2.4e18. Cuidado overflow.")],
  """  const n=Number(i.n)||0;
  if (n<0) return { resultado:'—', resumen:'Factorial no definido para negativos.' };
  if (n>170) return { resultado:'∞', resumen:'Desborda (overflow).' };
  let f=1; for (let k=2;k<=n;k++) f*=k;
  return { resultado:f.toLocaleString(), resumen:`${n}! = ${f.toLocaleString()}.` };""")

# 13. Combinaciones
M("combinaciones-n-tomados-k-cnk", "🎲", "Combinaciones C(n,k)",
  "Cuántas formas de elegir k de n sin orden.",
  "C(n,k) = n!/(k!(n-k)!)",
  [("n","n","number",None),("k","k","number",None)],
  [("resultado","C(n,k)",None),("resumen","Interpretación",None)],
  ["n=5, k=2","10"], "C(5,2)=10",
  [("¿Sin orden?","AB = BA. Si orden importa, usar permutaciones."),
   ("¿Lotería?","Ej. 6 de 45: C(45,6)=8145060."),
   ("¿Pascal?","C(n,k)=C(n-1,k-1)+C(n-1,k)."),
   ("¿Simetría?","C(n,k)=C(n,n-k)."),
   ("¿Binomio?","(a+b)^n suma C(n,k)·a^(n-k)·b^k.")],
  """  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0);
  if (k<0||k>n) return { resultado:'0', resumen:'k fuera de rango [0,n].' };
  let c=1; const m=Math.min(k,n-k);
  for (let j=0;j<m;j++) c=c*(n-j)/(j+1);
  return { resultado:Math.round(c).toLocaleString(), resumen:`C(${n},${k}) = ${Math.round(c).toLocaleString()}.` };""")

# 14. Permutaciones
M("permutaciones-n-tomados-k-pnk", "🔢", "Permutaciones P(n,k)",
  "Formas de elegir k de n con orden.",
  "P(n,k) = n!/(n-k)!",
  [("n","n","number",None),("k","k","number",None)],
  [("resultado","P(n,k)",None),("resumen","Interpretación",None)],
  ["n=5, k=2","20"], "P(5,2)=20",
  [("¿Con orden?","AB ≠ BA. Si no importa orden, usar combinaciones."),
   ("¿Todas?","P(n,n)=n!."),
   ("¿Con repetición?","n^k (tuplas)."),
   ("¿Ejemplo?","Código 3 dígitos distintos de 10: P(10,3)=720."),
   ("¿Relación?","P(n,k)=C(n,k)·k!")],
  """  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0);
  if (k<0||k>n) return { resultado:'0', resumen:'k fuera de rango.' };
  let p=1; for (let j=0;j<k;j++) p*=(n-j);
  return { resultado:p.toLocaleString(), resumen:`P(${n},${k}) = ${p.toLocaleString()}.` };""")

# 15. Logaritmo
M("logaritmo-base-cualquiera-numero", "📉", "Logaritmo (base cualquiera)",
  "log_b(x): exponente al que b se eleva para obtener x.",
  "log_b(x) = ln(x)/ln(b)",
  [("x","Número x","number",None),("b","Base","number",None)],
  [("log","log_b(x)",None),("resumen","Interpretación",None)],
  ["x=1000, b=10","3"], "log₁₀(1000)=3",
  [("¿Natural ln?","Base e (≈2.71828)."),
   ("¿Binario?","Base 2. Usado en información y ciencia computación."),
   ("¿Común?","Base 10."),
   ("¿Propiedades?","log(ab)=log(a)+log(b); log(a^n)=n·log(a)."),
   ("¿Antilog?","b^y=x si log_b(x)=y.")],
  """  const x=Number(i.x)||0; const b=Number(i.b)||10;
  if (x<=0||b<=0||b===1) return { log:'—', resumen:'Dominio inválido: x>0 y b>0, b≠1.' };
  const l=Math.log(x)/Math.log(b);
  return { log:l.toFixed(4), resumen:`log base ${b} de ${x} = ${l.toFixed(3)}.` };""")

# 16. MCD/MCM
M("mcd-mcm-dos-numeros-enteros", "🔗", "MCD y MCM (Euclides)",
  "Máximo común divisor y mínimo común múltiplo.",
  "MCM(a,b) = a·b / MCD(a,b)",
  [("a","a","number",None),("b","b","number",None)],
  [("mcd","MCD",None),("mcm","MCM",None),("resumen","Interpretación",None)],
  ["a=12, b=18","MCD=6, MCM=36"], "MCD=6, MCM=36",
  [("¿Euclides?","MCD(a,b)=MCD(b, a mod b). Termina cuando b=0."),
   ("¿Coprimos?","MCD=1 (ej. 15 y 8)."),
   ("¿Fracciones?","Simplificar dividiendo por MCD."),
   ("¿Sumar fracciones?","Denominador común = MCM."),
   ("¿3 números?","MCD(a,b,c)=MCD(MCD(a,b),c).")],
  """  let a=Math.abs(Math.floor(Number(i.a)||0)); let b=Math.abs(Math.floor(Number(i.b)||0));
  if (a===0||b===0) return { mcd:'—', mcm:'—', resumen:'Números deben ser enteros no nulos.' };
  const A=a, B=b; while (b) { [a,b]=[b,a%b]; }
  const mcm=(A*B)/a;
  return { mcd:a.toString(), mcm:mcm.toLocaleString(), resumen:`MCD(${A},${B})=${a}, MCM=${mcm}.` };""")

# 17. Conversión base
M("conversion-base-decimal-binario-hexa", "🔢", "Conversión de bases (2/10/16)",
  "Convierte entre binario, decimal y hexadecimal.",
  "División sucesiva por base",
  [("n","Número","number",None),("desde","Desde","select",[("10","Decimal"),("2","Binario"),("16","Hexa")]),("a","A","select",[("10","Decimal"),("2","Binario"),("16","Hexa")])],
  [("resultado","Resultado",None),("resumen","Interpretación",None)],
  ["255 dec → hex","FF"], "FF",
  [("¿Por qué hexa?","Cada dígito = 4 bits. Direcciones memoria."),
   ("¿Binario a hexa?","Agrupa de a 4 bits."),
   ("¿Ceros?","'0x' hexa, '0b' binario (convención)."),
   ("¿Negativos?","Complemento a 2."),
   ("¿Flotante?","IEEE 754 — otro estándar.")],
  """  const n=String(i.n||'0'); const desde=Number(i.desde)||10; const a=Number(i.a)||10;
  let dec:number;
  try { dec=parseInt(n, desde); } catch { return { resultado:'—', resumen:'Número inválido.' }; }
  if (isNaN(dec)) return { resultado:'—', resumen:'Número inválido para la base dada.' };
  const res=dec.toString(a).toUpperCase();
  return { resultado:res, resumen:`${n} base ${desde} = ${res} base ${a} (= ${dec} dec).` };""")

# 18. Porcentaje
M("porcentaje-de-numero-calculadora", "%", "Porcentaje (x% de N)",
  "Calcula qué es x% de N, o qué % es A de B.",
  "x% de N = N·x/100",
  [("modo","Modo","select",[("deN","x% de N"),("aEsPct","A es qué % de B")]),("x","x o A","number",None),("n","N o B","number",None)],
  [("resultado","Resultado",None),("resumen","Interpretación",None)],
  ["25% de 80","20"], "20",
  [("¿Aumento?","Nuevo=N·(1+x/100)."),
   ("¿Descuento?","Nuevo=N·(1-x/100)."),
   ("¿Variación?","(B-A)/A · 100."),
   ("¿IVA?","Precio+IVA = precio·(1+IVA/100)."),
   ("¿Punto porcentual?","Diferencia absoluta entre %, no relativa.")],
  """  const modo=String(i.modo||'deN'); const x=Number(i.x)||0; const n=Number(i.n)||0;
  if (modo==='deN') return { resultado:(n*x/100).toFixed(2), resumen:`${x}% de ${n} = ${(n*x/100).toFixed(2)}.` };
  if (n===0) return { resultado:'—', resumen:'B no puede ser 0.' };
  return { resultado:`${(x/n*100).toFixed(2)} %`, resumen:`${x} es ${(x/n*100).toFixed(2)}% de ${n}.` };""")

# 19. Regla de tres
M("regla-de-tres-simple-directa-inversa", "📐", "Regla de 3 (simple)",
  "Directa (proporcional) o inversa (inversamente proporcional).",
  "Directa: x=b·c/a; Inversa: x=a·b/c",
  [("modo","Tipo","select",[("dir","Directa"),("inv","Inversa")]),("a","a","number",None),("b","b","number",None),("c","c","number",None)],
  [("x","x",None),("resumen","Interpretación",None)],
  ["Dir: 3 kg $60, 5 kg=?","100"], "$100",
  [("¿Directa?","Más a, más b (proporcional)."),
   ("¿Inversa?","Más a, menos b (ej. obreros × días)."),
   ("¿Compuesta?","3 o más magnitudes: combinación de directas e inversas."),
   ("¿Ejemplo?","Si 3 kg cuestan $60, 5 kg cuestan $100."),
   ("¿Unidades?","Deben coincidir.")],
  """  const modo=String(i.modo||'dir'); const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a===0) return { x:'—', resumen:'División por cero.' };
  const x=modo==='dir'?(b*c/a):(a*b/c);
  return { x:x.toFixed(2), resumen:`Resultado: ${x.toFixed(2)}.` };""")

# 20. Interés simple
M("interes-simple-capital-tiempo-tasa", "💵", "Interés simple",
  "I = C·i·t. Útil para préstamos cortos y cuentas.",
  "I = C · i · t",
  [("c","Capital","number","$"),("i","Tasa anual","number","%"),("t","Tiempo","number","años")],
  [("interes","Interés",None),("total","Total",None),("resumen","Resumen",None)],
  ["C=1000, i=10%, t=2","I=200, Total=1200"], "I=200",
  [("¿Vs compuesto?","Simple: interés solo sobre capital. Compuesto: sobre capital+intereses."),
   ("¿Mensual?","i_mensual = i_anual/12."),
   ("¿Base 360?","Bancario: usa 360 días/año."),
   ("¿Diario?","Multiplica por días/365."),
   ("¿Argentina?","Plazo fijo: TNA/365·días.")],
  """  const c=Number(i.c)||0; const tasa=Number(i.i)||0; const t=Number(i.t)||0;
  const I=c*tasa/100*t; const total=c+I;
  return { interes:`$${I.toFixed(2)}`, total:`$${total.toFixed(2)}`, resumen:`Capital ${c} al ${tasa}% durante ${t} años: intereses $${I.toFixed(0)}.` };""")

# 21. Derivada polinomio
M("derivada-polinomio-coeficientes", "📉", "Derivada de polinomio",
  "Deriva ax^n + bx^(n-1) + ... aplicando regla de potencia.",
  "d/dx(a·x^n) = n·a·x^(n-1)",
  [("coefs","Coeficientes (mayor→menor, coma)","text",None)],
  [("derivada","Derivada",None),("resumen","Interpretación",None)],
  ["3,2,1 → 3x²+2x+1","6x+2"], "6x+2",
  [("¿Regla potencia?","d/dx(x^n)=n·x^(n-1)."),
   ("¿Suma?","Derivada de suma = suma derivadas."),
   ("¿Constante?","Derivada = 0."),
   ("¿Segunda?","Deriva de nuevo el resultado."),
   ("¿Aplicación?","Tangentes, optimización, velocidad.")],
  """  const s=String(i.coefs||''); const cs=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (cs.length===0) return { derivada:'—', resumen:'Ingresá coeficientes.' };
  const n=cs.length-1;
  const dc:number[]=[]; for (let k=0;k<n;k++) dc.push(cs[k]*(n-k));
  const terms=dc.map((c,k)=>{ const exp=n-1-k; if (c===0) return ''; const sign=c<0?'-':(k===0?'':'+'); const abs=Math.abs(c); const x=exp===0?'':(exp===1?'x':`x^${exp}`); return `${sign}${abs===1&&exp>0?'':abs}${x}`; }).filter(Boolean).join('');
  return { derivada:terms||'0', resumen:`d/dx = ${terms||'0'}.` };""")

# 22. Integral polinomio
M("integral-indefinida-polinomio-coefs", "∫", "Integral de polinomio",
  "Integra polinomio con regla de potencia.",
  "∫x^n dx = x^(n+1)/(n+1) + C",
  [("coefs","Coeficientes (mayor→menor)","text",None)],
  [("integral","Integral",None),("resumen","Interpretación",None)],
  ["2,1 → 2x+1","x²+x+C"], "x²+x+C",
  [("¿+C?","Constante de integración siempre."),
   ("¿Definida?","Evaluar F(b)-F(a)."),
   ("¿Partes?","∫u·dv = uv - ∫v·du."),
   ("¿Sustitución?","Cambio de variable."),
   ("¿Área?","∫f(x)dx entre a,b.")],
  """  const s=String(i.coefs||''); const cs=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (cs.length===0) return { integral:'—', resumen:'Ingresá coeficientes.' };
  const n=cs.length-1;
  const terms=cs.map((c,k)=>{ const exp=n-k+1; const nc=c/exp; if (nc===0) return ''; const sign=nc<0?'-':(k===0?'':'+'); return `${sign}${Math.abs(nc).toFixed(2)}x^${exp}`; }).filter(Boolean).join('')+' + C';
  return { integral:terms, resumen:`∫ = ${terms}.` };""")

# 23. Matriz 2x2 determinante
M("determinante-inversa-matriz-2x2", "⊞", "Determinante e inversa 2x2",
  "Calcula det y matriz inversa 2x2.",
  "det = ad-bc; inv = (1/det)·[[d,-b],[-c,a]]",
  [("a","a","number",None),("b","b","number",None),("c","c","number",None),("d","d","number",None)],
  [("det","Determinante",None),("inversa","Inversa",None),("resumen","Interpretación",None)],
  ["[[1,2],[3,4]]","det=-2"], "det=-2",
  [("¿Singular?","det=0: sin inversa."),
   ("¿Aplicación?","Transformaciones lineales, sistemas."),
   ("¿3x3?","Regla de Sarrus o cofactores."),
   ("¿Traspuesta?","Filas ↔ columnas."),
   ("¿Identidad?","A·A⁻¹=I.")],
  """  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return { det:'0', inversa:'—', resumen:'Matriz singular, sin inversa.' };
  const f=1/det;
  const inv=`[[${(d*f).toFixed(3)}, ${(-b*f).toFixed(3)}], [${(-c*f).toFixed(3)}, ${(a*f).toFixed(3)}]]`;
  return { det:det.toFixed(3), inversa:inv, resumen:`det=${det.toFixed(2)}, invertible.` };""")

# 24. Mediana moda
M("media-mediana-moda-rango-estadistica", "📊", "Media, mediana, moda, rango",
  "Estadística descriptiva básica de un conjunto.",
  "Media aritmética, valor central, más frecuente, max-min",
  [("datos","Datos (coma)","text",None)],
  [("media","Media",None),("mediana","Mediana",None),("moda","Moda",None),("rango","Rango",None),("resumen","Interpretación",None)],
  ["2,3,3,5,7","Media=4"], "media=4",
  [("¿Mediana par?","Promedio 2 centrales."),
   ("¿Multimodal?","Más de una moda."),
   ("¿Atípicos?","Mediana resiste mejor que media."),
   ("¿Cuartiles?","Q1, Q2=mediana, Q3."),
   ("¿Desvío?","σ mide dispersión.")],
  """  const s=String(i.datos||''); const arr=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x)).sort((a,b)=>a-b);
  if (arr.length===0) return { media:'—', mediana:'—', moda:'—', rango:'—', resumen:'Sin datos.' };
  const media=arr.reduce((a,b)=>a+b,0)/arr.length;
  const med=arr.length%2?arr[Math.floor(arr.length/2)]:(arr[arr.length/2-1]+arr[arr.length/2])/2;
  const freq:Record<string,number>={}; arr.forEach(x=>{freq[x]=(freq[x]||0)+1;});
  const maxf=Math.max(...Object.values(freq));
  const moda=Object.entries(freq).filter(([,v])=>v===maxf).map(([k])=>k).join(',');
  const rango=arr[arr.length-1]-arr[0];
  return { media:media.toFixed(3), mediana:med.toFixed(3), moda, rango:rango.toFixed(2), resumen:`n=${arr.length}, media=${media.toFixed(2)}, mediana=${med.toFixed(2)}.` };""")

# 25. Desvío estándar
M("desvio-estandar-varianza-conjunto", "📉", "Desvío estándar y varianza",
  "σ y σ² (muestral y poblacional).",
  "σ=√(Σ(x-μ)²/N)",
  [("datos","Datos (coma)","text",None),("tipo","Tipo","select",[("pob","Poblacional"),("mue","Muestral")])],
  [("sigma","Desvío",None),("varianza","Varianza",None),("media","Media",None),("resumen","Interpretación",None)],
  ["2,4,4,4,5,5,7,9 pob","σ=2"], "σ=2",
  [("¿Muestral?","Divide por n-1 (Bessel correction)."),
   ("¿Poblacional?","Divide por N (completo)."),
   ("¿CV?","σ/μ·100 — compara dispersión."),
   ("¿68-95-99?","Normal: 68% en ±1σ, 95% en ±2σ."),
   ("¿Z-score?","(x-μ)/σ.")],
  """  const s=String(i.datos||''); const arr=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (arr.length===0) return { sigma:'—', varianza:'—', media:'—', resumen:'Sin datos.' };
  const m=arr.reduce((a,b)=>a+b,0)/arr.length;
  const denom=String(i.tipo)==='mue'?arr.length-1:arr.length;
  if (denom<=0) return { sigma:'—', varianza:'—', media:m.toFixed(2), resumen:'Muestra necesita n≥2.' };
  const v=arr.reduce((a,b)=>a+(b-m)**2,0)/denom;
  const sigma=Math.sqrt(v);
  return { sigma:sigma.toFixed(3), varianza:v.toFixed(3), media:m.toFixed(3), resumen:`σ=${sigma.toFixed(2)}, σ²=${v.toFixed(2)}.` };""")

# 26. Regresión lineal
M("regresion-lineal-minimos-cuadrados", "📈", "Regresión lineal simple",
  "Ajusta y = mx + b por mínimos cuadrados.",
  "m = Σ(x-x̄)(y-ȳ)/Σ(x-x̄)²",
  [("x","X (coma)","text",None),("y","Y (coma)","text",None)],
  [("m","Pendiente m",None),("b","Ordenada b",None),("r2","R²",None),("resumen","Ecuación",None)],
  ["(1,2),(2,4),(3,5)","y=1.5x+0.67"], "y=1.5x+0.67",
  [("¿R²?","Bondad del ajuste: 1 perfecto, 0 nulo."),
   ("¿Outliers?","Afectan mucho a m y b. Considerar robustos."),
   ("¿Extrapolar?","Riesgoso fuera del rango de datos."),
   ("¿Correlación r?","r=±√R²."),
   ("¿No lineal?","Transformar variables (log, raíz).")],
  """  const xs=String(i.x||'').split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  const ys=String(i.y||'').split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  const n=Math.min(xs.length,ys.length);
  if (n<2) return { m:'—', b:'—', r2:'—', resumen:'Necesita ≥2 pares (x,y).' };
  const mx=xs.slice(0,n).reduce((a,b)=>a+b,0)/n; const my=ys.slice(0,n).reduce((a,b)=>a+b,0)/n;
  let num=0, den=0, sst=0;
  for (let k=0;k<n;k++) { num+=(xs[k]-mx)*(ys[k]-my); den+=(xs[k]-mx)**2; sst+=(ys[k]-my)**2; }
  if (den===0) return { m:'—', b:'—', r2:'—', resumen:'Datos X constantes.' };
  const m=num/den; const b=my-m*mx;
  let ssr=0; for (let k=0;k<n;k++) ssr+=(ys[k]-(m*xs[k]+b))**2;
  const r2=sst===0?1:1-ssr/sst;
  return { m:m.toFixed(4), b:b.toFixed(4), r2:r2.toFixed(4), resumen:`y = ${m.toFixed(3)}x + ${b.toFixed(3)}, R² = ${r2.toFixed(3)}.` };""")

# 27. Probabilidad binomial
M("probabilidad-binomial-ensayos-exitos", "🎲", "Probabilidad binomial",
  "P(X=k) en n ensayos con probabilidad p.",
  "P = C(n,k)·p^k·(1-p)^(n-k)",
  [("n","n","number",None),("k","k","number",None),("p","p","number",None)],
  [("prob","P(X=k)",None),("media","Media np",None),("var","Varianza",None),("resumen","Interpretación",None)],
  ["n=10, k=3, p=0.5","0.117"], "0.117",
  [("¿Binomial cuándo?","n fijo, 2 resultados, p constante, independientes."),
   ("¿Normal aprox?","Si np≥5 y n(1-p)≥5."),
   ("¿Acumulada?","Suma P(X≤k) desde 0."),
   ("¿Bernoulli?","n=1."),
   ("¿Ejemplo?","10 monedas, prob de 3 caras.")],
  """  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0); const p=Number(i.p)||0;
  if (k<0||k>n||p<0||p>1) return { prob:'—', media:'—', var:'—', resumen:'Parámetros fuera de rango.' };
  let c=1; for (let j=0;j<Math.min(k,n-k);j++) c=c*(n-j)/(j+1);
  const prob=c*Math.pow(p,k)*Math.pow(1-p,n-k);
  return { prob:prob.toFixed(5), media:(n*p).toFixed(2), var:(n*p*(1-p)).toFixed(2), resumen:`P(X=${k})=${prob.toFixed(4)}, μ=${(n*p).toFixed(1)}.` };""")

# 28. Conversión angular
M("conversion-grados-radianes-gradianes", "📐", "Conversión grados/radianes/gradianes",
  "Convierte entre unidades angulares.",
  "rad = grados·π/180",
  [("valor","Valor","number",None),("desde","Desde","select",[("deg","Grados"),("rad","Radianes"),("grad","Gradianes")]),("a","A","select",[("deg","Grados"),("rad","Radianes"),("grad","Gradianes")])],
  [("resultado","Resultado",None),("resumen","Interpretación",None)],
  ["90° → rad","π/2"], "1.5708 rad",
  [("¿Por qué radianes?","Unidad natural en cálculo (d/dx sin=cos)."),
   ("¿Grados a rad?","Multiplicar por π/180."),
   ("¿2π?","Una vuelta = 360° = 2π rad = 400 grad."),
   ("¿Gradianes?","Sistema centesimal. 100 grad = 90°."),
   ("¿Cuadrantes?","90° = π/2, 180° = π, 270° = 3π/2.")],
  """  const v=Number(i.valor)||0; const de=String(i.desde||'deg'); const a=String(i.a||'rad');
  let deg:number;
  if (de==='deg') deg=v; else if (de==='rad') deg=v*180/Math.PI; else deg=v*0.9;
  let res:number;
  if (a==='deg') res=deg; else if (a==='rad') res=deg*Math.PI/180; else res=deg/0.9;
  return { resultado:`${res.toFixed(4)} ${a}`, resumen:`${v} ${de} = ${res.toFixed(4)} ${a}.` };""")

# 29. Trigonometría seno coseno
M("seno-coseno-tangente-angulo-triangulo", "📐", "Seno/coseno/tangente de ángulo",
  "Funciones trigonométricas de un ángulo.",
  "sin, cos, tan",
  [("ang","Ángulo","number",None),("unidad","Unidad","select",[("deg","Grados"),("rad","Radianes")])],
  [("seno","Seno",None),("coseno","Coseno",None),("tangente","Tangente",None),("resumen","Interpretación",None)],
  ["30°","sin=0.5"], "sin=0.5",
  [("¿Radianes?","Si unidad=rad, no convertir."),
   ("¿tan undefined?","cos=0 (90°, 270°)."),
   ("¿Identidades?","sin²+cos²=1."),
   ("¿Arcsin?","sin⁻¹: devuelve ángulo."),
   ("¿Aplicación?","Vectores, ondas, trayectorias.")],
  """  const a=Number(i.ang)||0; const u=String(i.unidad||'deg');
  const rad=u==='deg'?a*Math.PI/180:a;
  const s=Math.sin(rad), c=Math.cos(rad); const t=Math.abs(c)<1e-10?'∞':Math.tan(rad);
  return { seno:s.toFixed(4), coseno:c.toFixed(4), tangente:typeof t==='number'?t.toFixed(4):t, resumen:`${a} ${u}: sin=${s.toFixed(3)}, cos=${c.toFixed(3)}.` };""")

# 30. Conversión temperatura
M("conversion-celsius-fahrenheit-kelvin", "🌡️", "Conversión °C/°F/K",
  "Convierte entre las 3 escalas de temperatura.",
  "°F = °C·9/5+32; K=°C+273.15",
  [("valor","Temperatura","number",None),("desde","Desde","select",[("C","Celsius"),("F","Fahrenheit"),("K","Kelvin")]),("a","A","select",[("C","Celsius"),("F","Fahrenheit"),("K","Kelvin")])],
  [("resultado","Resultado",None),("resumen","Equivalencias",None)],
  ["100°C → °F","212°F"], "212°F",
  [("¿0 absoluto?","0 K = -273.15°C = -459.67°F."),
   ("¿Agua?","0-100°C / 32-212°F / 273-373 K."),
   ("¿Rankine?","°R = °F+459.67."),
   ("¿Fiebre?","38°C = 100.4°F."),
   ("¿Ciencia?","Usar Kelvin (absoluta).")],
  """  const v=Number(i.valor)||0; const de=String(i.desde||'C'); const a=String(i.a||'F');
  let c:number;
  if (de==='C') c=v; else if (de==='F') c=(v-32)*5/9; else c=v-273.15;
  let r:number;
  if (a==='C') r=c; else if (a==='F') r=c*9/5+32; else r=c+273.15;
  return { resultado:`${r.toFixed(2)}°${a}`, resumen:`${v}°${de} = ${r.toFixed(2)}°${a}.` };""")


def collect():
    return SPECS
