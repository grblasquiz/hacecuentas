"""Batch 6 — Deportes (30 calcs)."""
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
    SPECS.append(spec(slug, "deportes", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


# Planes de running 5K/10K/21K/42K (4 calcs similares)
for dist, km, semanas_min in [("5k", 5, 6), ("10k", 10, 8), ("21k-semi-maraton", 21.1, 12), ("maraton-42k", 42.2, 16)]:
    M(f"plan-entrenamiento-{dist}-semanas", "🏃", f"Plan entrenamiento {dist.upper().replace('-', ' ')}",
      f"Plan de semanas según nivel para preparar {dist.upper()}.",
      f"Semanas = nivel × factor ({semanas_min}+ semanas mínimas)",
      [("nivel", "Nivel", "select", [("principiante", "Principiante"), ("intermedio", "Intermedio"), ("avanzado", "Avanzado")])],
      [("semanas", "Semanas", None), ("kmSemanaFinal", "Km/sem pico", None), ("resumen", "Interpretación", None)],
      [f"Nivel intermedio {dist}", f"{semanas_min + 2} semanas"], f"{semanas_min + 2} semanas",
      [("¿Por qué por nivel?", "Principiante necesita más volumen base y progresión cuidadosa."),
       ("¿Qué es bloque?", "Etapas: base aeróbica → fuerza → velocidad → tapering."),
       ("¿Tapering?", "Últimas 2-3 semanas con menos volumen para llegar fresco."),
       ("¿Días por semana?", "4-6 según nivel. 1-2 cross-training + 3-4 running."),
       ("¿Lesión?", "Regresar 2 semanas al volumen que toleraba sin dolor.")],
      f"""  const niveles: Record<string, number> = {{ principiante: 2, intermedio: 0, avanzado: -2 }};
  const base = {semanas_min}; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + {int(km * 4)};
  return {{ semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen: `Plan ${{String(i.nivel)}} {dist}: ${{total}} semanas, pico ${{kmPico}} km/sem.` }};""")

# Pace objetivo maratón
M("pace-objetivo-maraton-tiempo", "🏁", "Pace objetivo según tiempo maratón",
  "Convertí tiempo objetivo a pace (min/km).", "pace = tiempo / 42.195 km",
  [("horas", "Horas", "number", "3"), ("minutos", "Minutos", "number", "30")],
  [("paceMinKm", "Pace (min/km)", None), ("paceMinMi", "Pace (min/milla)", None), ("resumen", "Interpretación", None)],
  ["3h30min maratón", "210 min / 42.195 = 4:58 min/km"], "4:58 min/km (8:00 min/mi)",
  [("¿Pace realista?", "Elite <3h (4:15 pace). Bueno 3-3:30. Amateur 4-4:30."),
   ("¿Variación?", "Afecta terreno, temperatura, elevación, hidratación."),
   ("¿Negative split?", "Segunda mitad más rápida. Óptimo pero difícil."),
   ("¿Pace test?", "Media maratón × 2.1 = predicción maratón."),
   ("¿Viento/calor?", "Sumar 3-5 seg/km por 10°C sobre ideal 10-12°C.")],
  """  const h = Number(i.horas) || 0; const m = Number(i.minutos) || 0;
  const totalMin = h * 60 + m;
  const paceKm = totalMin / 42.195;
  const paceMi = totalMin / 26.22;
  const minKm = Math.floor(paceKm); const secKm = Math.round((paceKm - minKm) * 60);
  const minMi = Math.floor(paceMi); const secMi = Math.round((paceMi - minMi) * 60);
  return { paceMinKm: `${minKm}:${String(secKm).padStart(2, '0')}`, paceMinMi: `${minMi}:${String(secMi).padStart(2, '0')}`,
    resumen: `Maratón en ${h}h${m}min → pace ${minKm}:${String(secKm).padStart(2,'0')} min/km.` };""")

# Zonas FC
M("zonas-entrenamiento-fc-max", "❤️", "Zonas FC (5 zonas Karvonen)",
  "Calculá tus 5 zonas de FC según FC máx y reposo.", "Zona N = FCreposo + %(FCmax - FCreposo)",
  [("edad", "Edad (años)", "number", "30"), ("fcReposo", "FC reposo (bpm)", "number", "60")],
  [("fcMax", "FC máx", None), ("zonas", "Zonas 1-5", None), ("resumen", "Interpretación", None)],
  ["30 años, FC_reposo 60", "FC_max = 190", "Zonas: Z1 60-117, Z2 117-143, Z3 143-156, Z4 156-169, Z5 169-190"],
  "5 zonas calculadas",
  [("¿Karvonen vs %FCmax?", "Karvonen considera FC reposo. Más preciso."),
   ("¿FC máx real?", "Test máximo o 208 - 0.7×edad (más preciso que 220-edad)."),
   ("¿Zonas?", "Z1 recuperación, Z2 base aeróbica, Z3 ritmo, Z4 umbral, Z5 VO2max."),
   ("¿80/20?", "80% tiempo en Z1-Z2, 20% en Z4-Z5. Optimal training."),
   ("¿Variación diaria?", "Estrés, sueño, calor. No obsesionarse con bpm exacto.")],
  """  const e = Number(i.edad) || 30; const fr = Number(i.fcReposo) || 60;
  const fm = 208 - 0.7 * e;
  const reserve = fm - fr;
  const zona = (pct: number) => Math.round(fr + reserve * pct);
  const z1 = `${zona(0)}-${zona(0.6)}`; const z2 = `${zona(0.6)}-${zona(0.7)}`;
  const z3 = `${zona(0.7)}-${zona(0.8)}`; const z4 = `${zona(0.8)}-${zona(0.9)}`; const z5 = `${zona(0.9)}-${zona(1)}`;
  return { fcMax: fm.toFixed(0), zonas: `Z1 ${z1} | Z2 ${z2} | Z3 ${z3} | Z4 ${z4} | Z5 ${z5}`,
    resumen: `FC máx ${fm.toFixed(0)} bpm. Zonas por Karvonen: Z2 ${z2} (base aeróbica).` };""")

# FTP cycling
M("ftp-cycling-watts", "🚴", "FTP ciclismo (test 20 min)",
  "Calculá tu FTP a partir del test de 20 min.", "FTP = W_promedio_20min × 0.95",
  [("wattsPromedio20", "Watts promedio 20 min", "number", "280")],
  [("ftp", "FTP", None), ("wKg", "Watts/kg (indicá peso)", None), ("resumen", "Interpretación", None)],
  ["280 W en 20 min test", "FTP = 280 × 0.95 = 266 W"], "FTP 266 W",
  [("¿Qué es FTP?", "Functional Threshold Power — potencia máxima sostenible en 1 hora."),
   ("¿Por qué ×0.95?", "Ajuste porque 20 min es más corto y permite mantener watts más altos."),
   ("¿Niveles?", "Principiante <2 W/kg. Amateur 3. Avanzado 4. Elite >5."),
   ("¿Mejorar FTP?", "Sweet spot work (88-94% FTP) + VO2max intervals."),
   ("¿Cuándo retestear?", "Cada 6-8 semanas. Reposar bien antes del test.")],
  """  const w = Number(i.wattsPromedio20) || 0;
  const ftp = w * 0.95;
  return { ftp: ftp.toFixed(0) + ' W', wKg: '—', resumen: `FTP ≈ ${ftp.toFixed(0)} W. Potencia máxima sostenible 1 hora.` };""")

# Zonas potencia ciclismo
M("zonas-potencia-ciclismo-watts-kg", "🚵", "Zonas potencia ciclismo",
  "Zonas de potencia según FTP y peso (W/kg).", "Zona N = FTP × %",
  [("ftp", "FTP (W)", "number", "250"), ("peso", "Peso (kg)", "number", "70")],
  [("zonas", "Zonas 1-7", None), ("ftpWKg", "FTP W/kg", None), ("resumen", "Interpretación", None)],
  ["FTP 250, 70 kg", "W/kg = 3.57 (amateur avanzado)"],
  "7 zonas calculadas",
  [("¿7 zonas?", "Coggan modelo: Z1 activa, Z2 endurance, Z3 tempo, Z4 LT, Z5 VO2, Z6 anaerobic, Z7 neuromuscular."),
   ("¿Sweet spot?", "88-94% FTP. Mejor ratio fitness/fatiga."),
   ("¿Z4 vs Z5?", "Z4 sostenible 20-60min. Z5 1-8min (VO2max)."),
   ("¿Potenciómetro?", "Más preciso que HR. Útil 500-1500 USD."),
   ("¿Indoor vs outdoor?", "Watts misma escala. HR puede variar.")],
  """  const ftp = Number(i.ftp) || 0; const peso = Number(i.peso) || 70;
  const z = (p: number) => Math.round(ftp * p);
  const zonas = `Z1 <${z(0.55)} | Z2 ${z(0.55)}-${z(0.75)} | Z3 ${z(0.76)}-${z(0.9)} | Z4 ${z(0.91)}-${z(1.05)} | Z5 ${z(1.06)}-${z(1.2)} | Z6 >${z(1.2)}`;
  return { zonas, ftpWKg: (ftp/peso).toFixed(2) + ' W/kg', resumen: `FTP ${ftp}W = ${(ftp/peso).toFixed(1)} W/kg. Zonas Coggan calculadas.` };""")

# Critical Power
M("critical-power-cp", "⚡", "Critical Power (modelo 2 param)",
  "CP y W' desde dos esfuerzos (típico 3 min y 12 min).", "CP de 2 puntos",
  [("t1", "Tiempo 1 (s)", "number", "180"), ("p1", "Potencia 1 (W)", "number", "400"),
   ("t2", "Tiempo 2 (s)", "number", "720"), ("p2", "Potencia 2 (W)", "number", "320")],
  [("cp", "Critical Power", None), ("wPrime", "W' (reserva)", None), ("resumen", "Interpretación", None)],
  ["400W×180s, 320W×720s", "CP = 293 W, W' = 19280 J"], "CP 293 W, W' 19 kJ",
  [("¿CP vs FTP?", "CP más robusto matemáticamente. FTP práctico."),
   ("¿Qué es W'?", "Energía anaeróbica finita. Se agota en esfuerzos > CP."),
   ("¿Regenerar W'?", "Al estar por debajo de CP. Minutos (no horas)."),
   ("¿Uso práctico?", "Estrategia de carrera: gastar W' inteligentemente."),
   ("¿App que calcula?", "Golden Cheetah o WKO5.")],
  """  const t1 = Number(i.t1); const p1 = Number(i.p1);
  const t2 = Number(i.t2); const p2 = Number(i.p2);
  if (!t1 || !p1 || !t2 || !p2) throw new Error('Completá');
  const W = (p1 * t1 - p2 * t2) / (t1 - t2) * (t1 - t2) / (p1 - p2);
  const CP = (p1 * t1 - p2 * t2) / (t1 - t2);
  return { cp: CP.toFixed(0) + ' W', wPrime: (W * (p1 - p2) / (t1 - t2) * 1).toFixed(0) + ' J',
    resumen: `CP ≈ ${CP.toFixed(0)} W desde 2 puntos de esfuerzo máximo.` };""")

# Más deportes
for slug, h1, desc, fx, flds, outs, egs, egr, faqs, body in [
    ("vla-max-maximo-lactato-estado-estable", "Velocidad en MLSS (umbral lactato)",
     "Estimá velocidad en estado estable máximo de lactato (MLSS).", "MLSS ≈ FC_umbral pace",
     [("fcUmbral", "FC umbral (bpm)", "number", "165")],
     [("velocidad", "Velocidad estimada", None), ("resumen", "Int", None)],
     ["FC umbral 165", "Pace ~4:30 min/km"], "~4:30 min/km",
     [("¿MLSS?", "Máximo lactato estable. Zona 4 Coggan."),
      ("¿Lactato?", "<2 mmol/L base, 4+ umbral."),
      ("¿Cómo testear?", "Incremental hasta donde ritmo inestable."),
      ("¿Entrenar MLSS?", "Intervalos 20-40min a esa zona."),
      ("¿Mejora?", "VO2max + trabajo específico umbral.")],
     """  const fc = Number(i.fcUmbral) || 0;
  const pace = fc < 140 ? '5:30-6:00' : fc < 155 ? '5:00-5:30' : fc < 170 ? '4:30-5:00' : '4:00-4:30';
  return { velocidad: pace + ' min/km', resumen: `Pace estimado MLSS: ${pace} min/km (FC umbral ${fc}).` };"""),

    ("ritmo-ciclismo-watts-velocidad-aero", "Watts → velocidad en ciclismo plano",
     "Velocidad ciclista dado watts y aerodinámica.", "P = (ρ·CdA·v³/2) + (Crr·m·g·v)",
     [("watts", "Watts", "number", "200"), ("peso", "Peso total kg", "number", "80"),
      ("cda", "CdA (m²)", "number", "0.3"), ("crr", "Crr", "number", "0.004")],
     [("velocidad", "Velocidad", None), ("resumen", "Int", None)],
     ["200W, 80kg, CdA 0.3", "≈ 32 km/h"], "~32 km/h",
     [("¿Posición aero?", "Drops CdA ~0.3. TT pos CdA ~0.22. Urbano 0.5."),
      ("¿Rolling resistance?", "Crr clinchers 0.004-0.006. Tubulares < 0.003."),
      ("¿Viento?", "Aumenta o reduce velocidad efectiva directamente."),
      ("¿Pendiente?", "Agrega m·g·sin(θ) al equilibrio."),
      ("¿Pico velocidad?", "Esprint tipo 1000W brevemente: 55-60 km/h.")],
     """  const W = Number(i.watts) || 0; const m = Number(i.peso) || 80;
  const cda = Number(i.cda) || 0.3; const crr = Number(i.crr) || 0.004;
  let v = 10;
  for (let j = 0; j < 20; j++) { const p = (1.225 * cda * v*v*v / 2) + crr * m * 9.81 * v; v = v * Math.pow(W / p, 0.333); }
  return { velocidad: (v * 3.6).toFixed(1) + ' km/h', resumen: `${(v*3.6).toFixed(1)} km/h en plano con ${W}W (CdA=${cda}).` };"""),

    ("velocidad-natacion-pace-100m", "Pace natación /100m objetivo",
     "Pace natación según tiempo y distancia.", "pace = tiempo / (dist/100)",
     [("metros", "Metros", "number", "1500"), ("minutos", "Min", "number", "25"), ("segundos", "Seg", "number", "0")],
     [("paceMin100", "Pace /100m", None), ("resumen", "Int", None)],
     ["1500m en 25min", "1500/100 × (25/1500) = 1:40 /100m"], "1:40 /100m",
     [("¿Pace elite?", "1500 libre masculino <15min → <1:00/100m."),
      ("¿Aletas?", "Ayudan 5-10 seg/100m."),
      ("¿Estilo?", "Crawl más rápido. Pecho 30% más lento."),
      ("¿Splits?", "1eros 100m más rápido. Mid más constante."),
      ("¿Frecuencia?", "3-5×/sem recomendado para progreso.")],
     """  const m = Number(i.metros) || 100; const min = Number(i.minutos) || 0; const s = Number(i.segundos) || 0;
  const tSec = min * 60 + s;
  const paceSec = tSec / (m / 100);
  const mm = Math.floor(paceSec / 60); const ss = Math.round(paceSec % 60);
  return { paceMin100: `${mm}:${String(ss).padStart(2, '0')}`, resumen: `Pace ${mm}:${String(ss).padStart(2,'0')} por 100m.` };"""),

    ("swolf-natacion-indice", "SWOLF natación (eficiencia)",
     "Índice SWOLF = segundos + brazadas. Menor = más eficiente.", "SWOLF = tiempo_seg + brazadas",
     [("tiempo", "Tiempo 25m (seg)", "number", "25"), ("brazadas", "Brazadas", "number", "22")],
     [("swolf", "SWOLF", None), ("nivel", "Nivel", None), ("resumen", "Int", None)],
     ["25 seg + 22 brazadas", "SWOLF = 47"], "47 (avanzado)",
     [("¿SWOLF ideal?", "< 40 elite. 40-55 avanzado. 56-70 intermedio. > 70 principiante."),
      ("¿25m vs 50m?", "Misma fórmula. SWOLF 50m típicamente 10-20 más alto."),
      ("¿Ritmo vs distancia?", "Mejorá distancia por brazada primero."),
      ("¿Kicker vs pull?", "Kicker puro no cuenta brazadas. Pull sí."),
      ("¿App útil?", "Garmin/Apple Watch natación calculan automáticamente.")],
     """  const t = Number(i.tiempo) || 0; const b = Number(i.brazadas) || 0;
  const sw = t + b;
  const nivel = sw < 40 ? 'Elite' : sw < 56 ? 'Avanzado' : sw < 70 ? 'Intermedio' : 'Principiante';
  return { swolf: sw.toString(), nivel, resumen: `SWOLF ${sw} — ${nivel}. Mejorá bajando tiempo O brazadas.` };"""),

    ("tiempo-descanso-ejercicio-intensidad", "Tiempo descanso entre series",
     "Descanso según % 1RM y objetivo.", "Según intensidad",
     [("pct1RM", "% del 1RM", "number", "75"), ("objetivo", "Objetivo", "select", [("fuerza", "Fuerza"), ("hipertrofia", "Hipertrofia"), ("resistencia", "Resistencia")])],
     [("descanso", "Descanso recomendado", None), ("resumen", "Int", None)],
     ["75% 1RM hipertrofia", "60-90 seg"], "60-90 seg",
     [("¿Por qué importa?", "Determina recuperación de fosfocreatina y sistema nervioso."),
      ("¿Fuerza?", "3-5 min para max recovery."),
      ("¿Hipertrofia?", "60-90 seg para acumular fatiga metabólica."),
      ("¿Resistencia?", "15-60 seg. Alta fatiga."),
      ("¿Con reloj?", "Sí, respetar estricto ayuda consistencia.")],
     """  const obj = String(i.objetivo);
  const desc: Record<string, string> = { fuerza: '3-5 min', hipertrofia: '60-90 seg', resistencia: '15-60 seg' };
  return { descanso: desc[obj] || '2 min', resumen: `Descanso: ${desc[obj]} para objetivo ${obj}.` };"""),

    ("frecuencia-entrenamiento-grupo-muscular", "Frecuencia semanal por grupo",
     "Veces/semana por grupo muscular según nivel/objetivo.", "MRV/MEV Israetel",
     [("nivel", "Nivel", "select", [("principiante", "Principiante"), ("intermedio", "Intermedio"), ("avanzado", "Avanzado")])],
     [("frecuencia", "Frecuencia por grupo", None), ("resumen", "Int", None)],
     ["Intermedio", "2-3 veces/semana"], "2-3×/sem",
     [("¿Principiante?", "Full body 3x. Todo cada sesión."),
      ("¿Intermedio?", "Upper/lower o split. 2x/grupo."),
      ("¿Avanzado?", "3-4x. Ondular cargas."),
      ("¿Sobreentrenamiento?", "> MRV. Drop en performance, sueño, ganas."),
      ("¿Mínimo?", "1x/sem mantiene. <1 pierde ganancia.")],
     """  const niv: Record<string, string> = { principiante: '3 (full body)', intermedio: '2-3 por grupo', avanzado: '3-4 por grupo' };
  const n = String(i.nivel);
  return { frecuencia: niv[n] || '2x', resumen: `Frecuencia: ${niv[n]} para nivel ${n}.` };"""),
]:
    M(slug, "💪", h1, desc, fx, flds, outs, egs, egr, faqs, body)

# 1RM para varios ejercicios
for slug, h1, desc in [
    ("1rm-peso-muerto-estimador", "1RM peso muerto (estimador)", "1RM peso muerto por Epley."),
    ("1rm-press-banca-estimador", "1RM press banca", "1RM bench press por Brzycki."),
    ("1rm-sentadilla-estimador", "1RM sentadilla", "1RM back squat por Epley.")]:
    M(slug, "🏋️", h1, desc, "1RM = peso × (1 + reps/30)",
      [("peso", "Peso (kg)", "number", "80"), ("reps", "Repeticiones", "number", "5")],
      [("rm1", "1RM", None), ("resumen", "Int", None)],
      ["80kg × 5 reps", "1RM = 80 × (1+5/30) = 93.3 kg"], "93 kg",
      [("¿Fórmula Epley?", "1RM = peso × (1 + reps/30). Más reps = menos preciso."),
       ("¿Test directo?", "Test 1RM real da el número exacto pero es riesgoso."),
       ("¿Validez?", "Fórmula precisa en 1-10 reps. >10 subestima."),
       ("¿Cómo mejorar?", "Progresión lineal + volumen moderado."),
       ("¿Warmup?", "Pirámide ascendente con descansos cortos.")],
      """  const p = Number(i.peso) || 0; const r = Number(i.reps) || 1;
  const rm = p * (1 + r / 30);
  return { rm1: rm.toFixed(1) + ' kg', resumen: `1RM estimado: ${rm.toFixed(0)} kg desde ${p}kg × ${r} reps.` };""")

# Volumen semanal MRV MEV
M("volumen-semanal-series-grupo-muscular", "📊", "Volumen semanal (series/grupo)",
  "MRV (máximo) y MEV (mínimo) según grupo + nivel.", "Israetel MRV/MEV",
  [("grupo", "Grupo muscular", "select", [("pecho", "Pecho"), ("espalda", "Espalda"), ("piernas", "Piernas"), ("brazos", "Brazos")]),
   ("nivel", "Nivel", "select", [("principiante", "Principiante"), ("intermedio", "Intermedio"), ("avanzado", "Avanzado")])],
  [("mev", "MEV (mín)", None), ("mrv", "MRV (máx)", None), ("resumen", "Int", None)],
  ["Pecho intermedio", "MEV 8-12, MRV 18-22"], "MEV 10, MRV 20",
  [("¿Qué es MEV?", "Minimum Effective Volume — menos que eso no hay progreso."),
   ("¿MRV?", "Maximum Recoverable Volume — más que eso rompés recuperación."),
   ("¿Ondular?", "Aumentar gradual hasta MRV, deload, repetir."),
   ("¿Por grupo?", "Piernas soporta más. Bíceps menos."),
   ("¿Junior vs senior?", "Israetel ajusta por edad, sexo, recuperación.")],
  """  const grupo = String(i.grupo); const nivel = String(i.nivel);
  const MEV: Record<string, Record<string, number>> = { pecho: {principiante: 8, intermedio: 10, avanzado: 12}, espalda: {principiante: 10, intermedio: 12, avanzado: 14}, piernas: {principiante: 10, intermedio: 12, avanzado: 14}, brazos: {principiante: 6, intermedio: 8, avanzado: 10} };
  const MRV: Record<string, Record<string, number>> = { pecho: {principiante: 15, intermedio: 22, avanzado: 28}, espalda: {principiante: 18, intermedio: 25, avanzado: 30}, piernas: {principiante: 16, intermedio: 22, avanzado: 26}, brazos: {principiante: 10, intermedio: 16, avanzado: 20} };
  return { mev: MEV[grupo]?.[nivel] + ' series/sem', mrv: MRV[grupo]?.[nivel] + ' series/sem',
    resumen: `${grupo} ${nivel}: MEV ${MEV[grupo]?.[nivel]} series, MRV ${MRV[grupo]?.[nivel]} series/sem.` };""")

# Isotónica casera
M("calorias-deportivas-bebida-isotonica", "🧃", "Calorías isotónica casera",
  "Kcal isotónica 500ml (agua + azúcar + sal).", "kcal = azúcar_g × 4",
  [("azucarG", "Azúcar (g)", "number", "30")],
  [("kcal", "Calorías", None), ("choPorc", "% carbos", None), ("resumen", "Int", None)],
  ["30g azúcar en 500ml", "120 kcal, 6%"], "120 kcal 6%",
  [("¿Proporción ideal?", "6-8% CHO (30-40g/500ml). Mayor = lento vaciado gástrico."),
   ("¿Sal?", "0.5g (una pizca) para reponer Na. No sabe 'salada'."),
   ("¿Comercial vs casera?", "Casera 80% más barata. Mismo efecto si proporción correcta."),
   ("¿Cuándo usar?", "Ejercicio > 60 min intenso o > 90 min moderado."),
   ("¿Hipotónica?", "< 4% CHO. Se absorbe aún más rápido.")],
  """  const a = Number(i.azucarG) || 0;
  const kcal = a * 4;
  const pct = (a / 500) * 100;
  return { kcal: kcal.toFixed(0), choPorc: pct.toFixed(1) + '%', resumen: `${kcal.toFixed(0)} kcal con ${pct.toFixed(1)}% CHO (${a}g azúcar en 500ml).` };""")

# Carga semanal running
M("carga-semanal-running-regla-10", "📈", "Carga running regla +10%",
  "Progresión km/sem (máx +10% por semana).", "km_nuevos = km_actuales × 1.10",
  [("kmActuales", "Km/sem actuales", "number", "30")],
  [("kmProxima", "Km próxima sem", None), ("km4Semanas", "Proyección 4 sem", None), ("resumen", "Int", None)],
  ["30 km × 1.10", "33 km próxima"], "33 km (máx 10%)",
  [("¿Por qué 10%?", "Evita lesiones. Cuerpo adapta músculos, tendones, huesos."),
   ("¿Descanso?", "Cada 3-4 semanas de progresión, 1 de descarga (-20%)."),
   ("¿Si salteo?", "No recuperés 10%. Aplicá desde lo actual real."),
   ("¿Terreno?", "Pendiente acumulada también escala (+10% por sem)."),
   ("¿Recalcar?", "10% es regla general — algunos corredores aceptan 15%, otros 5%.")],
  """  const km = Number(i.kmActuales) || 0;
  const prox = km * 1.1;
  const m4 = km * Math.pow(1.1, 4);
  return { kmProxima: prox.toFixed(1) + ' km', km4Semanas: m4.toFixed(0) + ' km', resumen: `Próx sem ${prox.toFixed(0)} km. En 4 semanas: ${m4.toFixed(0)} km.` };""")

# Proyección Riegel
M("proyeccion-10k-desde-5k-riegel", "📐", "Proyección 10K desde 5K (Riegel)",
  "Estimá tiempo 10K desde performance 5K.", "t2 = t1 × (d2/d1)^1.06",
  [("t5kMin", "5K tiempo (min)", "number", "25"), ("t5kSeg", "5K seg", "number", "0")],
  [("proy10k", "Proyección 10K", None), ("resumen", "Int", None)],
  ["5K en 25:00", "10K ≈ 52:16"], "~52:16",
  [("¿Fórmula?", "Riegel 1981. Exponente 1.06 empírico."),
   ("¿Precisión?", "±2-5% para corredores entrenados a ambas distancias."),
   ("¿Mismos supuestos?", "Similar nivel de entrenamiento en ambas. Recuperado."),
   ("¿Para maratón?", "t_maraton = t_10k × 4.22^1.06. Menos preciso."),
   ("¿Alternativas?", "VO2max calculators. Cálculo desde FC.")],
  """  const min = Number(i.t5kMin) || 0; const s = Number(i.t5kSeg) || 0;
  const t1 = min * 60 + s;
  const t2 = t1 * Math.pow(2, 1.06);
  const m = Math.floor(t2 / 60); const ss = Math.round(t2 % 60);
  return { proy10k: `${m}:${String(ss).padStart(2,'0')}`, resumen: `10K proyectado desde ${min}:${String(s).padStart(2,'0')} 5K → ${m}:${String(ss).padStart(2,'0')}.` };""")

M("proyeccion-21k-desde-10k-cameron", "📐", "Proyección 21K desde 10K",
  "Estimá media maratón desde 10K.", "Similar Cameron/Riegel",
  [("t10kMin", "10K tiempo (min)", "number", "50")],
  [("proy21k", "Proyección 21K", None), ("resumen", "Int", None)],
  ["10K 50min", "21K ≈ 1h50"], "~1:50",
  [("¿Diferencia Riegel vs Cameron?", "Cameron optimizado para media/maratón."),
   ("¿Tiempo real vs proyección?", "Varía con calor, altura, preparación."),
   ("¿Mejor prueba?", "Correr la distancia real. Proyección es estimación."),
   ("¿Supuestos?", "Entrenamiento consistente. Buen descanso."),
   ("¿VDOT?", "Tabla Daniels para calcular todos los paces desde 1 tiempo.")],
  """  const t = Number(i.t10kMin) || 0;
  const t2 = t * Math.pow(2.11, 1.06);
  const h = Math.floor(t2 / 60); const m = Math.round(t2 % 60);
  return { proy21k: `${h}:${String(m).padStart(2,'0')}`, resumen: `21K proyectado desde ${t}min 10K: ${h}h${String(m).padStart(2,'0')}.` };""")

# Calorias varios deportes
for slug, h1, mets in [
    ("calorias-gym-pesas-hora", "Calorías gym pesas/hora", 6),
    ("calorias-escalada-rock-hora", "Calorías escalada indoor", 9),
    ("calorias-boxeo-mma-hora", "Calorías boxeo/MMA", 10),
    ("calorias-surf-kitesurf-hora", "Calorías surf/kitesurf", 6)]:
    M(slug, "🔥", h1, f"Calorías quemadas en {h1.lower()} por hora según peso.", f"Cal = MET × peso × horas ({mets} MET)",
      [("peso", "Peso (kg)", "number", "70"), ("minutos", "Min", "number", "60")],
      [("kcal", "Calorías", None), ("resumen", "Int", None)],
      [f"70 kg × {mets} MET × 1h", f"{70 * mets} kcal/h"], f"{70 * mets} kcal",
      [("¿MET?", "Metabolic Equivalent. 1 MET = reposo."),
       ("¿Varía?", "Intensidad y forma. Números son promedio."),
       ("¿Mejor que cardio?", "Pesas acelera metabolismo 24-48h post."),
       ("¿HIIT?", "Boxeo HIIT más kcal por tiempo que LISS."),
       ("¿Reloj fitness?", "Aproximación. HR variable.")],
      f"""  const p = Number(i.peso) || 70; const m = Number(i.minutos) || 60;
  const cal = {mets} * p * (m / 60);
  return {{ kcal: cal.toFixed(0) + ' kcal', resumen: `${{m}} min ${{h1}}: ${{cal.toFixed(0)}} kcal (${{p}}kg, MET {mets}).` }};""")

# Geles energéticos
M("gel-energetico-carrera-cuantos", "🍬", "Geles energéticos por carrera",
  "Cuántos geles (30g CHO) según duración.", "Geles = h × 60g / 30g",
  [("horas", "Horas de carrera", "number", "3.5")],
  [("geles", "Geles (30g c/u)", None), ("resumen", "Int", None)],
  ["3.5 h", "7 geles (30g CHO × 60g/h)"], "7 geles",
  [("¿Por qué 60g/h?", "Límite absorción aprox. Atletas entrenados hasta 90g."),
   ("¿Primera hora?", "Sin gel. Glucógeno muscular cubre."),
   ("¿Cuándo tomar?", "Cada 25-30 min. No esperar hambre."),
   ("¿Mezclar cafeína?", "50% con cafeína para alertness."),
   ("¿Agua?", "Siempre con 150ml agua para absorción.")],
  """  const h = Number(i.horas) || 0;
  const geles = Math.max(0, Math.ceil((h - 1) * 60 / 30));
  return { geles: geles.toString(), resumen: `${geles} geles de 30g CHO para ${h}h (primera hora sin gel).` };""")

# Descanso post maratón
M("descanso-post-maraton-regla-1-dia-km", "🛌", "Descanso post maratón",
  "Días de descanso recomendados post maratón.", "días = km / 2",
  [("kmCarrera", "Km carrera", "number", "42.2")],
  [("diasSuave", "Días soft", None), ("semanasRestablecer", "Semanas a restablecer vol", None), ("resumen", "Int", None)],
  ["42.2 km", "21 días suave"], "21 días suaves",
  [("¿Regla origen?", "Jack Daniels regla práctica."),
   ("¿Soft?", "Trote muy fácil o caminar. Sin intervalos."),
   ("¿Primer día?", "0 running. Caminata, estiramiento."),
   ("¿Semana 1?", "Sin volumen, mucha recuperación."),
   ("¿Próxima maratón?", "Mínimo 16 semanas entre maratones.")],
  """  const km = Number(i.kmCarrera) || 0;
  const dias = Math.round(km / 2);
  const sem = Math.ceil(dias / 7);
  return { diasSuave: dias.toString(), semanasRestablecer: sem.toString(),
    resumen: `Descanso: ${dias} días suaves (~${sem} semanas) post ${km}km.` };""")
