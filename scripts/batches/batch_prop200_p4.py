"""Batch Prop200 P4 — 50 calcs finales (Educación restantes 10 + Cocina 10 + Niños 15 + Tech 10 + Misc 5)."""
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

# ============================================================
# EDUCACIÓN restantes (10)
# ============================================================

M("itba-utdt-costo-carrera-anual-privada", "educacion", "💰", "Universidad privada costo",
  "Costo anual universidad privada top AR.",
  "cuotas × 12 + matrícula",
  [("universidad","Universidad","select",["itba","utdt","udesa","austral","uca","ucema"]),("carrera","Carrera","select",["ingenieria","economia","derecho","medicina","administracion"])]  ,
  [("costoAnual","Costo anual USD",None),("costoCarrera","Costo carrera completa",None),("beca","Oportunidades beca",None)],
  ["ITBA ingeniería","USD 10k/año"],"4-5 años",
  [("¿ITBA?","USD 10-14k/año ingeniería."),
   ("¿UTDT?","USD 8-12k/año economía."),
   ("¿UdeSA?","USD 12-18k/año."),
   ("¿Austral?","USD 10-15k/año."),
   ("¿UCA?","USD 5-8k/año (más accesible)."),
   ("¿UCEMA?","USD 7-10k."),
   ("¿Becas?","20-50% descuento por mérito. Cada una tiene sus programas.")],
  """  const u=String(i.universidad||'itba'); const c=String(i.carrera||'ingenieria');
  const base={'itba':12000,'utdt':10000,'udesa':14000,'austral':12000,'uca':6500,'ucema':8500}[u];
  const mult={'ingenieria':1.1,'economia':1,'derecho':1,'medicina':1.3,'administracion':1}[c];
  const anual=base*mult;
  const anios={'medicina':6,'ingenieria':5,'derecho':5,'economia':4,'administracion':4}[c];
  const total=anual*anios;
  return { costoAnual:`USD ${Math.round(anual).toLocaleString('en-US')}`, costoCarrera:`USD ${Math.round(total).toLocaleString('en-US')} (${anios} años)`, beca:'Becas mérito 20-50%. Info en sitio univ.' };""")

M("mba-roi-retorno-inversion-argentina-evaluacion", "negocios", "🎓", "MBA ROI",
  "¿Vale la pena un MBA? Análisis ROI.",
  "aumento sueldo / costo amortizado",
  [("costoMba","Costo MBA USD","number",50000),("sueldoActual","Sueldo anual actual USD","number",30000),("sueldoPostEsperado","Sueldo post-MBA USD","number",60000)],
  [("aumentoAnual","Aumento anual",None),("roiAnios","Años recupero inversión",None),("recomendacion","Recomendación",None)],
  ["USD 50k MBA +$30k/año","$30k"],"1.7 años",
  [("¿Costo MBA AR?","UdeSA/UTDT: USD 30-50k. Austral: USD 20-30k."),
   ("¿Exterior?","Top 10: USD 150-250k."),
   ("¿Tiempo?","1-2 años full-time. 2-3 part-time."),
   ("¿ROI realista?","3-7 años para recuperar. Depende carrera previa."),
   ("¿Cuándo?","5-10 años experiencia previa usual."),
   ("¿Network?","Valor difícil cuantificar pero real."),
   ("¿Alternativa?","Master en áreas específicas más baratos + focus.")],
  """  const c=Number(i.costoMba)||0; const sa=Number(i.sueldoActual)||0; const sp=Number(i.sueldoPostEsperado)||0;
  const aumento=sp-sa;
  const roi=aumento>0?c/aumento:Infinity;
  let rec='';
  if(roi<3) rec='ROI muy bueno. Hacelo si te interesa.';
  else if(roi<7) rec='ROI razonable. Pensalo bien si el network+oportunidades compensan.';
  else rec='ROI lento. Evaluá alternativas: master específico o online.';
  return { aumentoAnual:`USD ${aumento.toLocaleString('en-US')}/año`, roiAnios:`${roi.toFixed(1)} años`, recomendacion:rec };""")

M("ingles-niveles-cambridge-duolingo-tiempo-conversion", "educacion", "🇬🇧", "Niveles inglés",
  "Tiempo estimado entre niveles A1-C2.",
  "horas × nivel CEFR",
  [("nivelActual","Nivel actual","select",["cero","a1","a2","b1","b2","c1"]),("horasSemana","Horas/semana","number",5)]  ,
  [("semanasASiguiente","Semanas al siguiente nivel",None),("totalHasta","Total hasta C1",None),("observacion","Observación",None)],
  ["B1 5h/sem","~40 semanas a B2"],"300 horas",
  [("¿A1?","Principiante. 100 horas acumuladas."),
   ("¿A2?","Básico. 200 horas."),
   ("¿B1?","Intermedio. 400 horas."),
   ("¿B2?","Intermedio alto. 700 horas. Útil trabajar."),
   ("¿C1?","Avanzado. 1000+ horas. Universitario."),
   ("¿C2?","Maestría. 1500+ horas. Nativo-like."),
   ("¿Exámenes?","Cambridge FCE=B2, CAE=C1, CPE=C2. IELTS ≥6.5≈B2.")],
  """  const n=String(i.nivelActual||'b1'); const h=Number(i.horasSemana)||5;
  const niveles=['cero','a1','a2','b1','b2','c1','c2'];
  const horasAcum={'cero':0,'a1':100,'a2':200,'b1':400,'b2':700,'c1':1000,'c2':1500};
  const idx=niveles.indexOf(n);
  const siguiente=niveles[idx+1];
  if(!siguiente) return { semanasASiguiente:'Ya en C2', totalHasta:'—', observacion:'Nivel máximo' };
  const horasNec=horasAcum[siguiente]-horasAcum[n];
  const semanas=Math.ceil(horasNec/h);
  const hastaC1=horasAcum['c1']-horasAcum[n];
  return { semanasASiguiente:`${semanas} semanas a ${siguiente.toUpperCase()}`, totalHasta:`${hastaC1} horas a C1`, observacion:`Desde ${n.toUpperCase()} al siguiente: ${horasNec} horas.` };""")

M("sat-ielts-toefl-equivalencias-puntaje-convertidor", "educacion", "📝", "IELTS/TOEFL conversión",
  "Conversión entre IELTS, TOEFL iBT y CEFR.",
  "tabla equivalencias",
  [("examen","Tu examen","select",["ielts","toefl"]),("puntaje","Puntaje","number",7)]  ,
  [("equivalenciaOtro","Equivalente en otro examen",None),("cefr","CEFR",None),("interpretacion","Interpretación",None)],
  ["IELTS 7","TOEFL 95-101"],"C1",
  [("¿IELTS 5?","TOEFL 35-45. CEFR B1."),
   ("¿IELTS 6?","TOEFL 60-78. B2 ."),
   ("¿IELTS 7?","TOEFL 95-101. C1."),
   ("¿IELTS 8?","TOEFL 110-114. C1+."),
   ("¿IELTS 9?","TOEFL 118-120. C2."),
   ("¿Carrera universitaria?","IELTS 6.5+ o TOEFL 90+ típico."),
   ("¿Validez?","2 años ambos exámenes.")],
  """  const e=String(i.examen||'ielts'); const p=Number(i.puntaje)||0;
  let eq='', cefr='', interp='';
  if(e==='ielts'){
    if(p>=9){eq='TOEFL 118-120';cefr='C2';interp='Máximo nivel'}
    else if(p>=8){eq='TOEFL 110-114';cefr='C1+';interp='Muy alto'}
    else if(p>=7){eq='TOEFL 95-101';cefr='C1';interp='Avanzado'}
    else if(p>=6){eq='TOEFL 60-78';cefr='B2';interp='Intermedio alto — universitario'}
    else if(p>=5){eq='TOEFL 35-45';cefr='B1';interp='Intermedio'}
    else {eq='TOEFL <35';cefr='A2';interp='Básico'}
  } else {
    if(p>=115){eq='IELTS 8-9';cefr='C1-C2';interp='Muy alto'}
    else if(p>=95){eq='IELTS 7';cefr='C1';interp='Avanzado'}
    else if(p>=60){eq='IELTS 6';cefr='B2';interp='Intermedio alto'}
    else if(p>=35){eq='IELTS 5';cefr='B1';interp='Intermedio'}
    else {eq='IELTS <5';cefr='A2';interp='Básico'}
  }
  return { equivalenciaOtro:eq, cefr:cefr, interpretacion:interp };""")

M("tesis-palabras-tiempo-necesario-elaboracion", "educacion", "📖", "Tesis tiempo escribir",
  "Tiempo para escribir tesis por cantidad palabras.",
  "palabras / ritmo semanal",
  [("palabras","Palabras totales","number",20000),("palabrasSemana","Palabras/semana","number",1500)]  ,
  [("semanas","Semanas estimadas",None),("meses","Meses",None),("recomendacion","Recomendación",None)],
  ["20k palabras 1500/sem","~14 semanas"],"3.5 meses",
  [("¿Palabras típicas?","Licenciatura: 15-30k. Maestría: 30-50k. Doctorado: 60-100k."),
   ("¿Ritmo?","Principiante 500-1000/semana. Experimentado 2000-5000."),
   ("¿Draft?","1er borrador rápido + iteraciones."),
   ("¿Defensa?","30-60 min expositiva + jurado pregunta."),
   ("¿Directora?","Reuniones quincenales estándar."),
   ("¿Stress?","Último mes suele ser intenso."),
   ("¿Revisión?","5-10x borradores usual.")],
  """  const p=Number(i.palabras)||0; const ps=Number(i.palabrasSemana)||1;
  const s=p/ps; const m=s/4.33;
  const rec=s>26?'Muy largo. Aumenta ritmo o consulta con tu directora.':s>12?'Razonable.':'Buen ritmo — mantenelo.';
  return { semanas:`${Math.ceil(s)} semanas`, meses:`${m.toFixed(1)} meses`, recomendacion:rec };""")

M("vocabulario-idioma-palabras-nivel-conocido", "educacion", "📚", "Vocabulario nivel",
  "Palabras que conocés y tu nivel aproximado.",
  "palabras × nivel",
  [("palabrasActivas","Palabras activas conocidas","number",2500),("idioma","Idioma","select",["ingles","portugues","aleman","frances","italiano"])]  ,
  [("nivel","Nivel CEFR estimado",None),("interpretacion","Interpretación",None),("objetivo","Objetivo siguiente",None)],
  ["2500 palabras inglés","B1"],"3500 para B2",
  [("¿Palabras pasivas?","Reconocés pero no usás (2-4x las activas)."),
   ("¿A1?","500-1000 palabras."),
   ("¿A2?","1500-2000."),
   ("¿B1?","2500-3500."),
   ("¿B2?","4000-5000."),
   ("¿C1?","8000-10000."),
   ("¿C2?","16000+. Nivel nativo-culto.")],
  """  const p=Number(i.palabrasActivas)||0;
  let n='', int_='', obj='';
  if(p>=10000){n='C2';int_='Nativo-culto';obj='Dominio'}
  else if(p>=8000){n='C1';int_='Avanzado';obj='10000+ para C2'}
  else if(p>=4000){n='B2';int_='Intermedio alto';obj='8000 para C1'}
  else if(p>=2500){n='B1';int_='Intermedio';obj='4000 para B2'}
  else if(p>=1500){n='A2';int_='Básico';obj='2500 para B1'}
  else {n='A1';int_='Principiante';obj='1500 para A2'}
  return { nivel:n, interpretacion:int_, objetivo:obj };""")

