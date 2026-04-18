"""Batch 3 — Medio Ambiente (20 calcs). Formato ultracompacto."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _helper import spec

SPECS = []


def T(fn_name, body):
    return f"""export interface Inputs {{ [k: string]: number | string; }}
export interface Outputs {{ [k: string]: string | number; }}
export function {fn_name}(i: Inputs): Outputs {{
{body}
}}
"""


def M(slug, cat, icon, h1, desc, formula_expr, flds, outs, eg_steps, eg_result, faqs, body):
    SPECS.append(spec(slug, cat, icon, h1, desc, formula_expr, flds, outs, eg_steps, eg_result, faqs, T(to_camel(slug), body)))


def to_camel(s):
    parts = s.split('-')
    return parts[0] + ''.join(p[:1].upper() + p[1:] if p else '' for p in parts[1:])


# 1. Huella de carbono alimentación semanal
M("huella-carbono-alimentacion-semanal", "medio-ambiente", "🥗",
  "Huella de carbono dieta semanal (kg CO₂e)",
  "Estimá kg CO₂ equivalentes por semana según categorías alimenticias (carne, lácteos, vegetales, etc.).",
  "CO2e = Σ (kg_consumido × factor_CO2_kg)",
  [("carneRes", "Carne res (kg/sem)", "number", "0.5"), ("polloPescado", "Pollo/pescado (kg/sem)", "number", "0.8"),
   ("lacteos", "Lácteos (kg/sem)", "number", "2"), ("vegetales", "Vegetales+frutas (kg/sem)", "number", "4")],
  [("kgCo2Semana", "CO₂ semanal (kg)", None), ("kgCo2Año", "CO₂ anual (kg)", None), ("resumen", "Interpretación", None)],
  ["Carne 0.5kg, pollo 0.8kg, lácteos 2kg, vegetales 4kg", "0.5×27 + 0.8×6 + 2×3 + 4×2 = 32.3 kg/sem", "×52 = 1680 kg/año"],
  "32.3 kg/sem (1680 kg/año)",
  [("¿Por qué carne es tanto?", "Res: 27 kg CO₂/kg (tierra + metano + feed). Es 10-15× vs vegetales."),
   ("¿Vegetariano reduce?", "~50%. Vegano ~70%. Pero matiz por lácteos/huevos."),
   ("¿Equivalente auto?", "1 tonelada CO₂ = ~5000 km en auto. Dieta carnívora típica: 3 t/año."),
   ("¿Pescado?", "Varía. Salmón salvaje: bajo. Camarón: alto (similar a carne). Atún enlatado: medio."),
   ("¿Procesados?", "Peor que frescos. Empaque, transporte refrigerado, cocinado previo.")],
  """  const res = Number(i.carneRes) || 0; const pol = Number(i.polloPescado) || 0;
  const lac = Number(i.lacteos) || 0; const veg = Number(i.vegetales) || 0;
  const kgSem = res * 27 + pol * 6 + lac * 3 + veg * 2;
  const kgAño = kgSem * 52;
  return { kgCo2Semana: kgSem.toFixed(1) + ' kg', kgCo2Año: kgAño.toFixed(0) + ' kg', resumen: `CO2 semanal: ${kgSem.toFixed(1)} kg (anual ${(kgAño/1000).toFixed(1)} t).` };""")

# 2. Huella carbono ropa anual
M("huella-carbono-ropa-armario-anual", "medio-ambiente", "👕",
  "Huella de carbono del armario anual",
  "Estimá CO₂e anual de tu consumo de ropa según número de prendas nuevas compradas.",
  "CO2e = prendas × factor_por_tipo (kg CO₂)",
  [("remeras", "Remeras/año", "number", "10"), ("pantalones", "Pantalones/año", "number", "3"),
   ("zapatos", "Zapatos/año", "number", "2"), ("abrigos", "Abrigos/año", "number", "1")],
  [("kgCo2", "CO₂ anual", None), ("resumen", "Interpretación", None)],
  ["10 remeras (7kg), 3 pantalones (33kg), 2 zapatos (28kg), 1 abrigo (20kg)", "Total: 88 kg CO₂/año"],
  "88 kg CO₂/año",
  [("¿Por qué tanto?", "Algodón usa mucha agua, poliéster es petróleo, tintes químicos."),
   ("¿Fast fashion?", "Peor. Ropa barata Amazon/Shein: mayor huella por prenda."),
   ("¿Reutilizar?", "Alquilar o comprar usado reduce 80%. Ropa dura 5× más usándose más."),
   ("¿Lavado?", "Agua fría + colgar = -50% vs agua caliente + secadora."),
   ("¿Eco-friendly reales?", "Lana, lino, cáñamo orgánico. Certificaciones GOTS, OEKO-TEX.")],
  """  const r = Number(i.remeras) || 0; const p = Number(i.pantalones) || 0;
  const z = Number(i.zapatos) || 0; const a = Number(i.abrigos) || 0;
  const co2 = r * 7 + p * 11 + z * 14 + a * 20;
  return { kgCo2: co2.toFixed(0) + ' kg', resumen: `${co2.toFixed(0)} kg CO₂/año en ropa. Regla: comprar menos + calidad = -60%.` };""")

# 3. Streaming video horas
M("huella-carbono-streaming-video-horas", "medio-ambiente", "📺",
  "Huella carbono streaming video",
  "Calculá CO₂e generado por tus horas de streaming (Netflix, YouTube) mensuales.",
  "CO2 ≈ 36 g por hora de video HD en promedio global",
  [("horasDia", "Horas/día", "number", "3"), ("calidad", "Calidad", "select", [("SD", "SD"), ("HD", "HD"), ("4K", "4K")])],
  [("gCo2Dia", "g CO₂/día", None), ("kgCo2Mes", "kg CO₂/mes", None), ("resumen", "Interpretación", None)],
  ["3h/día en HD", "g/día = 3 × 36 = 108 g", "kg/mes = 3.24"],
  "3.24 kg CO₂/mes (moderado)",
  [("¿Cuánto es 1 hora?", "SD: 10g. HD: 36g. 4K: 75g. Principalmente servidores + red."),
   ("¿WiFi o 4G?", "WiFi -60% vs 4G/5G. Usar WiFi casa siempre que puedas."),
   ("¿OLED dark mode?", "Sí, -30% consumo en pantalla. YouTube dark theme ayuda."),
   ("¿Netflix vs YouTube?", "Similar. Servicio con mejor compresión (YouTube) tiende a ser menor."),
   ("¿Descargar vs streaming?", "Si lo ves 2+ veces, descargar reduce. Una sola vez: similar.")],
  """  const h = Number(i.horasDia) || 0;
  const factor = i.calidad === '4K' ? 75 : i.calidad === 'SD' ? 10 : 36;
  const gDia = h * factor; const kgMes = (gDia * 30) / 1000;
  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Mes: kgMes.toFixed(2) + ' kg', resumen: `${h}h/día en ${i.calidad}: ${gDia.toFixed(0)} g CO₂/día = ${kgMes.toFixed(1)} kg/mes.` };""")

# 4. Huella mascota anual
M("huella-carbono-mascota-anual", "medio-ambiente", "🐕",
  "Huella de carbono de mascota anual",
  "Calculá CO₂e anual de tener un perro o gato según peso (comida = mayor fuente).",
  "CO2_mascota ≈ peso × 120 kg/año (perro) o 40 kg/año (gato)",
  [("tipo", "Tipo", "select", [("perro", "Perro"), ("gato", "Gato")]),
   ("peso", "Peso mascota (kg)", "number", "15")],
  [("kgCo2", "CO₂ anual", None), ("resumen", "Interpretación", None)],
  ["Perro 15kg", "15 × 120 = 1800 kg/año ~ 1.8 t"],
  "1.8 t CO₂/año (similar a auto chico)",
  [("¿Por qué tanto?", "Alimento basado en carne tiene enorme huella. Dog food 70% es carne."),
   ("¿Perro vs humano?", "Perro grande ~30% de huella humana. Gato ~10%."),
   ("¿Vegano pet food?", "Existe y reduce 80%. Controversial por nutrición."),
   ("¿Caca?", "Biodegradable lejos de cuencas. Evitar inodoros (descompone en anaeróbico)."),
   ("¿Criar vs rescatar?", "Rescatar tiene huella muy menor (no nuevos recursos para criar).")],
  """  const p = Number(i.peso) || 10;
  const factor = i.tipo === 'perro' ? 120 : 40;
  const kg = p * factor;
  return { kgCo2: kg.toFixed(0) + ' kg', resumen: `${i.tipo} de ${p}kg: ${kg.toFixed(0)} kg CO₂/año (${(kg/1000).toFixed(1)} t).` };""")

# 5. Trabajo remoto vs oficina
M("huella-carbono-trabajo-remoto-vs-oficina", "medio-ambiente", "🏠",
  "Huella CO₂ trabajo remoto vs oficina",
  "Compará el CO₂ ahorrado trabajando desde casa vs ir a la oficina (por commute y oficina).",
  "Ahorro = CO2_commute - CO2_extra_casa",
  [("kmCommute", "Km commute/día (ida+vuelta)", "number", "30"), ("diasMes", "Días remoto/mes", "number", "12"),
   ("autoPublico", "Medio", "select", [("auto", "Auto"), ("publico", "Público")])],
  [("kgAhorradoMes", "Ahorro mensual", None), ("kgAhorradoAño", "Anual", None), ("resumen", "Interpretación", None)],
  ["30 km/día, 12 días/mes, auto", "Commute: 30×0.2 = 6kg/día", "Extra casa: ~3kg/día (luz, calefacción)", "Ahorro: 3×12 = 36 kg/mes"],
  "36 kg/mes (430 kg/año)",
  [("¿Siempre conviene remoto?", "Depende mes invierno con calefacción eléctrica puede no compensar tanto."),
   ("¿Transporte público?", "Factor más bajo. Ahorro remoto vs público es menor."),
   ("¿Y si hago poco km?", "<5 km: remoto no aporta mucho. <2 km: ir a pie gana siempre."),
   ("¿Meeting vs trabajar?", "Meetings Zoom tienen factor bajo. 10 hrs reunión/sem = ~1kg CO₂."),
   ("¿Co-working?", "Menor huella que oficina propia (sharing recursos).")],
  """  const km = Number(i.kmCommute) || 0; const d = Number(i.diasMes) || 12;
  const factor = i.autoPublico === 'auto' ? 0.2 : 0.07;
  const commuteDia = km * factor; const extraCasa = 3;
  const ahorroMes = (commuteDia - extraCasa) * d;
  return { kgAhorradoMes: ahorroMes.toFixed(1) + ' kg', kgAhorradoAño: (ahorroMes * 12).toFixed(0) + ' kg', resumen: `Ahorro ${ahorroMes.toFixed(1)} kg/mes (${(ahorroMes*12/1000).toFixed(1)} t/año).` };""")

# 6. Compensación árboles vuelo
M("compensacion-co2-arboles-vuelo", "medio-ambiente", "🌳",
  "Árboles para compensar vuelo",
  "Calculá cuántos árboles necesitás plantar para compensar el CO₂ de un vuelo.",
  "árboles = kg_CO2 / 22 kg/árbol/año",
  [("km", "Km de vuelo", "number", "10000"), ("clase", "Clase", "select", [("economica", "Económica"), ("business", "Business")])],
  [("kgCo2", "CO₂ vuelo", None), ("arboles", "Árboles necesarios", None), ("resumen", "Interpretación", None)],
  ["Buenos Aires → Madrid (10000 km) económica", "kg CO₂ = 10000 × 0.15 = 1500 kg", "Árboles: 1500/22 = 68"],
  "68 árboles para compensar 1 vuelo internacional",
  [("¿Factor vuelo?", "Económica ~150 g/km por pasajero. Business 3× más (más espacio)."),
   ("¿Por qué 22 kg/año?", "Promedio árbol joven (0-20 años). Árboles grandes capturan más."),
   ("¿Cuánto tarda?", "Un árbol tarda 40 años en compensar 1 vuelo largo. Plantar temprano."),
   ("¿Carbon offset real?", "Programas certificados (Gold Standard, Verra). Muchos 'greenwashing'."),
   ("¿Otras opciones?", "Volar menos (mayor impacto), rutas directas (más eficiente), clase económica.")],
  """  const km = Number(i.km) || 0; const factor = i.clase === 'business' ? 0.45 : 0.15;
  const kg = km * factor; const arb = Math.ceil(kg / 22);
  return { kgCo2: kg.toFixed(0) + ' kg', arboles: arb.toString(), resumen: `Vuelo ${km}km ${i.clase}: ${kg.toFixed(0)}kg CO₂. Plantá ${arb} árboles para compensar.` };""")

# 7. Dark mode
M("ahorro-energia-modo-oscuro-pantalla", "medio-ambiente", "🌙",
  "Ahorro de energía modo oscuro (OLED)",
  "Estimá cuánta energía ahorra usar modo oscuro en pantalla OLED/AMOLED según horas diarias.",
  "W_ahorrados = W_blanco × 0.6 × horas",
  [("horasDia", "Horas pantalla/día", "number", "8"), ("potenciaW", "Potencia pantalla (W)", "number", "3")],
  [("ahorroKwhMes", "Ahorro kWh/mes", None), ("resumen", "Interpretación", None)],
  ["8h/día, pantalla OLED 3W", "Ahorro 60% en pixels oscuros ≈ 1.8W ahorro", "× 8h × 30 = 0.43 kWh/mes"],
  "0.43 kWh/mes (~$35 AR)",
  [("¿Solo OLED?", "Sí. LCD tradicional no cambia consumo entre blanco y negro."),
   ("¿Teléfono o monitor?", "Funciona en ambos si son OLED. La mayoría de celulares modernos sí."),
   ("¿Cuánto se nota?", "Celular 5h/día: ~0.1 kWh/mes. Pequeño, pero se suma."),
   ("¿Beneficio salud?", "Discutido. No prueba científica fuerte, pero menos fatiga visual nocturna."),
   ("¿Sitios web?", "Muchos ofrecen dark mode. YouTube dark ahorra ~15% consumo pantalla.")],
  """  const h = Number(i.horasDia) || 0; const w = Number(i.potenciaW) || 3;
  const ahorroDia = w * 0.6 * h / 1000;
  const ahorroMes = ahorroDia * 30;
  return { ahorroKwhMes: ahorroMes.toFixed(3) + ' kWh', resumen: `Ahorro estimado ${ahorroMes.toFixed(2)} kWh/mes con modo oscuro en pantalla OLED.` };""")

# 8. Ahorro agua duchas
M("ahorro-agua-duchas-cortas-mes", "medio-ambiente", "🚿",
  "Ahorro de agua con duchas cortas",
  "Calculá agua y dinero ahorrado reduciendo minutos de ducha o bajando el caudal.",
  "Ahorro = (min_antes - min_después) × L/min × 30",
  [("minAntes", "Min/ducha actual", "number", "10"), ("minDespues", "Min/ducha nueva", "number", "5"),
   ("lMin", "Caudal (L/min)", "number", "10"), ("personas", "Personas en casa", "number", "2")],
  [("litrosMes", "Litros ahorrados/mes", None), ("m3Año", "m³/año", None), ("resumen", "Interpretación", None)],
  ["10→5min, 10 L/min, 2 personas", "5 min × 10 L × 30 × 2 = 3000 L/mes"],
  "3000 L/mes = 36 m³/año",
  [("¿Cuánto cuesta m³?", "AR: ~$200-800/m³. Ahorro 36m³/año = $7-30k anuales."),
   ("¿Caudal ducha?", "Estándar 10 L/min. Económico 6 L/min. Bajo flujo 2-3 L/min."),
   ("¿Comparar con otras prácticas?", "Lavar plato con remojo: ahorra 10× vs agua corriente."),
   ("¿Agua y energía?", "Agua caliente implica energía. Reducir ducha = ahorro 2× (agua + calefon)."),
   ("¿Reusar agua?", "Sí, para regar plantas. Recuperar 50% es factible.")],
  """  const ma = Number(i.minAntes) || 0; const md = Number(i.minDespues) || 0;
  const lm = Number(i.lMin) || 10; const p = Number(i.personas) || 1;
  const L = (ma - md) * lm * 30 * p;
  const m3 = L * 12 / 1000;
  return { litrosMes: L.toFixed(0) + ' L', m3Año: m3.toFixed(2) + ' m³', resumen: `Ahorro ${L.toFixed(0)} L/mes (${m3.toFixed(1)} m³/año) reduciendo ${ma-md} min/ducha.` };""")

# 9. Compostaje volumen
M("compostaje-volumen-residuos", "medio-ambiente", "🍂",
  "Volumen de compostero según residuos",
  "Calculá el volumen necesario de compostero según kg de residuos orgánicos semanales.",
  "V = kg_semana × 0.015 m³/kg (factor esponjamiento)",
  [("kgSemana", "Kg residuos/semana", "number", "3")],
  [("volumen", "Volumen compostero", None), ("resumen", "Interpretación", None)],
  ["3 kg/sem", "V = 3 × 0.015 × 52 = 2.34 m³"],
  "Compostero 2.3 m³ (~1.5m alto × 1.2m ancho)",
  [("¿Qué se composta?", "Cáscaras frutas/verduras, yerba, café, papel no blanqueado, hojas secas."),
   ("¿Qué NO?", "Carne, lácteos, aceite, heces, cítricos grandes, ceniza."),
   ("¿Tiempo?", "3-6 meses en compost cálido. 12+ en frío/lento."),
   ("¿Olor?", "Bien aireado no huele. Olor amoniaco = mucho N (agregar carbón/hojas)."),
   ("¿Vermicompost?", "Con lombrices rojas. Más rápido y rico. 1 kg lombrices procesa 0.5 kg/día.")],
  """  const kg = Number(i.kgSemana) || 0;
  const V = kg * 0.015 * 52;
  return { volumen: V.toFixed(2) + ' m³', resumen: `Compostero de ${V.toFixed(2)} m³ para ${kg} kg/semana de residuos.` };""")

# 10. Reciclaje CO2
M("reciclaje-botellas-ahorro-co2", "medio-ambiente", "♻️",
  "Ahorro CO₂ reciclando botellas PET",
  "Estimá kg CO₂ ahorrados al reciclar botellas PET vs producir nuevas.",
  "Ahorro = kg_PET × 2.3 kg CO₂/kg",
  [("botellas", "Botellas PET/semana", "number", "20")],
  [("kgCo2Año", "CO₂ ahorrado anual", None), ("resumen", "Interpretación", None)],
  ["20 botellas/sem × 40g = 0.8 kg PET × 52", "= 41.6 kg PET × 2.3 = 95.7 kg CO₂"],
  "96 kg CO₂/año ahorrados",
  [("¿Por qué 2.3?", "Producir PET virgen: 3 kg CO₂/kg. Reciclado: 0.7. Diferencia ahorrada."),
   ("¿Solo PET?", "Reciclaje vidrio ahorra 30% energía. Aluminio 95%. Vale para todos."),
   ("¿Vida plástica?", "PET reciclado sirve 7-10 veces. Luego sí termina vertedero."),
   ("¿Plásticos no reciclables?", "Bolsas y algunos #7 no. Reducir es mejor que reciclar para esos."),
   ("¿Botellas retornables?", "Ahorran aún más (60% menos CO₂ vs reciclaje desechable).")],
  """  const b = Number(i.botellas) || 0;
  const kgPet = (b * 40 * 52) / 1000;
  const co2 = kgPet * 2.3;
  return { kgCo2Año: co2.toFixed(1) + ' kg', resumen: `Reciclando ${b} botellas/sem ahorrás ${co2.toFixed(0)} kg CO₂/año.` };""")

# 11-20 (ultra compacto)
M("papel-ahorrado-impresion-doble-cara", "medio-ambiente", "📄",
  "Papel ahorrado imprimiendo doble cara",
  "Calculá hojas ahorradas/año imprimiendo doble faz.",
  "Hojas ahorradas = hojas_anuales × 0.5",
  [("hojasSem", "Hojas/semana promedio", "number", "50")],
  [("hojasAño", "Hojas ahorradas", None), ("arboles", "Árboles equivalentes", None), ("resumen", "Interpretación", None)],
  ["50 hojas/sem × 52 / 2 = 1300 ahorradas/año", "1 árbol da ~10000 hojas → 0.13 árboles"],
  "1300 hojas/año = 0.13 árboles",
  [("¿Papel es renovable?", "Sí pero el proceso (pulpa, blanqueado, transporte) tiene alta huella."),
   ("¿Papel reciclado?", "Usa 70% menos agua y 60% menos energía."),
   ("¿Imprimir menos?", "Digital cuando posible. Si imprimís: doble cara + reducir tamaño = -75%."),
   ("¿Certificación FSC?", "Bosques manejados sostenible. Buscar ese logo."),
   ("¿Otros ahorros?", "Reutilizar hojas impresas para borradores.")],
  """  const h = Number(i.hojasSem) || 0;
  const hAño = h * 52 * 0.5;
  const arb = hAño / 10000;
  return { hojasAño: hAño.toFixed(0), arboles: arb.toFixed(2), resumen: `Ahorrás ${hAño.toFixed(0)} hojas/año imprimiendo doble faz = ${arb.toFixed(2)} árboles.` };""")

M("energia-electrodomestico-etiqueta-eficiencia", "medio-ambiente", "🏷️",
  "Ahorro por cambiar a electrodoméstico A+++",
  "Calculá ahorro kWh y dinero por pasar de clase B/C a clase A+++.",
  "Ahorro = ΔkWh × tarifa",
  [("kwhClaseActual", "kWh/año actual", "number", "600"), ("kwhClaseNueva", "kWh/año nuevo (A+++)", "number", "200"),
   ("tarifa", "Tarifa $/kWh", "number", "80")],
  [("ahorroKwhAño", "kWh/año ahorrados", None), ("ahorroPesosAño", "$/año ahorrados", None), ("resumen", "Interpretación", None)],
  ["Actual 600 → Nuevo 200", "Ahorro 400 kWh × $80 = $32000/año"],
  "$32000 AR/año",
  [("¿Payback rápido?", "Heladera A+++: 3-6 años. Laptops y celulares no compensan por short life."),
   ("¿Verificar etiqueta real?", "Test ASIRAM en AR. Algunos datos del fabricante son optimistas."),
   ("¿Cuándo cambiar?", "Si aparato tiene >10 años, casi siempre conviene aunque funcione."),
   ("¿Reciclaje del viejo?", "Llevar a lugares certificados (no volcar electrónicos en basura común)."),
   ("¿Inverter?", "Heladeras/aires inverter son ~30% más eficientes que on/off tradicionales.")],
  """  const a = Number(i.kwhClaseActual) || 0; const n = Number(i.kwhClaseNueva) || 0;
  const t = Number(i.tarifa) || 80;
  const kWh = a - n; const pesos = kWh * t;
  return { ahorroKwhAño: kWh.toFixed(0), ahorroPesosAño: '$' + pesos.toFixed(0), resumen: `Ahorrás ${kWh.toFixed(0)} kWh/año = $${pesos.toFixed(0)} AR.` };""")

M("combustible-auto-viaje-emisiones", "medio-ambiente", "🚗",
  "Emisiones CO₂ por viaje en auto",
  "Calculá kg CO₂ emitidos en un viaje según consumo y tipo de combustible.",
  "CO2 = L_consumidos × factor (kg/L)",
  [("litros", "Litros consumidos", "number", "50"), ("tipo", "Combustible", "select", [("nafta", "Nafta"), ("gasoil", "Gasoil"), ("gnc", "GNC")])],
  [("kgCo2", "CO₂ emitido", None), ("resumen", "Interpretación", None)],
  ["50 L nafta", "50 × 2.31 = 115.5 kg CO₂"],
  "115.5 kg CO₂ por viaje",
  [("¿Por qué 2.31?", "1 L nafta = 2.31 kg CO₂. Gasoil: 2.68. GNC: 1.88 (por m³)."),
   ("¿Auto eléctrico?", "Depende de la red. AR: 0.3 kg CO₂/kWh × 6 kWh/100km = 0.018 kg/km."),
   ("¿Híbrido?", "30-40% menos que nafta puro. Muy bueno en ciudad (freno regenerativo)."),
   ("¿Conducción eco?", "-15-20% consumo. Acelerar suave, no frenar tarde."),
   ("¿Mantenimiento?", "Filtro aire, presión neumáticos, aceite correcto. -10% consumo.")],
  """  const L = Number(i.litros) || 0;
  const f = i.tipo === 'gasoil' ? 2.68 : i.tipo === 'gnc' ? 1.88 : 2.31;
  const co2 = L * f;
  return { kgCo2: co2.toFixed(1) + ' kg', resumen: `${L}L de ${i.tipo} = ${co2.toFixed(0)} kg CO₂ emitido.` };""")

M("consumo-bicicleta-vs-auto-anual", "medio-ambiente", "🚴",
  "Emisiones ahorradas bici vs auto",
  "Calculá CO₂ ahorrado y calorías quemadas si hacés X km/día en bici en vez de auto.",
  "CO2 ahorrado = km × factor_auto",
  [("kmDia", "Km/día en bici", "number", "15"), ("diasMes", "Días/mes", "number", "22")],
  [("kgCo2Año", "CO₂ ahorrado/año", None), ("caloriasAño", "Calorías quemadas/año", None), ("resumen", "Interpretación", None)],
  ["15 km × 22 días × 12 meses", "km/año = 3960", "CO₂ = 3960 × 0.2 = 792 kg/año", "Cal = 3960 × 25 = 99000"],
  "792 kg CO₂ + 99k kcal/año",
  [("¿Vale la pena?", "Sí. 2 km es umbral donde bici gana a caminar o auto."),
   ("¿Lluvia/frío?", "Ropa adecuada permite ~90% días. 10% auto no arruina balance."),
   ("¿Seguridad?", "Usar cascos, ciclovías donde existan, luces."),
   ("¿Bici eléctrica?", "Ahorro similar. 5-10× menos CO₂ que auto eléctrico por km."),
   ("¿Salud mental?", "Bonus: reduce estrés, mejora humor. Ejercicio = endorfinas.")],
  """  const km = Number(i.kmDia) || 0; const d = Number(i.diasMes) || 0;
  const kmAño = km * d * 12;
  const co2 = kmAño * 0.2; const cal = kmAño * 25;
  return { kgCo2Año: co2.toFixed(0) + ' kg', caloriasAño: cal.toFixed(0), resumen: `Ahorrás ${co2.toFixed(0)} kg CO₂/año y quemás ${cal.toFixed(0)} kcal.` };""")

M("huella-carbono-boda-evento", "medio-ambiente", "💒",
  "Huella carbono de boda o evento",
  "Estimá CO₂ total de una boda según invitados, catering y viajes.",
  "CO2_boda = invitados × (catering + transport + espacio)",
  [("invitados", "Invitados", "number", "120")],
  [("kgCo2", "CO₂ total", None), ("arbolesCompensar", "Árboles a plantar", None), ("resumen", "Interpretación", None)],
  ["120 invitados", "CO₂ ≈ 120 × 150 = 18000 kg = 18 t", "Árboles: 18000/22 = 818"],
  "18 t CO₂ (~plantar 820 árboles)",
  [("¿Por qué tanto?", "Transporte invitados + catering (carne) + espacio + luces + flores importadas."),
   ("¿Boda eco?", "Catering vegetariano -60%. Locación natural (sin luces) -40%."),
   ("¿Invitados lejanos?", "Principal contribución. Si vienen de otro país: +5 t cada vuelo."),
   ("¿Flores?", "Flores locales de temporada -70% vs importadas."),
   ("¿Compensar?", "Plantar árboles o donar a proyectos certificados.")],
  """  const i_ = Number(i.invitados) || 0;
  const co2 = i_ * 150;
  const arb = Math.ceil(co2 / 22);
  return { kgCo2: (co2/1000).toFixed(1) + ' t', arbolesCompensar: arb.toString(), resumen: `Boda con ${i_} invitados: ${(co2/1000).toFixed(1)} t CO₂. Plantar ${arb} árboles para compensar.` };""")

M("ahorro-co2-cargador-desenchufar", "medio-ambiente", "🔌",
  "Ahorro CO₂ desenchufando cargadores",
  "Calculá kWh y CO₂ ahorrados al desconectar cargadores sin uso (vampire load).",
  "Ahorro_kWh = W × 24 × 365 / 1000",
  [("numCargadores", "Cargadores sin uso", "number", "5"), ("wPromedio", "Watts/cargador promedio", "number", "0.5")],
  [("kwhAño", "kWh ahorrados/año", None), ("pesosAño", "$/año", None), ("resumen", "Interpretación", None)],
  ["5 cargadores × 0.5W × 24 × 365", "= 21.9 kWh/año"],
  "21.9 kWh/año = ~$1750 AR",
  [("¿Vampire load real?", "Sí. 1-15W por aparato enchufado sin usar. Suma."),
   ("¿Cuáles más?", "TV, microondas (reloj), decoder, impresora, audio. 100-200 kWh/año en hogar típico."),
   ("¿Zapatilla con switch?", "Sí. Corta todo de un golpe. Muy efectivo."),
   ("¿Modo standby igual?", "No. Modo bajo consumo <0.5W. Mejor que 'en uso' pero mayor que 0."),
   ("¿Vale la pena?", "~$2000/año en casa. Suma en combinación con otras medidas.")],
  """  const n = Number(i.numCargadores) || 0; const w = Number(i.wPromedio) || 0.5;
  const kWh = (n * w * 24 * 365) / 1000;
  const pesos = kWh * 80;
  return { kwhAño: kWh.toFixed(2), pesosAño: '$' + pesos.toFixed(0), resumen: `Ahorrás ${kWh.toFixed(1)} kWh/año ($${pesos.toFixed(0)}) desconectando cargadores.` };""")

M("emisiones-enviar-email-adjuntos", "medio-ambiente", "📧",
  "Emisiones por email (texto vs adjunto)",
  "Estimá g CO₂ por email según si tiene adjuntos grandes.",
  "g_CO2 = 4g (texto) o 50g (con adjunto grande)",
  [("emailsPorDia", "Emails/día", "number", "100"), ("porcentajeConAdjunto", "% con adjunto", "number", "20")],
  [("gCo2Dia", "g CO₂/día", None), ("kgCo2Año", "kg CO₂/año", None), ("resumen", "Interpretación", None)],
  ["100 emails/día, 20% adjuntos", "sin adjunto: 80 × 4 = 320g", "con adjunto: 20 × 50 = 1000g", "total: 1320g/día"],
  "1.3 kg/día = 482 kg/año",
  [("¿Por qué emite?", "Servidores, red, dispositivo. Proporcional al tamaño."),
   ("¿Cómo reducir?", "Drive link en vez de adjunto, comprimir PDF, sin firma con imagen."),
   ("¿Eliminar emails viejos?", "Sí. Cada GB guardado: ~0.01 kg CO₂/año. 100 GB: 1 kg/año."),
   ("¿Newsletter?", "Desuscribirse reduce miles de emails no leídos. Limpiar 1× al mes."),
   ("¿Teams/Slack?", "Similar o menor. Discord reduce redundancia.")],
  """  const e = Number(i.emailsPorDia) || 0; const p = Number(i.porcentajeConAdjunto) || 0;
  const sin = e * (1 - p/100) * 4;
  const con = e * (p/100) * 50;
  const gDia = sin + con; const kgAño = gDia * 365 / 1000;
  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Año: kgAño.toFixed(1) + ' kg', resumen: `${e} emails/día (${p}% adjunto) = ${gDia.toFixed(0)}g/día = ${kgAño.toFixed(0)} kg/año.` };""")

M("biodegradacion-residuo-tiempo", "medio-ambiente", "🗑️",
  "Tiempo de biodegradación por material",
  "Consultá cuánto tarda en biodegradarse un material en el ambiente.",
  "Consulta tabla biodegradación",
  [("material", "Material", "select", [("papel", "Papel"), ("cascara-fruta", "Cáscara fruta"),
    ("algodon", "Algodón"), ("vidrio", "Vidrio"), ("lata", "Lata aluminio"), ("plastico", "Plástico PET"),
    ("tetra", "TetraBrik"), ("pañal", "Pañal desechable"), ("neumatico", "Neumático")])],
  [("tiempoEstimado", "Tiempo biodegradación", None), ("resumen", "Interpretación", None)],
  ["Pañal desechable", "500-600 años"],
  "500+ años",
  [("¿Por qué plástico tanto?", "Polímeros sintéticos sin bacterias especializadas. Se fragmenta pero no degrada."),
   ("¿Vidrio más?", "Sí, ~4000 años. Pero NO contamina — puede reciclarse infinitamente."),
   ("¿Microplásticos?", "Fragmentación de plásticos > microplástico → océanos, peces, humanos."),
   ("¿Compostables?", "Bolsas 'bio' compostan solo industrial. En casa no degradan."),
   ("¿Alternativas?", "Bambú, cera de abeja, vidrio. Evitar desechables plásticos.")],
  """  const tiempos: Record<string, string> = {
    'papel': '2-5 meses', 'cascara-fruta': '2-4 semanas', 'algodon': '1-5 meses',
    'vidrio': '~4000 años', 'lata': '10-500 años', 'plastico': '450+ años',
    'tetra': '30-40 años', 'pañal': '500+ años', 'neumatico': '1000+ años'
  };
  const m = String(i.material);
  const t = tiempos[m] || 'Desconocido';
  return { tiempoEstimado: t, resumen: `${m}: ${t} para biodegradarse completamente.` };""")

M("luz-natural-ahorro-iluminacion", "medio-ambiente", "☀️",
  "Ahorro iluminación con luz natural",
  "Calculá kWh y $ ahorrados si usás luz natural X horas/día vs artificial.",
  "Ahorro = W_luz × horas × tarifa",
  [("horas", "Horas luz natural aprovechadas/día", "number", "3"), ("watts", "Watts luz evitada", "number", "60")],
  [("kwhMes", "kWh ahorrados/mes", None), ("pesosMes", "$/mes", None), ("resumen", "Interpretación", None)],
  ["3h × 60W", "kWh/día = 0.18", "/mes = 5.4 kWh = $432 AR"],
  "5.4 kWh/mes (~$432)",
  [("¿Por qué horas importan?", "Cada hora sin usar lámpara = watts × hora. Suma rápido."),
   ("¿LED vs incandescente?", "LED 8-10W ya es bajo. Incandescente 60W: 6-7× más ahorro."),
   ("¿Diseño?", "Ventanas grandes + claraboyas + colores claros = máximo aprovechamiento."),
   ("¿Y el invierno?", "Luz natural también calefacciona (gain solar). Ventanas sur (hemisferio norte)."),
   ("¿Mitos?", "Luz natural mejora circadiano, productividad, humor. Vale más que ahorro.")],
  """  const h = Number(i.horas) || 0; const w = Number(i.watts) || 0;
  const kWhMes = (h * w * 30) / 1000;
  const pesos = kWhMes * 80;
  return { kwhMes: kWhMes.toFixed(2) + ' kWh', pesosMes: '$' + pesos.toFixed(0), resumen: `Ahorrás ${kWhMes.toFixed(1)} kWh/mes ($${pesos.toFixed(0)}) usando luz natural.` };""")

M("lluvia-captacion-techo-m3-anual", "medio-ambiente", "💧",
  "Agua de lluvia captable en techo (m³/año)",
  "Calculá cuántos m³ de agua podés captar anualmente con tu techo según precipitación local.",
  "V = mm_lluvia × m²_techo × 0.001 × eficiencia",
  [("mmAnual", "Precipitación anual (mm)", "number", "1000"), ("m2Techo", "Superficie techo (m²)", "number", "100"),
   ("eficiencia", "Eficiencia captación (%)", "number", "80")],
  [("m3Año", "m³/año captables", None), ("personasAbastecidas", "Personas abastecidas", None), ("resumen", "Interpretación", None)],
  ["1000 mm × 100 m² × 80%", "V = 80 m³/año", "Persona usa 60 m³/año → abastece 1.3"],
  "80 m³ = abastece ~1.3 persona",
  [("¿Qué es eficiencia?", "Pérdidas por evaporación, hojas, primer agua (5-20%)."),
   ("¿Agua potable?", "No directo. Filtrar + tratar UV o cloro. Para riego/limpieza sí."),
   ("¿Tanque necesario?", "Depende lluvia. Regla: capacidad 1-2 meses consumo."),
   ("¿Zona seca?", "<500 mm/año: poco rentable. >800 mm/año: muy bueno."),
   ("¿Normativa AR?", "Sin obligación salvo zonas específicas. Promoción en CABA y BA desde 2020.")],
  """  const mm = Number(i.mmAnual) || 0; const m2 = Number(i.m2Techo) || 0;
  const eff = (Number(i.eficiencia) || 80) / 100;
  const m3 = mm * m2 * 0.001 * eff;
  const pers = m3 / 60;
  return { m3Año: m3.toFixed(1) + ' m³', personasAbastecidas: pers.toFixed(1), resumen: `Captable ${m3.toFixed(0)} m³/año. Abastece ~${pers.toFixed(1)} personas.` };""")
