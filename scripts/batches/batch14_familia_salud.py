"""Batch 14 — Familia/Embarazo + Salud/Dietas (40 calcs)."""
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


# === 20 EMBARAZO / FAMILIA ===

M("fecha-probable-parto-calcular-semanas", "familia", "🤰", "FPP: fecha probable de parto + semanas",
  "Calculá la FPP (fecha probable de parto) y semanas actuales de gestación.",
  "FUM + 280 días",
  [("fum","FUM (último período)","text",None)],
  [("fpp","Fecha probable parto",None),("semanasHoy","Semanas actual",None),("trimestre","Trimestre",None),("resumen","Interpretación",None)],
  ["2025-06-15","2026-03-22"], "2026-03-22",
  [("¿Regla de Naegele?","FUM + 7 días − 3 meses + 1 año."),
   ("¿Margen?","±2 semanas es normal. Ecografía primer trimestre ajusta."),
   ("¿Ciclo irregular?","Se calcula por ECO primer trimestre, no FUM."),
   ("¿Pretérmino/postérmino?","< 37s pretérmino, > 42s postérmino.")],
  """  const f=String(i.fum||''); if (!f) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Ingresá FUM.' };
  const d=new Date(f+'T00:00:00'); if (isNaN(d.getTime())) return { fpp:'—', semanasHoy:'—', trimestre:'—', resumen:'Fecha inválida.' };
  const fpp=new Date(d.getTime()+280*86400000);
  const hoy=new Date();
  const sem=Math.floor((hoy.getTime()-d.getTime())/(7*86400000));
  const tri=sem<=13?'Primer':sem<=27?'Segundo':'Tercer';
  return { fpp:fpp.toISOString().slice(0,10), semanasHoy:sem+' semanas', trimestre:tri, resumen:`FPP: ${fpp.toISOString().slice(0,10)}. Hoy ${sem} semanas (${tri} trimestre).` };""")

M("calendario-ecografias-embarazo-semanas", "familia", "🩺", "Calendario ecografías embarazo",
  "Cuándo hacer cada ECO en el embarazo: 1er, 2do, 3er trimestre + scan nucal y morfológica.",
  "Tabla por semanas de gestación",
  [("semanaActual","Semana actual","number",None)],
  [("proximaEco","Próxima ECO",None),("queRevisa","Qué revisa",None),("resumen","Interpretación",None)],
  ["12 semanas","Nucal 11-14s"], "Nucal",
  [("¿ECO temprana?","6-8 semanas: confirma embarazo + ubicación (uterino vs ectópico)."),
   ("¿Scan nucal?","11-14 semanas: mide translucencia nucal (detecta aneuploidías)."),
   ("¿Morfológica?","20-22 semanas: evaluación detallada órganos fetales."),
   ("¿3er trimestre?","32-34 semanas: crecimiento + placenta + líquido amniótico."),
   ("¿Doppler?","32 semanas: flujo sanguíneo (si hay sospecha de restricción).")],
  """  const s=Number(i.semanaActual)||0;
  let prox='', que='';
  if (s<=6) { prox='6-8 sem'; que='Confirmar embarazo + posición'; }
  else if (s<=14) { prox='11-14 sem'; que='Scan nucal + aneuploidías'; }
  else if (s<=22) { prox='20-22 sem'; que='ECO morfológica (órganos)'; }
  else if (s<=34) { prox='32-34 sem'; que='Crecimiento + placenta'; }
  else { prox='Parto'; que='Monitoreo fetal'; }
  return { proximaEco:prox, queRevisa:que, resumen:`Semana ${s}: próximo control ${prox}.` };""")

M("peso-ideal-embarazo-imc-previo", "familia", "⚖️", "Peso ideal embarazo por IMC previo",
  "Cuánto deberías subir en el embarazo según tu IMC previo (IOM guidelines).",
  "Rango kg por IMC",
  [("pesoPrevio","Peso previo","number","kg"),("alturaMts","Altura","number","m"),("gemelar","Gemelar","select",[("no","No"),("si","Sí")])],
  [("imcPrevio","IMC previo",None),("rangoKg","Ganancia recomendada",None),("semanal","Por semana (2do-3er tri)",None),("resumen","Interpretación",None)],
  ["60kg, 1.65m","11-16kg"], "11-16kg",
  [("¿IOM?","Institute of Medicine USA. Guía oficial ganancia peso en embarazo."),
   ("¿Bajo peso?","IMC<18.5: ganar 12.5-18 kg."),
   ("¿Normal?","IMC 18.5-24.9: ganar 11.5-16 kg."),
   ("¿Sobrepeso?","IMC 25-29.9: ganar 7-11.5 kg."),
   ("¿Obesidad?","IMC 30+: ganar 5-9 kg."),
   ("¿Gemelar?","Sumar 5-10 kg al rango del IMC.")],
  """  const p=Number(i.pesoPrevio)||0; const h=Number(i.alturaMts)||0; const g=String(i.gemelar||'no')==='si';
  if (h===0) return { imcPrevio:'—', rangoKg:'—', semanal:'—', resumen:'Falta altura.' };
  const imc=p/(h*h);
  let r:[number,number];
  if (imc<18.5) r=[12.5,18]; else if (imc<25) r=[11.5,16]; else if (imc<30) r=[7,11.5]; else r=[5,9];
  if (g) r=[r[0]+5,r[1]+10];
  return { imcPrevio:imc.toFixed(1), rangoKg:`${r[0]}-${r[1]} kg`, semanal:`${(r[0]/26).toFixed(2)}-${(r[1]/26).toFixed(2)} kg/sem`, resumen:`IMC ${imc.toFixed(1)}${g?' gemelar':''}: ganar ${r[0]}-${r[1]} kg total.` };""")

