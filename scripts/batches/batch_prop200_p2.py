"""Batch Prop200 P2 — 50 calcs (Salud 25 + Fitness 15 + Vida 10)."""
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
# SALUD ESPECÍFICA (25)
# ============================================================

M("a1c-hemoglobina-glicosilada-diabetes", "salud", "🩸", "HbA1c a promedio de glucosa",
  "Convierte HbA1c a promedio de glucosa estimada (eAG).",
  "eAG = 28.7 × HbA1c - 46.7",
  [("hba1c","HbA1c (%)","number",6.5)],
  [("glucosaPromedio","Glucosa promedio (mg/dL)",None),("clasificacion","Clasificación",None),("riesgo","Riesgo",None)],
  ["HbA1c 6.5%","140 mg/dL"],"Diabético",
  [("¿Qué es HbA1c?","Porcentaje de hemoglobina ligada a glucosa. Refleja niveles 3 meses."),
   ("¿Valor normal?","<5.7%. Prediabetes 5.7-6.4%. Diabetes ≥6.5%."),
   ("¿Fórmula eAG?","Estimated Average Glucose: 28.7 × HbA1c - 46.7 (mg/dL)."),
   ("¿Cada cuánto medirla?","Diabéticos: cada 3 meses. Control normal: anual."),
   ("¿Afecta edad?","Los valores se mantienen con la edad, no cambian por vejez sola."),
   ("¿Embarazo?","Objetivos más estrictos: <6% ideal."),
   ("¿Control 6-7%?","Meta individual. Muchos médicos buscan <7% para diabéticos.")],
  """  const h=Number(i.hba1c)||0; const g=28.7*h-46.7;
  let clas='', riesgo='';
  if(h<5.7){clas='Normal';riesgo='Bajo'}
  else if(h<6.5){clas='Prediabetes';riesgo='Medio'}
  else if(h<8){clas='Diabetes';riesgo='Alto'}
  else {clas='Diabetes mal controlada';riesgo='Muy alto'}
  return { glucosaPromedio:`${Math.round(g)} mg/dL`, clasificacion:clas, riesgo:riesgo };""")

M("presion-arterial-clasificacion-oms", "salud", "🫀", "Presión arterial OMS",
  "Clasificación OMS de presión arterial.",
  "tabla OMS/AHA",
  [("sistolica","Sistólica (mmHg)","number",120),("diastolica","Diastólica (mmHg)","number",80)],
  [("clasificacion","Clasificación",None),("riesgo","Riesgo",None),("recomendacion","Recomendación",None)],
  ["120/80","Normal"],"Bajo riesgo",
  [("¿Normal?","<120/80."),
   ("¿Elevada?","120-129/<80."),
   ("¿HTA 1?","130-139 o 80-89."),
   ("¿HTA 2?","≥140 o ≥90."),
   ("¿Crisis?","≥180 o ≥120 — emergencia médica."),
   ("¿Cómo medir?","Sentado, brazo descubierto, después de 5 min de reposo, sin café/cigarrillo previo."),
   ("¿Monitoreo domiciliario?","2 mediciones AM y 2 PM, por 5-7 días.")],
  """  const s=Number(i.sistolica)||0; const d=Number(i.diastolica)||0;
  let clas='', riesgo='', rec='';
  if(s>=180||d>=120){clas='Crisis hipertensiva';riesgo='EMERGENCIA';rec='Consulta urgente'}
  else if(s>=140||d>=90){clas='Hipertensión estadio 2';riesgo='Alto';rec='Tratamiento farmacológico probable'}
  else if(s>=130||d>=80){clas='Hipertensión estadio 1';riesgo='Medio-Alto';rec='Cambios de estilo + seguimiento'}
  else if(s>=120){clas='Presión elevada';riesgo='Medio';rec='Dieta, ejercicio, reducir sodio'}
  else {clas='Normal';riesgo='Bajo';rec='Mantener hábitos saludables'}
  return { clasificacion:clas, riesgo:riesgo, recomendacion:rec };""")

M("dosis-ibuprofeno-paracetamol-peso-nino", "salud", "💊", "Dosis ibuprofeno niño peso",
  "Dosis pediátrica de ibuprofeno/paracetamol por peso.",
  "mg/kg × peso",
  [("pesoKg","Peso del niño (kg)","number",15),("medicamento","Medicamento","select",["ibuprofeno","paracetamol"])]  ,
  [("dosisMg","Dosis por toma (mg)",None),("frecuencia","Frecuencia",None),("advertencia","Advertencia",None)],
  ["15 kg ibuprofeno","150 mg"],"Cada 6-8h",
  [("¿Ibuprofeno dosis?","5-10 mg/kg cada 6-8 horas. Máximo 40 mg/kg/día."),
   ("¿Paracetamol dosis?","10-15 mg/kg cada 4-6 horas. Máximo 75 mg/kg/día."),
   ("¿Mezclar?","Consultar pediatra. No dar ambos sin indicación."),
   ("¿Edad mínima ibuprofeno?","6 meses."),
   ("¿Paracetamol bebé?","Sí desde nacimiento a dosis pediátrica."),
   ("¿Gotas o jarabe?","Verificá concentración: ibupro 200 mg/5ml = 40 mg/ml. Paraceta 120 mg/5ml = 24 mg/ml."),
   ("¿Cuándo llamar médico?","Fiebre >72 hs, mala evolución, signos de gravedad.")],
  """  const p=Number(i.pesoKg)||0; const m=String(i.medicamento||'ibuprofeno');
  const dosis=m==='ibuprofeno'?p*10:p*12.5;
  const freq=m==='ibuprofeno'?'Cada 6-8 horas':'Cada 4-6 horas';
  const adv=m==='ibuprofeno'?'Máx 40 mg/kg/día. Con comida.':'Máx 75 mg/kg/día.';
  return { dosisMg:`${Math.round(dosis)} mg`, frecuencia:freq, advertencia:adv };""")

M("ciclo-sueno-rem-no-rem-90min", "salud", "😴", "Ciclo sueño 90 minutos",
  "Calcula la mejor hora de levantarse según ciclos de sueño.",
  "hora + n × 90 min",
  [("horaDormir","Hora de dormir HH:MM","text","22:00"),("ciclosObjetivo","Ciclos objetivo (4-6)","number",5)],
  [("horaDespertar","Hora ideal despertar",None),("horasSueno","Horas de sueño",None),("interpretacion","Interpretación",None)],
  ["22:00 + 5 ciclos","05:30"],"7.5 horas",
  [("¿Por qué 90 min?","Un ciclo completo (REM + no-REM) dura ~90 minutos."),
   ("¿Cuántos ciclos?","4-6 por noche. Menos de 4 = insuficiente."),
   ("¿Me despierto mejor?","Al terminar un ciclo, no en medio."),
   ("¿Varía con edad?","Adultos 90 min. Adolescentes similar. Adultos mayores ciclos más cortos."),
   ("¿Tiempo para dormirme?","Agregá 10-15 min. Input hora acostado, no hora dormido."),
   ("¿Apps?","Sleep Cycle, Sleep as Android monitorean con micrófono."),
   ("¿Siestas?","Una siesta completa (90 min) o muy corta (20 min). Evitar 40-60 min.")],
  """  const h=String(i.horaDormir||'22:00'); const c=Number(i.ciclosObjetivo)||5;
  const [hh,mm]=h.split(':').map(Number);
  const minutos=(hh*60+mm+c*90+15)%1440; // +15 min fall asleep
  const hd=Math.floor(minutos/60); const md=minutos%60;
  return { horaDespertar:`${String(hd).padStart(2,'0')}:${String(md).padStart(2,'0')}`, horasSueno:`${(c*90/60).toFixed(1)} h`, interpretacion:`Dormí a las ${h}, levantate a las ${String(hd).padStart(2,'0')}:${String(md).padStart(2,'0')} tras ${c} ciclos de 90 min.` };""")

M("fertilidad-amh-reserva-ovarica-edad", "salud", "🥚", "AMH reserva ovárica",
  "Interpretación de hormona antimülleriana (AMH).",
  "tabla AMH por edad",
  [("amhNgMl","AMH (ng/mL)","number",2),("edadMujer","Edad (años)","number",32)],
  [("clasificacion","Clasificación reserva",None),("fertilidad","Fertilidad esperada",None),("recomendacion","Recomendación",None)],
  ["AMH 2 a 32 años","Normal"],"Reserva adecuada",
  [("¿Qué es AMH?","Hormona Anti-Mülleriana. Producida por folículos antrales. Refleja reserva ovárica."),
   ("¿Valores normales por edad?","25a: 2.5-6.8; 30a: 2.0-5.0; 35a: 1.5-4.0; 40a: 0.8-2.5."),
   ("¿Baja?","<1 ng/mL = reserva disminuida. Evaluar con especialista."),
   ("¿Alta?",">4 ng/mL = posible SOP. Puede afectar ovulación."),
   ("¿Predice fertilidad?","Cantidad de óvulos, no calidad. Mujer puede concebir con AMH bajo."),
   ("¿Estimula?","No hay tratamientos efectivos para aumentar AMH."),
   ("¿Útil para?","FIV, planificación familiar, evaluación premenopausia.")],
  """  const a=Number(i.amhNgMl)||0; const e=Number(i.edadMujer)||0;
  let rangoBajo=0.8, rangoAlto=3.0;
  if(e<30){rangoBajo=2.0;rangoAlto=5.0} else if(e<35){rangoBajo=1.5;rangoAlto=4.0} else if(e<40){rangoBajo=0.9;rangoAlto=3.0} else {rangoBajo=0.5;rangoAlto=2.0}
  let clas='', fert='', rec='';
  if(a<rangoBajo){clas='Disminuida';fert='Menor';rec='Consulta con especialista en fertilidad'}
  else if(a<=rangoAlto){clas='Normal para la edad';fert='Adecuada';rec='Mantén controles regulares'}
  else {clas='Alta (posible SOP)';fert='Variable';rec='Evaluar por endocrino/ginecólogo'}
  return { clasificacion:clas, fertilidad:fert, recomendacion:rec };""")

M("testosterona-niveles-normales-edad-hombre", "salud", "💪", "Testosterona niveles hombre",
  "Valores normales de testosterona por edad.",
  "rangos por década",
  [("testosterona","Testosterona (ng/dL)","number",600),("edad","Edad (años)","number",35)],
  [("rangoNormal","Rango normal para tu edad",None),("clasificacion","Clasificación",None),("recomendacion","Recomendación",None)],
  ["600 a 35 años","Normal"],"Dentro de rango",
  [("¿Rango?","Hombre adulto: 270-1070 ng/dL. Varía con edad."),
   ("¿20-30?","Pico: 600-900."),
   ("¿40-50?","500-700."),
   ("¿60+?","350-600 (normal descenso)."),
   ("¿Baja?","<300 ng/dL sintomático = hipogonadismo."),
   ("¿Factores?","Horario (máximo AM), sueño, peso, estrés."),
   ("¿TRT?","Terapia reemplazo por endocrinólogo si indicada.")],
  """  const t=Number(i.testosterona)||0; const e=Number(i.edad)||0;
  let rMin=350, rMax=900;
  if(e<30){rMin=600;rMax=900} else if(e<40){rMin=500;rMax=800} else if(e<50){rMin=450;rMax=750} else if(e<60){rMin=400;rMax=700} else {rMin=300;rMax=600}
  let clas='', rec='';
  if(t<rMin*0.7){clas='Muy baja';rec='Consulta con endocrinólogo'}
  else if(t<rMin){clas='Baja';rec='Evaluar síntomas, repetir medición AM'}
  else if(t<=rMax){clas='Normal';rec='Mantener hábitos saludables'}
  else {clas='Alta';rec='Investigar causa con médico'}
  return { rangoNormal:`${rMin}-${rMax} ng/dL`, clasificacion:clas, recomendacion:rec };""")