M("lectura-velocidad-paginas-hora-wpm", "educacion", "📖", "Velocidad lectura",
  "Tu velocidad de lectura en palabras por minuto.",
  "palabras / tiempo",
  [("palabras","Palabras leídas","number",1000),("tiempoMinutos","Tiempo (min)","number",5)]  ,
  [("wpm","Palabras/minuto",None),("clasificacion","Clasificación",None),("recomendacion","Recomendación",None)],
  ["1000 palabras 5 min","200 WPM"],"Promedio",
  [("¿Lectura lenta?","<150 WPM."),
   ("¿Promedio?","200-250 WPM."),
   ("¿Rápida?","300-400 WPM."),
   ("¿Muy rápida?","500+ WPM."),
   ("¿Comprensión?","Mejor comprensión 250-350 WPM."),
   ("¿Técnicas?","Eliminar subvocalización, agrupar palabras."),
   ("¿Objetivo realista?","+20-30% con entrenamiento.")],
  """  const p=Number(i.palabras)||0; const t=Number(i.tiempoMinutos)||1;
  const wpm=p/t;
  let clas='', rec='';
  if(wpm>=500){clas='Muy rápida';rec='Excelente. Verifica comprensión.'}
  else if(wpm>=300){clas='Rápida';rec='Muy buena.'}
  else if(wpm>=200){clas='Promedio';rec='Intenta sin subvocalizar.'}
  else {clas='Lenta';rec='Practica: RSVP apps, Spreeder, lectura en chunks.'}
  return { wpm:`${Math.round(wpm)} WPM`, clasificacion:clas, recomendacion:rec };""")

M("memorizacion-spaced-repetition-anki-cards-dia", "educacion", "🧠", "Anki repetición",
  "Cantidad de cards Anki según objetivo.",
  "nuevas/día × revisiones",
  [("cardsMeta","Cards total deck","number",1000),("semanasObjetivo","Semanas para completar","number",12)]  ,
  [("cardsNuevasDia","Cards nuevas/día",None),("revisionesDiaMax","Revisiones día máx",None),("observacion","Observación",None)],
  ["1000 cards 12 sem","~12/día"],"~120/día revisiones",
  [("¿SRS?","Spaced Repetition System. Intervalos crecientes."),
   ("¿Algoritmo?","SM-2 de Piotr Wozniak."),
   ("¿Cards/día?","10-30 nuevas típico sostenible."),
   ("¿Tiempo?","~30-45 min/día con 15-20 nuevas."),
   ("¿Idiomas?","Excelente para vocabulario."),
   ("¿Medicina?","Muy usado MCAT, USMLE."),
   ("¿Mobile?","Anki Mobile iOS pago, Android gratis.")],
  """  const m=Number(i.cardsMeta)||0; const s=Number(i.semanasObjetivo)||12;
  const dias=s*7;
  const nuevas=Math.ceil(m/dias);
  const revisiones=nuevas*10;
  const obs=nuevas>30?'Mucho ritmo. Considerá extender plazo.':'Ritmo sostenible.';
  return { cardsNuevasDia:`${nuevas}/día`, revisionesDiaMax:`~${revisiones}/día`, observacion:obs };""")

M("concurso-docente-puntaje-antecedentes-baires", "educacion", "👨‍🏫", "Concurso docente puntaje",
  "Puntaje de concurso docente por antecedentes.",
  "suma puntos áreas",
  [("titulos","Puntos títulos","number",20),("antiguedad","Puntos antigüedad","number",15),("publicaciones","Puntos publicaciones","number",5),("cursos","Puntos cursos","number",10)]  ,
  [("puntajeTotal","Puntaje total",None),("nivelAproximado","Nivel aproximado",None),("recomendacion","Recomendación",None)],
  ["20+15+5+10","50 puntos"],"Medio",
  [("¿Qué se puntúa?","Títulos, antigüedad, publicaciones, cursos, ejercicio docente."),
   ("¿Títulos?","Profesorado: 10-20. Licenciatura: 15. Maestría: +5. Doctorado: +10."),
   ("¿Antigüedad?","1-2 puntos/año, según escalafón."),
   ("¿Publicaciones?","1-3 puntos cada una con referato."),
   ("¿Cursos?","Puntos según carga horaria."),
   ("¿Nivel?","Primaria, secundaria, terciario distintos pesos."),
   ("¿Examen oral?","En algunos concursos. Puntaje adicional.")],
  """  const t=Number(i.titulos)||0; const a=Number(i.antiguedad)||0; const p=Number(i.publicaciones)||0; const c=Number(i.cursos)||0;
  const tot=t+a+p+c;
  let n='', rec='';
  if(tot>=80){n='Alto';rec='Muy competitivo'}
  else if(tot>=50){n='Medio';rec='Competitivo'}
  else if(tot>=30){n='Básico';rec='Sumá cursos y antigüedad'}
  else {n='Inicial';rec='Suma formación'}
  return { puntajeTotal:`${tot} puntos`, nivelAproximado:n, recomendacion:rec };""")

M("ingreso-colegio-privado-cuota-anual-caba", "educacion", "🏫", "Colegio privado CABA",
  "Cuota anual colegio privado CABA por tipo.",
  "cuotas × 10 + extras",
  [("nivel","Nivel","select",["inicial","primaria","secundaria"]),("tipoColegio","Tipo","select",["bilinguie_premium","bilinguie","tradicional","no_tradicional"])]  ,
  [("cuotaMensual","Cuota mensual",None),("anualEstimado","Anual estimado",None),("extras","Extras típicos","text")],
  ["Primaria bilingüe","$600k/mes"],"$7M/año",
  [("¿Premium?","San Andrés, Northlands, Lincoln: $900k-1.5M/mes."),
   ("¿Bilingüe?","San Gregorio, Northfield, Cardenal Newman: $500-800k."),
   ("¿Tradicional?","Colegios católicos/comunidades: $200-500k."),
   ("¿Privado económico?","$100-300k/mes."),
   ("¿Extras?","Matricula, uniformes, viajes, libros, extracurriculares."),
   ("¿10 cuotas?","Marzo-diciembre (salvo algunos 11)."),
   ("¿Subsidios?","Ley Federal Educación: subvención estatal parcial a privados católicos.")],
  """  const n=String(i.nivel||'primaria'); const t=String(i.tipoColegio||'bilinguie');
  const base={'bilinguie_premium':1200000,'bilinguie':650000,'tradicional':350000,'no_tradicional':500000}[t];
  const multNivel={'inicial':0.85,'primaria':1,'secundaria':1.15}[n];
  const cm=base*multNivel; const anual=cm*10+cm*1.5; // 10 cuotas + extras aprox
  return { cuotaMensual:`$${Math.round(cm).toLocaleString('es-AR')}/mes`, anualEstimado:`$${Math.round(anual).toLocaleString('es-AR')}`, extras:'Matricula, uniformes, cooperadora, viajes, libros extras.' };""")

# ============================================================
# COCINA — DIETAS (10)
# ============================================================

M("ayuno-intermitente-16-8-ventana-horario", "cocina", "🕐", "Ayuno intermitente 16/8",
  "Calcula ventana de comida y ayuno.",
  "16h ayuno + 8h comida",
  [("horaComienzoAyuno","Última comida (HH:MM)","text","20:00"),("protocolo","Protocolo","select",["16_8","18_6","20_4_omad"])]  ,
  [("horaRomper","Romper ayuno",None),("horasAyuno","Horas ayuno",None),("observacion","Observación",None)],
  ["20:00, 16/8","12:00 día siguiente"],"16 horas",
  [("¿16/8?","Más común. Saltear desayuno o cena."),
   ("¿18/6?","Nivel intermedio."),
   ("¿OMAD?","One Meal a Day (20/4)."),
   ("¿Agua?","Permitida durante ayuno. También café/té sin azúcar."),
   ("¿Primer día?","Puede ser incómodo. Adaptación 1-2 semanas."),
   ("¿Mujeres?","Evidencia mixta. Algunas mejor con 14/10."),
   ("¿Entrenamiento?","Pesas en ventana comida. Cardio en ayunas OK.")],
  """  const h=String(i.horaComienzoAyuno||'20:00'); const p=String(i.protocolo||'16_8');
  const horas={'16_8':16,'18_6':18,'20_4_omad':20}[p];
  const [hh,mm]=h.split(':').map(Number);
  const totalMin=(hh*60+mm+horas*60)%1440;
  const nh=Math.floor(totalMin/60); const nm=totalMin%60;
  return { horaRomper:`${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`, horasAyuno:`${horas} horas`, observacion:`Ayuná desde ${h} hasta ${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}. Ventana comida: ${24-horas}h.` };""")

M("keto-macros-cetogenica-deficit-completo", "cocina", "🥑", "Keto macros",
  "Macros dieta cetogénica según objetivo.",
  "keto: <50g carbs, 70% grasa",
  [("calorias","Calorías","number",2000),("objetivo","Objetivo","select",["adelgazar","mantener","ganar"])]  ,
  [("grasaG","Grasa g",None),("proteinaG","Proteína g",None),("carbosG","Carbohidratos g",None)],
  ["2000 kcal adelgazar","155 g grasa"],"125 g proteína",
  [("¿Keto?","70-75% grasa, 20-25% proteína, 5-10% carbs."),
   ("¿Carbs?","<50g día. Algunos <20g (cetosis profunda)."),
   ("¿Cetosis?","2-3 días sin carbs + ejercicio. Strips orina confirman."),
   ("¿Cetona?","BHB es la molécula. Medición en sangre más precisa."),
   ("¿Keto flu?","Cansancio, dolor cabeza primeros días. Electrolitos + agua."),
   ("¿Largo plazo?","Estudios mixtos. Difícil de sostener."),
   ("¿Efectividad?","Epilepsia refractaria. Algo de pérdida peso.")],
  """  const c=Number(i.calorias)||0; const o=String(i.objetivo||'mantener');
  const mult={'adelgazar':0.8,'mantener':1,'ganar':1.15}[o];
  const cal=c*mult;
  const grasa=cal*0.72/9;
  const prot=cal*0.23/4;
  const carb=cal*0.05/4;
  return { grasaG:`${Math.round(grasa)} g`, proteinaG:`${Math.round(prot)} g`, carbosG:`${Math.round(carb)} g` };""")