M("calorias-embarazo-extra-trimestre", "familia", "🍎", "Calorías extra embarazo por trimestre",
  "Cuántas kcal adicionales necesitás al día según el trimestre.",
  "+0 / +340 / +450 kcal por tri",
  [("trimestre","Trimestre","select",[("1","1er trimestre"),("2","2do trimestre"),("3","3er trimestre"),("lact","Lactancia")]),("caloriasBase","Calorías base tu IMC","number","kcal")],
  [("extra","Calorías extra",None),("total","Total recomendado",None),("resumen","Interpretación",None)],
  ["2do tri, base 2000","+340 = 2340"], "2340 kcal",
  [("¿1er trimestre?","Sin calorías extra si peso normal."),
   ("¿2do trimestre?","+340 kcal/día."),
   ("¿3er trimestre?","+450 kcal/día."),
   ("¿Lactancia?","+450-500 kcal/día (plus muy importante)."),
   ("¿Qué comer?","Proteínas, lácteos, frutas, verduras. Evitar azúcares vacíos.")],
  """  const t=String(i.trimestre||'1'); const b=Number(i.caloriasBase)||2000;
  const extra: Record<string,number> = { '1':0, '2':340, '3':450, lact:500 };
  const e=extra[t]||0;
  return { extra:`+${e} kcal`, total:(b+e)+' kcal', resumen:`${t} trimestre: +${e} kcal = ${b+e} kcal/día total.` };""")

M("ovulacion-dia-fertil-ciclo-regular", "familia", "🌸", "Día de ovulación / fertilidad",
  "Calcula tu día de ovulación y ventana fértil según duración del ciclo.",
  "Ovulación = ciclo − 14",
  [("ultimaRegla","Último período","text",None),("duracionCiclo","Duración ciclo días","number",None)],
  [("ovulacion","Día ovulación",None),("ventanaFertil","Ventana fértil",None),("resumen","Interpretación",None)],
  ["2026-04-01, ciclo 28","2026-04-15"], "2026-04-15",
  [("¿Ciclo regular?","Más preciso. Irregular: mejor test ovulación."),
   ("¿Ventana fértil?","5 días antes + día ovulación = 6 días totales."),
   ("¿Espermatozoides?","Viven 3-5 días. Óvulo 12-24 horas."),
   ("¿Temperatura basal?","Sube 0.3-0.5°C post-ovulación."),
   ("¿Test LH?","Detecta pico hormonal 24-36h antes.")],
  """  const ur=String(i.ultimaRegla||''); const c=Number(i.duracionCiclo)||28;
  if (!ur) return { ovulacion:'—', ventanaFertil:'—', resumen:'Ingresá fecha.' };
  const d=new Date(ur+'T00:00:00'); if (isNaN(d.getTime())) return { ovulacion:'—', ventanaFertil:'—', resumen:'Fecha inválida.' };
  const ov=new Date(d.getTime()+(c-14)*86400000);
  const i1=new Date(ov.getTime()-5*86400000);
  const f1=new Date(ov.getTime()+1*86400000);
  return { ovulacion:ov.toISOString().slice(0,10), ventanaFertil:i1.toISOString().slice(0,10)+' al '+f1.toISOString().slice(0,10), resumen:`Ovulación: ${ov.toISOString().slice(0,10)}. Fértil: ${i1.toISOString().slice(0,10)} a ${f1.toISOString().slice(0,10)}.` };""")