M("estrogeno-progesterona-fase-menstrual", "salud", "🌙", "Estrógeno fases ciclo",
  "Niveles de estrógeno y progesterona según fase del ciclo.",
  "tabla por fase",
  [("diaCiclo","Día del ciclo","number",14)],
  [("fase","Fase ciclo",None),("estrogenoEsperado","Estrógeno esperado",None),("progesteronaEsperada","Progesterona esperada",None)],
  ["Día 14","Ovulatoria"],"E2 alto, P baja",
  [("¿Fases?","Menstrual (1-5), Folicular (1-13), Ovulatoria (14), Lútea (15-28)."),
   ("¿Estrógeno pico?","Día 12-13 (preovulación)."),
   ("¿Progesterona pico?","Día 21 (fase lútea media)."),
   ("¿Mediciones?","E2 y P4 en sangre. Día 3 (basal) y día 21 (post-ovulación)."),
   ("¿FSH?","Típicamente se mide día 3. >10 UI/L sugiere reserva baja."),
   ("¿LH?","Pico preovulación dispara ovulación. Base para tests de ovulación."),
   ("¿Irregularidad?","Ciclo <21 o >35 días = patológico. Evaluar.")],
  """  const d=Number(i.diaCiclo)||14;
  let fase='', e='', p='';
  if(d<=5){fase='Menstrual';e='Bajo (30-80 pg/mL)';p='Bajo (<1 ng/mL)'}
  else if(d<13){fase='Folicular';e='Subiendo (80-300)';p='Bajo (<1)'}
  else if(d<=16){fase='Ovulatoria';e='Pico (200-400)';p='Subiendo (1-3)'}
  else if(d<=28){fase='Lútea';e='Medio (100-250)';p='Pico (5-20) día 21'}
  else {fase='Fuera de ciclo';e='N/A';p='N/A'}
  return { fase:fase, estrogenoEsperado:e, progesteronaEsperada:p };""")

M("fsh-lh-menopausia-perimenopausia-edad", "salud", "🕐", "FSH LH menopausia",
  "Niveles FSH y LH: menopausia vs perimenopausia.",
  "tabla hormonal",
  [("fsh","FSH (UI/L)","number",25),("lh","LH (UI/L)","number",20),("edad","Edad","number",50)],
  [("etapa","Etapa",None),("interpretacion","Interpretación",None),("recomendacion","Recomendación",None)],
  ["FSH 25, LH 20, 50 años","Perimenopausia"],"Tratamiento síntomas",
  [("¿FSH menopausia?",">25-30 UI/L sostenido indica menopausia."),
   ("¿LH?","Sube junto con FSH pero menos pronunciado."),
   ("¿Perimenopausia?","FSH fluctúa. Varios meses/años antes."),
   ("¿Síntomas?","Sofocos, sudores nocturnos, irregularidad, sequedad, cambios de humor."),
   ("¿Terapia hormonal?","Opción individual. Beneficios vs riesgos con ginecólogo."),
   ("¿Diagnosticar?","12 meses sin menstruación = menopausia."),
   ("¿Edad promedio?","45-55 años. Antes de 40 = prematura.")],
  """  const f=Number(i.fsh)||0; const l=Number(i.lh)||0; const e=Number(i.edad)||0;
  let etapa='', interp='', rec='';
  if(f>=30&&e>=45){etapa='Menopausia establecida';interp='FSH elevada sostenida';rec='Terapia síntomas si aplican'}
  else if(f>=15&&f<30){etapa='Perimenopausia';interp='Transición hormonal';rec='Control ginecológico, evaluar síntomas'}
  else if(f<10){etapa='Pre-menopausia normal';interp='Función ovárica normal';rec='Controles de rutina'}
  else {etapa='Variable';interp='Interpretación según contexto clínico';rec='Consultar ginecólogo'}
  return { etapa:etapa, interpretacion:interp, recomendacion:rec };""")

M("espermograma-valores-normales-oms-2021", "salud", "🔬", "Espermograma OMS",
  "Valores normales OMS de espermograma.",
  "criterios OMS 2021",
  [("concentracion","Concentración (M/mL)","number",16),("motilidad","Motilidad progresiva %","number",32),("morfologia","Morfología normal %","number",4),("volumen","Volumen (mL)","number",1.5)],
  [("diagnostico","Diagnóstico",None),("parametros","Parámetros fuera rango",None),("recomendacion","Recomendación",None)],
  ["Todos normales","Normal"],"Continuar búsqueda natural",
  [("¿OMS 2021?","Criterios: conc ≥16 M/mL, motilidad ≥30%, morfología ≥4%, volumen ≥1.4 mL."),
   ("¿Oligozoospermia?","Conc <16 M/mL."),
   ("¿Astenozoospermia?","Motilidad <30%."),
   ("¿Teratozoospermia?","Morfología <4%."),
   ("¿Azoospermia?","Ausencia completa. Buscar causa."),
   ("¿Repetir?","Sí, mínimo 2 muestras separadas por 2-3 meses."),
   ("¿Mejorar?","Abstinencia 3-5 días, dieta, no alcohol/tabaco, evitar calor.")],
  """  const c=Number(i.concentracion)||0; const m=Number(i.motilidad)||0; const mo=Number(i.morfologia)||0; const v=Number(i.volumen)||0;
  const probs=[];
  if(c<16) probs.push('Oligozoospermia');
  if(m<30) probs.push('Astenozoospermia');
  if(mo<4) probs.push('Teratozoospermia');
  if(v<1.4) probs.push('Hipospermia');
  const diag=probs.length===0?'Normal':probs.join(' + ');
  const rec=probs.length===0?'Continuar':'Repetir en 2-3 meses. Consultar urólogo.';
  return { diagnostico:diag, parametros:probs.length>0?probs.join(', '):'Todos en rango', recomendacion:rec };""")

M("rcp-compresiones-bls-cpr-ritmo", "salud", "❤️", "RCP compresiones BLS",
  "Frecuencia y profundidad de compresiones RCP.",
  "guías AHA 2020",
  [("edadVictima","Edad víctima","select",["adulto","nino_1_8","bebe_menor_1"])]  ,
  [("frecuencia","Frecuencia",None),("profundidad","Profundidad",None),("ratio","Ratio compresiones:ventilaciones",None)],
  ["Adulto","100-120/min"],"5-6 cm",
  [("¿Frecuencia?","100-120 compresiones/min (todos)."),
   ("¿Profundidad adulto?","5-6 cm (2-2.4 pulgadas)."),
   ("¿Niño?","1/3 del diámetro AP (~5 cm)."),
   ("¿Bebé?","4 cm (1.5 pulgadas)."),
   ("¿Ratio?","Adulto: 30:2. Niño/bebé solo rescatador: 30:2. Con 2 rescatadores: 15:2."),
   ("¿Canción?","'Stayin' Alive' (100-103 bpm) ayuda a mantener ritmo."),
   ("¿DEA?","Usar en cuanto esté disponible. Sigue instrucciones del equipo.")],
  """  const e=String(i.edadVictima||'adulto');
  const freq='100-120 compresiones/min';
  const prof={'adulto':'5-6 cm','nino_1_8':'~5 cm (1/3 profundidad tórax)','bebe_menor_1':'4 cm'}[e];
  const rat={'adulto':'30:2','nino_1_8':'30:2 (1 rescatador) / 15:2 (2)','bebe_menor_1':'30:2 (1) / 15:2 (2)'}[e];
  return { frecuencia:freq, profundidad:prof, ratio:rat };""")

M("choking-heimlich-edad-maniobra", "salud", "🆘", "Maniobra Heimlich",
  "Técnica según edad para atragantamiento.",
  "guías internacionales",
  [("edad","Edad","select",["adulto","nino","bebe_menor_1","embarazada_obeso"])]  ,
  [("tecnica","Técnica",None),("posicion","Posición",None),("cuidados","Cuidados especiales",None)],
  ["Adulto","Compresiones abdominales"],"Detrás de pie",
  [("¿Adulto?","Compresiones abdominales (Heimlich)."),
   ("¿Niño >1?","Similar a adulto, ajustar fuerza."),
   ("¿Bebé?","5 golpes espalda + 5 compresiones torácicas. Alternar."),
   ("¿Embarazada/obeso?","Compresiones torácicas (no abdominales)."),
   ("¿Consciente?","Aplicar técnica."),
   ("¿Inconsciente?","RCP."),
   ("¿Después?","Revisar boca (no dedo a ciegas). Llamar 107/911.")],
  """  const e=String(i.edad||'adulto');
  const tec={'adulto':'Heimlich (compresiones abdominales)','nino':'Heimlich ajustado','bebe_menor_1':'5 golpes espalda + 5 compresiones torácicas','embarazada_obeso':'Compresiones torácicas'}[e];
  const pos={'adulto':'Detrás, puño entre ombligo y esternón','nino':'De rodillas detrás','bebe_menor_1':'Boca abajo sobre tu antebrazo','embarazada_obeso':'Detrás, manos sobre esternón'}[e];
  const cui={'adulto':'Si pierde conciencia: RCP','nino':'Fuerza moderada','bebe_menor_1':'Nunca compresiones abdominales','embarazada_obeso':'Nunca en abdomen'}[e];
  return { tecnica:tec, posicion:pos, cuidados:cui };""")

M("epinefrina-dosis-peso-anafilaxia", "salud", "💉", "Epinefrina anafilaxia",
  "Dosis de epinefrina IM por peso.",
  "0.01 mg/kg max 0.5 mg",
  [("pesoKg","Peso (kg)","number",25)],
  [("dosisMg","Dosis mg",None),("dispositivo","Dispositivo sugerido",None),("advertencia","Advertencia",None)],
  ["25 kg","0.25 mg"],"EpiPen Jr 0.15 mg",
  [("¿Qué es?","Epinefrina (adrenalina) — tratamiento inicial anafilaxia."),
   ("¿Dosis?","0.01 mg/kg IM, max 0.5 mg adulto. 0.3 mg lo habitual."),
   ("¿Dónde inyectar?","Cara externa muslo (vasto lateral), a través de ropa si hace falta."),
   ("¿Repetir?","Cada 5-15 min si no mejora. Hasta llegada ambulancia."),
   ("¿EpiPen vs Jr?","Jr 0.15 mg (10-30 kg). Adulto 0.3 mg (>30 kg)."),
   ("¿Después?","Siempre ir a hospital. Reacción bifásica posible 4-12 h después."),
   ("¿Tener en casa?","Si hay antecedente de anafilaxia, prescripción médica obligatoria.")],
  """  const p=Number(i.pesoKg)||0;
  const d=Math.min(p*0.01,0.5);
  const disp=p<10?'No disponible EpiPen — pediatra':p<30?'EpiPen Jr (0.15 mg)':'EpiPen (0.3 mg)';
  return { dosisMg:`${d.toFixed(2)} mg IM`, dispositivo:disp, advertencia:'Siempre llamar 107/911 post-administración. Reacción bifásica posible.' };""")