M("celiaco-gluten-alimentos-ppm-sin-tacc", "salud", "🚫", "Sin TACC celíaco",
  "Alimentos TACC vs sin TACC (ppm).",
  "guía Ley Celíaca AR",
  [("alimento","Alimento","select",["harina_trigo","arroz","maiz","cebada","avena","quinoa","papa","queso_duro","yogur"])],
  [("contieneTacc","Contiene TACC",None),("ppm","ppm aprox",None),("alternativa","Alternativa sin TACC",None)],
  ["Trigo","Sí"],"30000 ppm",
  [("¿TACC?","Trigo, Avena, Cebada, Centeno."),
   ("¿Ley 26.588?","Celíaca argentina. Logo oficial 'Sin TACC'."),
   ("¿Avena?","Puro es sin TACC, pero contaminación cruzada frecuente."),
   ("¿Quinoa?","Sin TACC natural."),
   ("¿Cerveza?","Tradicional es con cebada. Existen cervezas sin TACC."),
   ("¿Contaminación?","Panaderías mixtas contaminan. Restaurantes cuidadosos."),
   ("¿Test?","Tiras rápidas disponibles para algunas situaciones.")],
  """  const a=String(i.alimento||'arroz');
  const data={'harina_trigo':{t:'Sí',p:30000,alt:'Harina de arroz, mandioca, almendra'},'arroz':{t:'No',p:0,alt:'—'},'maiz':{t:'No',p:0,alt:'—'},'cebada':{t:'Sí',p:25000,alt:'Arroz, mijo'},'avena':{t:'Posible (contam.)',p:'100-300',alt:'Avena certificada sin TACC'},'quinoa':{t:'No',p:0,alt:'—'},'papa':{t:'No',p:0,alt:'—'},'queso_duro':{t:'No',p:0,alt:'—'},'yogur':{t:'No (natural)',p:'<20',alt:'Verificar marcas'}};
  const d=data[a];
  return { contieneTacc:d.t, ppm:`${d.p}${typeof d.p==='number'?' ppm':''}`, alternativa:d.alt };""")

M("vegana-proteina-completa-combinacion-aminoacidos", "cocina", "🌱", "Proteína vegana completa",
  "Combinaciones para proteína completa vegana.",
  "legumbres + cereales",
  [("plato","Plato","select",["lentejas_arroz","hummus_pan_pita","tofu_quinoa","mani_pan_integral","poroto_maiz"])],
  [("completo","¿Completo?",None),("aminoacidoLimitante","Aminoácido limitante",None),("pdcaas","PDCAAS",None)],
  ["Lentejas + arroz","Sí"],"Ninguno",
  [("¿Proteína completa?","Tiene los 9 aminoácidos esenciales en cantidades suficientes."),
   ("¿Legumbre?","Limitada en metionina."),
   ("¿Cereal?","Limitado en lisina."),
   ("¿Combinar?","Juntos complementan ambos aminoácidos."),
   ("¿Soja?","Completa por sí sola."),
   ("¿Quinoa?","Completa por sí sola."),
   ("¿PDCAAS?","Protein Digestibility Corrected Amino Acid Score. 1.0 = perfecta.")],
  """  const p=String(i.plato||'lentejas_arroz');
  const data={'lentejas_arroz':{c:'Sí',lim:'Ninguno',pd:0.95},'hummus_pan_pita':{c:'Sí',lim:'Ninguno',pd:0.9},'tofu_quinoa':{c:'Excelente',lim:'Ninguno (ambos completos)',pd:1.0},'mani_pan_integral':{c:'Casi',lim:'Trazas metionina',pd:0.85},'poroto_maiz':{c:'Sí',lim:'Ninguno',pd:0.9}};
  const d=data[p];
  return { completo:d.c, aminoacidoLimitante:d.lim, pdcaas:`${d.pd}` };""")

M("dieta-mediterranea-adherencia-score-test", "salud", "🫒", "Dieta mediterránea score",
  "Test de adherencia a dieta mediterránea (14 puntos).",
  "PREDIMED 14 items",
  [("aceiteOliva","Aceite oliva principal","select",["si","no"]),("pescadoSemana","Pescado ≥3/semana","select",["si","no"]),("vinoTintoDiario","Vino tinto <150mL/día","select",["si","no"]),("frutasDiarias","Frutas ≥3/día","select",["si","no"])],
  [("puntaje","Puntaje (0-4)",None),("adherencia","Adherencia",None),("consejo","Consejo",None)],
  ["Sí,No,Sí,No","2"],"Media",
  [("¿PREDIMED?","Estudio landmark dieta mediterránea 2013."),
   ("¿Puntos?","14 ítems originales. 10+ = alta adherencia."),
   ("¿Beneficios?","Cardiovascular, cognitivo, cáncer."),
   ("¿Base?","Vegetales, frutas, granos integrales, pescado, aceite oliva."),
   ("¿Limitar?","Carne roja, procesados, azúcar."),
   ("¿Lácteos?","Sí, especialmente queso y yogur fermentados."),
   ("¿Vino?","Opcional. 1 copa/día con comidas.")],
  """  const a=String(i.aceiteOliva||'no')==='si'?1:0;
  const p=String(i.pescadoSemana||'no')==='si'?1:0;
  const v=String(i.vinoTintoDiario||'no')==='si'?1:0;
  const f=String(i.frutasDiarias||'no')==='si'?1:0;
  const total=a+p+v+f;
  const adh=total>=3?'Alta':total>=2?'Media':'Baja';
  const cons=total<3?'Sumá más vegetales, pescado y aceite oliva.':'Buena base. Optimizar detalles.';
  return { puntaje:`${total}/4 (versión reducida)`, adherencia:adh, consejo:cons };""")

M("dash-hipertension-sodio-diario-tabla", "salud", "🧂", "DASH sodio diario",
  "Plan DASH: sodio diario máximo.",
  "mg sodio",
  [("tipoDash","Versión","select",["estandar","estricto"])],
  [("sodioMaximo","Sodio máximo diario",None),("equivalente","Equivalente sal",None),("observacion","Observación",None)],
  ["Estándar","2300 mg"],"5.75 g sal",
  [("¿DASH?","Dietary Approaches to Stop Hypertension. NIH."),
   ("¿Sodio?","Estándar: 2300 mg/día. Estricto: 1500 mg."),
   ("¿Sal?","1 g sal = 400 mg sodio."),
   ("¿Fuentes ocultas?","Pan, quesos, procesados, enlatados."),
   ("¿Beneficios?","Baja PA 5-10 mmHg en 2 semanas."),
   ("¿Componentes?","Alto K, Mg, Ca. Bajo grasa saturada."),
   ("¿Ejemplos?","Frutas, verduras, granos integrales, lácteos bajos grasa.")],
  """  const t=String(i.tipoDash||'estandar');
  const na=t==='estricto'?1500:2300;
  const sal=na/400;
  return { sodioMaximo:`${na} mg/día`, equivalente:`${sal.toFixed(2)} g sal (1 cucharadita ≈ 2.3g)`, observacion:t==='estricto'?'Versión estricta: hipertensión severa o riesgo alto.':'Versión estándar para control PA general.' };""")

M("fodmap-alimentos-intolerancia-sii-tabla", "salud", "🥦", "FODMAP alimentos",
  "Alimentos altos y bajos en FODMAP.",
  "tabla Monash",
  [("alimento","Alimento","select",["cebolla","ajo","manzana","pera","banana","zanahoria","arroz","avena","leche","yogur_sin_lactosa"])],
  [("nivelFodmap","Nivel FODMAP",None),("porcionSegura","Porción segura",None),("alternativa","Alternativa",None)],
  ["Cebolla","Alto"],"Evitar",
  [("¿FODMAP?","Fermentable Oligosaccharides, Disaccharides, Monosaccharides, Polyols."),
   ("¿SII?","Síndrome Intestino Irritable. Alivia con bajo FODMAP."),
   ("¿Monash?","Universidad pionera. App con listados."),
   ("¿Fases?","1: eliminar. 2: reintroducir. 3: personalizar."),
   ("¿Gluten?","No es FODMAP, pero tigo/centeno tienen fructanos."),
   ("¿Profesional?","Nutricionista capacitado recomendado."),
   ("¿Duración?","4-6 semanas fase eliminación, luego reintroducir.")],
  """  const a=String(i.alimento||'cebolla');
  const data={'cebolla':{n:'Alto',p:'Evitar (fructanos)',alt:'Puerro (parte verde)'},'ajo':{n:'Alto',p:'Evitar',alt:'Aceite infusionado con ajo'},'manzana':{n:'Alto',p:'20g',alt:'Mandarina, naranja'},'pera':{n:'Alto',p:'Evitar',alt:'Kiwi'},'banana':{n:'Bajo si madura',p:'1 mediana',alt:'—'},'zanahoria':{n:'Bajo',p:'Libre',alt:'—'},'arroz':{n:'Bajo',p:'Libre',alt:'—'},'avena':{n:'Bajo',p:'52g',alt:'—'},'leche':{n:'Alto (lactosa)',p:'Evitar',alt:'Leche sin lactosa'},'yogur_sin_lactosa':{n:'Bajo',p:'170g',alt:'—'}};
  const d=data[a];
  return { nivelFodmap:d.n, porcionSegura:d.p, alternativa:d.alt };""")

M("dieta-hipocalorica-deficit-saludable-mensual", "salud", "🥗", "Déficit calórico saludable",
  "Déficit para perder peso saludable.",
  "500 kcal = 0.5 kg/sem",
  [("pesoActual","Peso actual kg","number",80),("pesoObjetivo","Peso objetivo kg","number",70),("semanasObjetivo","Semanas objetivo","number",20)]  ,
  [("deficitDiario","Déficit diario",None),("perdidaSemanal","Pérdida semanal",None),("riesgo","Nivel","text")],
  ["80→70 kg 20 sem","500 kcal"],"0.5 kg/sem",
  [("¿Saludable?","0.5-1 kg/semana. 1500+ kcal mínimo para mujeres, 1800 para hombres."),
   ("¿Cómo lograr?","Déficit vía dieta + ejercicio."),
   ("¿1 kg grasa?","~7700 kcal."),
   ("¿Rebote?","Dietas estrictas generan rebote. Moderado es mejor."),
   ("¿Metabolismo?","Déficit largo lo adapta (termogénesis)."),
   ("¿Proteína?","Mantener 1.6-2.2 g/kg para preservar músculo."),
   ("¿Ejercicio?","Cardio + fuerza para mejor composición.")],
  """  const pa=Number(i.pesoActual)||0; const po=Number(i.pesoObjetivo)||0; const s=Number(i.semanasObjetivo)||1;
  const diff=pa-po;
  const perdidaSem=diff/s;
  const deficitDia=perdidaSem*1100;
  let riesgo='';
  if(perdidaSem>1) riesgo='Agresivo — considera más semanas';
  else if(perdidaSem>0.5) riesgo='Moderado — saludable';
  else riesgo='Conservador — sostenible';
  return { deficitDiario:`${Math.round(deficitDia)} kcal`, perdidaSemanal:`${perdidaSem.toFixed(2)} kg`, riesgo:riesgo };""")

M("reset-metabolismo-plateau-dieta-estrategia", "salud", "⏸️", "Plateau peso",
  "Estrategias para romper estancamiento dieta.",
  "refeed + cardio + revisión",
  [("semanasPlateau","Semanas en plateau","number",3),("deficitActual","Déficit kcal","number",500)]  ,
  [("estrategia","Estrategia","text"),("duracion","Duración sugerida",None),("expectativa","Expectativa",None)],
  ["3 semanas 500 kcal","Refeed 7-14 días"],"Calorías mantenimiento",
  [("¿Plateau?","2-3+ semanas sin pérdida real."),
   ("¿Primero?","Verificar balance real (apps no siempre precisas)."),
   ("¿Refeed?","Subir calorías a mantenimiento 1-2 semanas."),
   ("¿Diet break?","1-2 semanas comiendo mantenimiento reset hormonal."),
   ("¿Hormona?","Leptina baja con déficit prolongado."),
   ("¿Cardio?","Aumentar NEAT (pasos diarios) antes de intensificar cardio."),
   ("¿Sueño?","7+ horas clave para regular apetito.")],
  """  const s=Number(i.semanasPlateau)||0; const d=Number(i.deficitActual)||0;
  let e='', dur='', exp='';
  if(s<2){e='Verificá primero cumplimiento real. Muchos subestiman calorías';dur='Seguir 1-2 semanas más';exp='Posible sigue funcionando'}
  else if(s<4){e='Diet break: come a calorías de mantenimiento 7-14 días';dur='7-14 días';exp='Reset hormonal, luego retomá déficit'}
  else {e='Revisar: subir NEAT (+2000 pasos), aumentar proteína, dormir 7+h, reducir estrés';dur='2-4 semanas cambios';exp='Retomar pérdida 0.3-0.5 kg/sem'}
  return { estrategia:e, duracion:dur, expectativa:exp };""")