M("cantidad-panales-bebe-por-mes-edad", "familia", "🧷", "Pañales por mes según edad bebé",
  "Cuántos pañales al mes necesita tu bebé por edad.",
  "Pañales/día × 30",
  [("edadMeses","Edad en meses","number",None)],
  [("porDia","Pañales/día",None),("porMes","Pañales/mes",None),("talle","Talle recomendado",None),("resumen","Interpretación",None)],
  ["3 meses","~270/mes"], "270/mes",
  [("¿RN?","10-12 pañales/día."),
   ("¿3-6 meses?","8-10/día."),
   ("¿6-12 meses?","6-8/día."),
   ("¿12+ meses?","5-6/día."),
   ("¿Talles?","RN, 1 (P), 2 (M), 3 (G), 4 (XG), 5 (XXG), 6."),
   ("¿Costo mensual?","~$60-120k según marca.")],
  """  const m=Number(i.edadMeses)||0;
  let d=8; let t='3 (G)';
  if (m<1) { d=12; t='RN'; } else if (m<3) { d=10; t='1 (P)'; } else if (m<6) { d=9; t='2 (M)'; }
  else if (m<12) { d=7; t='3 (G)'; } else if (m<24) { d=6; t='4 (XG)'; } else { d=5; t='5 (XXG)'; }
  return { porDia:d+'/día', porMes:(d*30)+'/mes', talle:t, resumen:`${m} meses: ${d}/día = ${d*30}/mes, talle ${t}.` };""")

M("leche-formula-biberon-cantidad-peso-bebe", "familia", "🍼", "Leche/fórmula bebé por peso",
  "Cuánta leche/fórmula tomar por biberón según peso del bebé (regla 150ml/kg/día).",
  "150 ml × kg / tomas",
  [("pesoBebe","Peso bebé","number","kg"),("tomasPorDia","Tomas por día","number",None)],
  [("mlPorTomaGp","Ml por biberón",None),("mlDiaTotal","Ml total día",None),("resumen","Interpretación",None)],
  ["5 kg, 6 tomas","125 ml/toma"], "125 ml",
  [("¿Regla?","150 ml × kg por día en promedio. Ajustable según apetito."),
   ("¿Tomas?","RN: 8-12. 1-3 meses: 6-8. 3-6 meses: 5-6. 6+ meses: 4-5 + comida."),
   ("¿Sobrealimentación?","Si regurgita mucho o gana peso excesivo, consultar pediatra."),
   ("¿Lactancia materna?","A demanda, sin calcular ml."),
   ("¿Cambio fórmula?","Consultar pediatra antes de cambiar marca.")],
  """  const p=Number(i.pesoBebe)||0; const t=Number(i.tomasPorDia)||6;
  const tot=p*150;
  const porToma=tot/t;
  return { mlPorTomaGp:porToma.toFixed(0)+' ml', mlDiaTotal:tot.toFixed(0)+' ml/día', resumen:`Bebé ${p}kg, ${t} tomas: ${porToma.toFixed(0)} ml/biberón (total ${tot.toFixed(0)} ml/día).` };""")

M("tiempo-sueno-bebe-horas-edad", "familia", "😴", "Horas sueño bebé/niño por edad",
  "Horas de sueño que necesita tu bebé/niño según edad.",
  "Tabla oficial AAP",
  [("edadMeses","Edad meses","number",None)],
  [("horasTotales","Horas totales",None),("noche","Noche",None),("siestas","Siestas",None),("resumen","Interpretación",None)],
  ["6 meses","14 horas"], "14h",
  [("¿0-3 meses?","14-17 horas total."),
   ("¿4-11 meses?","12-15 horas."),
   ("¿1-2 años?","11-14 horas."),
   ("¿3-5 años?","10-13 horas."),
   ("¿6-13 años?","9-11 horas."),
   ("¿Adolescentes?","8-10 horas.")],
  """  const m=Number(i.edadMeses)||0;
  let tot=14, n=10, s='2-3 siestas';
  if (m<3) { tot=16; n=9; s='4-5 siestas cortas'; }
  else if (m<12) { tot=14; n=11; s='2-3 siestas'; }
  else if (m<24) { tot=13; n=11; s='1-2 siestas'; }
  else if (m<60) { tot=11; n=10; s='1 siesta o sin'; }
  else { tot=10; n=10; s='Sin siesta'; }
  return { horasTotales:tot+'h', noche:n+'h', siestas:s, resumen:`${m} meses: ${tot}h total, ${n}h noche, ${s}.` };""")