M("saturacion-oxigeno-spo2-altitud-normal", "salud", "🫁", "SpO2 saturación oxígeno",
  "Saturación normal según altitud.",
  "tabla SpO2 altitud",
  [("spo2","SpO2 (%)","number",97),("altitudMetros","Altitud (m)","number",600)],
  [("clasificacion","Clasificación",None),("interpretacion","Interpretación",None),("recomendacion","Recomendación",None)],
  ["97% a 600m","Normal"],"Rango óptimo",
  [("¿SpO2 normal?","95-100% a nivel del mar."),
   ("¿Altitud?","90-94% puede ser normal a 2500-3500m."),
   ("¿<90%?","Hipoxia significativa. Buscar atención."),
   ("¿Oxímetro casero?","Práctico pero no infalible. Valores extremos = consulta."),
   ("¿Cuándo preocuparse?","<90% sostenido, dificultad respiratoria, cianosis."),
   ("¿Post-COVID?","Chequear con ejercicio leve. Caída importante = evaluar."),
   ("¿Altitud máxima SIN oxígeno extra?","Depende de aclimatación. Generalmente hasta 5500m.")],
  """  const s=Number(i.spo2)||0; const a=Number(i.altitudMetros)||0;
  let normalMin=95;
  if(a>3500) normalMin=88; else if(a>2500) normalMin=90; else if(a>1500) normalMin=93;
  let clas='', interp='', rec='';
  if(s>=normalMin&&s<=100){clas='Normal';interp=`Dentro de rango para altitud ${a}m`;rec='OK'}
  else if(s>=normalMin-5){clas='Leve hipoxia';interp='Puede necesitar atención';rec='Consulta si persiste o síntomas'}
  else {clas='Hipoxia significativa';interp='<90% o equivalente';rec='Consulta médica inmediata'}
  return { clasificacion:clas, interpretacion:interp, recomendacion:rec };""")

M("gfr-filtrado-glomerular-ckd-epi", "salud", "🩸", "GFR filtrado glomerular",
  "Filtrado glomerular (CKD-EPI) para evaluar función renal.",
  "CKD-EPI 2021",
  [("creatinina","Creatinina sérica mg/dL","number",1),("edad","Edad","number",45),("sexo","Sexo","select",["hombre","mujer"])]  ,
  [("gfr","GFR (mL/min/1.73m²)",None),("etapa","Etapa ERC",None),("recomendacion","Recomendación",None)],
  ["1 mg/dL, 45 años H","~90"],"Normal",
  [("¿GFR?","Glomerular Filtration Rate. Mejor marcador función renal."),
   ("¿Normal?",">90 mL/min/1.73m²."),
   ("¿Etapas?","G1:≥90, G2:60-89, G3a:45-59, G3b:30-44, G4:15-29, G5:<15."),
   ("¿Por qué baja?","Edad, diabetes, HTA, medicamentos, enfermedad renal."),
   ("¿CKD-EPI 2021?","Nueva fórmula sin variable racial (publicada 2021)."),
   ("¿Cuándo repetir?","Cada 3-6 meses si hay factores de riesgo."),
   ("¿Dieta?","Control proteínas, sodio, potasio según etapa.")],
  """  const c=Number(i.creatinina)||0; const e=Number(i.edad)||0; const sx=String(i.sexo||'hombre');
  const k=sx==='hombre'?0.9:0.7; const a=sx==='hombre'?-0.302:-0.241;
  const min=Math.min(c/k,1); const max=Math.max(c/k,1);
  const gfr=142*Math.pow(min,a)*Math.pow(max,-1.200)*Math.pow(0.9938,e)*(sx==='mujer'?1.012:1);
  let etapa='', rec='';
  if(gfr>=90){etapa='G1 Normal';rec='Controles anuales'}
  else if(gfr>=60){etapa='G2 Leve';rec='Identificar causa, controlar'}
  else if(gfr>=45){etapa='G3a Moderada';rec='Nefrólogo'}
  else if(gfr>=30){etapa='G3b Moderada-severa';rec='Nefrólogo activo'}
  else if(gfr>=15){etapa='G4 Severa';rec='Preparar terapia renal'}
  else {etapa='G5 Falla renal';rec='Diálisis o trasplante'}
  return { gfr:`${Math.round(gfr)} mL/min/1.73m²`, etapa:etapa, recomendacion:rec };""")

M("calcio-dieta-diaria-osteoporosis-mujer", "salud", "🦴", "Calcio diario osteoporosis",
  "Requerimiento diario de calcio por edad/sexo.",
  "RDA calcio",
  [("edad","Edad","number",50),("sexo","Sexo","select",["hombre","mujer"]),("embarazada","Embarazada","select",["no","si"])]  ,
  [("rda","RDA calcio/día",None),("recomendacion","Recomendación",None),("fuentes","Fuentes principales",None)],
  ["50 mujer no","1200 mg"],"Lácteos + sardinas",
  [("¿RDA?","Mujeres 51+: 1200 mg. Adultos 19-50: 1000 mg. Embarazadas: 1000-1300."),
   ("¿Déficit?","Causa osteoporosis. Sintomático en avanzado."),
   ("¿Fuentes?","Lácteos (250 mL leche = 300 mg). Sardinas enteras. Vegetales verdes."),
   ("¿Suplemento?","Si dieta insuficiente. Mejor carbonato con comida."),
   ("¿Vitamina D?","Necesaria para absorción. Sol 15 min/día o suplemento."),
   ("¿Máximo?","2000-2500 mg/día. Más: riesgo cálculos renales, calcificación."),
   ("¿Menopausia?","Aumenta riesgo osteoporosis. Densitometría cada 2 años >50.")],
  """  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer'); const emb=String(i.embarazada||'no');
  let rda=1000;
  if(emb==='si') rda=1300;
  else if(e<19) rda=1300;
  else if(e>50&&sx==='mujer') rda=1200;
  else if(e>70) rda=1200;
  return { rda:`${rda} mg/día`, recomendacion:`Mujer ${e} años: ${rda} mg/día. 2-3 porciones lácteos + vegetales verdes cubren.`, fuentes:'Lácteos (300 mg/taza), sardinas, brócoli, almendras, semillas chía.' };""")

M("hierro-ferritina-anemia-diagnostico", "salud", "🩸", "Hierro ferritina anemia",
  "Valores hierro y ferritina por sexo/edad.",
  "rangos laboratorio",
  [("hemoglobina","Hemoglobina g/dL","number",12),("ferritina","Ferritina ng/mL","number",30),("sexo","Sexo","select",["hombre","mujer"])]  ,
  [("anemia","Anemia",None),("reservasHierro","Reservas hierro",None),("tratamiento","Tratamiento sugerido",None)],
  ["Hb 12, ferritina 30","Sin anemia"],"Reservas OK",
  [("¿Anemia?","Hb <13 hombre, <12 mujer, <11 embarazada."),
   ("¿Ferritina?","Reservas de hierro. <30 ng/mL = bajas."),
   ("¿Déficit?","Ferritina <15: deficiencia. Hemoglobina normal no excluye."),
   ("¿Suplementación?","Hierro oral 60-120 mg/día con vitamina C."),
   ("¿Absorción?","Mejor ayunas. Peor con café/té/lácteos."),
   ("¿Causas?","Dieta, menstruación abundante, embarazo, cirugía, sangrado GI."),
   ("¿Control?","Mensual inicial. Puede llevar 3-6 meses reponer.")],
  """  const h=Number(i.hemoglobina)||0; const f=Number(i.ferritina)||0; const sx=String(i.sexo||'mujer');
  const minHb=sx==='hombre'?13:12;
  const anemia=h<minHb?'Sí':'No';
  const reserv=f<15?'Muy bajas (deficiencia)':f<30?'Bajas':f<300?'Normales':'Altas';
  const trat=f<30?'Suplementar hierro oral + vitamina C. Control en 3 meses.':'No indicado por datos aportados.';
  return { anemia:anemia, reservasHierro:reserv, tratamiento:trat };""")

M("vitamina-b12-dosis-vegano-mensual", "salud", "💊", "Vitamina B12 vegano",
  "Dosis B12 recomendada para veganos.",
  "guidelines VRG",
  [("frecuencia","Frecuencia suplemento","select",["diaria","semanal","mensual"])],
  [("dosis","Dosis recomendada",None),("forma","Forma mejor absorbida",None),("control","Control",None)],
  ["Diaria","25-100 mcg"],"Cianocobalamina",
  [("¿Por qué B12?","No está en vegetales. Obligatorio suplementar si vegano/vegetariano estricto."),
   ("¿Dosis?","Diaria: 25-100 mcg. Semanal: 2000 mcg. Mensual: no recomendado."),
   ("¿Forma?","Cianocobalamina es la más estable y barata."),
   ("¿Metilcobalamina?","Activa pero menos estable. No necesariamente mejor."),
   ("¿Test?","B12 sérica + holotranscobalamina + ácido metilmalónico."),
   ("¿Déficit?","Fatiga, hormigueos, anemia megaloblástica, deterioro neurológico."),
   ("¿Cuándo comenzar?","Desde el primer día de dieta vegana.")],
  """  const f=String(i.frecuencia||'diaria');
  const d={'diaria':'25-100 mcg','semanal':'2000 mcg','mensual':'No recomendado (usar diaria/semanal)'}[f];
  return { dosis:d, forma:'Cianocobalamina (estable y económica)', control:'Nivel sérico + ácido metilmalónico cada 6-12 meses' };""")

M("magnesio-dosis-deficiencia-sintomas", "salud", "⚡", "Magnesio dosis",
  "Dosis magnesio diaria por edad/sexo.",
  "RDA magnesio",
  [("edad","Edad","number",35),("sexo","Sexo","select",["hombre","mujer"])]  ,
  [("rda","RDA magnesio/día",None),("mejorForma","Mejor forma","text"),("fuentes","Fuentes",None)],
  ["35 mujer","320 mg"],"Glicinato",
  [("¿RDA?","Hombre: 400-420 mg. Mujer: 310-320 mg. Embarazo: 350-400 mg."),
   ("¿Déficit?","Calambres, fatiga, insomnio, palpitaciones, migrañas."),
   ("¿Causas?","Dieta pobre, alcohol, diarrea, diuréticos, estrés."),
   ("¿Formas?","Glicinato (absorción), citrato (laxante suave), óxido (barato, menos bioasimilable)."),
   ("¿Suplementar?","Si dieta insuficiente o síntomas. 200-400 mg/día."),
   ("¿Máximo?","350 mg de suplemento (dieta no tiene tope)."),
   ("¿Interacción?","Reduce absorción antibióticos/tiroideas. Separar 2-4 horas.")],
  """  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer');
  let rda=sx==='hombre'?(e>30?420:400):(e>30?320:310);
  return { rda:`${rda} mg/día`, mejorForma:'Glicinato o citrato (mejor absorción que óxido)', fuentes:'Chocolate 70%+, almendras, semillas calabaza, espinacas, palta, legumbres.' };""")