M("agua-cafe-te-hidratacion-real-mitos", "salud", "☕", "Café e hidratación",
  "¿Café deshidrata?",
  "análisis científico",
  [("cafesDia","Cafés/día","number",3),("taza_ml","ml por taza","number",150)]  ,
  [("hidratacionNeta","Hidratación neta estimada",None),("mito","Mito/realidad",None),("recomendacion","Recomendación",None)],
  ["3 cafés 150ml","~90% hidrata"],"Mito del café deshidratante",
  [("¿Café deshidrata?","Mito. Efecto diurético es leve. Neto: hidrata."),
   ("¿Té?","Similar a café. Hidrata."),
   ("¿Mate?","Hidrata y aporta antioxidantes."),
   ("¿Alcohol?","Sí deshidrata (diurético fuerte)."),
   ("¿Jugos?","Hidratan pero con azúcar."),
   ("¿Mejor?","Agua pura. 6-8 vasos día."),
   ("¿Electrolitos?","En ejercicio intenso o enfermedad.")],
  """  const c=Number(i.cafesDia)||0; const t=Number(i.taza_ml)||150;
  const totalMl=c*t;
  const hidratacion=totalMl*0.9;
  return { hidratacionNeta:`${Math.round(hidratacion)} mL (~${(hidratacion/1000).toFixed(1)} L)`, mito:'Mito: café deshidrata. Realidad: hidrata ~90%. Solo efecto diurético leve.', recomendacion:'Café cuenta como hidratación. Con moderación (<400 mg cafeína/día).' };""")

# ============================================================
# NIÑOS + FAMILIA (15)
# ============================================================

M("crecimiento-percentil-edad-altura-peso-oms", "familia", "👶", "Percentil crecimiento OMS",
  "Percentil aproximado de peso y talla por edad.",
  "tablas OMS",
  [("edadMeses","Edad meses","number",24),("peso","Peso kg","number",12),("talla","Talla cm","number",87),("sexo","Sexo","select",["varon","mujer"])]  ,
  [("percentilPeso","Percentil peso",None),("percentilTalla","Percentil talla",None),("interpretacion","Interpretación",None)],
  ["24m 12kg 87cm varón","P50"],"Normal",
  [("¿Percentiles?","Comparación con referencia poblacional."),
   ("¿P50?","Mediana. Ni alto ni bajo."),
   ("¿P3?","Alerta. Evaluar médico."),
   ("¿P97?","Alerta superior."),
   ("¿Velocidad?","Importa más que un solo número."),
   ("¿Control?","Pediátrico cada 3 meses primer año."),
   ("¿Lactancia?","Patrón distinto. Normal bebé LME más alto P.")],
  """  const m=Number(i.edadMeses)||0; const p=Number(i.peso)||0; const t=Number(i.talla)||0; const s=String(i.sexo||'varon');
  // Approx P50 varón: 12 kg a 24m, 87 cm. Mujer ligeramente menor.
  const p50Peso=s==='varon'?(m<12?8+m*0.5:12+((m-24)/12*2)):(m<12?7.5+m*0.5:11.5+((m-24)/12*1.8));
  const p50Talla=s==='varon'?(m<12?60+m*2:87+((m-24)/12*6)):(m<12?59+m*1.9:86+((m-24)/12*5.8));
  const pctPeso=p>p50Peso*1.1?'P85-97':p<p50Peso*0.9?'P3-15':'P25-75 (normal)';
  const pctTalla=t>p50Talla*1.05?'P85-97':t<p50Talla*0.95?'P3-15':'P25-75 (normal)';
  return { percentilPeso:pctPeso, percentilTalla:pctTalla, interpretacion:'Aproximación. Control pediátrico oficial siempre.' };""")

M("calendario-vacunas-bebe-argentina-2026-completo", "familia", "💉", "Calendario vacunas 2026",
  "Vacunas obligatorias bebé AR por edad.",
  "calendario oficial Min Salud",
  [("edadMeses","Edad meses","number",6)],
  [("vacunasAplicadas","Vacunas aplicadas hasta hoy",None),("proximas","Próximas","text"),("gratis","¿Gratis?",None)],
  ["6 meses","BCG, HepB, Pentavalente"],"Sí",
  [("¿Nacimiento?","BCG (TBC) + HepB."),
   ("¿2 meses?","Pentavalente + Neumococo + Rotavirus + IPV."),
   ("¿4 meses?","Refuerzos."),
   ("¿6 meses?","Pentavalente + IPV + Gripe."),
   ("¿12 meses?","Triple viral + Hepatitis A + Neumococo."),
   ("¿18 meses?","Refuerzos cuádruple."),
   ("¿Obligatorias?","Sí por Ley 27.491. Gratis en centros de salud.")],
  """  const m=Number(i.edadMeses)||0;
  let apl='', prox='';
  if(m>=0) apl='BCG + Hepatitis B';
  if(m>=2) apl+=', Pentavalente + Neumococo + Rotavirus + IPV';
  if(m>=4) apl+=', Refuerzos';
  if(m>=6) apl+=', Pentavalente + IPV';
  if(m>=12) apl+=', Triple viral + HepA + Neumococo 13';
  if(m>=18) apl+=', Cuádruple + Polio oral';
  if(m<2) prox='2 meses: Pentavalente + Rotavirus';
  else if(m<4) prox='4 meses: 2° dosis pentavalente';
  else if(m<6) prox='6 meses: gripe + refuerzos';
  else if(m<12) prox='12 meses: Triple viral + HepA';
  else prox='Según calendario continuar';
  return { vacunasAplicadas:apl, proximas:prox, gratis:'Sí, gratuitas en centros de salud públicos. Ley 27.491.' };""")

M("formula-infantil-biberon-edad-ml-dia", "familia", "🍼", "Biberón ml por edad",
  "ml de fórmula por edad bebé.",
  "ml/día = peso × 150 aprox",
  [("edadMeses","Edad meses","number",3),("pesoKg","Peso kg","number",6)]  ,
  [("mlDia","Total ml/día",None),("tomas","Tomas sugeridas",None),("mlPorToma","ml por toma",None)],
  ["3m 6kg","900 ml"],"6 tomas 150 ml",
  [("¿Total diario?","150 mL/kg/día hasta 6 meses."),
   ("¿Tomas?","1 mes: 8. 3 meses: 6-7. 6 meses: 5."),
   ("¿Noche?","Se elimina gradualmente."),
   ("¿Lactancia mixta?","Ajustar. Pecho a demanda."),
   ("¿Alimentos?","Desde 6 meses BLW/papillas complemento."),
   ("¿Fórmula?","Niveles 1-2-3 por edad."),
   ("¿Preparar?","Agua hervida a 70°C por bacteria cronobacter.")],
  """  const m=Number(i.edadMeses)||0; const p=Number(i.pesoKg)||0;
  const total=p*150;
  const tomas=m<1?8:m<3?7:m<6?6:5;
  const porToma=total/tomas;
  return { mlDia:`${Math.round(total)} mL`, tomas:`${tomas} tomas/día`, mlPorToma:`${Math.round(porToma)} mL por toma` };""")

M("horas-sueno-bebe-por-edad-tabla-recomendada", "familia", "😴", "Sueño bebé",
  "Horas de sueño recomendadas por edad.",
  "guía pediátrica",
  [("edadMeses","Edad meses","number",6)],
  [("horasDia","Horas total/día",None),("siestas","Siestas típicas",None),("sueno","Sueño corrido noche",None)],
  ["6 meses","14-15 h"],"2-3 siestas",
  [("¿Recién nacido?","16-17 horas/día."),
   ("¿3 meses?","15 horas total. 4-5 siestas."),
   ("¿6 meses?","14-15 horas. 2-3 siestas."),
   ("¿12 meses?","13-14 horas. 1-2 siestas."),
   ("¿2 años?","12-13 horas total. 1 siesta."),
   ("¿3 años?","11-12 horas. Siesta opcional."),
   ("¿Señales cansancio?","Bostezos, frotar ojos, irritabilidad.")],
  """  const m=Number(i.edadMeses)||0;
  let h='',s='',n='';
  if(m<3){h='16-17 h';s='5+ siestas';n='4-5 h seguidas a veces'}
  else if(m<6){h='14-15 h';s='3-4 siestas';n='6-8 h noche ideal'}
  else if(m<12){h='14-15 h';s='2-3 siestas';n='10-12 h noche'}
  else if(m<24){h='12-14 h';s='1-2 siestas';n='10-12 h'}
  else {h='10-12 h';s='Siesta opcional';n='10-11 h'}
  return { horasDia:h, siestas:s, sueno:n };""")

M("introduccion-alimentos-blw-edad-etapa-6meses", "familia", "🥕", "BLW introducción",
  "Introducción alimentos sólidos bebé.",
  "6m+ alimentos en tiras",
  [("edadMeses","Edad meses","number",6)],
  [("apto","¿Apto BLW?",None),("etapa","Etapa",None),("recomendacion","Recomendación",None)],
  ["6 meses","Sí"],"Inicio",
  [("¿BLW?","Baby-Led Weaning. Desde 6m con signos de preparación."),
   ("¿Signos?","Sostiene cabeza, interés comida, pinza."),
   ("¿Alimentos?","Tiras blandas: banana, palta, batata cocida."),
   ("¿Evitar?","Frutos secos enteros, uvas enteras, miel <1a."),
   ("¿Atragantamiento?","Arcada normal. Real es silencioso."),
   ("¿Leche?","Sigue siendo principal hasta 12 meses."),
   ("¿Sal/Azúcar?","No durante primer año.")],
  """  const m=Number(i.edadMeses)||0;
  if(m<6) return { apto:'No todavía', etapa:'Leche exclusiva', recomendacion:'Esperá hasta 6 meses y signos de preparación.' };
  if(m<9) return { apto:'Sí', etapa:'Inicio BLW', recomendacion:'Tiras blandas de palta, banana, batata, zapallo.' };
  if(m<12) return { apto:'Sí', etapa:'Variedad creciente', recomendacion:'Carne desmenuzada, legumbres blandas, frutas en trozos.' };
  return { apto:'Sí', etapa:'Variada', recomendacion:'Comida familiar sin sal ni azúcar agregada.' };""")