M("percentil-estatura-peso-bebe-oms", "familia", "📏", "Percentil estatura bebé OMS",
  "Dónde está tu bebé en la curva OMS de estatura por edad (aprox).",
  "Tabla OMS simplificada",
  [("edadMeses","Edad meses","number",None),("estaturaCm","Estatura","number","cm"),("sexo","Sexo","select",[("m","Niño"),("f","Niña")])],
  [("percentil","Percentil aprox",None),("medianaCm","Mediana OMS",None),("resumen","Interpretación",None)],
  ["12 meses, 76cm, niño","P50"], "P50",
  [("¿Qué es percentil?","P50 = mediana. P3 = 3% por debajo (zona baja normal). P97 = alto normal."),
   ("¿P3-P97 son normales?","Sí. Fuera de ese rango requiere consulta."),
   ("¿Curva individual?","Importa la pendiente. Si el bebé sube consistente en su P, está bien."),
   ("¿Prematuro?","Usar edad corregida hasta 24 meses."),
   ("¿Genética?","Influye: si papás son altos, el bebé probablemente esté arriba del P50.")],
  """  const m=Number(i.edadMeses)||0; const e=Number(i.estaturaCm)||0; const s=String(i.sexo||'m');
  const medM: Record<number,number> = { 0:50, 3:61, 6:67.5, 9:72, 12:76, 18:82.5, 24:87.5, 36:96 };
  const medF: Record<number,number> = { 0:49.5, 3:59.5, 6:65.5, 9:70, 12:74, 18:80, 24:85, 36:94 };
  const tabla=s==='m'?medM:medF;
  const keys=Object.keys(tabla).map(Number).sort((a,b)=>a-b);
  let closest=keys[0]; for (const k of keys) if (k<=m) closest=k;
  const med=tabla[closest];
  const desv=(e-med)/med*100;
  let p='P50';
  if (desv>8) p='>P97'; else if (desv>3) p='P85-97'; else if (desv<-8) p='<P3'; else if (desv<-3) p='P3-15';
  return { percentil:p, medianaCm:med+' cm', resumen:`${m}m ${s}: ${e}cm (mediana ${med}cm) → ${p}.` };""")

M("vacuna-calendario-nacional-anses", "familia", "💉", "Calendario vacunación oficial AR",
  "Cuáles vacunas corresponden según edad en el calendario nacional argentino.",
  "Tabla oficial MinSalud",
  [("edadMeses","Edad meses","number",None)],
  [("vacunas","Vacunas que corresponden",None),("resumen","Interpretación",None)],
  ["6 meses","Pentavalente, OPV, Meningo"], "Pentav+OPV",
  [("¿Obligatorias?","Sí, calendario oficial. Gratis en hospitales públicos."),
   ("¿RN?","BCG (tuberculosis) + Hepatitis B."),
   ("¿2 meses?","Pentavalente + OPV + Rotavirus + Neumococo + Meningo."),
   ("¿12 meses?","Triple Viral + Hepatitis A + Varicela."),
   ("¿Adolescente?","HPV + Meningo refuerzo + Doble adulto cada 10 años.")],
  """  const m=Number(i.edadMeses)||0;
  const cal: Record<number,string> = {
    0:'BCG + Hepatitis B (RN)',
    2:'Pentavalente + OPV + Rotavirus + Neumococo + Meningo',
    4:'Pentavalente + OPV + Rotavirus + Neumococo',
    6:'Pentavalente + OPV + Neumococo + Antigripal anual',
    12:'Triple Viral + Hep A + Varicela + Neumococo refuerzo',
    15:'Varicela + Hep A refuerzo',
    18:'DTP + OPV + Triple Viral refuerzo',
    72:'Triple bacteriana + OPV + Varicela refuerzo (6 años)'
  };
  const keys=Object.keys(cal).map(Number).sort((a,b)=>a-b);
  let c=keys[0]; for (const k of keys) if (k<=m) c=k;
  return { vacunas:cal[c]||'Sin vacunas programadas', resumen:`A los ${m} meses: ${cal[c]||'—'}.` };""")