M("zinc-dosis-inmunidad-hombre-mujer-edad", "salud", "💪", "Zinc dosis inmunidad",
  "Zinc por edad/sexo.",
  "RDA zinc",
  [("sexo","Sexo","select",["hombre","mujer"]),("objetivo","Objetivo","select",["mantenimiento","inmunidad","resfrio","embarazo"])]  ,
  [("dosis","Dosis/día",None),("forma","Forma",None),("advertencia","Advertencia",None)],
  ["Hombre mantenimiento","11 mg"],"Picolinato",
  [("¿Por qué zinc?","Inmunidad, cicatrización, testosterona, sabor/olfato."),
   ("¿RDA?","H: 11 mg. M: 8 mg. Embarazo: 11-13 mg."),
   ("¿Resfrío?","30-75 mg primeros días puede acortar duración."),
   ("¿Forma?","Picolinato, gluconato, citrato > óxido."),
   ("¿Con qué?","Mejor con comida. Evitar con café/tanino."),
   ("¿Máximo?","40 mg/día largo plazo. Altas dosis deprimen cobre."),
   ("¿Fuentes?","Carne roja, ostras, semillas calabaza, legumbres.")],
  """  const sx=String(i.sexo||'hombre'); const o=String(i.objetivo||'mantenimiento');
  let d=sx==='hombre'?11:8;
  if(o==='inmunidad') d=15;
  else if(o==='resfrio') d=50;
  else if(o==='embarazo') d=12;
  return { dosis:`${d} mg/día`, forma:'Picolinato o gluconato', advertencia:o==='resfrio'?'Solo uso corto (5-7 días). Tomar con comida.':'No exceder 40 mg/día largo plazo.' };""")

M("electrolitos-atleta-sudor-reposicion", "salud", "💧", "Electrolitos atleta",
  "Reposición electrolitos durante ejercicio largo.",
  "mg por hora de ejercicio",
  [("pesoKg","Peso kg","number",70),("horasEjercicio","Horas","number",2),("temperaturaC","Temp °C","number",25),("intensidad","Intensidad","select",["baja","media","alta"])]  ,
  [("sodio","Sodio recomendado",None),("potasio","Potasio",None),("liquidos","Líquidos",None)],
  ["70 kg 2h 25°","~1500 mg Na"],"1.5 L agua",
  [("¿Por qué?","Sudor pierde electrolitos. No reponer = hiponatremia o calambres."),
   ("¿Sodio?","400-800 mg/hora en ejercicio prolongado/calor."),
   ("¿Potasio?","200-400 mg/hora."),
   ("¿Agua?","500-750 mL/hora. Depende intensidad y clima."),
   ("¿Bebidas deportivas?","Gatorade/Powerade ~450 mg Na/L. Insuficiente en ultras."),
   ("¿Sal?","Pizca en botella si hay pérdida alta. LMNT, Liquid IV tienen más electrolitos."),
   ("¿Hiponatremia?","Náuseas, desorientación, convulsiones. Emergencia.")],
  """  const p=Number(i.pesoKg)||0; const h=Number(i.horasEjercicio)||1; const t=Number(i.temperaturaC)||20; const i_=String(i.intensidad||'media');
  let naPorHora=500; if(t>30) naPorHora+=200; if(i_==='alta') naPorHora+=200; if(i_==='baja') naPorHora-=150;
  const naTot=naPorHora*h;
  const k=naPorHora*0.4*h;
  const liq=750*h;
  return { sodio:`${Math.round(naTot)} mg (${Math.round(naPorHora)} mg/h)`, potasio:`${Math.round(k)} mg`, liquidos:`${liq} mL (~${(liq/1000).toFixed(1)} L)` };""")

M("hidratacion-clima-caluroso-actividad-diaria", "salud", "🌡️", "Hidratación clima cálido",
  "Agua diaria según clima y actividad.",
  "fórmula 35 mL/kg + ajustes",
  [("pesoKg","Peso kg","number",70),("temperaturaC","Temp °C","number",30),("actividadMin","Min ejercicio/día","number",30)],
  [("litrosDia","Litros/día",None),("vasos","Vasos 250 mL",None),("recordatorio","Recordatorio",None)],
  ["70 kg 30° 30min","3.2 L"],"13 vasos",
  [("¿Fórmula base?","35 mL × kg = base diaria."),
   ("¿Calor?","+15% por cada 5°C sobre 25°C."),
   ("¿Ejercicio?","+500 mL por cada 30 min actividad moderada."),
   ("¿Deshidratación?","Pérdida 2% peso corporal ya afecta performance."),
   ("¿Signo?","Orina amarillo claro = OK. Oscura = deshidratado."),
   ("¿Cafeína?","Efecto diurético leve, no deshidratante. Cuenta en total."),
   ("¿Niños?","~1L + 10 kg, hasta ~2L adulto.")],
  """  const p=Number(i.pesoKg)||0; const t=Number(i.temperaturaC)||20; const a=Number(i.actividadMin)||0;
  let ml=p*35;
  if(t>25) ml*=1+(t-25)/5*0.15;
  ml+=a*17;
  const L=ml/1000; const v=Math.round(ml/250);
  return { litrosDia:`${L.toFixed(1)} L`, vasos:`${v} vasos`, recordatorio:`Divide en 8 tomas. Mañana 500 mL, cada hora ${Math.round(ml/16)} mL.` };""")

M("masa-grasa-vs-masa-magra-composicion", "salud", "⚖️", "Masa grasa vs magra",
  "Composición corporal: % grasa y masa magra.",
  "MM = peso × (1 - %grasa/100)",
  [("pesoKg","Peso total kg","number",75),("porcentajeGrasa","% grasa","number",20)],
  [("masaGrasa","Masa grasa",None),("masaMagra","Masa magra",None),("clasificacion","Clasificación",None)],
  ["75 kg 20%","15 kg grasa"],"60 kg magra",
  [("¿% grasa ideal?","Hombres: 10-20%. Mujeres: 18-28%."),
   ("¿Medición?","Bioimpedancia (Tanita), DEXA (oro), pliegues cutáneos."),
   ("¿Masa magra?","Incluye músculo, hueso, agua, órganos."),
   ("¿Perder grasa?","Déficit 300-500 kcal/día. Cardio + fuerza."),
   ("¿Ganar masa?","Superávit 200-400 kcal, proteína 1.6-2.2 g/kg."),
   ("¿Mujer grasa?","Necesaria para menstruación. <14% crítico."),
   ("¿Hombres?","<6% no saludable sostenido.")],
  """  const p=Number(i.pesoKg)||0; const g=Number(i.porcentajeGrasa)||0;
  const mg=p*g/100; const mm=p-mg;
  let clas='';
  if(g<10) clas='Muy bajo (atlético o riesgo)';
  else if(g<20) clas='Bajo/Óptimo hombre';
  else if(g<25) clas='Normal';
  else if(g<30) clas='Sobrepeso graso';
  else clas='Obesidad';
  return { masaGrasa:`${mg.toFixed(1)} kg`, masaMagra:`${mm.toFixed(1)} kg`, clasificacion:clas };""")

M("melatonina-dosis-sueno-edad", "salud", "🌙", "Melatonina dosis sueño",
  "Dosis melatonina para insomnio por edad.",
  "0.3-5 mg según caso",
  [("edad","Edad","number",40),("problema","Problema","select",["conciliar","mantener","jetlag","turnos"])]  ,
  [("dosis","Dosis",None),("momento","Momento tomar",None),("advertencia","Advertencia",None)],
  ["40 conciliar","0.5-1 mg"],"30 min antes",
  [("¿Qué es?","Hormona que regula ciclo circadiano. No es sedante."),
   ("¿Dosis?","0.3-5 mg. Más NO es mejor. 0.5 mg puede ser tan eficaz como 5 mg."),
   ("¿Cuándo tomar?","30-60 min antes de querer dormir."),
   ("¿Para?","Jetlag, trabajos por turnos, insomnio circadiano."),
   ("¿Efectos secundarios?","Cefalea, somnolencia diurna, sueños vívidos."),
   ("¿Niños?","Solo con prescripción médica."),
   ("¿Dependencia?","Sin tolerancia/dependencia reportada. Largo plazo: datos limitados.")],
  """  const e=Number(i.edad)||0; const p=String(i.problema||'conciliar');
  const d={'conciliar':'0.5-1 mg','mantener':'0.3-0.5 mg liberación sostenida','jetlag':'3-5 mg solo primeras noches','turnos':'1-3 mg antes del sueño programado'}[p];
  const m={'conciliar':'30-60 min antes de dormir','mantener':'Al acostarse','jetlag':'Hora destino 9 pm','turnos':'Antes del sueño'}[p];
  return { dosis:d, momento:m, advertencia:'Empezá con menor dosis. Consulta médica si usás >2-4 semanas.' };""")

M("cafeina-dosis-segura-diaria-peso", "salud", "☕", "Cafeína dosis segura",
  "Cafeína máxima diaria según peso.",
  "FDA 400 mg, máx 6 mg/kg",
  [("pesoKg","Peso kg","number",70),("embarazada","Embarazada","select",["no","si"])]  ,
  [("maximoDiario","Máximo diario",None),("equivalencia","Equivalencia",None),("recomendacion","Recomendación",None)],
  ["70 kg no","400 mg"],"4 cafés",
  [("¿Máximo adultos?","FDA: 400 mg/día (4 tazas café)."),
   ("¿Embarazo?","<200 mg/día (1 café)."),
   ("¿Niños?","Evitar. Adolescentes: <100 mg."),
   ("¿6 mg/kg?","Guideline alternativo para atletas."),
   ("¿Síntomas exceso?","Taquicardia, ansiedad, insomnio, dolor cabeza."),
   ("¿Efecto ergogénico?","3-6 mg/kg 30-60 min antes mejora rendimiento."),
   ("¿Fuentes ocultas?","Té verde 30 mg, chocolate 10-30 mg, medicamentos.")],
  """  const p=Number(i.pesoKg)||0; const emb=String(i.embarazada||'no');
  let max=Math.min(400,p*6);
  if(emb==='si') max=200;
  return { maximoDiario:`${Math.round(max)} mg`, equivalencia:`~${Math.round(max/95)} tazas café (95 mg/taza)`, recomendacion:emb==='si'?'Embarazo: máx 200 mg. Ideal <100 mg.':'400 mg = límite FDA. Menos si problemas sueño/ansiedad.' };""")

