"""Batch 10 — Familia (30) + Idiomas (30)."""
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


def M(slug, cat, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, body):
    SPECS.append(spec(slug, cat, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


# =========================================================
# FAMILIA (30)
# =========================================================

# F1. Fecha probable parto
M("fecha-probable-parto-ultima-menstruacion", "familia", "🤰", "Fecha probable de parto (Naegele)",
  "FPP desde fecha última menstruación.",
  "FUM + 280 días",
  [("fum","Fecha FUM (YYYY-MM-DD)","text",None),("cicloDias","Duración ciclo","number",None)],
  [("fpp","FPP",None),("semanaHoy","Semana hoy",None),("resumen","Interpretación",None)],
  ["FUM 2025-06-01, 28 días","2026-03-10"], "2026-03-10",
  [("¿Naegele?","FUM + 280 días (40 semanas)."),
   ("¿Ciclo >28?","Sumar (ciclo-28) días extras."),
   ("¿Exacto?","Ecografía temprana ajusta ±1 semana."),
   ("¿Término?","37-42 semanas se considera a término."),
   ("¿Pretérmino?","<37 semanas.")],
  """  const f=String(i.fum||''); const c=Number(i.cicloDias)||28;
  if (!f) return { fpp:'—', semanaHoy:'—', resumen:'Ingresá FUM.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { fpp:'—', semanaHoy:'—', resumen:'Fecha inválida.' };
  const fpp=new Date(d.getTime()+(280+(c-28))*86400000);
  const hoy=new Date();
  const sem=Math.floor((hoy.getTime()-d.getTime())/(7*86400000));
  return { fpp:fpp.toISOString().slice(0,10), semanaHoy:`Semana ${sem}`, resumen:`FPP: ${fpp.toISOString().slice(0,10)} (semana ${sem} hoy).` };""")

# F2. Semanas gestación
M("semanas-gestacion-hoy-bebe-trimestre", "familia", "📅", "Semanas de gestación hoy",
  "Semanas y trimestre actual del embarazo.",
  "(hoy - FUM)/7",
  [("fum","Fecha FUM","text",None)],
  [("semanas","Semanas",None),("dias","Días extra",None),("trimestre","Trimestre",None),("resumen","Interpretación",None)],
  ["FUM 2025-09-01","18 sem 3d"], "2° trimestre",
  [("¿Trimestres?","1°:1-13, 2°:14-27, 3°:28-40."),
   ("¿Viabilidad?","Desde sem 24 con soporte neonatal."),
   ("¿Movimientos?","A partir de sem 18-22."),
   ("¿Ecos?","11-14, 20-22, 32-34 sem."),
   ("¿Inducir?","Si >41 sem sin progreso.")],
  """  const f=String(i.fum||''); if (!f) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Ingresá FUM.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { semanas:'—', dias:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const h=new Date();
  const dif=(h.getTime()-d.getTime())/86400000;
  const s=Math.floor(dif/7); const dd=Math.floor(dif%7);
  const tri=s<=13?'1°':s<=27?'2°':'3°';
  return { semanas:`${s}`, dias:`${dd}d`, trimestre:tri, resumen:`${s} semanas ${dd} días (${tri} trimestre).` };""")

# F3. Ventana fértil
M("ventana-fertil-ovulacion-ciclo-mujer", "familia", "🌸", "Ventana fértil / ovulación",
  "Días fértiles según ciclo menstrual.",
  "Ovulación = ciclo - 14",
  [("ultimaRegla","Fecha última regla","text",None),("cicloDias","Ciclo días","number",None)],
  [("ovulacion","Ovulación",None),("ventana","Ventana fértil",None),("proxRegla","Próx regla",None),("resumen","Interpretación",None)],
  ["2025-10-01, 28 días","2025-10-15"], "Ventana 13-17 oct",
  [("¿Ventana?","5 días antes + día ovulación + 1 día."),
   ("¿Ciclo irregular?","Menos preciso; mejor test LH."),
   ("¿Temperatura basal?","Sube 0.3-0.5°C post ovulación."),
   ("¿Síntomas?","Moco elástico clara de huevo, mittelschmerz."),
   ("¿Conceptivo?","Riesgo embarazo en ventana.")],
  """  const f=String(i.ultimaRegla||''); const c=Number(i.cicloDias)||28;
  if (!f) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Ingresá fecha.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { ovulacion:'—', ventana:'—', proxRegla:'—', resumen:'Fecha inválida.' };
  const ovu=new Date(d.getTime()+(c-14)*86400000);
  const vIni=new Date(ovu.getTime()-5*86400000);
  const vFin=new Date(ovu.getTime()+1*86400000);
  const prox=new Date(d.getTime()+c*86400000);
  return { ovulacion:ovu.toISOString().slice(0,10), ventana:`${vIni.toISOString().slice(0,10)} a ${vFin.toISOString().slice(0,10)}`, proxRegla:prox.toISOString().slice(0,10), resumen:`Ovulación: ${ovu.toISOString().slice(0,10)}. Máx fertilidad: 6 días previos.` };""")

# F4. Peso ideal bebé OMS
M("percentil-peso-bebe-oms-edad-meses", "familia", "👶", "Percentil de peso bebé (referencia)",
  "Peso aprox por percentil según edad (meses).",
  "Tabla OMS referencial",
  [("mes","Edad meses","number",None),("sexo","Sexo","select",[("m","Masculino"),("f","Femenino")]),("peso","Peso actual","number","kg")],
  [("mediana","P50",None),("rango","P3-P97",None),("evaluacion","Evaluación",None),("resumen","Interpretación",None)],
  ["12m M, 10kg","P50 ~9.6"], "Normal",
  [("¿P50?","Mediana: mitad arriba, mitad abajo."),
   ("¿<P3?","Posible bajo peso: consultar pediatra."),
   ("¿>P97?","Sobrepeso: consultar."),
   ("¿Variación?","Normal fluctuar ±1 percentil entre visitas."),
   ("¿Tabla OMS?","Curvas estándar 2006 0-5 años.")],
  """  const m=Number(i.mes)||0; const s=String(i.sexo||'m'); const p=Number(i.peso)||0;
  const p50M=[3.3,4.5,5.6,6.4,7,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,10.2,10.8,11.3,11.8,12.2,12.7,13.1];
  const p50F=[3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9,9.5,10.1,10.6,11.1,11.5,12,12.4];
  const p=s==='m'?p50M:p50F;
  const idx=Math.min(Math.floor(m/3),p.length-1);
  const med=p[idx];
  const ev=p<med*0.8?'Bajo':p>med*1.2?'Alto':'Normal';
  return { mediana:`${med} kg`, rango:`~${(med*0.8).toFixed(1)} a ${(med*1.2).toFixed(1)} kg`, evaluacion:ev, resumen:`A los ${m} meses, P50 ${med}kg. Tu bebé (${p}kg): ${ev}.` };""")

# F5. Costo criar hijo
M("costo-total-criar-hijo-18-anios", "familia", "💰", "Costo criar hijo 0-18 años",
  "Estimación acumulada hasta 18.",
  "Mensual × 12 × 18",
  [("mensual","Gasto mensual","number","$"),("infl","Inflación anual","number","%")],
  [("totalNom","Total nominal",None),("totalReal","Total hoy",None),("resumen","Interpretación",None)],
  ["$500/mes, 0%","$108000"], "$108000",
  [("¿Incluye?","Comida, ropa, salud, escuela, ocio."),
   ("¿Universidad?","Sumar aparte (18+)."),
   ("¿Primer año?","Más caro: pañales, cochecito, cuna."),
   ("¿Familia?","Segundo hijo usa hand-me-downs, 20-30% menos."),
   ("¿Planificar?","Considerar seguros y ahorro educativo.")],
  """  const m=Number(i.mensual)||0; const inf=Number(i.infl)||0;
  let tot=0, presente=0;
  for (let k=0;k<18;k++) { const costAnio=m*12*Math.pow(1+inf/100,k); tot+=costAnio; presente+=m*12; }
  return { totalNom:`$${tot.toFixed(0)}`, totalReal:`$${presente.toFixed(0)}`, resumen:`18 años a $${m}/mes: nominal $${tot.toFixed(0)}.` };""")

# F6. Pañales mes
M("pañales-por-dia-mes-bebe-edad", "familia", "🧷", "Pañales por día/mes según edad",
  "Consumo según edad.",
  "Tabla por etapas",
  [("mes","Edad meses","number",None)],
  [("diarios","Por día",None),("mensuales","Por mes",None),("tamano","Talle",None),("resumen","Interpretación",None)],
  ["2 meses","10/día"], "300/mes",
  [("¿RN?","10-12 pañales/día primeros 2 meses."),
   ("¿6 meses?","6-8 pañales/día."),
   ("¿Nocturnos?","Más absorbentes al dormir."),
   ("¿Tela?","Inversión inicial alta, ahorro largo plazo."),
   ("¿Tamaños?","Siempre peso del bebé, no edad estricta.")],
  """  const m=Number(i.mes)||0;
  let d:number; let t:string;
  if (m<=2) { d=11; t='RN/T1'; }
  else if (m<=6) { d=8; t='T2/T3'; }
  else if (m<=12) { d=6; t='T3/T4'; }
  else if (m<=24) { d=5; t='T4/T5'; }
  else { d=4; t='T5/T6'; }
  return { diarios:`${d}/día`, mensuales:`~${d*30}/mes`, tamano:t, resumen:`A los ${m} meses: ${d} pañales/día (~${d*30}/mes), talle ${t}.` };""")

# F7. Fórmula lactancia
M("onzas-biberon-peso-bebe-dia", "familia", "🍼", "Onzas biberón por peso bebé",
  "Leche/día según peso (fórmula).",
  "~75-105 ml/kg/día (0-3 meses)",
  [("peso","Peso bebé","number","kg"),("edadMes","Edad meses","number",None)],
  [("mlDia","ml/día",None),("porToma","Por toma (6 tomas)",None),("resumen","Interpretación",None)],
  ["4kg, 2 meses","~600 ml"], "~100 ml × 6 tomas",
  [("¿Lactancia materna?","A demanda, sin medir."),
   ("¿Cuándo bajar?","A partir de 6 meses con alimentación complementaria."),
   ("¿Señales hambre?","Manos a boca, movimientos succión."),
   ("¿Reflujo?","Pausas, no acostar inmediatamente."),
   ("¿Agua?","Menores 6 meses solo leche materna o fórmula.")],
  """  const p=Number(i.peso)||0; const m=Number(i.edadMes)||0;
  let mlkg=90; if (m>3) mlkg=75; if (m>6) mlkg=60;
  const mlDia=p*mlkg; const tomas=m<=3?6:5;
  return { mlDia:`${mlDia.toFixed(0)} ml/día`, porToma:`${(mlDia/tomas).toFixed(0)} ml/toma`, resumen:`${p}kg a ${m}m: ~${mlDia.toFixed(0)}ml/día en ${tomas} tomas.` };""")

# F8. Mesada edad
M("mesada-por-edad-hijo-semanal-mensual", "familia", "💵", "Mesada por edad",
  "Mesada semanal según edad (regla $1 × años).",
  "Ajustar por contexto",
  [("edad","Edad hijo","number",None),("factor","Factor $/año","number",None)],
  [("semanal","Semanal",None),("mensual","Mensual",None),("resumen","Recomendación",None)],
  ["10 años, $1","$10/sem"], "$10/sem",
  [("¿Por qué?","Enseña valor dinero y ahorro."),
   ("¿Ligado a tareas?","Debate: unos sí, otros no."),
   ("¿Aumento?","Anual, acordado con el hijo."),
   ("¿Adolescentes?","Más alta para gastos sociales."),
   ("¿Ahorro?","Fomentar 30% en alcancía/banco.")],
  """  const a=Number(i.edad)||0; const f=Number(i.factor)||1;
  const sem=a*f;
  return { semanal:`$${sem.toFixed(2)}`, mensual:`$${(sem*4).toFixed(2)}`, resumen:`Edad ${a}: $${sem}/semana ≈ $${(sem*4)}/mes.` };""")

# F9. Vacunas calendario
M("vacunas-faltantes-bebe-edad-meses", "familia", "💉", "Vacunas al día según edad",
  "Checklist vacunas esperadas al mes X (ARG 2025).",
  "Referencia calendario",
  [("mes","Edad meses","number",None)],
  [("esperadas","Vacunas esperadas",None),("proximas","Próxima cita",None),("resumen","Recomendación",None)],
  ["6 meses","BCG, HB, OPV..."], "Completar las de 2, 4 y 6 meses",
  [("¿ARG?","Calendario oficial Ministerio de Salud."),
   ("¿Retraso?","Ponerse al día lo antes posible."),
   ("¿Obligatorias?","Sí en ARG, asociadas a asignaciones."),
   ("¿Privadas?","Algunas opcionales: Meningo, rotavirus en algunas regiones."),
   ("¿Libreta?","Guardar siempre.")],
  """  const m=Number(i.mes)||0;
  const cal:Record<number,string>={0:'BCG, Hep B',2:'Pentavalente, OPV, Rotavirus, Neumo, Meningo',4:'Pentavalente, OPV, Rotavirus, Neumo',6:'Pentavalente, OPV, Neumo, Antigripal',12:'Triple Viral, Hep A, Neumo, Meningo refuerzo',15:'Varicela',18:'DTP, OPV refuerzo'};
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let esperadas:string[]=[];
  for (const k of keys) if (k<=m) esperadas.push(`${k}m: ${cal[k]}`);
  const prox=keys.find(k=>k>m);
  return { esperadas:esperadas.join('; ')||'Ninguna', proximas:prox!==undefined?`A los ${prox}m: ${cal[prox]}`:'Calendario completo (edad escolar siguiente)', resumen:`A los ${m}m: ${esperadas.length} grupos de vacunas esperados.` };""")

# F10. Edad escolar inicio
M("edad-ingreso-escolar-primaria-jardin", "familia", "🏫", "Edad ingreso escolar",
  "Edad típica de ingreso por nivel.",
  "Argentina: corte 30 junio",
  [("fechaNac","Fecha nacimiento","text",None),("nivel","Nivel","select",[("jardin3","Jardín 3"),("preescolar","Preescolar 5"),("primaria","Primaria"),("secundaria","Secundaria")])],
  [("anio","Año de ingreso",None),("edad","Edad al ingresar",None),("resumen","Interpretación",None)],
  ["nacido 2022, jardín 3","2025"], "2025",
  [("¿Corte?","ARG: cumplir edad antes del 30 de junio del año."),
   ("¿Adelantar?","Requiere evaluación."),
   ("¿Repitencia?","Poca en nivel inicial."),
   ("¿Escolaridad?","Obligatoria desde sala de 4 años."),
   ("¿Secundaria?","6 años tradicional; 5 años modalidad.")],
  """  const f=String(i.fechaNac||''); const n=String(i.nivel||'jardin3');
  if (!f) return { anio:'—', edad:'—', resumen:'Ingresá fecha nacimiento.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { anio:'—', edad:'—', resumen:'Fecha inválida.' };
  const edades:Record<string,number>={jardin3:3,preescolar:5,primaria:6,secundaria:12};
  const e=edades[n]||6;
  const anio=d.getFullYear()+e;
  return { anio:anio.toString(), edad:`${e} años`, resumen:`Nacido ${d.getFullYear()}: ingresa ${n} en ${anio} con ${e} años.` };""")

# F11. Ahorro educativo
M("ahorro-universidad-hijo-18-anios-cuota", "familia", "🎓", "Ahorro universidad hijo",
  "Cuota mensual para ahorrar monto objetivo.",
  "Anualidad futura",
  [("monto","Monto futuro","number","$"),("anios","Años disponibles","number",None),("tasa","Tasa anual","number","%")],
  [("cuota","Cuota mensual",None),("totalAhorro","Total ahorrado",None),("resumen","Recomendación",None)],
  ["$30000, 15 años, 5%","$110"], "~$110/mes",
  [("¿Compuesto?","Importa empezar temprano."),
   ("¿Inflación?","Ajustar cuota anualmente."),
   ("¿Instrumentos?","Fondos indexados, bonos, plazo fijo."),
   ("¿529 plan?","EE.UU.: exento impuestos educativos."),
   ("¿Beca?","Reduce necesidad, pero no reemplaza ahorro.")],
  """  const m=Number(i.monto)||0; const a=Number(i.anios)||1; const t=Number(i.tasa)||0;
  const im=t/100/12; const n=a*12;
  const c=im===0?m/n:m*im/(Math.pow(1+im,n)-1);
  return { cuota:`$${c.toFixed(2)}`, totalAhorro:`$${(c*n).toFixed(0)}`, resumen:`Para $${m} en ${a} años: $${c.toFixed(0)}/mes.` };""")

# F12. Tiempo pantalla
M("tiempo-pantalla-recomendado-hijo-edad", "familia", "📱", "Tiempo pantalla recomendado",
  "Máximo diario según edad.",
  "Guías AAP",
  [("edad","Edad","number",None)],
  [("maxDia","Máx/día",None),("consejos","Consejos",None),("resumen","Interpretación",None)],
  ["5 años","1h"], "1h",
  [("¿<2 años?","Evitar excepto videollamadas familia."),
   ("¿2-5 años?","Máx 1h, alta calidad (Sesame Street, educativo)."),
   ("¿6-12 años?","2h, con límites y contexto."),
   ("¿Adolescentes?","Consensuado, focalizado en calidad."),
   ("¿Fin de semana?","Excepciones OK pero con moderación.")],
  """  const e=Number(i.edad)||0;
  let max:string; let c:string;
  if (e<2) { max='0h (evitar)'; c='Solo videollamadas familia'; }
  else if (e<6) { max='1h'; c='Contenido de calidad, acompañar'; }
  else if (e<12) { max='2h'; c='Límites claros, sin pantallas mientras come'; }
  else { max='2-3h'; c='Ayudar a autorregular, charlar sobre consumo'; }
  return { maxDia:max, consejos:c, resumen:`Edad ${e}: máx ${max}. ${c}.` };""")

# F13. Medicamento por peso
M("dosis-pediatrica-mg-por-kg-medicamento", "familia", "💊", "Dosis pediátrica (mg/kg)",
  "Dosis por peso para medicamentos comunes.",
  "Dosis = peso × mg/kg",
  [("peso","Peso hijo","number","kg"),("med","Medicamento","select",[("paracetamol","Paracetamol 10-15mg/kg"),("ibuprofeno","Ibuprofeno 5-10mg/kg"),("amoxi","Amoxicilina 50mg/kg/día")])],
  [("dosis","Dosis por toma",None),("frecuencia","Cada",None),("resumen","Recomendación",None)],
  ["15kg, paracetamol","150-225mg"], "150-225mg c/6h",
  [("¿Paracetamol?","10-15 mg/kg/dosis, máx 4 dosis/día."),
   ("¿Ibuprofeno?","5-10 mg/kg, c/8h. Con estómago lleno."),
   ("¿Amoxi?","50mg/kg/día dividida en 2-3 tomas."),
   ("¿Consultar?","Dosis siempre con pediatra."),
   ("¿Gotas vs jarabe?","Leer prospecto, mg/ml varían.")],
  """  const p=Number(i.peso)||0; const m=String(i.med||'paracetamol');
  const ds:Record<string,{min:number,max:number,cada:string}>={paracetamol:{min:10,max:15,cada:'6h'},ibuprofeno:{min:5,max:10,cada:'8h'},amoxi:{min:25,max:25,cada:'12h'}};
  const d=ds[m]||ds.paracetamol;
  return { dosis:`${(p*d.min).toFixed(0)}-${(p*d.max).toFixed(0)} mg`, frecuencia:`Cada ${d.cada}`, resumen:`${p}kg ${m}: ${(p*d.min).toFixed(0)}-${(p*d.max).toFixed(0)}mg cada ${d.cada}. Consultar pediatra.` };""")

# F14. Fiesta presupuesto
M("costo-fiesta-cumpleanos-infantil-invitados", "familia", "🎂", "Fiesta infantil presupuesto",
  "Presupuesto total según invitados y nivel.",
  "Nivel × invitados",
  [("invitados","# Invitados","number",None),("nivel","Nivel","select",[("casa","Casa simple"),("medio","Salón medio"),("lujo","Salón premium")])]
  ,
  [("costo","Costo estimado",None),("perInvitado","Por invitado",None),("resumen","Interpretación",None)],
  ["20 invitados, salón medio","$300-500"], "$300-500",
  [("¿Casa?","$5-15/invitado: torta, snacks, juegos."),
   ("¿Salón?","$20-60/invitado: animación, catering."),
   ("¿Premium?","$80+/invitado: temática, mago, inflables."),
   ("¿Ahorro?","Horario vespertino más barato que nocturno."),
   ("¿Invitados?","Regla: edad + 2 máx.")],
  """  const n=Number(i.invitados)||0; const l=String(i.nivel||'casa');
  const pc:Record<string,[number,number]>={casa:[5,15],medio:[20,60],lujo:[80,200]};
  const [mi,ma]=pc[l]||pc.casa;
  return { costo:`$${(n*mi).toFixed(0)}-${(n*ma).toFixed(0)}`, perInvitado:`$${mi}-${ma}`, resumen:`${n} invitados ${l}: $${n*mi}-${n*ma}.` };""")

# F15. Licencia maternidad
M("dias-licencia-maternidad-paternidad-pais", "familia", "👶", "Días licencia maternidad/paternidad",
  "Días por país/tipo de licencia.",
  "Referencia por país",
  [("pais","País","select",[("ar","Argentina"),("es","España"),("mx","México"),("co","Colombia")]),("tipo","Tipo","select",[("mat","Maternidad"),("pat","Paternidad")])]
  ,
  [("dias","Días",None),("remunerada","Remunerada",None),("resumen","Detalles",None)],
  ["AR, maternidad","90 días"], "90 días",
  [("¿Argentina?","Maternidad 90 días (45+45). Paternidad 2 días."),
   ("¿España?","16 semanas cada uno."),
   ("¿México?","Maternidad 12 semanas. Paternidad 5 días."),
   ("¿Colombia?","Maternidad 18 semanas. Paternidad 2 semanas."),
   ("¿Adopción?","Generalmente equivalente a maternidad.")],
  """  const p=String(i.pais||'ar'); const t=String(i.tipo||'mat');
  const map:Record<string,Record<string,number>>={ar:{mat:90,pat:2},es:{mat:112,pat:112},mx:{mat:84,pat:5},co:{mat:126,pat:14}};
  const d=(map[p]&&map[p][t])||0;
  return { dias:`${d} días`, remunerada:'Sí', resumen:`${p.toUpperCase()} ${t}: ${d} días remunerados.` };""")

# F16. Test embarazo
M("dias-minimos-test-embarazo-positivo", "familia", "🔬", "Días para test de embarazo",
  "Cuándo hacer test para máxima precisión.",
  "Días post ovulación",
  [("fum","FUM","text",None),("cicloDias","Ciclo","number",None)],
  [("proxRegla","Próx regla",None),("testFiable","Test fiable",None),("betaHcg","Beta hCG",None),("resumen","Recomendación",None)],
  ["2025-10-01, 28 días","2025-10-29"], "Después del atraso",
  [("¿hCG?","Empieza días post-implantación (6-12 DPO)."),
   ("¿Orina?","Fiable día esperado de regla."),
   ("¿Sangre?","Detecta antes: 7-10 DPO."),
   ("¿Falsos negativos?","Comunes antes del atraso."),
   ("¿Falsos positivos?","Raros, descartar medicamentos.")],
  """  const f=String(i.fum||''); const c=Number(i.cicloDias)||28;
  if (!f) return { proxRegla:'—', testFiable:'—', betaHcg:'—', resumen:'Ingresá FUM.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { proxRegla:'—', testFiable:'—', betaHcg:'—', resumen:'Fecha inválida.' };
  const prox=new Date(d.getTime()+c*86400000);
  const testOk=new Date(prox.getTime()-0);
  const beta=new Date(d.getTime()+(c-14+9)*86400000);
  return { proxRegla:prox.toISOString().slice(0,10), testFiable:testOk.toISOString().slice(0,10)+' (orina)', betaHcg:beta.toISOString().slice(0,10)+' (sangre)', resumen:`Test orina confiable: ${testOk.toISOString().slice(0,10)}. Beta: desde ${beta.toISOString().slice(0,10)}.` };""")

# F17. Altura adulto niño
M("altura-adulta-hijo-formula-padres", "familia", "📏", "Altura adulta estimada (genética)",
  "Altura adulta estimada por padres.",
  "Tanner method",
  [("papa","Altura padre","number","cm"),("mama","Altura madre","number","cm"),("sexo","Sexo hijo","select",[("m","Varón"),("f","Niña")])]
  ,
  [("estimada","Altura estimada",None),("rango","Rango ±8cm",None),("resumen","Interpretación",None)],
  ["175+165, M","176cm"], "168-184cm",
  [("¿Método Tanner?","Padre+madre +13 (m) o -13 (f), /2."),
   ("¿Precisión?","±8-10 cm."),
   ("¿Nutrición?","Afecta hasta 5cm."),
   ("¿Pubertad temprana?","Puede reducir altura final."),
   ("¿Deporte?","Con moderación, no afecta altura.")],
  """  const pa=Number(i.papa)||0; const ma=Number(i.mama)||0; const s=String(i.sexo||'m');
  const base=s==='m'?(pa+ma+13)/2:(pa+ma-13)/2;
  return { estimada:`${base.toFixed(0)} cm`, rango:`${(base-8).toFixed(0)}-${(base+8).toFixed(0)} cm`, resumen:`Estimada: ${base.toFixed(0)}cm (±8cm genético).` };""")

# F18. Noches sueño
M("horas-sueno-hijo-edad-recomendadas", "familia", "😴", "Horas de sueño recomendadas",
  "Horas por edad (NSF/AAP).",
  "Tabla referencia",
  [("edad","Edad","number",None)],
  [("horas","Horas/día",None),("siestas","Siestas",None),("resumen","Recomendación",None)],
  ["2 años","11-14h"], "11-14h + siesta",
  [("¿Bebé?","0-3m: 14-17h; 4-11m: 12-15h."),
   ("¿Niño?","1-2: 11-14h; 3-5: 10-13h; 6-13: 9-11h."),
   ("¿Adolescente?","8-10h."),
   ("¿Siestas?","Hasta ~4 años."),
   ("¿Rutina?","Mismo horario ayuda calidad.")],
  """  const e=Number(i.edad)||0;
  let h:string; let s:string;
  if (e<1) { h='12-17h'; s='3-4 siestas'; }
  else if (e<3) { h='11-14h'; s='1-2 siestas'; }
  else if (e<6) { h='10-13h'; s='1 siesta opcional'; }
  else if (e<14) { h='9-11h'; s='Sin siesta'; }
  else { h='8-10h'; s='Sin siesta'; }
  return { horas:h, siestas:s, resumen:`Edad ${e}: ${h}, ${s}.` };""")

# F19. Peso ideal embarazo
M("aumento-peso-embarazo-imc-semana", "familia", "⚖️", "Aumento peso en embarazo",
  "Rango ganancia según IMC pregestacional.",
  "Guías IOM",
  [("imc","IMC antes","number",None),("multiple","Gemelar","select",[("no","No"),("si","Sí")])]
  ,
  [("rango","Ganancia total",None),("semanal","Por semana (T2-T3)",None),("resumen","Recomendación",None)],
  ["IMC 22","11.5-16kg"], "11.5-16kg",
  [("¿Bajo peso?","IMC<18.5: 12.5-18 kg."),
   ("¿Normal?","18.5-25: 11.5-16 kg."),
   ("¿Sobrepeso?","25-30: 7-11 kg."),
   ("¿Obesidad?","30+: 5-9 kg."),
   ("¿Gemelar?","Sumar 5-10 kg al rango.")],
  """  const imc=Number(i.imc)||22; const mul=String(i.multiple||'no')==='si';
  let r:[number,number];
  if (imc<18.5) r=[12.5,18]; else if (imc<25) r=[11.5,16]; else if (imc<30) r=[7,11]; else r=[5,9];
  if (mul) { r=[r[0]+5,r[1]+5]; }
  return { rango:`${r[0]}-${r[1]} kg`, semanal:`${(r[0]/25).toFixed(2)}-${(r[1]/25).toFixed(2)} kg/sem`, resumen:`IMC ${imc} ${mul?'gemelar':''}: ${r[0]}-${r[1]}kg total.` };""")

# F20. Etapa desarrollo
M("hitos-desarrollo-bebe-edad-meses", "familia", "🧠", "Hitos de desarrollo bebé",
  "Hitos esperados a edad X meses.",
  "Referencia pediátrica",
  [("mes","Edad meses","number",None)],
  [("motores","Motores",None),("lenguaje","Lenguaje",None),("social","Social",None),("resumen","Interpretación",None)],
  ["6m","Se sienta con apoyo"], "Balbucea",
  [("¿Variación?","Normal ±2-3 meses."),
   ("¿Alarma?","No sienta 9m, no camina 18m: consultar."),
   ("¿Lenguaje?","Primer palabra ~12m, 2 palabras ~24m."),
   ("¿Autismo?","Preocupa si hay regresión."),
   ("¿Screening M-CHAT?","Evaluar 18-24m.")],
  """  const m=Number(i.mes)||0;
  const h:Record<number,[string,string,string]>={
    2:['Sostiene cabeza','Sonríe reactivo','Mira rostros'],
    4:['Se apoya en brazos','Balbuceos','Ríe fuerte'],
    6:['Se sienta con apoyo','Consonantes','Juego espejo'],
    9:['Gatea','Primera palabra','Extraña'],
    12:['Se para solo','3-5 palabras','Saluda chau'],
    18:['Camina, sube escalera','10+ palabras','Imita'],
    24:['Corre, patea','2 palabras juntas','Juego simbólico']
  };
  const keys=Object.keys(h).map(Number).sort((a,b)=>a-b);
  let cercano=keys[0]; for (const k of keys) if (k<=m) cercano=k;
  const [mo,la,so]=h[cercano];
  return { motores:mo, lenguaje:la, social:so, resumen:`A los ~${cercano}m: motor ${mo}; lenguaje ${la}; social ${so}.` };""")

# F21. Desparasitar
M("frecuencia-desparasitar-familia-tipos", "familia", "💊", "Frecuencia desparasitar familia",
  "Cada cuánto desparasitar según contexto.",
  "Guía general",
  [("zona","Zona","select",[("urbano","Urbano"),("rural","Rural"),("tropical","Tropical")]),("edad","Edad","number",None)],
  [("frecuencia","Frecuencia",None),("medicamento","Medicamento típico",None),("resumen","Recomendación",None)],
  ["Rural, 5","Cada 6 meses"], "Cada 6 meses",
  [("¿Urbano?","1-2 veces/año si contacto bajo."),
   ("¿Rural?","Cada 6 meses recomendado."),
   ("¿Tropical?","Cada 3-4 meses."),
   ("¿Mascotas?","Desparasitar también."),
   ("¿Albendazol?","Más usado, dosis única de 400mg.")],
  """  const z=String(i.zona||'urbano'); const e=Number(i.edad)||10;
  const f:Record<string,string>={urbano:'Anual',rural:'Cada 6 meses',tropical:'Cada 3-4 meses'};
  return { frecuencia:f[z]||'Anual', medicamento:'Albendazol/Mebendazol (ver médico)', resumen:`Zona ${z}: ${f[z]}. Consultar médico.` };""")

# F22. Kilos viaje con bebé
M("kilos-equipaje-viaje-bebe-dias", "familia", "🧳", "Equipaje con bebé (kg estimado)",
  "Kg equipaje según duración y edad.",
  "Estimación empírica",
  [("dias","Días viaje","number",None),("edadMes","Edad meses","number",None)],
  [("kg","Estimado kg",None),("items","Ítems clave",None),("resumen","Recomendación",None)],
  ["7 días, 6 meses","~15kg"], "~15kg",
  [("¿Qué llevar?","Pañales, ropa x2/día, fórmula, cochecito."),
   ("¿Volumen?","Cochecito ocupa mucho, valet check."),
   ("¿Comprar destino?","Pañales y toallitas sí; fórmula no (marca)."),
   ("¿Avión?","Stroller gate-check gratis normalmente."),
   ("¿Fórmulas líquidas?","Permitidas >100ml en seguridad aeropuerto.")],
  """  const d=Number(i.dias)||0; const m=Number(i.edadMes)||0;
  const base=5; const porDia=m<12?1.5:1;
  const kg=base+d*porDia;
  return { kg:`${kg.toFixed(1)} kg`, items:'Pañales, ropa, fórmula, cochecito, silla auto', resumen:`${d} días con bebé ${m}m: ~${kg.toFixed(0)}kg.` };""")

# F23. Cuántos cuidadores
M("numero-cuidadores-fiesta-infantil-edad", "familia", "👩‍🏫", "Ratio cuidador:niño por edad",
  "Recomendado para eventos.",
  "Ratios normativos",
  [("edad","Edad niños","number",None),("numNinos","# niños","number",None)],
  [("ratio","Ratio 1:N",None),("adultos","Adultos mínimo",None),("resumen","Recomendación",None)],
  ["3 años, 10 niños","1:5"], "2 adultos",
  [("¿0-18m?","1:3 o 1:4."),
   ("¿18m-3a?","1:5."),
   ("¿3-5a?","1:8."),
   ("¿6-8a?","1:10."),
   ("¿Agua/piscina?","Doblar ratio por seguridad.")],
  """  const e=Number(i.edad)||0; const n=Number(i.numNinos)||0;
  let ratio:number;
  if (e<=2) ratio=4; else if (e<=3) ratio=5; else if (e<=5) ratio=8; else ratio=10;
  const ad=Math.ceil(n/ratio);
  return { ratio:`1:${ratio}`, adultos:`${ad} adultos`, resumen:`${n} niños de ${e}a: ${ad} adultos (1:${ratio}).` };""")

# F24. Gasto escolar
M("gasto-inicio-escolar-utiles-uniforme-mes", "familia", "🎒", "Gasto inicio escolar",
  "Presupuesto útiles y uniforme.",
  "Por nivel",
  [("nivel","Nivel","select",[("inicial","Inicial"),("primaria","Primaria"),("secundaria","Secundaria")]),("privado","Privada","select",[("no","No"),("si","Sí")])],
  [("util","Útiles",None),("uniforme","Uniforme",None),("total","Total",None),("resumen","Interpretación",None)],
  ["Primaria pública","$100-200"], "$150 total",
  [("¿Útiles?","Inicial $50-100, primaria $100-200, secundaria $150-300."),
   ("¿Uniforme?","Pública opcional, privada obligatorio 3-4 juegos."),
   ("¿Cuota?","Privada: entre $200-800/mes en ARG."),
   ("¿Cooperadora?","Anual voluntaria en pública."),
   ("¿Libros?","Algunos provistos por escuela.")],
  """  const n=String(i.nivel||'primaria'); const p=String(i.privado||'no')==='si';
  const uti:Record<string,number>={inicial:75,primaria:150,secundaria:225};
  const uni=p?300:0;
  const u=uti[n]||150;
  return { util:`$${u}`, uniforme:`$${uni}`, total:`$${u+uni}`, resumen:`${n} ${p?'privada':'pública'}: útiles $${u} + uniforme $${uni} = $${u+uni}.` };""")

# F25. Cuando hablar sexo
M("edad-conversar-temas-dificiles-hijo", "familia", "💬", "Edad para conversar temas difíciles",
  "Edad apropiada por tema.",
  "Guía pediátrica",
  [("tema","Tema","select",[("sexo","Sexualidad"),("muerte","Muerte"),("drogas","Drogas"),("divorcio","Divorcio"),("redes","Redes sociales")])]
  ,
  [("edad","Inicio recomendado",None),("enfoque","Enfoque",None),("resumen","Recomendación",None)],
  ["Sexualidad","3+ (nombres)"], "Progresivo",
  [("¿Sexualidad?","Nombres correctos desde 3a, detalles progresivos."),
   ("¿Muerte?","4-6a concepto, sin evasivas."),
   ("¿Drogas?","8-10a prevención, 12+ honestidad."),
   ("¿Divorcio?","Siempre honesto, sin culpa al niño."),
   ("¿Redes?","Antes de abrir cuentas, límites claros.")],
  """  const t=String(i.tema||'sexo');
  const g:Record<string,[string,string]>={sexo:['Desde 3 años (partes del cuerpo)','Información progresiva honesta'],muerte:['Desde 4 años','Palabras claras, no eufemismos confusos'],drogas:['Desde 8-10 años','Prevención y factores riesgo'],divorcio:['Apenas decidido','Juntos, no culpabilizar al niño'],redes:['Antes de abrir cuentas','Privacidad y límites claros']};
  const [e,en]=g[t]||g.sexo;
  return { edad:e, enfoque:en, resumen:`${t}: ${e}. ${en}.` };""")

# F26. Actividades por semana
M("actividades-extra-ninos-por-semana-maximo", "familia", "🎨", "Actividades extra por semana (máx)",
  "Recomendación de actividades según edad.",
  "Balance juego/estructura",
  [("edad","Edad","number",None)],
  [("maxSemanal","Máx por semana",None),("tiempoLibre","Juego libre min/día",None),("resumen","Recomendación",None)],
  ["7 años","2-3"], "2-3 actividades",
  [("¿<5?","Juego libre es la actividad principal."),
   ("¿5-10?","1-3 actividades estructuradas."),
   ("¿10+?","Pueden manejar 3-5 si eligen."),
   ("¿Sobrecarga?","Estrés, mal rendimiento escolar."),
   ("¿Elegir?","Mejor que decidan qué les apasiona.")],
  """  const e=Number(i.edad)||0;
  let max:string; let tl:string;
  if (e<5) { max='0-1'; tl='180+ min'; }
  else if (e<10) { max='2-3'; tl='120 min'; }
  else { max='3-5'; tl='60-90 min'; }
  return { maxSemanal:max, tiempoLibre:tl, resumen:`Edad ${e}: máx ${max} actividades, juego libre ${tl}/día.` };""")

# F27. Pareja roce discusión
M("horas-pareja-calidad-semanal-relacion", "familia", "💑", "Horas de calidad con pareja",
  "Tiempo recomendado solo pareja.",
  "Estudios Gottman Institute",
  [("hijosNum","# hijos","number",None),("ocup","Ocupación","select",[("light","Liviana"),("med","Media"),("alta","Alta")])]
  ,
  [("semanal","Semanal",None),("diario","Diario",None),("cita","Salidas/mes",None),("resumen","Recomendación",None)],
  ["2 hijos, media","6h+/sem"], "6h",
  [("¿Mínimo?","Gottman: 5h/semana de conexión."),
   ("¿Día a día?","20-30 min conversación sin pantallas."),
   ("¿Cita?","1-2/mes como pareja solo."),
   ("¿Con hijos?","Más difícil pero más necesario."),
   ("¿Calidad?","Mejor 30 min sin distracción que 3h con pantallas.")],
  """  const n=Number(i.hijosNum)||0; const o=String(i.ocup||'med');
  const base=6; const extra=n*0.5+(o==='alta'?1:o==='med'?0:-1);
  const sem=Math.max(3,base-extra);
  return { semanal:`${sem.toFixed(1)}h`, diario:`${(sem*60/7).toFixed(0)} min`, cita:'1-2/mes', resumen:`Pareja con ${n} hijos: ${sem.toFixed(1)}h/semana, ${(sem*60/7).toFixed(0)}min/día.` };""")

# F28. Edad abandonar hogar
M("costo-emanciparse-hijo-sueldo-alquiler", "familia", "🏠", "Hijo emancipándose: ingreso mínimo",
  "Sueldo necesario para independizarse.",
  "Regla 30% alquiler",
  [("alquiler","Alquiler zona","number","$"),("gastos","Gastos mes","number","$")],
  [("sueldoMin","Sueldo mínimo",None),("ahorro","Ahorro recomendado",None),("resumen","Recomendación",None)],
  ["$500 alq, $400 gtos","~$2500 sueldo"], "~$2500",
  [("¿30% regla?","Alquiler ≤30% del sueldo neto."),
   ("¿Garantía?","Requiere padres o garante."),
   ("¿Fondo emergencia?","3-6 meses de gastos."),
   ("¿Compartir?","Baja costos 40-50%."),
   ("¿Empezar gradual?","Aportar en casa paterna primero.")],
  """  const a=Number(i.alquiler)||0; const g=Number(i.gastos)||0;
  const min=Math.max(a/0.3,a+g+200);
  return { sueldoMin:`$${min.toFixed(0)}`, ahorro:`$${(a*3).toFixed(0)} (3 meses)`, resumen:`Alquiler $${a} + gastos $${g}: sueldo mínimo ~$${min.toFixed(0)}.` };""")

# F29. Cuanto tarda adoptar
M("tiempo-proceso-adopcion-argentina-anios", "familia", "👪", "Proceso adopción tiempo (ARG)",
  "Tiempo promedio proceso adopción.",
  "RUAGA + tribunales",
  [("edadBuscada","Edad niño","number",None)],
  [("tiempoProm","Tiempo promedio",None),("probable","Probabilidad",None),("resumen","Info",None)],
  ["0-2 años","3-5 años"], "3-5 años",
  [("¿0-2 años?","Mayor espera (3-5+ años)."),
   ("¿5-10 años?","1-3 años."),
   ("¿Grupo hermanos?","Menor espera."),
   ("¿Salud especial?","Proceso más rápido."),
   ("¿RUAGA?","Registro único nacional.")],
  """  const e=Number(i.edadBuscada)||0;
  let t:string; let p:string;
  if (e<=2) { t='3-5+ años'; p='Baja disponibilidad'; }
  else if (e<=5) { t='2-4 años'; p='Media'; }
  else if (e<=10) { t='1-3 años'; p='Alta'; }
  else { t='<1 año'; p='Muy alta'; }
  return { tiempoProm:t, probable:p, resumen:`Edad buscada ${e}: espera ${t}, disponibilidad ${p}.` };""")

# F30. Duelo tiempo
M("etapas-duelo-perdida-familiar-meses", "familia", "💔", "Duelo familiar: etapas típicas",
  "Fases y duración aproximada.",
  "Kübler-Ross",
  [("tipoPerdida","Tipo","select",[("esperada","Enfermedad larga"),("subita","Súbita"),("ninez","Pérdida padre niñez")])],
  [("etapas","Etapas",None),("duracion","Duración típica",None),("alerta","Señal alerta",None),("resumen","Info",None)],
  ["Pérdida súbita","Shock inicial"], "6-18 meses",
  [("¿Etapas?","Negación → Ira → Negociación → Depresión → Aceptación."),
   ("¿No lineal?","Fases se alternan, vuelven."),
   ("¿Duración?","6-12 meses normal; patológico si intenso >1 año."),
   ("¿Apoyo?","Terapia duelo, grupos, apoyo familiar."),
   ("¿Niños?","Procesan diferente, explicar edad-apropiada.")],
  """  const t=String(i.tipoPerdida||'esperada');
  const d:Record<string,[string,string]>={esperada:['6-12 meses','Normal si intensidad decrece'],subita:['12-18 meses','Shock prolongado puede requerir ayuda'],ninez:['Años con reevaluación en etapas'+'','Acompañar en hitos vitales']};
  const [dur,al]=d[t]||d.esperada;
  return { etapas:'Negación, ira, negociación, depresión, aceptación', duracion:dur, alerta:al, resumen:`${t}: ${dur}. ${al}.` };""")


# =========================================================
# IDIOMAS (30)
# =========================================================

# I1. Horas fluidez FSI
M("horas-estudio-idioma-fluidez-fsi", "idiomas", "⏰", "Horas hasta fluidez (FSI)",
  "Estimación FSI para alcanzar nivel profesional.",
  "Categoría FSI × 600-2200h",
  [("idioma","Idioma","select",[("ingles","Inglés (I)"),("frances","Francés (I)"),("aleman","Alemán (II)"),("ruso","Ruso (III)"),("chino","Chino (IV)"),("japones","Japonés (IV)")])]
  ,
  [("horas","Horas",None),("meses","Si 1h/día",None),("categoria","Categoría FSI",None),("resumen","Interpretación",None)],
  ["Inglés","600h"], "600h",
  [("¿FSI?","Foreign Service Institute US."),
   ("¿Categoría I?","Idiomas cercanos al inglés (ES, IT, FR)."),
   ("¿Categoría IV?","Árabe, chino, japonés, coreano."),
   ("¿Hispanohablante?","ES→IT/PT ~600h; ES→EN ~900h."),
   ("¿Fluidez laboral?","B2/C1.")],
  """  const id=String(i.idioma||'ingles');
  const h:Record<string,[number,string]>={ingles:[600,'I'],frances:[600,'I'],aleman:[900,'II'],ruso:[1100,'III'],chino:[2200,'IV'],japones:[2200,'IV']};
  const [hr,cat]=h[id]||[600,'I'];
  return { horas:`${hr}h`, meses:`${(hr/30).toFixed(1)} meses`, categoria:cat, resumen:`${id} cat ${cat}: ${hr}h estudio (${(hr/30).toFixed(0)} meses a 1h/día).` };""")

# I2. Vocabulario por nivel
M("vocabulario-nivel-mcer-a1-c2-palabras", "idiomas", "📚", "Vocabulario por nivel MCER",
  "Cantidad palabras activas aproximadas.",
  "Referencia lingüística",
  [("nivel","Nivel","select",[("a1","A1"),("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1"),("c2","C2")])],
  [("palabras","Palabras activas",None),("pasivas","Pasivas",None),("resumen","Interpretación",None)],
  ["B1","2000"], "2000 activas",
  [("¿A1?","500 palabras, presentación básica."),
   ("¿A2?","1000, temas cotidianos."),
   ("¿B1?","2000, conversación sostenida."),
   ("¿B2?","4000, noticias, trabajo."),
   ("¿C1?","8000, matices complejos. C2: 16000.")],
  """  const n=String(i.nivel||'a1');
  const v:Record<string,[number,number]>={a1:[500,1000],a2:[1000,2000],b1:[2000,4000],b2:[4000,8000],c1:[8000,12000],c2:[16000,20000]};
  const [act,pas]=v[n]||v.a1;
  return { palabras:act.toLocaleString(), pasivas:pas.toLocaleString(), resumen:`${n.toUpperCase()}: ${act} activas, ${pas} pasivas.` };""")

# I3. Plan de estudio
M("plan-estudio-idioma-minutos-dia-objetivo", "idiomas", "📅", "Plan estudio diario por objetivo",
  "Minutos/día para alcanzar nivel en X meses.",
  "Horas totales / días",
  [("horasTotales","Horas hasta nivel","number",None),("meses","Meses plazo","number",None)],
  [("minDia","Min/día",None),("semDia","Sesiones sem",None),("resumen","Plan",None)],
  ["600h en 12 meses","100 min"], "100 min/día",
  [("¿Consistencia?","Mejor 30min diarios que 4h semanal."),
   ("¿Inmersión?","Series, música, podcasts cuentan."),
   ("¿Anki?","15min flashcards SRS poderoso."),
   ("¿Conversación?","Mínimo 2/sem con hablantes."),
   ("¿Descanso?","1 día/semana OK, recuperar siguiente.")],
  """  const h=Number(i.horasTotales)||600; const m=Number(i.meses)||12;
  const min=(h*60)/(m*30);
  return { minDia:`${min.toFixed(0)} min`, semDia:'6-7/sem', resumen:`${h}h en ${m}m: ${min.toFixed(0)}min/día.` };""")

# I4. Leer libros
M("libros-leer-idioma-nivel-anio", "idiomas", "📖", "Libros a leer en el idioma",
  "Cantidad y dificultad según nivel.",
  "Inmersión por lectura",
  [("nivel","Nivel","select",[("a1","A1"),("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1"),("c2","C2")])],
  [("librosAnio","Libros/año",None),("tipo","Tipo recomendado",None),("resumen","Recomendación",None)],
  ["B1","5-8"], "Graded readers",
  [("¿A1-A2?","Graded readers nivel 1-3."),
   ("¿B1?","Libros juveniles adaptados."),
   ("¿B2?","Harry Potter, best-sellers."),
   ("¿C1-C2?","Literatura adulta sin diccionario."),
   ("¿Audiobook?","Complementa pronunciación.")],
  """  const n=String(i.nivel||'a1');
  const r:Record<string,[string,string]>={a1:['2-3','Graded readers nivel 1'],a2:['4-6','Graded readers 2-3'],b1:['5-8','Juvenil adaptado'],b2:['8-12','Young Adult, best-sellers'],c1:['12+','Literatura general'],c2:['20+','Clásicos, técnico']};
  const [lib,tp]=r[n]||r.a1;
  return { librosAnio:lib, tipo:tp, resumen:`${n.toUpperCase()}: ${lib} libros/año. ${tp}.` };""")

# I5. TOEFL vs IELTS
M("equivalencia-toefl-ielts-cambridge-mcer", "idiomas", "🎓", "Equivalencia TOEFL/IELTS/Cambridge/MCER",
  "Conversión entre exámenes principales.",
  "Tabla ETS oficial",
  [("examen","Examen","select",[("toefl","TOEFL iBT"),("ielts","IELTS"),("cpe","Cambridge")]),("score","Score","number",None)],
  [("toefl","TOEFL",None),("ielts","IELTS",None),("cambridge","Cambridge",None),("mcer","MCER",None),("resumen","Nivel",None)],
  ["TOEFL 100","IELTS 7"], "C1",
  [("¿TOEFL?","120 máx, 90+ top universidades."),
   ("¿IELTS?","9 bandas, 7+ nivel avanzado."),
   ("¿Cambridge?","FCE B2, CAE C1, CPE C2."),
   ("¿Vigencia?","TOEFL/IELTS 2 años; Cambridge vitalicio."),
   ("¿Costo?","~$200-300 USD en 2024.")],
  """  const e=String(i.examen||'toefl'); const s=Number(i.score)||0;
  let toefl=0, ielts=0, cam='', mcer='';
  if (e==='toefl') { toefl=s; ielts=s>=100?7.5:s>=80?6.5:s>=60?5.5:4.5; cam=s>=100?'CAE':s>=80?'FCE':'PET'; mcer=s>=100?'C1':s>=80?'B2':s>=60?'B1':'A2'; }
  else if (e==='ielts') { ielts=s; toefl=Math.round(s*14.3); cam=s>=7.5?'CAE':s>=5.5?'FCE':'PET'; mcer=s>=7.5?'C1':s>=5.5?'B2':s>=4?'B1':'A2'; }
  else { cam=s.toString(); toefl=100; ielts=7; mcer='C1'; }
  return { toefl:toefl.toString(), ielts:ielts.toString(), cambridge:cam, mcer, resumen:`${e} ${s} ≈ MCER ${mcer}.` };""")

# I6. Anki cards/día
M("anki-flashcards-dia-aprender-palabras", "idiomas", "🃏", "Anki: cards nuevas por día",
  "Cards nuevas para meta de vocabulario.",
  "Objetivo / días",
  [("objetivo","Meta palabras","number",None),("meses","Plazo meses","number",None)],
  [("nuevas","Nuevas/día",None),("tiempo","Tiempo estimado",None),("resumen","Plan",None)],
  ["2000, 6m","11/día"], "~15min/día",
  [("¿Anki?","Spaced repetition automatizado."),
   ("¿Cuántas?","15-20 nuevas/día manejable."),
   ("¿Revisión?","Cards repasas aumentan al principio."),
   ("¿Decks?","Usar pre-hechos + propios."),
   ("¿Frecuencia?","Diario, sin saltear.")],
  """  const o=Number(i.objetivo)||1000; const m=Number(i.meses)||6;
  const dias=m*30; const nuevas=o/dias;
  const min=nuevas*1.5;
  return { nuevas:`${nuevas.toFixed(0)}/día`, tiempo:`${min.toFixed(0)}min/día aprox`, resumen:`${o} palabras en ${m}m: ${nuevas.toFixed(0)} cards nuevas/día.` };""")

# I7. Cuántas películas
M("horas-peliculas-serie-inmersion-idioma", "idiomas", "🎬", "Horas de series/películas/mes",
  "Horas para inmersión efectiva.",
  "30% del tiempo estudio",
  [("horasEstudio","h estudio/semana","number",None)],
  [("horasMedia","Horas video/sem",None),("modoRec","Modo recomendado",None),("resumen","Plan",None)],
  ["7h estudio","2h video"], "2h/sem",
  [("¿Subtítulos?","Nativos > objetivo > sin subs."),
   ("¿Pasiva?","Escuchar fondo ayuda menos que activa."),
   ("¿Series?","Más variedad vocabulario que películas."),
   ("¿Nivel?","Stop frecuente en niveles bajos normal."),
   ("¿Apps?","Language Learning with Netflix.")],
  """  const h=Number(i.horasEstudio)||0;
  const v=h*0.3;
  return { horasMedia:`${v.toFixed(1)}h/sem`, modoRec:'Serie con sub objetivo', resumen:`${h}h estudio → ${v.toFixed(1)}h video inmersivo.` };""")

# I8. Pronunciación tiempo
M("tiempo-pronunciacion-nativa-practica-diaria", "idiomas", "🗣️", "Tiempo para pronunciación nativa",
  "Años para acento cercano a nativo.",
  "Depende edad y práctica",
  [("edad","Edad inicio","number",None),("minDia","Min/día práctica","number",None)],
  [("anios","Años estimados",None),("probabilidad","Probabilidad",None),("resumen","Info",None)],
  ["25, 30min","5 años"], "Difícil sin acento",
  [("¿Período crítico?","Antes de 12 años más fácil."),
   ("¿Adultos?","Acento nativo difícil, inteligibilidad no."),
   ("¿Shadowing?","Repetir audio nativo 5-10min/día."),
   ("¿Mimicking?","Imitar gestos faciales."),
   ("¿Entrenador?","Coach de pronunciación útil.")],
  """  const e=Number(i.edad)||25; const m=Number(i.minDia)||0;
  let p:string; let anios:number;
  if (e<12) { p='Alta'; anios=2; }
  else if (e<18) { p='Media'; anios=4; }
  else { p='Baja (acento remanente)'; anios=6; }
  if (m>=60) anios*=0.7;
  return { anios:`${anios.toFixed(0)} años`, probabilidad:p, resumen:`Inicio ${e}a con ${m}min/día: ~${anios.toFixed(0)} años para fluidez (acento: ${p}).` };""")

# I9. Minuto/palabra lectura
M("velocidad-lectura-idioma-palabras-minuto", "idiomas", "⚡", "Velocidad lectura WPM",
  "Palabras por minuto según nivel.",
  "Referencia académica",
  [("nivel","Nivel","select",[("nativo","Nativo"),("c2","C2"),("c1","C1"),("b2","B2"),("b1","B1"),("a2","A2")])]
  ,
  [("wpm","WPM",None),("vsNativo","% vs nativo",None),("resumen","Interpretación",None)],
  ["C1","150 WPM"], "~70% nativo",
  [("¿Nativo?","200-300 WPM."),
   ("¿C2?","180-220."),
   ("¿C1?","120-180."),
   ("¿B1?","80-120."),
   ("¿Aumentar?","Lectura extensiva diaria.")],
  """  const n=String(i.nivel||'c1');
  const w:Record<string,number>={nativo:250,c2:200,c1:150,b2:100,b1:80,a2:40};
  const v=w[n]||100;
  const pct=(v/250*100).toFixed(0);
  return { wpm:`${v} WPM`, vsNativo:`${pct}%`, resumen:`Nivel ${n}: ~${v} WPM (${pct}% velocidad nativa).` };""")

# I10. Práctica conversación
M("conversacion-intercambio-idioma-horas-semana", "idiomas", "💬", "Horas conversación/semana",
  "Horas conversación por nivel objetivo.",
  "Componente activo",
  [("nivelMeta","Nivel meta","select",[("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1")])],
  [("horas","Horas/sem",None),("metodos","Métodos",None),("resumen","Plan",None)],
  ["B2","3h"], "3h/sem",
  [("¿A2?","1h/sem alcanza."),
   ("¿B1?","2h hablando."),
   ("¿B2?","3h mixto temas variados."),
   ("¿C1?","5h+ sobre temas complejos."),
   ("¿Intercambio?","Tandem, HelloTalk gratis.")],
  """  const n=String(i.nivelMeta||'b1');
  const h:Record<string,number>={a2:1,b1:2,b2:3,c1:5};
  const hr=h[n]||2;
  return { horas:`${hr}h/sem`, metodos:'Tandem, iTalki, intercambio', resumen:`Meta ${n.toUpperCase()}: ${hr}h conversación/sem.` };""")

# I11. Repaso intervalos
M("repaso-srs-dias-proximo-card", "idiomas", "🔁", "SRS: próxima revisión",
  "Cuándo revisar card según SM-2.",
  "SuperMemo SM-2",
  [("lastReview","Última","number","días"),("eFactor","E-Factor","number",None),("intervalo","Intervalo actual","number","días")]
  ,
  [("proximo","Próximo repaso",None),("nuevoInter","Nuevo intervalo",None),("resumen","Info",None)],
  ["3d, EF 2.5, int 1","3 días"], "3 días",
  [("¿SM-2?","Algoritmo de SuperMemo."),
   ("¿E-Factor?","Dificultad de tarjeta (1.3-2.5)."),
   ("¿Intervalos?","1 día, 6, 6×EF..."),
   ("¿Anki?","Implementa SM-2 modificado."),
   ("¿Lapsos?","Reset intervalo pero conserva EF.")],
  """  const int_act=Number(i.intervalo)||1; const ef=Number(i.eFactor)||2.5;
  const nuevo=Math.round(int_act*ef);
  return { proximo:`${nuevo} días`, nuevoInter:`${nuevo}d`, resumen:`Int ${int_act}d × EF ${ef} = próximo en ${nuevo} días.` };""")

# I12. Cognados
M("cognados-idioma-porcentaje-espanol-ayuda", "idiomas", "🔤", "Cognados: % vocabulario común con español",
  "Porcentaje palabras similares vs español.",
  "Lingüística comparada",
  [("idioma","Idioma","select",[("italiano","Italiano"),("portugues","Portugués"),("frances","Francés"),("ingles","Inglés"),("aleman","Alemán"),("japones","Japonés")])]
  ,
  [("pct","% cognados",None),("ventaja","Ventaja aprendizaje",None),("resumen","Info",None)],
  ["Italiano","~82%"], "Alta ventaja",
  [("¿Italiano?","~82% cognados con español."),
   ("¿Portugués?","~89% (más fácil cercano)."),
   ("¿Inglés?","~30-40% (via latín)."),
   ("¿Falsos amigos?","Misma forma, distinto significado (embarazada/embarrassed)."),
   ("¿Ventaja?","Cognados aceleran lectura.")],
  """  const id=String(i.idioma||'italiano');
  const c:Record<string,[string,string]>={italiano:['~82%','Altísima'],portugues:['~89%','Altísima'],frances:['~75%','Alta'],ingles:['~30-40%','Media'],aleman:['~25%','Baja'],japones:['~0%','Nula']};
  const [pct,vn]=c[id]||c.italiano;
  return { pct, ventaja:vn, resumen:`${id}: ${pct} cognados con ES. Ventaja ${vn}.` };""")

# I13. Accent score
M("acento-extranjero-score-practica-horas", "idiomas", "🎤", "Acento extranjero: reducción",
  "Horas para reducir acento significativo.",
  "Shadowing + coach",
  [("nivelActual","Acento actual 1-10","number",None),("horasSem","h/sem práctica","number",None)],
  [("meses","Meses para notar","number|string"),("resumen","Estrategia",None)],
  ["Nivel 7, 2h/sem","6-12 meses"], "6-12 meses",
  [("¿Shadowing?","Imitar audio nativo."),
   ("¿Transcripción?","Escuchar y copiar fonéticamente."),
   ("¿Grabarse?","Escuchar errores propios."),
   ("¿Fonética?","IPA ayuda sonidos inexistentes."),
   ("¿Coach?","Acento coach acelera resultados.")],
  """  const a=Number(i.nivelActual)||5; const h=Number(i.horasSem)||0;
  const meses=h===0?'—':Math.max(3, (10-a)*2/(h/2));
  return { meses:typeof meses==='string'?meses:`${Number(meses).toFixed(0)} meses`, resumen:`Acento ${a}/10 con ${h}h/sem: ${typeof meses==='string'?meses:`~${Number(meses).toFixed(0)} meses`} para notar reducción.` };""")

# I14. Costo curso
M("costo-mensual-aprender-idioma-opciones", "idiomas", "💵", "Costo mensual aprender idioma",
  "Presupuesto según método.",
  "Referencia 2024",
  [("metodo","Método","select",[("app","App (Duolingo)"),("online","Online (Preply)"),("academia","Academia"),("inmersion","Inmersión país")])],
  [("mensual","Costo mes",None),("efectividad","Efectividad",None),("resumen","Recomendación",None)],
  ["Online","$100-200"], "$100-200",
  [("¿Apps?","$0-20/mes, base pero no suficiente."),
   ("¿Online 1:1?","$100-300/mes."),
   ("¿Academia?","$80-200/mes."),
   ("¿Inmersión?","$1500-3000/mes todo incluido."),
   ("¿Mix óptimo?","App + 1:1 semanal + media inmersiva.")],
  """  const m=String(i.metodo||'app');
  const c:Record<string,[string,string]>={app:['$0-20','Baja (motivación sí)'],online:['$100-300','Alta 1:1'],academia:['$80-200','Media'],inmersion:['$1500-3000','Altísima']};
  const [co,ef]=c[m]||c.app;
  return { mensual:co, efectividad:ef, resumen:`${m}: ${co}/mes, efectividad ${ef}.` };""")

# I15. Edad mejor aprender
M("edad-optima-aprender-idioma-ninos-adultos", "idiomas", "👶", "Edad óptima aprender idioma",
  "Ventajas/desventajas por edad.",
  "Hipótesis período crítico",
  [("edad","Edad","number",None)],
  [("ventajas","Ventajas",None),("desventajas","Desventajas",None),("resumen","Info",None)],
  ["7 años","Pronunciación fácil"], "Fácil pronunciación",
  [("¿Período crítico?","Hipótesis: mejor <12 años para fonología."),
   ("¿Adultos?","Mejor gramática explícita."),
   ("¿Niños?","Absorben sin esfuerzo si hay exposición."),
   ("¿Cuál ganar?","Adultos con método, niños con inmersión."),
   ("¿Nunca tarde?","Pero más esfuerzo consciente.")],
  """  const e=Number(i.edad)||0;
  let v:string; let d:string;
  if (e<6) { v='Absorción natural, acento nativo'; d='Sin gramática consciente'; }
  else if (e<12) { v='Acento bueno, analítico'; d='Necesita inmersión'; }
  else if (e<20) { v='Gramática + buena pronunciación'; d='Motivación fluctúa'; }
  else { v='Disciplina, gramática fuerte'; d='Acento más difícil'; }
  return { ventajas:v, desventajas:d, resumen:`Edad ${e}: ${v}. ${d}.` };""")

# I16. Examen oficial
M("dias-preparacion-examen-oficial-idioma", "idiomas", "📜", "Días preparación examen oficial",
  "Días estimados según nivel actual.",
  "Diferencial al target",
  [("actual","Nivel actual","select",[("a1","A1"),("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1")]),("meta","Meta","select",[("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1"),("c2","C2")])]
  ,
  [("dias","Días preparación",None),("horas","Horas totales",None),("resumen","Recomendación",None)],
  ["B1 → B2","180 días"], "~200h",
  [("¿Entre niveles?","~200h de trabajo por cada salto MCER."),
   ("¿Simular?","Mock tests últimas 4 semanas."),
   ("¿Todas partes?","Speaking, Writing, Listening, Reading."),
   ("¿Coach?","1:1 en writing/speaking crítico."),
   ("¿Vigencia?","TOEFL/IELTS 2 años, Cambridge permanente.")],
  """  const niv=['a1','a2','b1','b2','c1','c2'];
  const a=niv.indexOf(String(i.actual||'a1')); const m=niv.indexOf(String(i.meta||'b2'));
  if (a<0||m<0||m<=a) return { dias:'—', horas:'—', resumen:'Meta debe ser mayor que actual.' };
  const salto=m-a; const h=salto*200; const d=h/(2*7)*7;
  return { dias:`${Math.round(d)} días`, horas:`${h}h`, resumen:`De ${niv[a].toUpperCase()} a ${niv[m].toUpperCase()}: ~${h}h, ${Math.round(d)} días a 2h/día.` };""")

# I17. Peliculas sub
M("peliculas-sin-subtitulos-horas-idioma", "idiomas", "🎥", "Horas hasta ver sin subtítulos",
  "Horas inmersión para prescindir de subs.",
  "Listening threshold",
  [("nivel","Nivel","select",[("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1")])]
  ,
  [("horas","Horas listening",None),("metodo","Método",None),("resumen","Recomendación",None)],
  ["B2","~100h"], "100h video",
  [("¿A2?","500h+ necesarias."),
   ("¿B1?","250h."),
   ("¿B2?","100h."),
   ("¿C1?","50h ya sin problema."),
   ("¿Técnica?","Empezar con subtítulos idioma target.")],
  """  const n=String(i.nivel||'b1');
  const h:Record<string,number>={a2:500,b1:250,b2:100,c1:50};
  const hr=h[n]||250;
  return { horas:`~${hr}h`, metodo:'Reemplazar subs gradualmente', resumen:`${n.toUpperCase()}: ~${hr}h listening para lograr sin subs.` };""")

# I18. Podcast diario
M("podcasts-aprender-idioma-minutos-diarios", "idiomas", "🎧", "Podcasts diarios para idioma",
  "Min/día + tipo según nivel.",
  "Listening comprehension",
  [("nivel","Nivel","select",[("a1","A1"),("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1")])]
  ,
  [("minDia","Min/día",None),("tipo","Tipo podcast",None),("resumen","Plan",None)],
  ["B1","30 min"], "Graded",
  [("¿A1?","15-20 min podcasts específicos principiantes."),
   ("¿B1?","30 min variedad."),
   ("¿B2?","30-45 min nativos lentos."),
   ("¿C1?","45+ min sin modificar velocidad."),
   ("¿Transcript?","Útil primer nivel.")],
  """  const n=String(i.nivel||'a1');
  const p:Record<string,[string,string]>={a1:['15 min','Para principiantes absolutos'],a2:['20 min','Graded, transcripción'],b1:['30 min','Graded sin transcripción'],b2:['30-45 min','Nativos lentos'],c1:['45+ min','Nativos normales']};
  const [m,t]=p[n]||p.a1;
  return { minDia:m, tipo:t, resumen:`${n.toUpperCase()}: ${m}/día. ${t}.` };""")

# I19. Niveles DELE
M("niveles-dele-dalf-goethe-hsk-equivalencia", "idiomas", "🏆", "Exámenes por idioma (DELE/DALF/Goethe/HSK)",
  "Equivalencia entre exámenes oficiales.",
  "Tabla institutos",
  [("examen","Examen","select",[("dele","DELE (ES)"),("dalf","DELF/DALF (FR)"),("goethe","Goethe (DE)"),("hsk","HSK (CN)"),("jlpt","JLPT (JP)")]),("nivel","Nivel","select",[("elem","Elem"),("inter","Inter"),("avan","Avan"),("sup","Superior")])]
  ,
  [("mcer","MCER equiv",None),("examenLiteral","Nombre examen",None),("resumen","Info",None)],
  ["DELE intermedio","B1/B2"], "B1/B2",
  [("¿DELE?","Español: A1,A2,B1,B2,C1,C2."),
   ("¿DALF?","Francés: C1,C2; DELF A1-B2."),
   ("¿Goethe?","Alemán: mismos niveles MCER."),
   ("¿HSK?","Chino: 1-6 (nuevo HSK 1-9)."),
   ("¿JLPT?","Japonés: N5 (básico) a N1 (master).")],
  """  const e=String(i.examen||'dele'); const n=String(i.nivel||'inter');
  const niv:Record<string,Record<string,string>>={dele:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},dalf:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},goethe:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},hsk:{elem:'HSK1-2 (A1)',inter:'HSK3-4 (B1)',avan:'HSK5 (B2/C1)',sup:'HSK6 (C2)'},jlpt:{elem:'N5-N4 (A1-A2)',inter:'N3 (B1)',avan:'N2 (B2/C1)',sup:'N1 (C1/C2)'}};
  const nmap:Record<string,string>={elem:'Elemental',inter:'Intermedio',avan:'Avanzado',sup:'Superior'};
  return { mcer:niv[e][n]||'—', examenLiteral:`${e.toUpperCase()} ${nmap[n]}`, resumen:`${e.toUpperCase()} ${nmap[n]}: ${niv[e][n]||'N/A'}.` };""")

# I20. Dictado speed
M("dictado-velocidad-palabras-escuchar-idioma", "idiomas", "✍️", "Dictado: palabras/minuto objetivo",
  "Velocidad palabras por minuto dictado.",
  "Listening comprehension",
  [("nivel","Nivel","select",[("a1","A1"),("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1"),("c2","C2")])]
  ,
  [("wpm","WPM dictado",None),("reproduc","Reproducciones",None),("resumen","Info",None)],
  ["B1","90 WPM"], "90 WPM",
  [("¿Nativo hablar?","~160 WPM."),
   ("¿A1-A2?","60-70 WPM."),
   ("¿B1?","90 WPM."),
   ("¿B2?","120 WPM."),
   ("¿C1-C2?","160 WPM nativo.")],
  """  const n=String(i.nivel||'a1');
  const w:Record<string,number>={a1:60,a2:70,b1:90,b2:120,c1:140,c2:160};
  const v=w[n]||60;
  const rep=v<90?'2-3 reproducciones':'1-2 reproducciones';
  return { wpm:`${v} WPM`, reproduc:rep, resumen:`${n.toUpperCase()}: dictado ${v} WPM, ${rep}.` };""")

# I21. Escribir ensayos
M("ensayos-semanales-mejorar-writing-idioma", "idiomas", "📝", "Ensayos semanales writing",
  "# ensayos y palabras/semana.",
  "Práctica writing",
  [("nivelMeta","Meta","select",[("b1","B1"),("b2","B2"),("c1","C1"),("c2","C2")])]
  ,
  [("ensayosSem","Ensayos/semana",None),("palabras","Palabras/ensayo",None),("resumen","Plan",None)],
  ["B2","2"], "2 × 200 palabras",
  [("¿B1?","1-2 textos 150 palabras."),
   ("¿B2?","2-3 textos 200 palabras."),
   ("¿C1?","3 textos 350-500."),
   ("¿C2?","3+ ensayos 500+ con argumentación."),
   ("¿Corrección?","Italki, LangCorrect, tutor.")],
  """  const n=String(i.nivelMeta||'b1');
  const p:Record<string,[number,number]>={b1:[2,150],b2:[2,250],c1:[3,400],c2:[3,500]};
  const [num,pal]=p[n]||p.b1;
  return { ensayosSem:num.toString(), palabras:`${pal} palabras c/u`, resumen:`Meta ${n.toUpperCase()}: ${num} ensayos/sem × ${pal} palabras.` };""")

# I22. Idiomas por profesión
M("idiomas-mas-utiles-profesion-internacional", "idiomas", "💼", "Idiomas útiles por profesión",
  "Top idiomas según carrera.",
  "Empleabilidad global",
  [("profesion","Profesión","select",[("tech","Tech"),("negocios","Negocios"),("diplomatico","Diplomacia"),("salud","Salud"),("academia","Academia")])]
  ,
  [("top","Top 3",None),("resumen","Info",None)],
  ["Tech","Inglés, Mandarín, Alemán"], "Inglés",
  [("¿Tech?","Inglés, mandarín."),
   ("¿Negocios?","Inglés, mandarín, español."),
   ("¿Diplomacia?","Inglés, francés, árabe, ruso, chino, español (ONU)."),
   ("¿Salud?","Inglés (papers), español LATAM."),
   ("¿Academia?","Inglés domina publicación.")],
  """  const p=String(i.profesion||'tech');
  const t:Record<string,string>={tech:'Inglés, Mandarín, Alemán',negocios:'Inglés, Mandarín, Español',diplomatico:'Inglés, Francés, Árabe',salud:'Inglés, Español, Francés',academia:'Inglés, Alemán, Francés'};
  return { top:t[p]||t.tech, resumen:`Profesión ${p}: top idiomas son ${t[p]}.` };""")

# I23. Dialéctos
M("variantes-idioma-espanol-portugues-ingles-regiones", "idiomas", "🌎", "Variantes por idioma (regiones)",
  "Diferencias regionales claves.",
  "Variedades lingüísticas",
  [("idioma","Idioma","select",[("espanol","Español"),("portugues","Portugués"),("ingles","Inglés"),("frances","Francés"),("arabe","Árabe"),("chino","Chino")])]
  ,
  [("variantes","Variantes clave",None),("mayorDif","Mayor diferencia",None),("resumen","Info",None)],
  ["Español","LatAm/España"], "LatAm vs Castellano",
  [("¿Español?","Peninsular, rioplatense, neutro LATAM, andaluz."),
   ("¿Portugués?","Brasil vs Portugal (diferencias notables)."),
   ("¿Inglés?","US, UK, AU, IN; acento, spelling."),
   ("¿Francés?","Francia, Québec, África."),
   ("¿Árabe?","MSA vs dialectos (a veces ininteligibles).")],
  """  const id=String(i.idioma||'espanol');
  const v:Record<string,[string,string]>={espanol:['Peninsular, Rioplatense, Mexicano, Andino','Vosotros vs Ustedes'],portugues:['Brasileño vs Europeo','Pronunciación y léxico'],ingles:['US, UK, AUS, India','Pronunciación y slang'],frances:['Metropolitano, Québécois','Vocabulario y pronunciación'],arabe:['MSA + dialectos (egipcio, levantino...)','Dialectos pueden ser ininteligibles'],chino:['Mandarín, Cantonés, Hokkien','Tonos y caracteres']};
  const [va,dif]=v[id]||v.espanol;
  return { variantes:va, mayorDif:dif, resumen:`${id}: ${va}. ${dif}.` };""")

# I24. Padawan: MCER hours/week
M("horas-semanales-mantener-nivel-idioma", "idiomas", "🔁", "Horas/semana mantener nivel",
  "Para no perder nivel ya adquirido.",
  "Maintenance práctica",
  [("nivel","Nivel","select",[("a2","A2"),("b1","B1"),("b2","B2"),("c1","C1"),("c2","C2")])]
  ,
  [("horasSem","h/sem",None),("consejos","Modo",None),("resumen","Plan",None)],
  ["B2","3h"], "3h/sem",
  [("¿Perdés nivel?","Sin uso 6m: -1 nivel MCER."),
   ("¿Maintenance?","Media inmersión equivale a study."),
   ("¿Conversación?","Crucial, más que leer."),
   ("¿Hobby?","Transformar aprendizaje en interés."),
   ("¿Viajes?","Inmersión corta reactiva rápido.")],
  """  const n=String(i.nivel||'b1');
  const h:Record<string,number>={a2:1,b1:2,b2:3,c1:4,c2:5};
  const hr=h[n]||2;
  return { horasSem:`${hr}h`, consejos:'Mix: media + conversación + lectura', resumen:`Mantener ${n.toUpperCase()}: ~${hr}h/sem.` };""")

# I25. Traducciones
M("velocidad-traduccion-palabras-hora-profesional", "idiomas", "📖", "Velocidad traducción WPH",
  "Palabras/hora traducción profesional.",
  "ProZ, industria",
  [("tipo","Tipo texto","select",[("general","General"),("tecnico","Técnico"),("literario","Literario"),("juridico","Jurídico")])]
  ,
  [("wph","Palabras/hora",None),("diario","Por día (8h)",None),("resumen","Info",None)],
  ["General","500 wph"], "500 wph",
  [("¿General?","400-600 wph."),
   ("¿Técnico?","300-500 wph."),
   ("¿Literario?","150-250 wph."),
   ("¿Jurídico?","200-400 wph."),
   ("¿Herramientas CAT?","Trados, MemoQ aumentan 30-50%.")],
  """  const t=String(i.tipo||'general');
  const w:Record<string,number>={general:500,tecnico:400,literario:200,juridico:300};
  const v=w[t]||400;
  return { wph:`${v} palabras/h`, diario:`${(v*8).toLocaleString()} palabras/día`, resumen:`${t}: ~${v} palabras/h, ${(v*8).toLocaleString()} día.` };""")

# I26. Clases semanales
M("clases-semanales-italki-online-frecuencia", "idiomas", "💻", "Clases 1:1 online frecuencia",
  "Clases/sem según meta.",
  "iTalki/Preply",
  [("meta","Meta","select",[("manten","Mantener"),("mejora","Mejorar"),("intensivo","Intensivo")])]
  ,
  [("clases","Clases/sem",None),("duracion","Min/clase",None),("resumen","Plan",None)],
  ["Mejorar","2-3"], "2-3/sem",
  [("¿Mantener?","1/sem, 60 min."),
   ("¿Mejorar?","2-3/sem, 45-60 min."),
   ("¿Intensivo?","5-7/sem, 60 min."),
   ("¿Calidad?","Profesor certificado > comunitario."),
   ("¿Preparación?","Lista temas/preguntas antes.")],
  """  const m=String(i.meta||'manten');
  const p:Record<string,[string,string]>={manten:['1','60 min'],mejora:['2-3','60 min'],intensivo:['5-7','60 min']};
  const [cl,du]=p[m]||p.manten;
  return { clases:cl, duracion:du, resumen:`Meta ${m}: ${cl} clases/sem × ${du}.` };""")

# I27. Duolingo streak
M("duolingo-streak-progresion-diaria-idioma", "idiomas", "🔥", "Duolingo: progresión por streak",
  "Nivel estimado por días de racha.",
  "Referencia empírica",
  [("dias","Días racha","number",None)],
  [("nivelAprox","Nivel aprox",None),("realidad","Realidad",None),("resumen","Info",None)],
  ["365","A2+"], "A2-B1",
  [("¿Solo Duo?","No alcanza: 10 min/día limitado."),
   ("¿Complementar?","Con conversación y medios."),
   ("¿Streak?","Buen hábito, no progreso real."),
   ("¿Nivel?","Máximo Duo ~A2/B1."),
   ("¿Alternativas?","Anki, Busuu, Babbel para gramática estructurada.")],
  """  const d=Number(i.dias)||0;
  let n:string;
  if (d<30) n='A1 parcial'; else if (d<180) n='A1 completo'; else if (d<365) n='A2 parcial'; else if (d<730) n='A2-B1'; else n='B1 máximo';
  return { nivelAprox:n, realidad:'Duo solo no lleva más allá de B1', resumen:`${d} días racha ≈ ${n}. Complementar con conversación.` };""")

# I28. Caligrafía
M("horas-caligrafia-chino-kanji-practica", "idiomas", "🖋️", "Caligrafía chino/japonés: horas",
  "Horas hasta escribir 1000 caracteres.",
  "HSK/JLPT cronograma",
  [("caracteres","Caracteres meta","number",None),("minDia","Min/día práctica","number",None)],
  [("horas","Horas totales",None),("meses","Meses","number|string"),("resumen","Plan",None)],
  ["1000 chars, 20min","~330h"], "~18 meses",
  [("¿Cuántos?","HSK4 ~1200 chars; JLPT N3 ~650 kanji."),
   ("¿Ritmo?","3-5 chars/día sostenible."),
   ("¿Método?","Radicals + mnemotecnia (Heisig)."),
   ("¿Escribir?","Trazo fortalece memoria."),
   ("¿Apps?","Skritter, Wani Kani.")],
  """  const c=Number(i.caracteres)||0; const m=Number(i.minDia)||0;
  const h=c*0.3;
  const meses=m===0?'—':h*60/(m*30);
  return { horas:`${h.toFixed(0)}h`, meses:typeof meses==='string'?meses:`${Number(meses).toFixed(1)} meses`, resumen:`${c} chars: ${h.toFixed(0)}h, ${typeof meses==='string'?meses:`${Number(meses).toFixed(0)} meses`} a ${m}min/día.` };""")

# I29. Escuchar música
M("canciones-idioma-aprender-lyrics-memoria", "idiomas", "🎵", "Música para idioma: cuántas canciones",
  "Canciones/día para inmersión musical.",
  "Listening passivo",
  [("min","Min música/día","number",None)],
  [("canciones","Canciones",None),("beneficio","Beneficio",None),("resumen","Info",None)],
  ["30 min","~8 canciones"], "Ritmo/pronunc",
  [("¿Recordar letra?","SSspaced repetition."),
   ("¿Entender?","Leer letra junto con audio."),
   ("¿Cantar?","Pronuncia mejor con ritmo."),
   ("¿Género?","Pop/rap más moderno vocab."),
   ("¿Misma canción?","Repetida varias semanas sedimenta.")],
  """  const m=Number(i.min)||0;
  const c=Math.floor(m/3.5);
  return { canciones:`${c} canciones`, beneficio:'Pronunciación, ritmo, vocab emocional', resumen:`${m}min/día música: ~${c} canciones.` };""")

# I30. Gamificación
M("apps-idioma-efectividad-comparacion-nivel", "idiomas", "📱", "Apps idioma efectividad",
  "Qué app para qué propósito.",
  "Comparativa 2024",
  [("nivel","Nivel","select",[("princ","Principiante"),("inter","Intermedio"),("avan","Avanzado")]),("objetivo","Objetivo","select",[("vocab","Vocab"),("gram","Gramática"),("conv","Conversación"),("pron","Pronunciación")])]
  ,
  [("recom","Recomendada",None),("alter","Alternativas",None),("resumen","Info",None)],
  ["Inter, conv","iTalki"], "iTalki",
  [("¿Duolingo?","Principiante vocab básico."),
   ("¿Anki?","Intermedio vocab SRS."),
   ("¿iTalki?","Conversación 1:1."),
   ("¿Busuu?","Gramática estructurada."),
   ("¿HelloTalk?","Intercambio tandem.")],
  """  const n=String(i.nivel||'princ'); const o=String(i.objetivo||'vocab');
  const map:Record<string,Record<string,string>>={
    princ:{vocab:'Duolingo',gram:'Busuu',conv:'HelloTalk',pron:'Elsa Speak'},
    inter:{vocab:'Anki',gram:'Lingoda',conv:'iTalki',pron:'Pimsleur'},
    avan:{vocab:'Anki custom',gram:'Coach 1:1',conv:'iTalki Pro',pron:'Shadow coach'}
  };
  const r=map[n][o]||'—';
  return { recom:r, alter:'Busuu, Babbel, Preply', resumen:`${n} ${o}: recomendado ${r}.` };""")


def collect():
    return SPECS