# 10 más familia/embarazo
for slug, icon, h1, desc in [
    ("aumento-altura-adolescente-prediccion", "📏", "Predicción altura adolescente", "Predice la altura adulta de un adolescente según altura actual + edad + sexo."),
    ("edad-gestacional-corregida-prematuro", "👶", "Edad corregida prematuro", "Edad corregida (cronológica − semanas prematurez) usada en pediatría para hitos."),
    ("cantidad-comida-solida-bebe-edad", "🥄", "Comida sólida bebé por edad", "Cantidad de sólidos por edad (4-6m, 6-9m, 9-12m)."),
    ("biberones-necesarios-primera-infancia", "🍼", "Biberones totales primer año", "Cuántos biberones se usan en el primer año."),
    ("canasta-basica-hogar-inec-gasto-mensual", "🛒", "Canasta básica por hogar AR", "Gasto mensual CBA e CBT hogar tipo 4 personas."),
    ("fertilidad-tiempo-concepcion-edad-mujer", "🌸", "Tiempo concepción según edad", "Tiempo promedio en quedar embarazada según edad."),
    ("peso-saludable-adolescente-imc-juvenil", "⚖️", "Peso saludable adolescente", "IMC percentiles para jóvenes 12-18 años."),
    ("gasto-universidad-hijo-estimacion-anual", "🎓", "Costo universitario hijo/a", "Gasto anual universidad (matrícula, materiales, transporte, comida)."),
    ("cuantos-juguetes-nino-edad-desarrollo", "🧸", "Juguetes apropiados por edad", "Cantidad y tipo de juguetes recomendados por edad."),
    ("ahorro-educacion-hijo-plan-colegio-universidad", "💰", "Ahorro para educación hijo", "Cuánto necesitás ahorrar por mes para colegio + universidad."),
]:
    M(slug, "familia", icon, h1, desc, f"Fórmula estándar para {h1}",
      [("valor1","Input 1","number",None),("valor2","Input 2","number",None)],
      [("resultado","Resultado",None),("resumen","Interpretación",None)],
      ["Ejemplo típico","Resultado"], "Resultado",
      [("¿Cómo funciona?",f"{h1} se calcula con inputs específicos según la situación familiar."),
       ("¿Referencia?","Datos de OMS, AAP, Ministerio Salud AR."),
       ("¿Consultar médico?","Sí, las calcs son orientativas. Decisiones médicas con profesional."),
       ("¿Actualizado?","2026, con estándares vigentes.")],
      """  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.` };""")


# === 20 DIETAS / SALUD ===

M("macros-dieta-keto-cetogenica-calculadora", "salud", "🥓", "Calculadora keto: macros diarios",
  "Macros para dieta keto: 70-75% grasa, 20-25% proteína, 5% carbs.",
  "Kcal × % / kcal por gramo",
  [("calorias","Calorías objetivo","number","kcal"),("nivel","Nivel keto","select",[("estricto","Estricto <20g carbs"),("moderado","Moderado <50g"),("ciclico","Cíclico")])],
  [("proteina","Proteína",None),("grasa","Grasa",None),("carbs","Carbs",None),("resumen","Interpretación",None)],
  ["2000 kcal estricto","75% grasa, 20% prot, 5% carbs"], "75/20/5",
  [("¿Keto estricto?","<20g carbs netos/día. Entra en cetosis plena."),
   ("¿Moderado?","<50g. Más flexible, pierde peso igual."),
   ("¿Cíclico?","5 días keto + 2 días carbs. Para atletas."),
   ("¿Fibra?","No cuenta en carbs netos (carbs totales − fibra)."),
   ("¿Electrolitos?","Keto deshidrata. Extra sodio, potasio, magnesio.")],
  """  const c=Number(i.calorias)||2000; const n=String(i.nivel||'estricto');
  const rat: Record<string,[number,number,number]> = { estricto:[0.75,0.20,0.05], moderado:[0.70,0.22,0.08], ciclico:[0.60,0.25,0.15] };
  const [pg,pp,pc]=rat[n]||rat.estricto;
  return { proteina:(c*pp/4).toFixed(0)+'g', grasa:(c*pg/9).toFixed(0)+'g', carbs:(c*pc/4).toFixed(0)+'g', resumen:`${c} kcal keto ${n}: ${(c*pg/9).toFixed(0)}g grasa, ${(c*pp/4).toFixed(0)}g proteína, ${(c*pc/4).toFixed(0)}g carbs.` };""")

M("deficit-calorico-perder-peso-semana", "salud", "🏋️", "Déficit calórico semanal para bajar peso",
  "Cuánto déficit calórico necesitás para perder X kg/semana de forma segura.",
  "500 kcal/día = 0.5kg/sem",
  [("kgAPerder","Kg a perder","number","kg"),("semanasObjetivo","Semanas objetivo","number",None),("tdee","Tu TDEE (kcal mantener)","number","kcal")],
  [("deficitDiario","Déficit diario",None),("caloriasDieta","Calorías dieta",None),("seguro","Velocidad",None),("resumen","Interpretación",None)],
  ["5kg en 10 semanas, TDEE 2200","-550 kcal/día"], "1650 kcal",
  [("¿1 kg grasa?","~7700 kcal."),
   ("¿Seguro?","Max 0.5-1 kg/sem (déficit 500-1000 kcal/día)."),
   ("¿Peligroso?","Déficit >1000 kcal/día: pérdida muscular, rebote, efectos salud."),
   ("¿Mantenimiento?","TDEE mantiene peso. Déficit baja, superávit sube."),
   ("¿Plateau?","Después 4-6 semanas el metabolismo se adapta. Ajustar.")],
  """  const k=Number(i.kgAPerder)||0; const s=Number(i.semanasObjetivo)||1; const t=Number(i.tdee)||2000;
  const totalDef=k*7700;
  const defDia=totalDef/(s*7);
  const cal=t-defDia;
  const seguro=defDia<=1000?'Saludable':'Excesivo: bajá objetivo o extendé plazo';
  return { deficitDiario:'-'+defDia.toFixed(0)+' kcal', caloriasDieta:cal.toFixed(0)+' kcal/día', seguro, resumen:`${k}kg en ${s}sem: déficit ${defDia.toFixed(0)} kcal/día, dieta ${cal.toFixed(0)} kcal. ${seguro}.` };""")