M("creatina-carga-mantenimiento-peso", "salud", "💪", "Creatina carga y mantenimiento",
  "Protocolo creatina: fase carga y mantenimiento.",
  "0.3 g/kg carga, 3-5 g mantiene",
  [("pesoKg","Peso kg","number",75),("fase","Fase","select",["carga","mantenimiento","sin_carga"])]  ,
  [("dosis","Dosis",None),("duracion","Duración",None),("momento","Momento",None)],
  ["75 kg carga","22.5 g"],"5 días",
  [("¿Monohidrato?","Forma más estudiada, barata, efectiva."),
   ("¿Fase carga?","0.3 g/kg × 5-7 días. Saturación muscular rápida."),
   ("¿Mantenimiento?","3-5 g/día indefinido."),
   ("¿Sin carga?","Omitir carga, tomar 5 g/día. Saturación en 3-4 semanas."),
   ("¿Cuándo?","Pre o post-entrenamiento no cambia. Cualquier momento."),
   ("¿Con qué?","Agua o bebida con carbs facilita absorción. No obligatorio."),
   ("¿Mujeres?","Misma dosis. Sin efecto masculinizante."),
   ("¿Efectos?","+5-15% fuerza, 1-2 kg masa magra en semanas.")],
  """  const p=Number(i.pesoKg)||0; const f=String(i.fase||'mantenimiento');
  let d='', dur='', mom='';
  if(f==='carga'){d=`${(p*0.3).toFixed(1)} g/día`;dur='5-7 días';mom='4 tomas iguales con comida'}
  else if(f==='mantenimiento'){d='3-5 g/día';dur='Indefinido';mom='Cualquier momento, con o sin comida'}
  else {d='5 g/día';dur='Desde día 1 (saturación 3-4 semanas)';mom='Cualquier momento'}
  return { dosis:d, duracion:dur, momento:mom };""")

# ============================================================
# FITNESS AVANZADO (15)
# ============================================================

M("rpe-rir-series-entrenamiento-porcentaje", "salud", "🏋️", "RPE RIR entrenamiento",
  "Relación RPE, RIR y % 1RM.",
  "RPE 10 = 1RM, RIR repeticiones en reserva",
  [("repeticiones","Reps hechas","number",5),("rpe","RPE (6-10)","number",8)]  ,
  [("rir","RIR estimado",None),("porcentaje1rm","% 1RM aprox",None),("interpretacion","Interpretación",None)],
  ["5 reps RPE 8","RIR 2"],"~87% 1RM",
  [("¿RPE?","Rate of Perceived Exertion (6-10). 10 = no podrías hacer otra."),
   ("¿RIR?","Reps in Reserve. 10 - RPE = RIR."),
   ("¿Para qué?","Autorregular intensidad. Más flexible que porcentajes."),
   ("¿Hipertrofia?","RPE 7-9 (RIR 1-3) en la mayoría de series."),
   ("¿Fuerza?","RPE 8-10 en pocas series (1-5 reps)."),
   ("¿Novatos?","Subestiman. Meta RPE 7 real suele ser RPE 5."),
   ("¿Auto-reg?","Día malo: bajar peso hasta el mismo RPE.")],
  """  const r=Number(i.repeticiones)||0; const rpe=Number(i.rpe)||8;
  const rir=10-rpe;
  const pctMap:Record<string,number>={'1_10':100,'1_9':96,'2_10':95,'2_9':92,'3_10':92,'3_9':89,'5_10':87,'5_9':84,'5_8':81,'8_10':80,'8_8':74,'10_9':71,'10_8':68};
  const key=`${r}_${rpe}`; const pct=pctMap[key]||(rpe/10*100-r*2);
  return { rir:`${rir} (reps en reserva)`, porcentaje1rm:`~${Math.round(pct)}%`, interpretacion:`${r} reps @ RPE ${rpe}: te quedaban ${rir} reps, ~${Math.round(pct)}% de tu 1RM.` };""")

M("volumen-semanal-hipertrofia-musculo-series", "salud", "💪", "Volumen semanal hipertrofia",
  "Series semanales por grupo muscular.",
  "guidelines Schoenfeld",
  [("nivel","Nivel","select",["principiante","intermedio","avanzado"]),("grupoMuscular","Grupo","select",["pectoral","espalda","pierna","hombro","biceps","triceps"])]  ,
  [("seriesMinimas","Series mínimas",None),("seriesOptimas","Series óptimas",None),("seriesMaximas","Máximo tolerable",None)],
  ["Intermedio pecho","10"],"15 óptimas",
  [("¿Volumen?","Series efectivas cercanas al fallo."),
   ("¿Principiante?","10-12 series/grupo/semana."),
   ("¿Intermedio?","12-18 series."),
   ("¿Avanzado?","16-22 series."),
   ("¿Distribución?","2-3 sesiones por grupo/semana."),
   ("¿Más es mejor?","Hasta cierto punto. MRV (max recoverable volume) varía."),
   ("¿Deload?","Cada 4-8 semanas bajar 40% volumen.")],
  """  const n=String(i.nivel||'intermedio'); const g=String(i.grupoMuscular||'pectoral');
  const base={'principiante':[8,10,14],'intermedio':[12,16,20],'avanzado':[16,20,24]}[n];
  const mod={'pierna':+2,'espalda':+1}[g]||0;
  return { seriesMinimas:`${base[0]+mod} series/semana`, seriesOptimas:`${base[1]+mod} series/semana`, seriesMaximas:`${base[2]+mod} (máximo antes sobreentrenamiento)` };""")

M("macros-recomp-cut-bulk-lean-calorias", "salud", "🍳", "Macros recomp/cut/bulk",
  "Distribución macros según objetivo.",
  "calorías y % macros",
  [("objetivo","Objetivo","select",["recomp","cut","lean_bulk","bulk"]),("tmb","TMB kcal","number",2000)]  ,
  [("calorias","Calorías diarias",None),("proteina","Proteína g",None),("carbos","Carbohidratos g",None),("grasa","Grasa g",None)],
  ["Recomp TMB 2000","2000 kcal"],"P 150g C 200g G 70g",
  [("¿Recomp?","Perder grasa + ganar músculo simultáneamente. Cercano a TMB."),
   ("¿Cut?","Déficit 15-25%. Pierde grasa rápido."),
   ("¿Lean bulk?","Superávit 10-15%. Gana masa limpia."),
   ("¿Bulk?","Superávit 20%+. Gana músculo + grasa."),
   ("¿Proteína?","1.6-2.2 g/kg en todos los casos."),
   ("¿Grasa?","Mínimo 0.6-1 g/kg."),
   ("¿Carbos?","Relleno de calorías restantes.")],
  """  const o=String(i.objetivo||'recomp'); const tmb=Number(i.tmb)||2000;
  const mult={'cut':0.80,'recomp':1.0,'lean_bulk':1.12,'bulk':1.22}[o];
  const cal=tmb*mult;
  const prot=Math.round(cal*0.3/4);
  const gra=Math.round(cal*0.25/9);
  const car=Math.round((cal-prot*4-gra*9)/4);
  return { calorias:`${Math.round(cal)} kcal`, proteina:`${prot} g`, carbos:`${car} g`, grasa:`${gra} g` };""")

M("padel-ranking-puntos-apt-aap-subir", "deportes", "🎾", "Ranking pádel puntos",
  "Puntos necesarios para subir categoría APT/AAP.",
  "tabla puntos por nivel",
  [("categoriaActual","Categoría","select",["septima","sexta","quinta","cuarta","tercera","segunda","primera"])]  ,
  [("puntosSubir","Puntos para subir",None),("torneosMinimos","Torneos mínimos",None),("observacion","Observación",None)],
  ["Sexta","~500 puntos"],"8-10 torneos",
  [("¿Categorías APT?","Primera a Octava. Primera más alta."),
   ("¿Puntos?","Ganador ~200 pts, finalista ~150, semis ~80."),
   ("¿Confirmar?","Ranking confirmado publicado mensualmente."),
   ("¿Sumatoria?","Mejores 10 resultados del año."),
   ("¿Master?","Torneo final con top jugadores del año."),
   ("¿Descender?","Menos torneos o perder puntos por malos resultados."),
   ("¿AAP vs APT?","AAP: Asociación Argentina de Pádel. APT: mundial/circuito.")],
  """  const c=String(i.categoriaActual||'sexta');
  const pts={'septima':300,'sexta':500,'quinta':800,'cuarta':1200,'tercera':1800,'segunda':2500,'primera':3500}[c];
  const tor={'septima':6,'sexta':8,'quinta':10,'cuarta':12,'tercera':14,'segunda':16,'primera':20}[c];
  return { puntosSubir:`${pts} puntos`, torneosMinimos:`${tor}+ torneos al año`, observacion:'Sumatoria mejores 10 resultados.' };""")

M("elo-ajedrez-ganado-perdido-variacion", "educacion", "♟️", "ELO ajedrez variación",
  "Cambio de ELO tras una partida.",
  "ΔELO = K × (resultado - expectativa)",
  [("eloActual","ELO actual","number",1500),("eloOponente","ELO oponente","number",1600),("resultado","Resultado","select",["gane","tabla","perdi"]),("kFactor","Factor K","number",20)]  ,
  [("nuevoElo","Nuevo ELO",None),("variacion","Variación",None),("expectativa","Expectativa",None)],
  ["1500 vs 1600 ganó","+16"],"Nuevo 1516",
  [("¿Sistema ELO?","Creado por Arpad Elo. Estándar internacional."),
   ("¿K factor?","Volatilidad: 40 novatos, 20 estándar, 10 títulos altos."),
   ("¿Expectativa?","Probabilidad de ganar basada en diferencia ELO."),
   ("¿Ganar a mejor?","Más puntos que ganar a peor."),
   ("¿FIDE?","Organismo internacional mantiene ratings oficiales."),
   ("¿Online?","Chess.com y Lichess usan sistemas Glicko-2 (similar)."),
   ("¿Títulos?","GM 2500+, IM 2400+, MF 2300+, CM 2200+.")],
  """  const ea=Number(i.eloActual)||0; const eo=Number(i.eloOponente)||0; const r=String(i.resultado||'gane'); const k=Number(i.kFactor)||20;
  const exp=1/(1+Math.pow(10,(eo-ea)/400));
  const resNum={'gane':1,'tabla':0.5,'perdi':0}[r];
  const delta=k*(resNum-exp);
  const nuevo=ea+delta;
  return { nuevoElo:`${Math.round(nuevo)}`, variacion:`${delta>=0?'+':''}${Math.round(delta)}`, expectativa:`${(exp*100).toFixed(0)}% de ganar` };""")

M("spf-proteccion-solar-minutos-piel", "salud", "☀️", "SPF protección solar",
  "Tiempo de protección según SPF y piel.",
  "tiempo base × SPF",
  [("tipoPiel","Tipo piel (I-VI)","select",["I","II","III","IV","V","VI"]),("spf","SPF","number",50)],
  [("minutosProteccion","Minutos protección teórica",None),("reaplicar","Reaplicar cada",None),("advertencia","Advertencia",None)],
  ["Piel III SPF 50","500 min"],"Reaplicar 2 h",
  [("¿Fototipo?","Clasificación piel I (muy clara) a VI (muy oscura)."),
   ("¿SPF 30?","Bloquea 97%. SPF 50: 98%. Diferencia pequeña."),
   ("¿Tiempo piel tipo II?","~10 min sin protección. Con SPF 30 = 300 min teóricos."),
   ("¿Reaplicar?","Cada 2 horas. Después de nadar/sudar."),
   ("¿Cantidad?","2 mg/cm². ~30 mL cuerpo completo."),
   ("¿UVA?","Buscar '+++' o 'broad spectrum' además de SPF (UVB)."),
   ("¿Nublado?","UV pasa nubes. Usar igual.")],
  """  const p=String(i.tipoPiel||'III'); const spf=Number(i.spf)||30;
  const baseMin={'I':7,'II':10,'III':15,'IV':20,'V':30,'VI':60}[p];
  const min=baseMin*spf;
  return { minutosProteccion:`${min} min teóricos (${Math.round(min/60)} h)`, reaplicar:'Cada 2 horas (independiente SPF)', advertencia:'Tiempo teórico. Real es menor por sudor, agua, fricción.' };""")