M("horas-pantalla-edad-oms-recomendado-nino", "familia", "📱", "Pantallas niños OMS",
  "Horas pantalla recomendadas OMS por edad.",
  "guía OMS 2019",
  [("edad","Edad años","number",4)],
  [("maxRecomendado","Máximo recomendado",None),("alternativas","Alternativas","text"),("advertencia","Advertencia",None)],
  ["4 años","1 hora"],"Juego activo",
  [("¿<1 año?","Ninguna pantalla."),
   ("¿1-2 años?","Evitar. Solo videollamada."),
   ("¿2-5?","<1 hora día (contenido calidad)."),
   ("¿6-12?","<2 horas día no escolar."),
   ("¿+13?","Moderado, con pautas."),
   ("¿Efectos?","Sueño, obesidad, desarrollo lenguaje/social."),
   ("¿Excepción?","Videollamadas familia no cuentan.")],
  """  const e=Number(i.edad)||0;
  let max='',alt='',adv='';
  if(e<1){max='0 (ninguna)';alt='Juego sensorial, lectura';adv='Sin pantallas menores de 1 año'}
  else if(e<2){max='Evitar';alt='Libros, juego libre';adv='Solo videollamadas con familia'}
  else if(e<5){max='1 hora día';alt='Juego activo, arte, aire libre';adv='Contenido educativo de calidad'}
  else if(e<13){max='2 horas día no escolar';alt='Actividad física, libros';adv='Separar uso recreativo del escolar'}
  else {max='Moderado con pautas';alt='Redes sociales con límite';adv='Acuerdos familiares claros'}
  return { maxRecomendado:max, alternativas:alt, advertencia:adv };""")

M("mesada-semanal-hijo-edad-sugerida-monto", "familia", "💰", "Mesada hijo edad",
  "Mesada sugerida por edad del niño.",
  "monto × edad/año",
  [("edad","Edad años","number",10),("nivelVida","Nivel de vida","select",["basico","medio","alto"])]  ,
  [("mesadaSemanal","Mesada semanal",None),("mensualEquivalente","Mensual",None),("proposito","Propósito","text")],
  ["10 medio","~$2.5k/sem"],"$10k/mes",
  [("¿Para qué?","Aprender valor del dinero, ahorro, decisiones."),
   ("¿Cuándo empezar?","6-8 años."),
   ("¿Monto?","~$1000 por año de edad por semana (variable)."),
   ("¿Tareas?","Algunos lo atan a responsabilidades. Debate entre expertos."),
   ("¿Ahorro obligatorio?","10-20% como hábito."),
   ("¿Cumpleaños?","Adicional, no reemplaza."),
   ("¿Adolescente?","Mayor autonomía. Presupuesto mensual.")],
  """  const e=Number(i.edad)||0; const n=String(i.nivelVida||'medio');
  const mult={'basico':1,'medio':2,'alto':4}[n];
  const sem=e*1000*mult;
  const mes=sem*4.33;
  return { mesadaSemanal:`$${Math.round(sem).toLocaleString('es-AR')}`, mensualEquivalente:`$${Math.round(mes).toLocaleString('es-AR')}`, proposito:'Educación financiera desde temprano. 10-20% ahorro obligatorio.' };""")

M("panales-mensual-bebe-talla-cambios-dia", "familia", "🧷", "Pañales por mes",
  "Pañales necesarios por mes según edad.",
  "cambios/día × 30",
  [("edadMeses","Edad meses","number",3)],
  [("porDia","Pañales/día",None),("porMes","Pañales/mes",None),("talla","Talla sugerida",None)],
  ["3 meses","8/día"],"~240/mes, talla 3",
  [("¿Recién nacido?","10-12/día. Talla 0 o NB."),
   ("¿1-3 meses?","8-10/día. Talla 1-2."),
   ("¿4-6 meses?","6-8/día. Talla 3."),
   ("¿7-12 meses?","5-6/día. Talla 4."),
   ("¿Talla?","Por peso, no edad. Mojados = chicos."),
   ("¿Nocturnos?","Absorción extra desde 9-12 meses."),
   ("¿Marcas AR?","Pampers, Huggies, Babysec.")],
  """  const m=Number(i.edadMeses)||0;
  let d,t;
  if(m<1){d=11;t='NB o Talla 0'}
  else if(m<3){d=9;t='Talla 1-2'}
  else if(m<6){d=7;t='Talla 3'}
  else if(m<12){d=6;t='Talla 4'}
  else if(m<24){d=5;t='Talla 5'}
  else {d=4;t='Talla 6 o pants'}
  return { porDia:`${d} pañales`, porMes:`~${d*30} pañales`, talla:t };""")

M("guarderia-jardin-maternal-costo-caba-mensual", "familia", "🎒", "Jardín maternal CABA",
  "Costo jardín maternal CABA.",
  "tipo × horario",
  [("tipo","Tipo","select",["publico","privado_comunitario","privado_tradicional","bilingüe"]),("horario","Horario","select",["media_jornada","jornada_completa"])]  ,
  [("costoMensual","Costo mensual",None),("incluye","Incluye","text"),("observacion","Observación",None)],
  ["Privado tradicional JC","$400-700k"],"4-5 horas",
  [("¿Público?","Gratuito pero muy limitado (pocas vacantes)."),
   ("¿Comunitario?","Subsidio mixto. $80-150k/mes."),
   ("¿Privado tradicional?","$300-700k JC."),
   ("¿Bilingüe premium?","$800k-1.5M/mes."),
   ("¿MJ?","Mañana o tarde 3-4 horas."),
   ("¿JC?","Desde 7/8 a 16/17 horas."),
   ("¿Cuota inicial?","Matrícula + cooperadora + uniformes.")],
  """  const t=String(i.tipo||'privado_tradicional'); const h=String(i.horario||'jornada_completa');
  const base={'publico':0,'privado_comunitario':120000,'privado_tradicional':500000,'bilingüe':1000000}[t];
  const mult=h==='jornada_completa'?1:0.65;
  const costo=base*mult;
  const inc=h==='jornada_completa'?'Desayuno + almuerzo + merienda. Actividades.':'Desayuno o merienda. Actividades.';
  return { costoMensual:t==='publico'?'Gratis':`$${Math.round(costo).toLocaleString('es-AR')}`, incluye:inc, observacion:t==='publico'?'Gratuito pero lista de espera':'Privado: verificar inscripción anticipada' };""")

M("adolescente-estatura-final-prediccion-edad-huesos", "familia", "📏", "Estatura final predicción",
  "Altura final estimada del adolescente.",
  "fórmula Khamis-Roche aprox",
  [("edad","Edad años","number",13),("sexo","Sexo","select",["varon","mujer"]),("alturaActualCm","Altura actual cm","number",160),("alturaPadre","Altura padre cm","number",178),("alturaMadre","Altura madre cm","number",165)]  ,
  [("estaturaFinal","Estatura final estimada",None),("rango","Rango probable",None),("observacion","Observación",None)],
  ["13a varón 160cm","~177 cm"],"±5 cm",
  [("¿Método?","Promedio padres + factor sexo (Tanner)."),
   ("¿Varón?","(padre + madre + 13) / 2."),
   ("¿Mujer?","(padre + madre - 13) / 2."),
   ("¿Variación?","±8 cm genético normal."),
   ("¿Pubertad?","Mayor crecimiento: mujeres 10-13, varones 12-16."),
   ("¿Nutrición?","Afecta. Desnutrición limita."),
   ("¿Médico?","Si preocupa, pediatra + endocrino.")],
  """  const e=Number(i.edad)||0; const s=String(i.sexo||'varon'); const a=Number(i.alturaActualCm)||0;
  const p=Number(i.alturaPadre)||0; const m=Number(i.alturaMadre)||0;
  let estGenetica=0;
  if(s==='varon') estGenetica=(p+m+13)/2;
  else estGenetica=(p+m-13)/2;
  let estAproxEdad=0;
  if(s==='varon'){ estAproxEdad=e<13?a+((18-e)*4):a+((18-e)*2) }
  else { estAproxEdad=e<11?a+((16-e)*3):a+((16-e)*1.5) }
  const prom=(estGenetica+estAproxEdad)/2;
  return { estaturaFinal:`${Math.round(prom)} cm`, rango:`${Math.round(prom-5)}-${Math.round(prom+5)} cm (±5 cm)`, observacion:'Aproximación. Nutrición, genética y pubertad afectan.' };""")

M("pension-alimentaria-hijo-porcentaje-sueldo-detallada", "finanzas", "👨‍👧", "Pensión alimentaria detalle",
  "Cuota alimentaria: cuánto y cómo.",
  "20-40% según casos",
  [("sueldoObligado","Sueldo neto obligado $","number",1500000),("hijos","Cantidad hijos","number",2),("ingresoMadre","Ingreso madre (si aporta) $","number",500000)]  ,
  [("cuotaMensual","Cuota sugerida",None),("porcentaje","% sueldo obligado",None),("observacion","Observación",None)],
  ["$1.5M 2 hijos madre $500k","~$450k"],"30%",
  [("¿Porcentaje?","1 hijo: 20-25%. 2 hijos: 30-35%. 3+: 40%+."),
   ("¿Incluye?","Alimentación, salud, educación, ropa, recreación."),
   ("¿Extraordinarias?","Gastos puntuales (uniformes, tratamientos) adicional."),
   ("¿Quien fija?","Juez familia por acuerdo o demanda."),
   ("¿Incumplimiento?","Embargo sueldo, inhibición, denuncia penal."),
   ("¿Hasta cuándo?","21 años o 25 si estudia."),
   ("¿Madre aporta?","Se considera ingreso ambos para proporcional.")],
  """  const s=Number(i.sueldoObligado)||0; const h=Number(i.hijos)||1; const im=Number(i.ingresoMadre)||0;
  let pct=h===1?22:h===2?32:h===3?40:45;
  const ingresosTotales=s+im;
  const proporcional=s/ingresosTotales;
  const cuota=(s*pct/100)*proporcional;
  return { cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`, porcentaje:`${pct}% (ajustado por aporte madre)`, observacion:`Base: ${pct}% para ${h} hijo${h>1?'s':''}. Ajustado por ingresos conjuntos.` };""")

M("divorcio-liquidacion-bienes-gananciales-costo", "finanzas", "💔", "Divorcio liquidación",
  "Estimación costo divorcio AR.",
  "sin hijos + honorarios",
  [("bienes","Valor bienes gananciales $","number",100000000),("acuerdo","Tipo","select",["acuerdo","contradictorio"])]  ,
  [("honorariosEstimados","Honorarios estimados",None),("tiempo","Tiempo estimado",None),("observacion","Observación",None)],
  ["$100M acuerdo","$4-8M"],"1-3 meses",
  [("¿Acuerdo?","Amistoso: más rápido y barato. 3 meses."),
   ("¿Contradictorio?","Disputa: 1-3 años, más costos."),
   ("¿Honorarios?","5-15% valor bienes."),
   ("¿Sin bienes?","$500k-2M honorarios base."),
   ("¿Hijos?","Cuota + tenencia agregan complejidad."),
   ("¿Divorcio express?","Desde CCyC 2015 sin causa. 3 meses mínimo."),
   ("¿Mediación?","Obligatoria previa en mayoría casos familia.")],
  """  const b=Number(i.bienes)||0; const a=String(i.acuerdo||'acuerdo');
  const pct=a==='acuerdo'?0.06:0.12;
  const hon=Math.max(b*pct,1500000);
  const t=a==='acuerdo'?'2-4 meses':'1-3 años';
  return { honorariosEstimados:`$${Math.round(hon).toLocaleString('es-AR')}`, tiempo:t, observacion:a==='acuerdo'?'Divorcio por acuerdo: más rápido, conviene siempre que se pueda.':'Contradictorio: mayores costos + tiempo.' };""")