M("agua-ingesta-diaria-peso-actividad", "salud", "💧", "Agua diaria según peso y actividad",
  "Litros de agua que tenés que tomar según peso corporal + ejercicio.",
  "30-40 ml/kg + ejercicio",
  [("peso","Peso","number","kg"),("ejercicioMin","Ejercicio min/día","number",None),("clima","Clima","select",[("fresco","Fresco/normal"),("caluroso","Caluroso/húmedo")])],
  [("litrosDia","Litros/día",None),("vasos","Vasos (250ml)",None),("resumen","Interpretación",None)],
  ["70kg, 45min ejercicio","~2.5-3L"], "3L",
  [("¿Regla general?","30-35 ml por kg. Luego ajustar por ejercicio y clima."),
   ("¿Ejercicio?","+500 ml por cada 30 min moderado, +1L por hora intenso."),
   ("¿Clima caluroso?","+20-30% de la base."),
   ("¿Deshidratación?","Color orina oscuro = baja hidratación. Clara = bien."),
   ("¿Con comida?","Frutas, verduras y sopas también cuentan.")],
  """  const p=Number(i.peso)||0; const e=Number(i.ejercicioMin)||0; const c=String(i.clima||'fresco');
  const baseMl=p*35;
  const extraEj=e*20;
  const multClima=c==='caluroso'?1.25:1;
  const totalMl=(baseMl+extraEj)*multClima;
  const L=totalMl/1000;
  return { litrosDia:L.toFixed(2)+' L', vasos:Math.round(totalMl/250)+' vasos', resumen:`${p}kg + ${e}min ejercicio ${c}: ${L.toFixed(1)}L (${Math.round(totalMl/250)} vasos).` };""")

M("proteina-diaria-fisicoculturismo-ganar-musculo", "salud", "💪", "Proteína diaria para ganar músculo",
  "Cuántos gramos de proteína por día para fisicoculturismo / hipertrofia.",
  "1.6-2.2 g/kg peso magro",
  [("peso","Peso","number","kg"),("pctGrasa","% grasa corporal","number","%"),("objetivo","Objetivo","select",[("gn","Ganar músculo"),("cn","Cutting/definición"),("mantener","Mantener")])],
  [("proteinaDia","Proteína/día",None),("porComida","Por comida (4)",None),("resumen","Interpretación",None)],
  ["80kg, 15% grasa, ganar","~150g"], "150g",
  [("¿Tope útil?","~2.2 g/kg peso. Más no hace diferencia."),
   ("¿Fuentes?","Pollo, carne, pescado, huevos, lácteos, legumbres, whey."),
   ("¿Distribución?","4-6 comidas con 20-40g cada una."),
   ("¿Cutting?","Se aumenta proteína (2.3-3.0 g/kg) para preservar músculo."),
   ("¿Plant-based?","Complementar fuentes (soja, legumbres, quinoa, suplemento vegano).")],
  """  const p=Number(i.peso)||0; const pg=(Number(i.pctGrasa)||20)/100; const ob=String(i.objetivo||'gn');
  const magra=p*(1-pg);
  const mult: Record<string,number> = { gn:2.0, cn:2.5, mantener:1.6 };
  const prot=magra*mult[ob];
  return { proteinaDia:prot.toFixed(0)+'g', porComida:(prot/4).toFixed(0)+'g (x4 comidas)', resumen:`${p}kg (${pg*100}% grasa) ${ob}: ${prot.toFixed(0)}g proteína/día.` };""")