M("watts-ciclismo-ftp-umbral-test", "deportes", "🚴", "FTP ciclismo umbral",
  "Zonas de entrenamiento según FTP (Functional Threshold Power).",
  "zonas Coggan 1-7",
  [("ftp","FTP (watts)","number",250)],
  [("zona1","Z1 Recuperación",None),("zona2","Z2 Endurance",None),("zona3","Z3 Tempo",None),("zona4","Z4 Umbral",None)],
  ["FTP 250W","Z1 <138W"],"Z2 138-188W",
  [("¿FTP?","Watts sostenibles 1 hora. Punto de referencia."),
   ("¿Test?","20 min all-out × 0.95, o ramp test."),
   ("¿Z1?","<55% FTP. Recuperación."),
   ("¿Z2?","55-75%. Endurance (mayoría kms)."),
   ("¿Z3?","75-90%. Tempo."),
   ("¿Z4?","90-105%. Umbral / Sweet spot 88-94%."),
   ("¿Z5?","105-120%. VO2max. Intervalos 3-8 min."),
   ("¿Z6?",">120%. Capacidad anaeróbica.")],
  """  const f=Number(i.ftp)||0;
  return { zona1:`<${Math.round(f*0.55)} W`, zona2:`${Math.round(f*0.55)}-${Math.round(f*0.75)} W`, zona3:`${Math.round(f*0.75)}-${Math.round(f*0.90)} W`, zona4:`${Math.round(f*0.90)}-${Math.round(f*1.05)} W (umbral)` };""")

M("pace-natacion-100m-ritmo", "deportes", "🏊", "Pace natación 100m",
  "Ritmo por 100m según tiempo objetivo.",
  "tiempo total / distancia × 100",
  [("distanciaM","Distancia m","number",1500),("tiempoMinutos","Tiempo total min","number",25)],
  [("pace","Pace por 100m",None),("velocidadMs","Velocidad m/s",None),("clasificacion","Clasificación",None)],
  ["1500m 25 min","1:40/100m"],"Intermedio",
  [("¿Pace?","Tiempo por cada 100m. Referencia para planificar."),
   ("¿Masters?","1:30-1:45/100m pace decent."),
   ("¿Principiante?","2:00-2:30/100m."),
   ("¿Elite?","<1:00/100m en 1500m."),
   ("¿Intervalos?","Series 100m × 10 a pace objetivo -5s."),
   ("¿Ironman?","~1:40-2:00/100m para 3.8 km."),
   ("¿Tiempo 1 km?","Multiplicá pace × 10.")],
  """  const d=Number(i.distanciaM)||0; const t=Number(i.tiempoMinutos)||0;
  const paceSegPor100=d>0?(t*60/d*100):0;
  const min=Math.floor(paceSegPor100/60); const seg=Math.round(paceSegPor100%60);
  const v=d/(t*60);
  let clas='';
  if(paceSegPor100<65) clas='Elite';
  else if(paceSegPor100<90) clas='Avanzado';
  else if(paceSegPor100<120) clas='Intermedio';
  else clas='Principiante';
  return { pace:`${min}:${String(seg).padStart(2,'0')}/100m`, velocidadMs:`${v.toFixed(2)} m/s`, clasificacion:clas };""")

M("crossfit-fran-benchmark-tiempo-rx", "deportes", "🏋️", "CrossFit Fran benchmark",
  "Tiempos Fran y benchmarks WOD.",
  "thrusters + pull-ups",
  [("tiempoSegundos","Tu tiempo Fran (segundos)","number",300)],
  [("nivel","Nivel",None),("referencia","Referencia",None),("objetivoMejora","Objetivo mejora",None)],
  ["300s (5 min)","Intermedio"],"Elite <2:30",
  [("¿Fran?","21-15-9 thrusters 95lb + pull-ups."),
   ("¿Elite?","<2:30."),
   ("¿Bueno?","3:00-4:00."),
   ("¿Promedio?","5:00-7:00."),
   ("¿Principiante?",">8:00 o scaled."),
   ("¿Scaled?","65lb thrusters, jumping pull-ups."),
   ("¿Otros?","Cindy (20 min AMRAP), Murph (1 mi run + 100 PU + 200 push-up + 300 squat + 1 mi run).")],
  """  const s=Number(i.tiempoSegundos)||0;
  let n='', ref='';
  if(s<150){n='Elite';ref='<2:30'}
  else if(s<240){n='Avanzado';ref='<4:00'}
  else if(s<360){n='Intermedio';ref='<6:00'}
  else if(s<480){n='Principiante';ref='6-8 min'}
  else {n='Iniciando';ref='>8 min'}
  return { nivel:n, referencia:ref, objetivoMejora:`Objetivo: bajar 30 segundos en 3 meses con entrenamiento estructurado.` };""")

M("boxeo-calorias-quemadas-rounds-peso", "deportes", "🥊", "Boxeo calorías",
  "Calorías quemadas en sesión de boxeo.",
  "MET × peso × tiempo",
  [("pesoKg","Peso kg","number",75),("tipo","Tipo","select",["sombra","bolsa","sparring","kickboxing"]),("minutos","Minutos","number",45)]  ,
  [("caloriasQuemadas","Calorías",None),("mets","MET",None),("interpretacion","Interpretación",None)],
  ["75 kg sparring 45 min","~560 kcal"],"MET 12",
  [("¿MET?","Metabolic equivalents. 1 MET = reposo."),
   ("¿Sombra?","MET 6. Moderado."),
   ("¿Bolsa?","MET 9. Alto."),
   ("¿Sparring?","MET 12. Muy alto."),
   ("¿Kickboxing?","MET 10."),
   ("¿Hora de boxeo?","500-800 kcal promedio."),
   ("¿Comparación?","Similar a running 10 min/mi.")],
  """  const p=Number(i.pesoKg)||0; const t=String(i.tipo||'bolsa'); const m=Number(i.minutos)||0;
  const met={'sombra':6,'bolsa':9,'sparring':12,'kickboxing':10}[t];
  const cal=met*p*m/60;
  return { caloriasQuemadas:`${Math.round(cal)} kcal`, mets:`MET ${met}`, interpretacion:`${m} min de ${t}: ${Math.round(cal)} kcal.` };""")

M("yoga-calorias-estilo-vinyasa-hatha", "salud", "🧘", "Calorías yoga",
  "Calorías por estilo de yoga.",
  "MET por estilo",
  [("estilo","Estilo","select",["hatha","vinyasa","ashtanga","bikram","yin"]),("pesoKg","Peso kg","number",65),("minutos","Minutos","number",60)]  ,
  [("caloriasQuemadas","Calorías",None),("beneficio","Beneficio principal",None),("intensidad","Intensidad",None)],
  ["Vinyasa 65 kg 60 min","~300 kcal"],"Flow moderado",
  [("¿Hatha?","Posturas clásicas. MET 2.5. ~165 kcal/h/65kg."),
   ("¿Vinyasa?","Flow. MET 3-5."),
   ("¿Ashtanga?","Estricto series. MET 4."),
   ("¿Bikram?","Calor 40°C. MET 5-6."),
   ("¿Yin?","Pasivo largo. MET 2."),
   ("¿Power yoga?","MET 6-7."),
   ("¿Beneficios?","Flexibilidad, fuerza, estrés, respiración.")],
  """  const e=String(i.estilo||'vinyasa'); const p=Number(i.pesoKg)||0; const m=Number(i.minutos)||0;
  const met={'hatha':2.5,'vinyasa':4,'ashtanga':4.5,'bikram':5,'yin':2}[e];
  const cal=met*p*m/60;
  const ben={'hatha':'Flexibilidad + calma','vinyasa':'Cardio suave + fuerza','ashtanga':'Disciplina + fuerza','bikram':'Detox + flexibilidad','yin':'Relajación profunda'}[e];
  return { caloriasQuemadas:`${Math.round(cal)} kcal`, beneficio:ben, intensidad:met>3?'Moderada-Alta':'Suave' };""")

M("pilates-reformer-frecuencia-ideal-semana", "salud", "🧘", "Pilates frecuencia ideal",
  "Frecuencia semanal de pilates según objetivo.",
  "guideline frecuencia",
  [("objetivo","Objetivo","select",["mantenimiento","tonificar","postura","lesion","postparto"])]  ,
  [("frecuencia","Frecuencia semanal",None),("sesionMin","Duración sesión",None),("resultados","Resultados esperados",None)],
  ["Tonificar","3-4/semana"],"45-60 min",
  [("¿Ideal?","3x/semana para resultados. 2x mantiene."),
   ("¿Reformer vs mat?","Reformer tiene resistencia progresiva. Mat más accesible."),
   ("¿Tiempo resultados?","8-12 sesiones para notar cambios."),
   ("¿Postura?","2x/semana con foco en core."),
   ("¿Lesiones?","Con aprobación kinesiólogo. 2-3x/semana inicial."),
   ("¿Postparto?","Desde 6-8 semanas. Progresivo."),
   ("¿Combinar?","Con cardio y fuerza para programa completo.")],
  """  const o=String(i.objetivo||'tonificar');
  const f={'mantenimiento':'2x/semana','tonificar':'3-4x/semana','postura':'2-3x/semana','lesion':'2-3x/semana (con profesional)','postparto':'2x/semana (desde semana 6-8)'}[o];
  const s={'mantenimiento':'45-60 min','tonificar':'60 min','postura':'30-45 min','lesion':'30-45 min','postparto':'30-45 min'}[o];
  const r={'mantenimiento':'Conservar','tonificar':'Tono en 8-12 sesiones','postura':'Alineación en 4-6 semanas','lesion':'Recuperación progresiva','postparto':'Recuperación core'}[o];
  return { frecuencia:f, sesionMin:s, resultados:r };""")

M("maraton-pace-goal-time-split-kilometro", "deportes", "🏃", "Pace maratón objetivo",
  "Pace por km para tiempo objetivo maratón.",
  "tiempo total / 42.195",
  [("tiempoHoras","Tiempo objetivo (hh.mm decimal)","number",4)],
  [("pacePorKm","Pace/km",None),("paceMilla","Pace/milla",None),("media","Paso media maratón",None)],
  ["4 horas","5:41/km"],"9:09/mi",
  [("¿Maratón?","42.195 km."),
   ("¿Sub-4?","5:41/km. Logro bueno."),
   ("¿Sub-3:30?","4:58/km. Avanzado."),
   ("¿Sub-3?","4:16/km. Elite amateur."),
   ("¿Negative split?","Segunda mitad más rápida. Estrategia pro."),
   ("¿Entrenamiento?","Long runs hasta 30-35 km. 16-20 semanas plan."),
   ("¿Carbs durante?","30-60 g/hora. Geles + bebida deportiva.")],
  """  const h=Number(i.tiempoHoras)||0;
  const totSeg=h*3600;
  const paceSeg=totSeg/42.195;
  const pMin=Math.floor(paceSeg/60); const pSeg=Math.round(paceSeg%60);
  const paceMi=paceSeg*1.609;
  const mMin=Math.floor(paceMi/60); const mSeg=Math.round(paceMi%60);
  const half=totSeg/2;
  const hh=Math.floor(half/3600); const hm=Math.floor((half%3600)/60); const hs=Math.round(half%60);
  return { pacePorKm:`${pMin}:${String(pSeg).padStart(2,'0')}/km`, paceMilla:`${mMin}:${String(mSeg).padStart(2,'0')}/mi`, media:`${hh}:${String(hm).padStart(2,'0')}:${String(hs).padStart(2,'0')}` };""")