M("embarazada-aumento-peso-semana-imc-previo", "familia", "🤰", "Aumento peso embarazo",
  "Aumento de peso esperado según IMC previo.",
  "guía IOM 2009",
  [("imcPrevio","IMC previo","number",22),("semanasEmbarazo","Semanas actuales","number",30)]  ,
  [("aumentoEsperadoSemana","Aumento esperado hasta la semana",None),("aumentoTotal","Aumento total esperado",None),("observacion","Observación",None)],
  ["IMC 22 semana 30","10-12 kg"],"Total 11-15 kg",
  [("¿IMC bajo (<18.5)?","Total: 12.5-18 kg."),
   ("¿IMC normal (18.5-24.9)?","Total: 11-15 kg."),
   ("¿IMC sobrepeso (25-29.9)?","Total: 6-11 kg."),
   ("¿IMC obesidad (>30)?","Total: 5-9 kg."),
   ("¿Gemelar?","16-25 kg normal."),
   ("¿Por semana?","Primer trim: 0.5-1 kg total. 2-3°: 0.3-0.5/sem."),
   ("¿Cuándo consultar?","Pérdida inexplicada o aumento >2 kg/sem.")],
  """  const imc=Number(i.imcPrevio)||22; const s=Number(i.semanasEmbarazo)||0;
  let min=0,max=0;
  if(imc<18.5){min=12.5;max=18}
  else if(imc<25){min=11;max=16}
  else if(imc<30){min=7;max=11.5}
  else {min=5;max=9}
  const prog=s/40;
  const aumSemMin=min*prog*0.9;
  const aumSemMax=max*prog;
  return { aumentoEsperadoSemana:`${aumSemMin.toFixed(1)}-${aumSemMax.toFixed(1)} kg hasta semana ${s}`, aumentoTotal:`${min}-${max} kg total`, observacion:`IMC previo ${imc.toFixed(1)}: rango basado en IOM 2009.` };""")

M("fertilidad-intentos-ivf-fiv-edad-costo-argentina", "familia", "👶", "FIV Argentina costo",
  "Costo FIV/IVF según clínica y tipo.",
  "tratamiento + medicación",
  [("tipoTratamiento","Tipo","select",["fiv_tradicional","icsi","ovulos_donacion","embrion_donado"]),("clinica","Clínica","select",["obra_social","privada_media","privada_premium"])]  ,
  [("costoTotal","Costo por intento",None),("probabilidad","Probabilidad embarazo",None),("observacion","Observación",None)],
  ["FIV trad privada media","USD 8-12k"],"40% <35a",
  [("¿FIV?","Fecundación in vitro. USD 5-15k por intento."),
   ("¿ICSI?","Inyección esperma. USD +2-3k."),
   ("¿Donación óvulos?","USD 15-25k. Mayor éxito."),
   ("¿Cobertura?","Ley 26.862: 3-4 intentos por obras sociales/prepagas."),
   ("¿Éxito por edad?","35-: 40%. 35-37: 30%. 38-40: 20%. 41+: <15%."),
   ("¿Intentos?","70% embarazo en 3 intentos <35."),
   ("¿Medicación?","USD 2-5k adicional.")],
  """  const t=String(i.tipoTratamiento||'fiv_tradicional'); const c=String(i.clinica||'privada_media');
  const base={'fiv_tradicional':6000,'icsi':8500,'ovulos_donacion':18000,'embrion_donado':14000}[t];
  const mult={'obra_social':0,'privada_media':1,'privada_premium':1.5}[c];
  const total=base*mult;
  const prob={'fiv_tradicional':'35-40% <35a','icsi':'35-40% <35a','ovulos_donacion':'50-60% cualquier edad','embrion_donado':'40-50%'}[t];
  return { costoTotal:c==='obra_social'?'Cubierto por Ley 26.862':`USD ${total.toLocaleString('en-US')}`, probabilidad:prob, observacion:'Ley 26.862 cubre 3-4 intentos. Medicación adicional USD 2-5k.' };""")

M("maternidad-licencia-sueldo-anses-duracion", "familia", "🤱", "Licencia maternidad",
  "Licencia maternidad según régimen.",
  "90 días LCT + extensión",
  [("regimen","Régimen","select",["lct_empleada","monotributo","autonoma","ama_casa"]),("sueldoBruto","Sueldo bruto","number",1500000)]  ,
  [("diasLicencia","Días licencia",None),("porcentajeSueldo","% sueldo cubierto",None),("quienPaga","Quién paga",None)],
  ["LCT","90 días"],"100% ANSES",
  [("¿LCT?","90 días (45 pre + 45 post). 100% sueldo ANSES."),
   ("¿Monotributo?","No cubierto por ANSES. Cobra asignación universal."),
   ("¿Autónoma?","Similar monotributo."),
   ("¿Prepaga?","Cubierto por LCT si hay empleo."),
   ("¿Lactancia?","2 descansos 30min hasta 1 año."),
   ("¿Extensión?","3 meses más sin goce tras licencia."),
   ("¿Padre?","2 días corridos post-parto.")],
  """  const r=String(i.regimen||'lct_empleada'); const s=Number(i.sueldoBruto)||0;
  const data={'lct_empleada':{dias:90,pct:'100%',pag:'ANSES (acreditado por empleador)'},'monotributo':{dias:0,pct:'Asignación por Hijo',pag:'No aplica licencia, sí AUH'},'autonoma':{dias:0,pct:'Asignación por Hijo',pag:'No aplica'},'ama_casa':{dias:0,pct:'Asignación universal',pag:'No corresponde'}}[r];
  return { diasLicencia:`${data.dias} días`, porcentajeSueldo:data.pct, quienPaga:data.pag };""")

# ============================================================
# TECH + GAMING + IA (10)
# ============================================================

M("tokens-openai-gpt-costo-uso-mensual", "tecnologia", "🤖", "Costo API ChatGPT",
  "Costo mensual estimado API OpenAI.",
  "tokens × precio por modelo",
  [("tokensEntrada","Tokens entrada (M)","number",10),("tokensSalida","Tokens salida (M)","number",5),("modelo","Modelo","select",["gpt_4_turbo","gpt_4","gpt_35_turbo","gpt_4o"])]  ,
  [("costoMensual","Costo mensual USD",None),("porRequest","Costo por request promedio",None),("observacion","Observación",None)],
  ["10M in 5M out GPT-4","USD ~550"],"Request prom USD 0.05",
  [("¿Tokens?","~4 caracteres por token. 1000 tokens ≈ 750 palabras."),
   ("¿GPT-4 Turbo?","USD 10/M input, USD 30/M output."),
   ("¿GPT-4o?","USD 5/M input, USD 15/M output (más barato)."),
   ("¿GPT-3.5?","USD 0.50/M input, USD 1.50/M output."),
   ("¿Caching?","Prompt caching reduce 50% input tokens repetidos."),
   ("¿Batch API?","50% descuento async."),
   ("¿Alternativas?","Claude (Anthropic), Gemini (Google), Llama (local).")],
  """  const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0; const m=String(i.modelo||'gpt_4_turbo');
  const pricing={'gpt_4_turbo':[10,30],'gpt_4':[30,60],'gpt_35_turbo':[0.5,1.5],'gpt_4o':[5,15]}[m];
  const costoIn=ti*pricing[0]; const costoOut=to*pricing[1];
  const total=costoIn+costoOut;
  const requests=(ti+to)*1000/5; // asumir 5k tokens prom por request
  const porReq=requests>0?total/requests:0;
  return { costoMensual:`USD ${total.toFixed(2)}`, porRequest:`USD ${porReq.toFixed(4)}`, observacion:`In ${ti}M × USD ${pricing[0]} + Out ${to}M × USD ${pricing[1]} = USD ${total.toFixed(2)}/mes.` };""")

M("claude-gemini-tokens-comparativa-precio-uso", "tecnologia", "🧠", "Claude vs Gemini",
  "Precio y uso Claude vs Gemini vs OpenAI.",
  "por M tokens",
  [("modelo","Modelo","select",["claude_sonnet","claude_opus","gemini_pro","gemini_ultra","gpt_4o"]),("tokensEntrada","Tokens entrada M","number",10),("tokensSalida","Tokens salida M","number",5)]  ,
  [("costoMensualUsd","Costo mensual USD",None),("contexto","Contexto max",None),("recomendacion","Recomendación",None)],
  ["Claude Sonnet 10+5","USD 150"],"200k context",
  [("¿Claude?","Anthropic. Mejor para escritura y razonamiento largo."),
   ("¿Gemini?","Google. Fuerte en multimodal (imagen, video)."),
   ("¿Context?","Claude Sonnet 200k, Gemini Pro 2M, GPT-4o 128k."),
   ("¿Precio Claude Sonnet?","USD 3/M in, USD 15/M out."),
   ("¿Claude Opus?","Más caro pero mejor. USD 15/M in, USD 75/M out."),
   ("¿Gemini Pro?","USD 3.50/M in, USD 10.50/M out."),
   ("¿Open source?","Llama 3 via Groq: gratis con límites.")],
  """  const m=String(i.modelo||'claude_sonnet'); const ti=Number(i.tokensEntrada)||0; const to=Number(i.tokensSalida)||0;
  const pricing={'claude_sonnet':[3,15,'200k'],'claude_opus':[15,75,'200k'],'gemini_pro':[3.5,10.5,'2M'],'gemini_ultra':[7,21,'1M'],'gpt_4o':[5,15,'128k']}[m];
  const total=ti*pricing[0]+to*pricing[1];
  const rec={'claude_sonnet':'Balance precio/calidad. Buena opción.','claude_opus':'Máxima calidad. Use cases complejos.','gemini_pro':'Mejor contexto largo (2M).','gemini_ultra':'Potente pero evaluar vs Claude Opus.','gpt_4o':'Buen multimodal. Ecosistema OpenAI.'}[m];
  return { costoMensualUsd:`USD ${total.toFixed(2)}`, contexto:pricing[2], recomendacion:rec };""")

M("midjourney-stable-diffusion-credits-mensual", "tecnologia", "🎨", "Midjourney precio",
  "Planes Midjourney y créditos mensuales.",
  "USD por plan",
  [("plan","Plan","select",["basic","standard","pro","mega"])],
  [("precioMes","Precio USD/mes",None),("horasFast","Horas fast GPU",None),("rolmode","Roll mode",None)],
  ["Standard","USD 30"],"15h GPU",
  [("¿Basic?","USD 10/mes. 200 imágenes/mes. Sin modo fast."),
   ("¿Standard?","USD 30/mes. 15 horas GPU fast + unlimited relax."),
   ("¿Pro?","USD 60/mes. 30 horas. Stealth mode."),
   ("¿Mega?","USD 120/mes. 60 horas. Para agencias."),
   ("¿Alternativas?","Stable Diffusion gratis local. DALL-E 3 con ChatGPT Plus."),
   ("¿Licencia comercial?","Solo con Pro+."),
   ("¿API?","Midjourney no tiene. SD sí via Replicate, Runway.")],
  """  const p=String(i.plan||'standard');
  const data={'basic':{pr:10,h:'0 fast (200 img)',r:'No'},'standard':{pr:30,h:'15 h fast + unlimited relax',r:'Sí'},'pro':{pr:60,h:'30 h fast + unlimited relax',r:'Sí + stealth'},'mega':{pr:120,h:'60 h fast',r:'Sí + stealth'}}[p];
  return { precioMes:`USD ${data.pr}/mes`, horasFast:data.h, rolmode:data.r };""")