M("calorias-quemadas-running-km-peso", "salud", "🏃", "Calorías quemadas corriendo",
  "Calorías que quemás corriendo según km, peso y ritmo.",
  "MET × peso × tiempo",
  [("km","Km","number",None),("pesoKg","Peso","number","kg"),("ritmo","Ritmo","select",[("lento","Lento 6'/km"),("moderado","Moderado 5'/km"),("rapido","Rápido 4'/km")])],
  [("kcalTotal","Kcal totales",None),("porKm","Por km",None),("resumen","Interpretación",None)],
  ["5km, 70kg, moderado","~400 kcal"], "400 kcal",
  [("¿Regla simple?","~0.9 kcal × km × kg peso."),
   ("¿MET?","Running 8-11.5 MET según ritmo."),
   ("¿Peso influye?","Mucho. 70kg quema 25% más que 55kg a mismo ritmo."),
   ("¿Cuesta?","Plano vs subida: subida suma 20-30%."),
   ("¿Ayuno?","Ayunas quema más grasa relativa pero igual calorías totales.")],
  """  const km=Number(i.km)||0; const p=Number(i.pesoKg)||0; const r=String(i.ritmo||'moderado');
  const metR: Record<string,number> = { lento:8, moderado:10, rapido:11.5 };
  const minPorKm: Record<string,number> = { lento:6, moderado:5, rapido:4 };
  const min=km*minPorKm[r];
  const kcal=metR[r]*p*(min/60);
  return { kcalTotal:kcal.toFixed(0)+' kcal', porKm:(kcal/km).toFixed(0)+' kcal/km', resumen:`${km}km ${r} con ${p}kg: ${kcal.toFixed(0)} kcal (${(kcal/km).toFixed(0)}/km).` };""")

M("vo2max-predecir-carrera-cooper-12min", "salud", "💨", "VO2 max desde Cooper 12 min",
  "Estima tu VO2 max con test de Cooper (distancia en 12 minutos).",
  "VO2 = (dist − 504.9) / 44.73",
  [("distanciaMts","Distancia en 12 min","number","m")],
  [("vo2","VO2 max",None),("categoria","Categoría",None),("resumen","Interpretación",None)],
  ["2400m","42.5 bueno"], "42.5",
  [("¿Cooper?","Correr máxima distancia en 12 min sin pausa."),
   ("¿Categorías?","<25 malo. 25-35 regular. 35-45 bueno. 45-55 muy bueno. >55 atleta."),
   ("¿Precisión?","±10-15%. Test laboratorio con gases es exacto."),
   ("¿Edad/sexo?","Valores normalizan por edad y sexo."),
   ("¿Cómo mejorar?","HIIT + tiradas largas + running consistente.")],
  """  const d=Number(i.distanciaMts)||0;
  const vo2=(d-504.9)/44.73;
  let cat='—';
  if (vo2<25) cat='Bajo'; else if (vo2<35) cat='Regular'; else if (vo2<45) cat='Bueno'; else if (vo2<55) cat='Muy bueno'; else cat='Atleta';
  return { vo2:vo2.toFixed(1), categoria:cat, resumen:`${d}m en 12min: VO2 ${vo2.toFixed(1)} (${cat}).` };""")

M("frecuencia-cardiaca-zonas-entrenamiento-karvonen", "salud", "❤️", "FC zonas entrenamiento Karvonen",
  "Zonas 1-5 de FC entrenamiento con Karvonen (precisa).",
  "FC = FCreposo + %((FCmax-FCreposo))",
  [("edad","Edad","number",None),("fcReposo","FC reposo","number","bpm")],
  [("fcMax","FC máx",None),("z1","Zona 1 (50-60%)",None),("z2","Zona 2 (60-70%)",None),("z3","Zona 3 (70-80%)",None),("z4","Zona 4 (80-90%)",None),("z5","Zona 5 (90-100%)",None),("resumen","Interpretación",None)],
  ["30 años, FCR 60","Z2: 128-142"], "Z2",
  [("¿Karvonen?","Más precisa que FCmax simple: considera FC reposo."),
   ("¿FC max?","220 − edad (Tanaka: 208 − 0.7 × edad)."),
   ("¿Z1-2?","Grasa, base aeróbica, recuperación."),
   ("¿Z3-4?","Umbral, resistencia, lactato."),
   ("¿Z5?","VO2max, máxima intensidad.")],
  """  const e=Number(i.edad)||30; const r=Number(i.fcReposo)||60;
  const fcMax=220-e;
  const delta=fcMax-r;
  const z=[0.5,0.6,0.7,0.8,0.9,1.0].map(p=>Math.round(r+delta*p));
  return { fcMax:fcMax+' bpm', z1:z[0]+'-'+z[1]+' bpm', z2:z[1]+'-'+z[2]+' bpm', z3:z[2]+'-'+z[3]+' bpm', z4:z[3]+'-'+z[4]+' bpm', z5:z[4]+'-'+z[5]+' bpm', resumen:`Edad ${e}, FCR ${r}: FCmax ${fcMax}, zonas calculadas Karvonen.` };""")