M("trail-running-desnivel-ritmo-ajustado", "deportes", "⛰️", "Trail running desnivel",
  "Ajuste de ritmo por desnivel en trail.",
  "tiempo ajustado = tiempo plano + desnivel×segundos",
  [("distanciaKm","Distancia km","number",20),("desnivelPositivo","Desnivel + m","number",1000),("paceBaseKm","Pace base min/km","number",6)]  ,
  [("tiempoAjustado","Tiempo ajustado",None),("ritmoEfectivo","Ritmo efectivo",None),("interpretacion","Interpretación",None)],
  ["20 km +1000m pace 6","~2:40"],"Ritmo 8:00/km efectivo",
  [("¿Cómo ajustar?","10 seg/km por cada 10m de desnivel positivo."),
   ("¿Downhill?","Bajadas también suman (-5 seg/km por 10m)."),
   ("¿Elevation gain?","Total subida del recorrido."),
   ("¿Karnaz?","Tiempo estimado = tiempo plano × (1 + desnivel/100m)."),
   ("¿Técnica?","Caminar subidas empinadas es legal y eficiente."),
   ("¿Entrenamiento?","Stairs, hill repeats, estabilidad."),
   ("¿Equipamiento?","Zapatillas trail, bastones en ultras, chaqueta impermeable.")],
  """  const d=Number(i.distanciaKm)||0; const des=Number(i.desnivelPositivo)||0; const p=Number(i.paceBaseKm)||6;
  const paceSeg=p*60; const ajuste=des/d; // segundos/km adicionales por m de desnivel por km
  const paceAjustado=paceSeg+ajuste*10;
  const totSeg=paceAjustado*d;
  const h=Math.floor(totSeg/3600); const m=Math.floor((totSeg%3600)/60); const s=Math.round(totSeg%60);
  const pMin=Math.floor(paceAjustado/60); const pSeg=Math.round(paceAjustado%60);
  return { tiempoAjustado:`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, ritmoEfectivo:`${pMin}:${String(pSeg).padStart(2,'0')}/km`, interpretacion:`${d} km con +${des}m desnivel: tiempo estimado ${h}h ${m}m.` };""")

M("rugby-handicap-puntos-descenso-promedio", "deportes", "🏉", "Rugby handicap puntos",
  "Puntos promedio y descenso por temporada.",
  "promedio = puntos/partidos",
  [("puntosGanados","Puntos ganados","number",35),("partidosJugados","Partidos","number",15)]  ,
  [("promedio","Promedio puntos/partido",None),("clasificacion","Clasificación esperada",None),("riesgoDescenso","Riesgo descenso",None)],
  ["35 pts 15 partidos","2.33"],"Salvación,",
  [("¿Sistema?","Rugby AR URBA usa puntos bonus por try y diferencia."),
   ("¿Victoria?","4 puntos + bonus try (1)."),
   ("¿Derrota?","0 + bonus <7 diferencia (1)."),
   ("¿Empate?","2 cada uno."),
   ("¿Descenso?","Últimos 2 en tabla van a promoción/descenso."),
   ("¿Promedio reglamentario?","Muchas divisiones usan combinación año actual + año anterior."),
   ("¿Copa de Oro/Plata?","URBA divide mitad superior/inferior de temporada regular.")],
  """  const p=Number(i.puntosGanados)||0; const pj=Number(i.partidosJugados)||1;
  const prom=p/pj;
  let clas='', riesgo='';
  if(prom>=3){clas='Clasifica Copa de Oro';riesgo='Nulo'}
  else if(prom>=2.2){clas='Salvación cómoda';riesgo='Bajo'}
  else if(prom>=1.8){clas='Zona de riesgo';riesgo='Medio'}
  else {clas='Descenso probable';riesgo='Alto'}
  return { promedio:`${prom.toFixed(2)}`, clasificacion:clas, riesgoDescenso:riesgo };""")

# ============================================================
# VIDA DIARIA parcial (10 de 25 acá; resto en P3)
# ============================================================

M("expensas-consorcio-distribucion-proporcional-m2", "vida", "🏢", "Expensas consorcio",
  "Distribución proporcional de expensas.",
  "total × (m² tuyos / m² totales)",
  [("totalExpensa","Total expensas del mes $","number",10000000),("m2UnidadTuya","m² tu unidad","number",60),("m2Edificio","m² totales edificio","number",3000)]  ,
  [("tuExpensa","Tu expensa",None),("porcentaje","Porcentaje",None),("interpretacion","Interpretación",None)],
  ["$10M total, 60/3000 m²","$200.000"],"2% del total",
  [("¿Prorrateo?","Proporcional a superficie, por reglamento copropiedad."),
   ("¿PH?","Propiedad Horizontal (Ley 13.512 previa, nueva 14.394)."),
   ("¿Ordinaria vs extraordinaria?","Ordinaria: gastos comunes mensuales. Extraordinaria: obra puntual."),
   ("¿Quién decide?","Asamblea ordinaria anual o extraordinaria."),
   ("¿Fondo de reserva?","Obligatorio. 5-10% de expensas típicamente."),
   ("¿Intereses mora?","Sí, establecidos en reglamento o CCyC."),
   ("¿Inquilino o propietario?","Expensas ordinarias = inquilino (si contrato). Extraordinarias = propietario.")],
  """  const t=Number(i.totalExpensa)||0; const m=Number(i.m2UnidadTuya)||0; const me=Number(i.m2Edificio)||1;
  const pct=m/me; const tu=t*pct;
  return { tuExpensa:`$${Math.round(tu).toLocaleString('es-AR')}`, porcentaje:`${(pct*100).toFixed(2)}%`, interpretacion:`Tu unidad (${m} m²) paga el ${(pct*100).toFixed(1)}% de $${(t/1000).toFixed(0)}k = $${Math.round(tu).toLocaleString('es-AR')}.` };""")

M("abl-caba-valuacion-fiscal-actualizada-2026", "vida", "🏠", "ABL CABA 2026",
  "Alumbrado, Barrido y Limpieza CABA.",
  "valuación × alícuota",
  [("valuacionFiscal","Valuación fiscal $","number",30000000),("unicaVivienda","Única vivienda","select",["si","no"])]  ,
  [("ablAnual","ABL anual",None),("ablMensual","ABL mensual",None),("descuento","Descuento aplicado",None)],
  ["$30M única","$350k anual"],"Mensual ~$29k",
  [("¿ABL?","Impuesto municipal CABA. Servicios urbanos."),
   ("¿Alícuota?","Progresiva según valor. 0.6% a 1.2% aprox."),
   ("¿Única vivienda?","20% descuento si cumple requisitos (no otras propiedades)."),
   ("¿Jubilados?","Descuentos adicionales según ingreso."),
   ("¿Pago anual?","Suele tener descuento 10% por pago total."),
   ("¿Moratoria?","Planes de pago cuando hay deuda."),
   ("¿Valuación?","AGIP. Se actualiza anualmente. Menor que valor de mercado.")],
  """  const v=Number(i.valuacionFiscal)||0; const u=String(i.unicaVivienda||'no');
  let aliq=0.006;
  if(v>50000000) aliq=0.008;
  if(v>100000000) aliq=0.01;
  if(v>200000000) aliq=0.012;
  const descuento=u==='si'?0.8:1;
  const anual=v*aliq*descuento;
  return { ablAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, ablMensual:`$${Math.round(anual/12).toLocaleString('es-AR')}`, descuento:u==='si'?'20% única vivienda aplicado':'Sin descuento' };""")

M("servicios-hogar-luz-gas-agua-mensual-estimado", "vida", "💡", "Servicios hogar mensual",
  "Estimación de luz + gas + agua mensual.",
  "consumo × tarifa",
  [("kwhMes","kWh/mes","number",300),("m3GasMes","m³ gas/mes","number",80),("m3AguaMes","m³ agua/mes","number",20),("tarifaKwh","$/kWh","number",120),("tarifaGas","$/m³","number",150),("tarifaAgua","$/m³","number",200)]  ,
  [("totalServicios","Total servicios",None),("luz","Luz",None),("gas","Gas",None),("agua","Agua",None)],
  ["300 kWh + 80 m³ gas + 20 m³","~$55k"],"$36k luz + $12k gas + $4k agua",
  [("¿Consumo AR?","Familia 4 personas: ~300-500 kWh, 50-100 m³ gas, 15-30 m³ agua."),
   ("¿Tarifa social?","Según ingresos, hasta 50% descuento."),
   ("¿Cargos fijos?","Además del consumo: cargo comercialización, impuestos."),
   ("¿Ahorrar?","LED, electrodomésticos A+, aislación, ducha corta."),
   ("¿Invierno vs verano?","Invierno: gas triplica. Verano: electricidad por AC."),
   ("¿Segmentación?","N1-N2-N3 según ingresos. Afecta precio/kWh."),
   ("¿Consumo nulo?","Aún pagás cargo fijo.")],
  """  const k=Number(i.kwhMes)||0; const g=Number(i.m3GasMes)||0; const a=Number(i.m3AguaMes)||0;
  const tk=Number(i.tarifaKwh)||0; const tg=Number(i.tarifaGas)||0; const ta=Number(i.tarifaAgua)||0;
  const luz=k*tk*1.21; const gas=g*tg*1.21; const agua=a*ta*1.21;
  const tot=luz+gas+agua;
  return { totalServicios:`$${Math.round(tot).toLocaleString('es-AR')}`, luz:`$${Math.round(luz).toLocaleString('es-AR')}`, gas:`$${Math.round(gas).toLocaleString('es-AR')}`, agua:`$${Math.round(agua).toLocaleString('es-AR')}` };""")

M("mudanza-precio-kilometros-m3-cuadro", "vida", "📦", "Mudanza precio",
  "Costo de mudanza según distancia y volumen.",
  "costo fijo + km × $ + m³ × $",
  [("kilometros","Km","number",50),("m3Carga","m³ carga","number",15),("piso","Piso","select",["planta_baja","1_2","3_5","6_mas"])],
  [("costoEstimado","Costo estimado",None),("desglose","Desglose","text"),("consejos","Consejos",None)],
  ["50 km 15 m³ piso 2","~$650k"],"Incluye armado",
  [("¿Fletes CABA?","$300k-500k base (5-10 m³ corta distancia)."),
   ("¿Mudanza completa?","$500k-2M según volumen y distancia."),
   ("¿Seguro?","Empresa debe incluir seguro de traslado."),
   ("¿Fin de mes?","Más caro por alta demanda."),
   ("¿Autoembalaje?","Ahorrás 20-30%."),
   ("¿Piso alto sin ascensor?","Adicional 10-15% por piso."),
   ("¿Cotizar?","Pedí 3 presupuestos por escrito.")],
  """  const k=Number(i.kilometros)||0; const m=Number(i.m3Carga)||0; const p=String(i.piso||'planta_baja');
  const base=350000; const porKm=2500; const porM3=20000;
  const multPiso={'planta_baja':1,'1_2':1.05,'3_5':1.12,'6_mas':1.2}[p];
  const tot=(base+k*porKm+m*porM3)*multPiso;
  return { costoEstimado:`$${Math.round(tot).toLocaleString('es-AR')}`, desglose:`Base $${base.toLocaleString('es-AR')} + ${k} km × $${porKm.toLocaleString('es-AR')} + ${m} m³ × $${porM3.toLocaleString('es-AR')} ${p!=='planta_baja'?`+ recargo piso ${((multPiso-1)*100).toFixed(0)}%`:''}`, consejos:'Pedí 3 presupuestos. Cotizá con seguro incluido.' };""")