M("streamer-ganancias-twitch-youtube-viewers-afiliacion", "marketing", "🎥", "Streamer ingresos",
  "Estimación ingresos streamer Twitch/YouTube.",
  "subs + bits + ads + donaciones",
  [("viewersPromedio","Viewers promedio","number",500),("horasMensuales","Horas stream/mes","number",120),("plataforma","Plataforma","select",["twitch","youtube","kick"])]  ,
  [("subsEstimadas","Subscripciones",None),("adsEstimadas","Ads revenue",None),("ingresoTotal","Ingreso total mensual",None)],
  ["500 viewers 120h Twitch","50 subs"],"USD ~600/mes",
  [("¿Subs?","5-15% conversion viewers a subs."),
   ("¿Sub Twitch?","USD 4.99 (50% streamer)."),
   ("¿CPM Twitch?","USD 2-8 por 1000 ad views."),
   ("¿YouTube?","USD 1-5 CPM. Requiere 1000 subs + 4000 horas."),
   ("¿Bits Twitch?","100 bits = USD 1 streamer."),
   ("¿Donaciones?","Streamlabs, Ko-fi."),
   ("¿Kick?","95/5 split (vs Twitch 50/50). Crece pero menor audiencia.")],
  """  const v=Number(i.viewersPromedio)||0; const h=Number(i.horasMensuales)||0; const p=String(i.plataforma||'twitch');
  const convRate={'twitch':0.08,'youtube':0.03,'kick':0.05}[p];
  const subs=Math.round(v*convRate);
  const subRev=p==='twitch'?subs*2.5:p==='youtube'?subs*2:subs*4.5;
  const hoursAdViews=h*v*0.15;
  const adsRev=hoursAdViews/1000*4;
  const donaciones=h*3;
  const total=subRev+adsRev+donaciones;
  return { subsEstimadas:`${subs} subs (USD ${Math.round(subRev)})`, adsEstimadas:`USD ${Math.round(adsRev)}`, ingresoTotal:`USD ${Math.round(total)}/mes` };""")

M("youtube-ingresos-cpm-suscriptores-views-monetizacion", "marketing", "▶️", "YouTube ingresos",
  "Ingresos YouTube por views y CPM.",
  "views × CPM / 1000",
  [("viewsMensuales","Views/mes","number",500000),("cpm","CPM USD","number",3),("nicho","Nicho","select",["general","finanzas","tecnologia","gaming","educacion","cocina"])]  ,
  [("ingresoAds","Ingreso ads",None),("cpmEstimado","CPM nicho",None),("total","Total aprox",None)],
  ["500k views CPM 3 gen","USD 1050"],"Finanzas CPM 10+",
  [("¿CPM?","Cost per Mille (1000 impresiones)."),
   ("¿CPM nicho?","Finanzas USD 10-30. Tech USD 5-15. Gaming USD 1-5."),
   ("¿Requisitos monetización?","1000 subs + 4000 horas reproducidas 12 meses."),
   ("¿YouTube corta 45%?","55% al creator."),
   ("¿Shorts?","Fondo específico. Por engagement."),
   ("¿Membership?","Desde 1000 subs. YouTube corta 30%."),
   ("¿Super Thanks?","Donaciones. 30% YouTube.")],
  """  const v=Number(i.viewsMensuales)||0; const c=Number(i.cpm)||0; const n=String(i.nicho||'general');
  const cpmMult={'general':1,'finanzas':4,'tecnologia':2,'gaming':0.7,'educacion':3,'cocina':2}[n];
  const cpmEst=c*cpmMult;
  const ingAds=v/1000*cpmEst*0.55;
  return { ingresoAds:`USD ${Math.round(ingAds)}`, cpmEstimado:`CPM nicho USD ${cpmEst.toFixed(1)}`, total:`USD ${Math.round(ingAds).toLocaleString('en-US')}/mes` };""")

M("tiktok-creator-fund-views-ingresos-argentina", "marketing", "🎵", "TikTok creator fund",
  "Ingresos TikTok creator fund.",
  "USD 0.02-0.04 por 1000 views",
  [("viewsMensuales","Views/mes","number",1000000)],
  [("ingresoEstimado","Ingreso mensual",None),("porKView","USD por 1000 views",None),("alternativas","Alternativas","text")],
  ["1M views","USD 30"],"Muy bajo vs otros",
  [("¿Creator Fund?","USD 0.02-0.04 por 1000 views."),
   ("¿Requisitos?","10k subs + 100k views en 30 días."),
   ("¿AR disponible?","No oficialmente. VPN needed."),
   ("¿Lives?","Gifts/stickers durante en vivo."),
   ("¿TikTok Shop?","Comisión por ventas en app."),
   ("¿UGC?","Brands pagan USD 100-5000 por videos."),
   ("¿Creator Marketplace?","Match con brands según nicho.")],
  """  const v=Number(i.viewsMensuales)||0;
  const ingreso=v/1000*0.03;
  return { ingresoEstimado:`USD ${ingreso.toFixed(2)}/mes`, porKView:'USD 0.02-0.04 por 1000 views', alternativas:'UGC brand deals, TikTok Shop comisiones, lives con gifts.' };""")

M("gaming-fps-componentes-pc-armar-presupuesto", "tecnologia", "🎮", "PC gamer precio",
  "Presupuesto PC gamer por rendimiento.",
  "CPU + GPU + otros",
  [("objetivoFps","Objetivo FPS","select",["60_1080p","144_1080p","60_4k","144_1440p","240_competitive"]),("anoJuegos","Año juegos","number",2026)]  ,
  [("presupuestoTotal","Presupuesto USD",None),("gpuSugerida","GPU sugerida",None),("cpuSugerido","CPU sugerido",None)],
  ["144 1080p","USD 1200"],"RTX 4060 Ti",
  [("¿60 1080p?","USD 600-800. RTX 3060 / RX 7600."),
   ("¿144 1080p?","USD 1000-1300. RTX 4060 Ti / RX 7700 XT."),
   ("¿60 4K?","USD 1500-2000. RTX 4070 Super."),
   ("¿144 1440p?","USD 1500-2000."),
   ("¿240 competitive?","USD 1800-2500. RTX 4070 Ti / RX 7900 XTX."),
   ("¿Sistema completo?","Agregar USD 200-300 periféricos + monitor."),
   ("¿En AR?","Multiplicar USD precios por MEP + 20-30% premium.")],
  """  const f=String(i.objetivoFps||'144_1080p');
  const data={'60_1080p':{pr:700,gpu:'RTX 3060 / RX 7600',cpu:'Ryzen 5 5600'},'144_1080p':{pr:1150,gpu:'RTX 4060 Ti / RX 7700 XT',cpu:'Ryzen 5 7600'},'60_4k':{pr:1800,gpu:'RTX 4070 Super',cpu:'Ryzen 7 7700X'},'144_1440p':{pr:1700,gpu:'RTX 4070 Ti / RX 7800 XT',cpu:'Ryzen 7 7700X'},'240_competitive':{pr:2200,gpu:'RTX 4070 Ti Super',cpu:'Ryzen 7 7800X3D'}}[f];
  return { presupuestoTotal:`USD ${data.pr.toLocaleString('en-US')}`, gpuSugerida:data.gpu, cpuSugerido:data.cpu };""")

M("bandwidth-streaming-bitrate-resolucion-youtube", "tecnologia", "📺", "Bitrate streaming",
  "Bitrate recomendado por resolución.",
  "Mbps según píxeles",
  [("resolucion","Resolución","select",["720p","1080p_30","1080p_60","1440p","4k"]),("plataforma","Plataforma","select",["youtube","twitch","kick"])]  ,
  [("bitrateMbps","Bitrate recomendado",None),("uploadMinimo","Upload mínimo",None),("codec","Codec","text")],
  ["1080p 60 YouTube","6 Mbps"],"H.264/H.265",
  [("¿720p?","2.5-4 Mbps."),
   ("¿1080p 30?","3-6 Mbps."),
   ("¿1080p 60?","4.5-9 Mbps."),
   ("¿1440p?","6-13 Mbps."),
   ("¿4K?","13-51 Mbps."),
   ("¿Upload?","Siempre 1.5x bitrate (overhead protocolos)."),
   ("¿H.265?","Mejor compresión pero pocos softwares soportan streaming.")],
  """  const r=String(i.resolucion||'1080p_60'); const p=String(i.plataforma||'youtube');
  const bitrate={'720p':3.5,'1080p_30':5,'1080p_60':6,'1440p':10,'4k':25}[r];
  const mult=p==='twitch'?1:p==='youtube'?1.1:0.8;
  const br=bitrate*mult;
  return { bitrateMbps:`${br.toFixed(1)} Mbps`, uploadMinimo:`${(br*1.5).toFixed(1)} Mbps`, codec:'H.264 (x264) compatible todo. H.265 mejor compresión.' };""")

M("cloud-aws-gcp-azure-ec2-mes-ondemand", "tecnologia", "☁️", "AWS EC2 mensual",
  "Costo aproximado EC2 AWS on-demand.",
  "precio/hora × 720 hrs",
  [("tipoInstancia","Tipo","select",["t3_micro","t3_medium","m5_large","c5_xlarge","r5_2xlarge"]),("region","Región","select",["us_east","eu_west","sa_east_1"])]  ,
  [("costoMensual","Costo mensual USD",None),("cpu","vCPU + RAM",None),("observacion","Observación",None)],
  ["t3.medium US east","USD ~30"],"2 vCPU 4GB",
  [("¿t3.micro?","Free tier primer año. Luego USD 10/mes."),
   ("¿t3.medium?","USD 30/mes. Apps small."),
   ("¿m5.large?","USD 70/mes. 2 CPU 8 GB."),
   ("¿c5.xlarge?","USD 130/mes. CPU-optimized."),
   ("¿r5.2xlarge?","USD 340/mes. Memory-optimized."),
   ("¿Reserved?","30-75% descuento si 1-3 años commit."),
   ("¿Spot?","Hasta 90% descuento para cargas interrumpibles.")],
  """  const t=String(i.tipoInstancia||'t3_medium'); const r=String(i.region||'us_east');
  const baseHr={'t3_micro':0.0104,'t3_medium':0.0416,'m5_large':0.096,'c5_xlarge':0.17,'r5_2xlarge':0.504}[t];
  const regMult={'us_east':1,'eu_west':1.08,'sa_east_1':1.35}[r];
  const mes=baseHr*720*regMult;
  const specs={'t3_micro':'2 vCPU 1GB','t3_medium':'2 vCPU 4GB','m5_large':'2 vCPU 8GB','c5_xlarge':'4 vCPU 8GB','r5_2xlarge':'8 vCPU 64GB'}[t];
  return { costoMensual:`USD ${mes.toFixed(2)}`, cpu:specs, observacion:r==='sa_east_1'?'SA más caro por infraestructura.':'On-demand. Reserved/Spot más baratos.' };""")