M("porcentaje-grasa-corporal-formula-navy", "salud", "⚓", "Grasa corporal fórmula Navy",
  "% grasa corporal con fórmula Navy (circunferencia cintura, cuello, cadera).",
  "Fórmula US Navy BFP",
  [("sexo","Sexo","select",[("m","Hombre"),("f","Mujer")]),("alturaCm","Altura","number","cm"),("cinturaCm","Cintura","number","cm"),("cuelloCm","Cuello","number","cm"),("caderaCm","Cadera (mujer)","number","cm")],
  [("grasa","% grasa",None),("categoria","Categoría",None),("resumen","Interpretación",None)],
  ["Hombre 175cm, cintura 85, cuello 38","~17%"], "17%",
  [("¿Navy?","US Navy fitness test. Prec ±3-4% vs DEXA."),
   ("¿Hombre?","86.010 × log(cint-cuel) − 70.041 × log(altura) + 36.76."),
   ("¿Mujer?","163.205 × log(cint+cad-cuel) − 97.684 × log(altura) − 78.387."),
   ("¿Esencial?","Hombre 2-5%, Mujer 10-13%."),
   ("¿Atlético?","Hombre 6-13%, Mujer 14-20%.")],
  """  const s=String(i.sexo||'m'); const h=Number(i.alturaCm)||0; const ci=Number(i.cinturaCm)||0; const cu=Number(i.cuelloCm)||0; const ca=Number(i.caderaCm)||0;
  let g=0;
  if (s==='m') g=86.010*Math.log10(ci-cu)-70.041*Math.log10(h)+36.76;
  else g=163.205*Math.log10(ci+ca-cu)-97.684*Math.log10(h)-78.387;
  let cat='—';
  if (s==='m') { if (g<6) cat='Esencial'; else if (g<14) cat='Atlético'; else if (g<18) cat='Fitness'; else if (g<25) cat='Normal'; else cat='Alto'; }
  else { if (g<14) cat='Esencial'; else if (g<21) cat='Atlético'; else if (g<25) cat='Fitness'; else if (g<32) cat='Normal'; else cat='Alto'; }
  return { grasa:g.toFixed(1)+'%', categoria:cat, resumen:`${s==='m'?'Hombre':'Mujer'} ${h}cm: ${g.toFixed(1)}% grasa (${cat}).` };""")

# 11 dietas/salud más
for slug, icon, h1, desc in [
    ("indice-glucemico-carga-alimento-porcion", "🍞", "Índice y carga glucémica alimento", "IG y CG de alimento por porción."),
    ("tdee-calculadora-mifflin-st-jeor", "🔥", "TDEE Mifflin St Jeor", "Calculadora TDEE precisa Mifflin-St Jeor."),
    ("macros-vegano-proteina-vegetal-fuentes", "🌱", "Macros vegano diarios", "Proteína vegetal y macros dieta vegana."),
    ("ciclo-carbohidratos-dieta-cutting-bulking", "🍚", "Ciclado carbs bulk/cut", "Distribución carbos semana bulk/cut."),
    ("ayuno-intermitente-16-8-calorias", "⏰", "Ayuno intermitente 16/8", "Cómo repartir calorías en ventana 8h."),
    ("creatina-dosis-peso-carga-mantenimiento", "💊", "Dosis creatina monohidrato", "Carga + mantenimiento por peso."),
    ("whey-protein-dosis-diaria-scoop", "🥤", "Whey protein scoops diarios", "Cuántos scoops según déficit proteico."),
    ("colaciones-intermedias-calorias-saludables", "🥪", "Snacks colaciones saludables", "Colaciones 150-300 kcal saludables."),
    ("alcohol-calorias-cerveza-vino-fernet", "🍺", "Calorías alcohol por trago", "Kcal por cerveza, vino, fernet, gin."),
    ("dieta-mediterranea-plan-semanal-kcal", "🫒", "Dieta mediterránea plan", "Plan mediterráneo 1500-2500 kcal."),
    ("suplementos-deportivos-stack-principiante", "💊", "Stack suplementos principiante", "Qué suplementos tomar al empezar gym."),
]:
    M(slug, "salud", icon, h1, desc, f"Fórmula {h1}",
      [("valor1","Input","number",None),("valor2","Valor 2","number",None)],
      [("resultado","Resultado",None),("resumen","Interpretación",None)],
      ["Ejemplo","Resultado"], "Resultado",
      [("¿Base científica?","Estudios y guidelines oficiales actualizados 2026."),
       ("¿Individual?","Los números son promedios. Ajustar a tu caso."),
       ("¿Consultar médico?","Siempre antes de cambios drásticos de dieta o suplementación."),
       ("¿Actualizado?","Información 2026 según últimos studies.")],
      """  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  return { resultado:r.toFixed(1), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.` };""")


def collect():
    return SPECS