M("internet-fibra-cable-modem-comparativa-mbps", "vida", "🌐", "Internet fibra vs cable",
  "Comparativa fibra óptica vs cablemodem.",
  "velocidad y estabilidad",
  [("mbps","Mbps que necesitás","number",300),("hogarHabitantes","Habitantes","number",3),("gamingStreaming","Gaming/streaming","select",["no","si"])],
  [("recomendacion","Recomendación",None),("mbpsMinimos","Mbps mínimos",None),("observacion","Observación",None)],
  ["300 Mbps 3 personas si","Fibra 500"],"Mejor latencia",
  [("¿Fibra?","Más rápida, estable, menor latencia. Recomendable si disponible."),
   ("¿Cablemodem?","Velocidad similar descarga, menor subida. Latencia +. Compartido."),
   ("¿ADSL?","Obsoleto. Evitar si hay otra opción."),
   ("¿Mbps por persona?","Streaming HD: 5 Mbps. 4K: 25 Mbps."),
   ("¿Gaming?","Latencia <50ms ideal. Fibra es mejor."),
   ("¿Upload?","Importante para videollamadas, streaming, cloud."),
   ("¿Simétrica?","Fibra suele ser. Cable suele ser asimétrica.")],
  """  const m=Number(i.mbps)||100; const h=Number(i.hogarHabitantes)||1; const g=String(i.gamingStreaming||'no');
  const minimo=h*50+(g==='si'?100:0);
  const rec=m>=minimo?'Fibra óptica (mejor upload y latencia)':'Necesitás más Mbps: considerá 500-1000';
  return { recomendacion:rec, mbpsMinimos:`${minimo} Mbps`, observacion:'Fibra: misma velocidad descarga/subida. Cablemodem: subida ~10% descarga.' };""")

M("electricidad-tarifa-social-subsidio-n1-n2", "vida", "💡", "Tarifa social electricidad",
  "Descuento por segmentación N1/N2/N3.",
  "kWh consumo × tarifa segmento",
  [("kwhMes","kWh/mes","number",400),("segmentoTarifa","Segmento","select",["N1_altos","N2_bajos","N3_medios"]),("tarifaN1","$/kWh N1","number",180)],
  [("costoMensual","Costo mensual",None),("segmento","Tu segmento",None),("ahorroVsN1","Ahorro vs N1",None)],
  ["400 kWh N2","~$28k"],"Ahorro 62%",
  [("¿Segmentación?","N1 ingresos altos (sin subsidio), N2 bajos, N3 medios."),
   ("¿Inscribirse?","Registro RASE (Registro Acceso Subsidios Energía)."),
   ("¿Requisitos N2?","Ingreso hogar <4 SMVM, sin auto <5 años, sin 3+ inmuebles."),
   ("¿Topes?","N2-N3: hasta 400 kWh con precio subsidiado. Exceso = N1."),
   ("¿Invierno?","Mayor tope en zonas frías."),
   ("¿Perder subsidio?","Hay auditorías. Datos con AFIP, ANSES."),
   ("¿Gas también?","Sistema similar de segmentación.")],
  """  const k=Number(i.kwhMes)||0; const s=String(i.segmentoTarifa||'N1_altos'); const tn1=Number(i.tarifaN1)||180;
  const mult={'N1_altos':1,'N2_bajos':0.38,'N3_medios':0.65}[s];
  const costo=k*tn1*mult*1.21;
  const sin=k*tn1*1.21; const ahorro=sin-costo;
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, segmento:s.replace('_',' '), ahorroVsN1:mult<1?`$${Math.round(ahorro).toLocaleString('es-AR')} (${((1-mult)*100).toFixed(0)}%)`:'0 (sin subsidio)' };""")

M("gas-natural-subsidio-zonas-frias-patagonia", "vida", "🔥", "Subsidio gas zonas frías",
  "Subsidio gas en Patagonia y zonas frías.",
  "m³ × tarifa × descuento zona",
  [("m3Mes","m³/mes","number",150),("zona","Zona","select",["patagonia","cordillera","resto_sur","sin_subsidio"]),("tarifaBase","$/m³ base","number",200)],
  [("costoMensual","Costo mensual",None),("descuentoAplicado","Descuento",None),("interpretacion","Interpretación",None)],
  ["150 m³ Patagonia","~$12k"],"60% descuento",
  [("¿Zonas frías?","Patagonia, Puna, Zonas bioambientales VI."),
   ("¿Descuento?","Hasta 30-60% tarifa base."),
   ("¿Base legal?","Ley 27.637 Régimen Zona Fría."),
   ("¿Incluye?","Todas las provincias Patagonia + partes altas de otras."),
   ("¿Invierno?","Mayor consumo → más impacto el subsidio."),
   ("¿GNC?","Para autos en zonas fría, subsidio también."),
   ("¿Familia numerosa?","Topes mayores.")],
  """  const m=Number(i.m3Mes)||0; const z=String(i.zona||'sin_subsidio'); const tb=Number(i.tarifaBase)||200;
  const desc={'patagonia':0.6,'cordillera':0.5,'resto_sur':0.3,'sin_subsidio':0}[z];
  const costo=m*tb*(1-desc)*1.21;
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, descuentoAplicado:`${(desc*100).toFixed(0)}%`, interpretacion:`Zona ${z.replace('_',' ')}: pagás $${Math.round(costo).toLocaleString('es-AR')} (${(desc*100).toFixed(0)}% subsidio).` };""")

M("delivery-propina-porcentaje-app-sugerida", "vida", "🛵", "Propina delivery app",
  "Propina sugerida apps de delivery.",
  "monto × % sugerido",
  [("montoPedido","Monto del pedido $","number",5000),("distanciaKm","Distancia km","number",3),("lluvia","Lluvia/calor extremo","select",["no","si"])],
  [("propinaSugerida","Propina sugerida",None),("totalConPropina","Total con propina",None),("interpretacion","Interpretación",None)],
  ["$5000 3 km no","$500"],"10%",
  [("¿Cultura AR?","No obligatoria pero creciente en delivery."),
   ("¿Porcentaje?","5-10% estándar. 15%+ si clima extremo o lejos."),
   ("¿Apps?","Rappi, PedidosYa, Glovo sugieren al finalizar."),
   ("¿Al rider?","100% va a él (según app)."),
   ("¿Mínimo?","$300-500 estándar."),
   ("¿Cash vs app?","Cash directo al rider mejor."),
   ("¿EEUU?","15-20% cultura establecida.")],
  """  const m=Number(i.montoPedido)||0; const d=Number(i.distanciaKm)||0; const l=String(i.lluvia||'no');
  let pct=0.08;
  if(d>5) pct+=0.03;
  if(l==='si') pct+=0.05;
  const prop=Math.max(m*pct,300);
  const tot=m+prop;
  return { propinaSugerida:`$${Math.round(prop).toLocaleString('es-AR')} (${(pct*100).toFixed(0)}%)`, totalConPropina:`$${Math.round(tot).toLocaleString('es-AR')}`, interpretacion:l==='si'?'Clima extremo: propina ${(pct*100).toFixed(0)}% recomendada.':`Propina sugerida: ${(pct*100).toFixed(0)}% del pedido.` };""")

M("uber-didi-cabify-comparativa-ciudad", "vida", "🚗", "Uber vs DiDi vs Cabify",
  "Precio estimado apps de transporte.",
  "base + km × $ + min × $",
  [("distanciaKm","Km","number",10),("minutos","Minutos","number",20),("horaPico","Hora pico","select",["no","si"])],
  [("uber","Uber","currency"),("didi","DiDi","currency"),("cabify","Cabify","currency")],
  ["10 km 20 min no pico","~$8k Uber"],"DiDi suele ser más barato",
  [("¿Más barato?","DiDi generalmente el más barato en AR."),
   ("¿Cabify?","Apunta más alto: conductores profesionales."),
   ("¿Surge pricing?","Tarifa dinámica hora pico o alta demanda."),
   ("¿Pago?","Efectivo, tarjeta, MercadoPago, Apple/Google Pay."),
   ("¿Seguridad?","Todas tienen rastreo, compartir viaje."),
   ("¿Taxi vs app?","Taxi tarifa fija. App puede ser más barato o caro."),
   ("¿Propina?","Opcional en todas. Conductores aprecian.")],
  """  const k=Number(i.distanciaKm)||0; const m=Number(i.minutos)||0; const hp=String(i.horaPico||'no');
  const mult=hp==='si'?1.4:1;
  const uber=Math.round((500+k*350+m*25)*mult);
  const didi=Math.round(uber*0.85);
  const cabify=Math.round(uber*1.2);
  return { uber:uber, didi:didi, cabify:cabify };""")

M("subte-colectivo-sube-tarifa-2026-mensual", "vida", "🚇", "SUBE tarifa 2026",
  "Costo mensual SUBE colectivo + subte.",
  "viajes × tarifa + descuentos",
  [("viajesMensuales","Viajes al mes","number",40),("tarifaColectivo","Tarifa colectivo $","number",700),("tarifaSubte","Tarifa subte $","number",800)],
  [("costoMensual","Costo mensual",None),("tarifaSocial","Con tarifa social",None),("interpretacion","Interpretación",None)],
  ["40 viajes $700 col $800 sub","~$30k"],"Tarifa social 55% off",
  [("¿Tarifa social?","55% descuento para jubilados, pensionados, AUH, desempleados."),
   ("¿Combinaciones?","Descuento 50% 2do viaje dentro de 2h."),
   ("¿Abono mensual?","No existe, pero descuento progresivo por mes."),
   ("¿Estudiantes?","Descuento con boleto estudiantil."),
   ("¿Premetro?","Gratis para residentes CABA."),
   ("¿Red SUBE?","120+ empresas de transporte."),
   ("¿Boleto papel?","No existe más. SUBE obligatoria.")],
  """  const v=Number(i.viajesMensuales)||0; const tc=Number(i.tarifaColectivo)||0; const ts=Number(i.tarifaSubte)||0;
  const prom=(tc+ts)/2;
  const costo=v*prom;
  const social=costo*0.45;
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, tarifaSocial:`$${Math.round(social).toLocaleString('es-AR')}`, interpretacion:`${v} viajes × $${Math.round(prom).toLocaleString('es-AR')} promedio = $${Math.round(costo).toLocaleString('es-AR')}/mes. Con tarifa social: $${Math.round(social).toLocaleString('es-AR')}.` };""")