M("vpn-mejor-argentina-precio-velocidad-comparativa", "tecnologia", "🔒", "Mejor VPN",
  "Comparativa VPN populares.",
  "precio + velocidad + features",
  [("uso","Uso principal","select",["privacidad","streaming","torrents","viajes"])],
  [("recomendacion","VPN recomendada",None),("precioAnual","Precio anual",None),("features","Features","text")],
  ["Streaming","NordVPN"],"USD 40-70/año",
  [("¿NordVPN?","USD 3-5/mes. Muy rápida. Buenos servidores."),
   ("¿ExpressVPN?","USD 6-8/mes. Más cara pero muy confiable."),
   ("¿Surfshark?","USD 2-3/mes. Dispositivos ilimitados."),
   ("¿ProtonVPN?","Enfoque privacidad. Plan gratis disponible."),
   ("¿Mullvad?","USD 5/mes. Anónima (sin email)."),
   ("¿Netflix?","NordVPN, ExpressVPN desbloquean bien."),
   ("¿Gratis?","Proton gratis pero limitado. Evitar gratis desconocidas.")],
  """  const u=String(i.uso||'privacidad');
  const data={'privacidad':{v:'Mullvad o ProtonVPN',pr:'USD 60/año',f:'Sin logs, pagos anónimos, código abierto'},'streaming':{v:'NordVPN o ExpressVPN',pr:'USD 40-90/año',f:'Desbloquea Netflix, Disney+, HBO. Alta velocidad'},'torrents':{v:'Mullvad o Proton',pr:'USD 60/año',f:'P2P permitido, kill switch, port forwarding'},'viajes':{v:'ExpressVPN',pr:'USD 90/año',f:'Servidores en 90+ países, estable para trabajo remoto'}}[u];
  return { recomendacion:data.v, precioAnual:data.pr, features:data.f };""")

# ============================================================
# MISC (5)
# ============================================================

M("costo-anual-mascota-perro-gato-ar-completo", "mascotas", "🐕", "Costo anual mascota",
  "Costo anual perro/gato en Argentina.",
  "comida + vet + accesorios",
  [("tipo","Tipo","select",["perro_chico","perro_mediano","perro_grande","gato"]),("marcaComida","Marca","select",["economica","media","premium"])]  ,
  [("comidaMensual","Comida mensual",None),("costoAnual","Costo anual",None),("desglose","Desglose","text")],
  ["Perro mediano media","$100k/mes"],"Anual $1.5M",
  [("¿Comida?","Perros: 20-40 kg alimento/mes según tamaño."),
   ("¿Vet anual?","$100k-300k entre vacunas, chequeos, antiparasitarios."),
   ("¿Accesorios?","$20k-100k iniciales. $10-30k/año."),
   ("¿Peluquería?","Razas pelo largo $30-50k/mes."),
   ("¿Emergencias?","Fondo $100-300k/año por si acaso."),
   ("¿Premium vs económica?","Premium es mejor salud a largo plazo."),
   ("¿Guardería vacaciones?","$5-15k/día.")],
  """  const t=String(i.tipo||'perro_mediano'); const m=String(i.marcaComida||'media');
  const kgMes={'perro_chico':8,'perro_mediano':20,'perro_grande':40,'gato':3}[t];
  const precioKg={'economica':3500,'media':6000,'premium':10000}[m];
  const comida=kgMes*precioKg;
  const vet=t==='gato'?120000:180000; // anual
  const acc=t==='gato'?60000:120000; // anual
  const pelu=t==='perro_grande'?240000:t==='perro_mediano'?120000:0;
  const anual=comida*12+vet+acc+pelu;
  return { comidaMensual:`$${Math.round(comida).toLocaleString('es-AR')}`, costoAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, desglose:`Comida $${Math.round(comida*12/1000)}k + Vet $${vet/1000}k + Accs $${acc/1000}k${pelu>0?` + Peluquería $${pelu/1000}k`:''}` };""")

M("envejecer-mascota-humano-tabla-raza-tamano", "mascotas", "🐶", "Edad mascota años humanos",
  "Edad perro/gato en años humanos según tamaño/raza.",
  "fórmula logarítmica",
  [("tipo","Tipo","select",["perro_chico","perro_mediano","perro_grande","perro_gigante","gato"]),("edadMascota","Edad mascota años","number",5)]  ,
  [("edadHumana","Edad humana aprox",None),("etapa","Etapa vida",None),("observacion","Observación",None)],
  ["Perro mediano 5a","~35 humanos"],"Adulto",
  [("¿Fórmula?","Perro año 1 = 15 humanos. Año 2 = 9. Luego depende tamaño."),
   ("¿Chico?","Viven más. Año 10 = ~56 humanos."),
   ("¿Grande?","Viven menos. Año 10 = 78 humanos."),
   ("¿Gato?","Más lenta la conversión. Año 5 = ~36 humanos."),
   ("¿Senior?","Perros grandes 6+. Medianos 8+. Chicos 10+."),
   ("¿Esperanza vida?","Chihuahua 15+. Gran Danés 7-10."),
   ("¿Razas mixtas?","Generalmente más longevas que puras.")],
  """  const t=String(i.tipo||'perro_mediano'); const e=Number(i.edadMascota)||0;
  let h=0;
  if(t==='gato'){ if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*4; }
  else {
    const multByTamano={'perro_chico':4,'perro_mediano':5,'perro_grande':6,'perro_gigante':7}[t];
    if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*multByTamano;
  }
  let etapa='';
  if(h<12) etapa='Cachorro/Junior';
  else if(h<30) etapa='Adulto joven';
  else if(h<55) etapa='Adulto';
  else if(h<70) etapa='Senior';
  else etapa='Geriatría';
  return { edadHumana:`~${Math.round(h)} años`, etapa:etapa, observacion:`${e} año${e>1?'s':''} mascota ≈ ${Math.round(h)} humanos (${etapa}).` };""")

M("auto-usado-valor-depreciacion-anos-antiguedad", "automotor", "🚗", "Depreciación auto",
  "Valor estimado auto usado según antigüedad.",
  "valor_0km × (1-depr)^años",
  [("valor0km","Valor 0 km USD","number",20000),("anosUso","Años uso","number",5),("kmTotales","Km totales","number",80000)]  ,
  [("valorEstimado","Valor estimado",None),("depreciacion","Depreciación acumulada",None),("observacion","Observación",None)],
  ["USD 20k 5 años 80k km","USD 11-13k"],"40% menos",
  [("¿Primer año?","Pierde 15-25% al salir concesionaria."),
   ("¿Año 2-5?","~10-15% anual."),
   ("¿Año 5-10?","~5-8% anual."),
   ("¿>10 años?","Se estabiliza ~3-5%."),
   ("¿Km?","100k+ afecta precio."),
   ("¿Marcas mantenedoras?","Toyota, Honda depreciación baja. Europa más alta."),
   ("¿Mercado AR?","Menos depreciación por escasez vs USA.")],
  """  const v=Number(i.valor0km)||0; const a=Number(i.anosUso)||0; const km=Number(i.kmTotales)||0;
  let valor=v;
  if(a>=1) valor*=0.82; // primer año
  for(let i_=1;i_<a;i_++){ if(i_<4) valor*=0.88; else if(i_<10) valor*=0.93; else valor*=0.96; }
  // ajuste km
  if(km>100000) valor*=0.92; else if(km>50000) valor*=0.96;
  const dep=((1-valor/v)*100);
  return { valorEstimado:`USD ${Math.round(valor).toLocaleString('en-US')}`, depreciacion:`${dep.toFixed(0)}%`, observacion:`Depreciación teórica. Mercado AR tiende a mantener valor más que USA/Europa.` };""")

M("leasing-vs-credito-auto-comparativa-completa", "finanzas", "🚙", "Leasing vs crédito auto",
  "Comparativa leasing vs crédito para comprar auto.",
  "cuota × plazo + opción",
  [("valorAuto","Valor auto USD","number",20000),("plazoAnios","Plazo años","number",3)]  ,
  [("cuotaLeasing","Cuota leasing USD/mes",None),("cuotaCredito","Cuota crédito USD/mes",None),("recomendacion","Recomendación",None)],
  ["USD 20k 3 años","~USD 500 leasing"],"Crédito USD 650/mes",
  [("¿Leasing?","Alquilás con opción compra. Cuota menor, depósito bajo."),
   ("¿Crédito?","Comprás financiado. Sos dueño. Cuota mayor."),
   ("¿Empresa?","Leasing 100% deducible. Ventaja fiscal."),
   ("¿Persona?","Crédito suele ser mejor largo plazo."),
   ("¿Opción compra?","10-30% valor al final típicamente."),
   ("¿Km límite?","Leasing suele tener (20k/año). Excedente penaliza."),
   ("¿En AR?","Leasing menos común que crédito.")],
  """  const v=Number(i.valorAuto)||0; const p=Number(i.plazoAnios)||1;
  const cuotaL=v*0.025; // 2.5% mensual en leasing típico
  const cuotaC=v*0.032; // crédito más caro
  const rec=v>30000?'Leasing si es uso empresa (deducible)':'Crédito suele ser mejor para persona física.';
  return { cuotaLeasing:`USD ${Math.round(cuotaL)}/mes + opción compra final`, cuotaCredito:`USD ${Math.round(cuotaC)}/mes (sos dueño al finalizar)`, recomendacion:rec };""")

M("propiedad-tasacion-m2-barrio-caba-promedio", "vida", "🏙️", "Valor m² CABA por barrio",
  "Valor estimado m² CABA por barrio.",
  "tabla barrios",
  [("barrio","Barrio","select",["puerto_madero","recoleta","palermo","belgrano","caballito","villa_crespo","flores","liniers","boedo","pompeya"]),("tipoProp","Tipo","select",["departamento","casa"])]  ,
  [("valorM2Usd","Valor USD/m²",None),("rango","Rango típico",None),("observacion","Observación",None)],
  ["Palermo depto","USD 2800"],"USD 2200-3500",
  [("¿Puerto Madero?","USD 4000-6000/m² (más caro)."),
   ("¿Recoleta/Belgrano?","USD 2500-3500."),
   ("¿Palermo?","USD 2500-3500 según zona."),
   ("¿Caballito?","USD 1800-2400."),
   ("¿Boedo?","USD 1500-2000."),
   ("¿Pompeya?","USD 1000-1400."),
   ("¿Factores?","Amenities, antigüedad, orientación, piso, vista.")],
  """  const b=String(i.barrio||'palermo'); const t=String(i.tipoProp||'departamento');
  const base={'puerto_madero':5000,'recoleta':3200,'palermo':2900,'belgrano':2800,'caballito':2000,'villa_crespo':2100,'flores':1700,'liniers':1400,'boedo':1600,'pompeya':1100}[b];
  const mult=t==='casa'?0.9:1;
  const val=base*mult;
  const rango=`USD ${Math.round(val*0.8).toLocaleString('en-US')}-${Math.round(val*1.2).toLocaleString('en-US')}`;
  return { valorM2Usd:`USD ${val.toLocaleString('en-US')}/m²`, rango:rango, observacion:'Promedio 2026. Varía según amenities, antigüedad, orientación, ubicación exacta.' };""")
