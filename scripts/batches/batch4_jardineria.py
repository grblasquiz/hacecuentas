"""Batch 4 — Jardinería (20 calcs)."""
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


def to_camel(s):
    p = s.split('-'); return p[0] + ''.join(x[:1].upper() + x[1:] for x in p[1:])


def M(slug, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, body):
    SPECS.append(spec(slug, "jardineria", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(to_camel(slug), body)))


# 1
M("tierra-cantero-m3-litros", "🌱", "Tierra para cantero (m³ / L)",
  "Calculá volumen tierra necesaria para cantero rectangular.", "V = largo × ancho × alto",
  [("largo", "Largo (m)", "number", "2"), ("ancho", "Ancho (m)", "number", "1"), ("prof", "Profundidad (m)", "number", "0.3")],
  [("m3", "m³", None), ("litros", "L", None), ("resumen", "Interpretación", None)],
  ["2×1×0.3", "V = 0.6 m³ = 600 L"], "0.6 m³ = 600 L",
  [("¿Cuántos sacos?", "Saco 50L: 12 sacos para 600L."),
   ("¿Tierra mejorada?", "Mezclá con 20-30% compost para mejores resultados."),
   ("¿Hay que llenar arriba?", "No. Dejá 3-5 cm de gap para riego."),
   ("¿Cantero circular?", "Área = π × r². Volumen = área × profundidad."),
   ("¿Fondo drenaje?", "Sí, 5cm de grava mejora drenaje en canteros profundos.")],
  """  const l = Number(i.largo) || 0; const a = Number(i.ancho) || 0; const p = Number(i.prof) || 0;
  const V = l * a * p;
  return { m3: V.toFixed(3), litros: (V*1000).toFixed(0), resumen: `Tierra necesaria: ${V.toFixed(2)} m³ = ${(V*1000).toFixed(0)} L.` };""")

# 2
M("semillas-por-m2-huerta", "🌾", "Semillas por m² de huerta",
  "Calculá cantidad de semillas según especie y área cultivable.", "cantidad = m² × densidad_especie",
  [("m2", "m² disponibles", "number", "10"), ("especie", "Especie", "select", [("lechuga", "Lechuga"), ("tomate", "Tomate"), ("zanahoria", "Zanahoria"), ("rabano", "Rábano"), ("espinaca", "Espinaca")])],
  [("semillas", "Semillas necesarias", None), ("resumen", "Interpretación", None)],
  ["10 m² zanahoria (200/m²)", "2000 semillas"], "2000 semillas",
  [("¿Por qué tantas?", "Para compensar que no todas germinan. Germinación típica 70-85%."),
   ("¿Sembrar directo o plantín?", "Zanahoria: directo. Tomate: plantín. Lechuga: ambas."),
   ("¿Cuándo sembrar?", "Según calendario local y estación. Zanahoria cálida: primavera-verano."),
   ("¿Semillas orgánicas?", "Más caras pero sin químicos. Mejor para huerta personal."),
   ("¿Autopropagación?", "Dejá florecer 1-2 plantas para generar tus propias semillas.")],
  """  const m = Number(i.m2) || 0;
  const dens: Record<string, number> = { lechuga: 20, tomate: 4, zanahoria: 200, rabano: 100, espinaca: 30 };
  const d = dens[String(i.especie)] || 10;
  return { semillas: (m * d).toFixed(0), resumen: `${m} m² de ${i.especie}: ${(m*d).toFixed(0)} semillas.` };""")

# 3
M("agua-riego-plantas-dia", "💧", "Agua de riego por planta/día",
  "Calculá litros de agua necesarios por planta según especie y clima.", "L/día = ET × factor × área",
  [("especie", "Especie", "select", [("tomate", "Tomate"), ("lechuga", "Lechuga"), ("hierba", "Hierba aromática"), ("cactus", "Cactus"), ("arbol", "Árbol maduro")]),
   ("etapa", "Etapa", "select", [("germinacion", "Germinación"), ("crecimiento", "Crecimiento"), ("fructificacion", "Fructificación")])],
  [("litrosDia", "L/día", None), ("resumen", "Interpretación", None)],
  ["Tomate en fructificación", "2.5 L/día"], "2.5 L/día",
  [("¿Cuándo regar?", "Temprano mañana o tarde. Evitar mediodía (evaporación)."),
   ("¿Cómo saber si falta agua?", "Meter dedo 2cm en tierra. Si está seca, regar."),
   ("¿Riego por goteo?", "Ahorra 50% vs manguera. Ideal para verano."),
   ("¿Mulch?", "Paja o hojas sobre tierra reduce evaporación 30-50%."),
   ("¿Lluvia?", "Controla si lluvia >5mm, skip riego ese día.")],
  """  const base: Record<string, number> = { tomate: 2, lechuga: 0.5, hierba: 0.2, cactus: 0.05, arbol: 15 };
  const mult: Record<string, number> = { germinacion: 0.3, crecimiento: 0.7, fructificacion: 1.2 };
  const L = (base[String(i.especie)] || 1) * (mult[String(i.etapa)] || 1);
  return { litrosDia: L.toFixed(2), resumen: `Riego: ${L.toFixed(1)} L/día por planta (${i.especie}, ${i.etapa}).` };""")

# 4-20 (más compactos)
M("fertilizante-npk-dosis", "🌿", "Dosis NPK por planta",
  "Calculá gramos de fertilizante NPK según m² y concentración.", "g = m² × dosis_recomendada",
  [("m2", "m²", "number", "5"), ("tipo", "NPK", "select", [("10-10-10", "10-10-10 balanceado"), ("15-5-20", "15-5-20 hojas"), ("5-10-15", "5-10-15 floración")])],
  [("gramos", "Gramos", None), ("resumen", "Interpretación", None)],
  ["5 m² balanceado 30g/m²", "150g"], "150g",
  [("¿Cuándo aplicar?", "Primavera y después de cada cosecha. 2-4 veces/año."),
   ("¿Orgánico?", "Compost da equivalente NPK 3-1-2. Más lento pero sostenido."),
   ("¿Exceso?", "Quema raíces. Respetar dosis del fabricante."),
   ("¿Disolver en agua?", "Mejor absorción. 20g/10L agua para riego fertilizante."),
   ("¿NPK significa?", "N=nitrógeno (hojas), P=fósforo (raíz/flor), K=potasio (fruto).")],
  """  const m = Number(i.m2) || 0; const t = String(i.tipo);
  const dosis: Record<string, number> = { '10-10-10': 30, '15-5-20': 40, '5-10-15': 35 };
  const g = m * (dosis[t] || 30);
  return { gramos: g.toFixed(0) + ' g', resumen: `Aplicar ${g.toFixed(0)} g de NPK ${t} en ${m} m².` };""")

M("compost-tiempo-maduracion", "🍂", "Tiempo maduración compost",
  "Estimá meses para que tu compost esté listo.", "Depende de temperatura y volteo",
  [("volteo", "Frecuencia volteo", "select", [("semanal", "Semanal"), ("mensual", "Mensual"), ("ninguno", "Ninguno")]),
   ("clima", "Clima", "select", [("calido", "Cálido"), ("templado", "Templado"), ("frio", "Frío")])],
  [("meses", "Meses estimados", None), ("resumen", "Interpretación", None)],
  ["Semanal + cálido", "2 meses"], "2 meses",
  [("¿Señal de listo?", "Color marrón oscuro, olor a tierra, sin restos reconocibles."),
   ("¿Humedad?", "50-60% (como esponja escurrida). Muy seco frena descomposición."),
   ("¿Ratio C:N?", "30:1 ideal. Verdes (N): hojas, café. Marrones (C): papel, hojas secas."),
   ("¿Mal olor?", "Demasiada humedad o poco N. Agregar material seco o volteo."),
   ("¿Tamaño trozos?", "Picar en <5cm acelera 2-3× el proceso.")],
  """  const v = String(i.volteo); const c = String(i.clima);
  const base: Record<string, number> = { semanal: 2, mensual: 4, ninguno: 8 };
  const mult: Record<string, number> = { calido: 1, templado: 1.3, frio: 2 };
  const m = base[v] * mult[c];
  return { meses: m.toFixed(1), resumen: `${m.toFixed(0)} meses para compost listo (volteo ${v}, clima ${c}).` };""")

M("calendario-siembra-hemisferio-sur", "📅", "Calendario siembra Sur (AR/Chile/Uru)",
  "Qué sembrar cada mes en hemisferio sur.", "Selección estacional",
  [("mes", "Mes", "select", [("marzo", "Marzo"), ("abril", "Abril"), ("mayo", "Mayo"), ("junio", "Junio"), ("julio", "Julio"), ("agosto", "Agosto"), ("septiembre", "Septiembre"), ("octubre", "Octubre"), ("noviembre", "Noviembre"), ("diciembre", "Diciembre"), ("enero", "Enero"), ("febrero", "Febrero")])],
  [("recomendadas", "Qué sembrar", None), ("resumen", "Interpretación", None)],
  ["Octubre", "Tomate, zapallito, pimiento, morrón, calabaza"], "Primavera sur: solanáceas",
  [("¿Qué es hemisferio sur?", "AR, Chile, Uruguay, Brasil sur, Perú costa sur."),
   ("¿Lunas?", "Siembra de hojas luna creciente, raíces luna menguante."),
   ("¿Zonas?", "Calendario general. Patagonia/altura: +1 mes. Norte tropical: todo el año."),
   ("¿Hidroponía?", "Ignorar estaciones. Todo el año si controlás temperatura+luz."),
   ("¿Verduras de invierno?", "Acelga, espinaca, lechuga invierno, coliflor, brócoli.")],
  """  const plan: Record<string, string> = {
    marzo: 'Acelga, espinaca, lechuga, rabanito', abril: 'Habas, arvejas, zanahoria',
    mayo: 'Ajo, cebolla, arveja', junio: 'Alcauciles, ajos', julio: 'Lechuga, espinaca',
    agosto: 'Tomate (plantín), pimiento (plantín)', septiembre: 'Maíz, zapallito, choclo',
    octubre: 'Tomate, zapallito, pimiento, morrón, calabaza', noviembre: 'Sandía, melón, pepino',
    diciembre: 'Porotos, maíz tardío', enero: 'Acelga otoño, lechuga cabeza',
    febrero: 'Hinojo, zanahoria otoño, rúcula'
  };
  const m = String(i.mes);
  return { recomendadas: plan[m] || 'Variable', resumen: `En ${m} en hemisferio sur: sembrar ${plan[m] || 'variado'}.` };""")

M("calendario-siembra-hemisferio-norte", "📅", "Calendario siembra Norte (MX/US/ES)",
  "Qué sembrar cada mes en hemisferio norte.", "Selección estacional",
  [("mes", "Mes", "select", [("enero", "Enero"), ("febrero", "Febrero"), ("marzo", "Marzo"), ("abril", "Abril"), ("mayo", "Mayo"), ("junio", "Junio"), ("julio", "Julio"), ("agosto", "Agosto"), ("septiembre", "Septiembre"), ("octubre", "Octubre"), ("noviembre", "Noviembre"), ("diciembre", "Diciembre")])],
  [("recomendadas", "Qué sembrar", None), ("resumen", "Interpretación", None)],
  ["Abril", "Tomate, pimiento, maíz"], "Primavera norte",
  [("¿México qué zona?", "Centro/Norte: hemisferio norte. Yucatán: tropical, todo el año."),
   ("¿España?", "Hemisferio norte. Atlántico más lluvia, Mediterráneo más cálido."),
   ("¿USA?", "Norte frío, sur cálido. Zona USDA determina heladas."),
   ("¿Invernadero?", "Extiende 2 meses cada lado. Germinar adentro, plantar afuera después."),
   ("¿Siembra escalonada?", "Cada 2-3 semanas para cosecha continua.")],
  """  const plan: Record<string, string> = {
    enero: 'Frutales bare root, ajos', febrero: 'Habas, arvejas indoor', marzo: 'Lechuga, rabanito',
    abril: 'Tomate, pimiento, maíz', mayo: 'Pepino, sandía, calabaza', junio: 'Porotos, maíz tardío',
    julio: 'Coliflor, repollo otoño', agosto: 'Acelga, lechuga otoño', septiembre: 'Ajos, espinaca invierno',
    octubre: 'Ajos, bulbos floración', noviembre: 'Frutales desnudos', diciembre: 'Descanso/planificación'
  };
  const m = String(i.mes);
  return { recomendadas: plan[m] || 'Variable', resumen: `En ${m} en hemisferio norte: sembrar ${plan[m] || 'variado'}.` };""")

M("cantidad-cesped-semillas-kg-m2", "🌳", "Semillas de césped por m²",
  "Gramos de semilla césped según mezcla y área.", "g/m² según especie",
  [("m2", "m²", "number", "100"), ("tipo", "Tipo", "select", [("rye", "Ray grass"), ("fescue", "Festuca"), ("mezcla", "Mezcla general")])],
  [("gramos", "Gramos total", None), ("resumen", "Interpretación", None)],
  ["100 m² mezcla", "3.5 kg"], "3.5 kg",
  [("¿Mejor época?", "Primavera u otoño. Evitar verano extremo."),
   ("¿Mezclas?", "Combinar tipos mejora resistencia y cobertura año completo."),
   ("¿Preparar suelo?", "Aflojar 10cm + nivelar + compactar levemente."),
   ("¿Riego?", "Cada día primeras 2-3 semanas. Luego 2-3× semana."),
   ("¿Cuándo cortar primera vez?", "Cuando alcance 8-10cm, cortar a 5cm.")],
  """  const m = Number(i.m2) || 0;
  const rate: Record<string, number> = { rye: 40, fescue: 30, mezcla: 35 };
  const g = m * (rate[String(i.tipo)] || 35);
  return { gramos: (g/1000).toFixed(2) + ' kg', resumen: `${(g/1000).toFixed(1)} kg de semilla ${i.tipo} para ${m} m².` };""")

M("podar-rosal-cuando-fecha", "🌹", "¿Cuándo podar rosal?",
  "Según tu zona, cuándo podar rosales.", "Último helada + días",
  [("zona", "Zona climática", "select", [("frio", "Frío (Patagonia/Sierra)"), ("templado", "Templado (BA/Mendoza)"), ("calido", "Cálido (Norte AR/LATAM trópico)")])],
  [("mejorEpoca", "Mejor época", None), ("resumen", "Interpretación", None)],
  ["Templado BA", "Junio-julio (invierno)"], "Invierno: junio-agosto",
  [("¿Por qué en invierno?", "Planta dormida, no sangra savia. Mejor cicatrización."),
   ("¿Cuánto cortar?", "30-50% de la planta. Corte a 45° sobre yema externa."),
   ("¿Herramientas?", "Tijera afilada y desinfectada con alcohol o lavandina."),
   ("¿Primer año?", "Solo limpieza (muertas, cruzadas). Poda fuerte desde 2do año."),
   ("¿Floración?", "Poda bien hecha = más flores en primavera.")],
  """  const plan: Record<string, string> = { frio: 'Agosto-septiembre (fin invierno)', templado: 'Junio-julio (invierno)', calido: 'Mayo-junio (transición)' };
  const z = String(i.zona);
  return { mejorEpoca: plan[z] || 'Invierno', resumen: `Mejor época poda rosales en zona ${z}: ${plan[z]}.` };""")

M("macetas-tamano-planta", "🏺", "Tamaño maceta ideal por planta",
  "Calculá diámetro de maceta según tamaño de raíz y especie.", "Ø maceta = Ø raíz × 1.5",
  [("diametroRaiz", "Diámetro raíz/cepa actual (cm)", "number", "15"), ("tipo", "Tipo", "select", [("hojas", "Planta hojas"), ("frutal", "Frutal/verdura"), ("cactus", "Cactus")])],
  [("diametro", "Ø maceta", None), ("volumen", "Volumen maceta", None), ("resumen", "Interpretación", None)],
  ["Raíz 15cm, planta hojas", "Maceta 22cm Ø"], "22cm Ø (5 L aprox)",
  [("¿Muy grande es malo?", "Sí. Mucha tierra sin raíces retiene agua → pudrición."),
   ("¿Cambiar maceta?", "Cada 1-3 años según especie. Raíz pegada = trasplantar."),
   ("¿Drenaje?", "Siempre agujeros fondo + capa grava. Sin drenaje = muerte."),
   ("¿Material?", "Barro respira (mejor). Plástico retiene agua (mejor para cactus)."),
   ("¿Profundidad?", "Mayor que Ø en plantas profundas (zanahoria). Igual para resto.")],
  """  const d = Number(i.diametroRaiz) || 10;
  const mult: Record<string, number> = { hojas: 1.5, frutal: 2, cactus: 1.2 };
  const dMaceta = d * (mult[String(i.tipo)] || 1.5);
  const r = dMaceta / 2;
  const V = Math.PI * r * r * dMaceta * 0.0007;
  return { diametro: dMaceta.toFixed(0) + ' cm', volumen: V.toFixed(1) + ' L', resumen: `Maceta ${dMaceta.toFixed(0)}cm Ø (${V.toFixed(0)}L) para ${i.tipo}.` };""")

M("luz-solar-horas-planta", "☀️", "Horas de sol por planta",
  "Recomendación según categoría de requerimiento lumínico.", "tabla horas por tipo",
  [("tipo", "Tipo planta", "select", [("full", "Full sun (tomate, pimiento)"), ("partial", "Partial (lechuga, acelga)"), ("shade", "Shade (helechos, begonias)")])],
  [("horas", "Horas directas/día", None), ("resumen", "Interpretación", None)],
  ["Full sun tomate", "6-8 h sol directo"], "6-8h",
  [("¿Cómo mido?", "Observá tu jardín 1 día entero y marcá horas con sol."),
   ("¿Norte/Sur?", "Hemisferio sur: Norte es más sol. Hemisferio norte: Sur."),
   ("¿Sol filtrado?", "Vale como partial. Árbol transpirable = 50% del sol."),
   ("¿Indoor?", "Ventana sur (hemisferio norte) da 4-6h equivalentes."),
   ("¿Lámparas grow?", "LED grow 20-40W reemplaza sol directo para 1 planta.")],
  """  const tipos: Record<string, string> = { full: '6-8 h', partial: '3-5 h', shade: '1-3 h' };
  const t = String(i.tipo);
  return { horas: tipos[t] || '?', resumen: `Planta ${t}: necesita ${tipos[t]} de sol directo/día.` };""")

M("ph-suelo-correccion-calcio", "⚗️", "pH suelo — dosis cal agrícola",
  "Calculá kg de cal agrícola para corregir pH suelo.", "kg/m² = (pH_ideal - pH_actual) × factor",
  [("phActual", "pH actual", "number", "5.5"), ("phIdeal", "pH ideal", "number", "6.5"), ("m2", "m²", "number", "50")],
  [("kgCal", "Kg cal", None), ("resumen", "Interpretación", None)],
  ["5.5 → 6.5, 50 m²", "Δ=1 × 0.5 kg/m² × 50 = 25 kg"], "25 kg cal agrícola",
  [("¿Qué es cal agrícola?", "Carbonato de calcio molido. Subir pH gradualmente."),
   ("¿Cuándo aplicar?", "Otoño/invierno. Tarda 2-3 meses en actuar."),
   ("¿Bajar pH?", "Azufre elemental o sulfato. Más lento."),
   ("¿Test pH?", "Tiras reactivas ($500 AR) o medidor electrónico ($5000)."),
   ("¿pH ideal?", "Mayoría hortalizas: 6-7. Ácidos: arándano (5), papa (5.5).")],
  """  const pa = Number(i.phActual) || 7; const pi = Number(i.phIdeal) || 6.5; const m = Number(i.m2) || 0;
  const dif = pi - pa;
  const kg = dif * 0.5 * m;
  return { kgCal: kg.toFixed(1) + ' kg', resumen: kg > 0 ? `Agregar ${kg.toFixed(1)} kg cal en ${m} m² para subir pH.` : 'pH ya alcanza o supera ideal.' };""")

M("drenaje-grava-maceta", "🪨", "Grava para drenaje maceta",
  "% volumen de grava para capa drenaje.", "5-15% del volumen maceta",
  [("volumenMaceta", "Volumen maceta (L)", "number", "10")],
  [("litrosGrava", "L grava", None), ("resumen", "Interpretación", None)],
  ["10 L maceta", "0.5-1.5 L grava (5-15%)"], "0.5-1.5 L de grava",
  [("¿Material?", "Grava 0.5-1cm, piedra pómez, arcilla expandida, cerámicos triturados."),
   ("¿Siempre necesario?", "En maceta con drenaje básico no. En macetas grandes sí."),
   ("¿Altura?", "2-5 cm fondo. Más = tierra queda elevada."),
   ("¿Separar con tela?", "Sí. Geotextil entre grava y tierra previene colmatado."),
   ("¿Leca vs grava?", "Leca retiene humedad, grava drena más. Según planta.")],
  """  const V = Number(i.volumenMaceta) || 0;
  const min = V * 0.05; const max = V * 0.15;
  return { litrosGrava: `${min.toFixed(1)}-${max.toFixed(1)} L`, resumen: `Drenaje: ${min.toFixed(1)}-${max.toFixed(1)} L de grava para maceta de ${V} L.` };""")

M("zona-usda-clima", "🌐", "Zona USDA según T mínima",
  "Determiná zona climática USDA según T mín invierno.", "Tabla USDA oficial",
  [("tMin", "Temperatura mín invierno (°C)", "number", "-5")],
  [("zona", "Zona USDA", None), ("resumen", "Interpretación", None)],
  ["-5°C", "Zona 7"], "Zona 7",
  [("¿Para qué sirve?", "Saber qué plantas sobreviven el invierno en tu región."),
   ("¿AR zonas?", "Patagonia 6-7. BA 9-10. Norte AR 10-11. Selva 11-12."),
   ("¿España?", "Interior alta 6-7. Mediterráneo 9-10. Canarias 11."),
   ("¿Plantas hardiness?", "Etiqueta 'zona 7' = tolera hasta zona 7 mínima."),
   ("¿Microclimas?", "Jardín cerca pared sur (hemisferio norte) es 1-2 zonas arriba.")],
  """  const t = Number(i.tMin);
  let z: string;
  if (t <= -40) z = '1-2'; else if (t <= -30) z = '3'; else if (t <= -20) z = '4-5';
  else if (t <= -10) z = '6'; else if (t <= -5) z = '7'; else if (t <= 0) z = '8';
  else if (t <= 5) z = '9'; else if (t <= 10) z = '10'; else z = '11+';
  return { zona: 'Zona ' + z, resumen: `Con mínima ${t}°C estás en zona USDA ${z}.` };""")

M("distancia-entre-plantas-huerto", "🌽", "Distancia entre plantas",
  "Distancia recomendada entre plantas según especie.", "tabla especie",
  [("especie", "Especie", "select", [("tomate", "Tomate"), ("lechuga", "Lechuga"), ("zanahoria", "Zanahoria"), ("papa", "Papa"), ("calabaza", "Calabaza")])],
  [("distancia", "Distancia (cm)", None), ("resumen", "Interpretación", None)],
  ["Tomate", "60-80 cm"], "60-80 cm",
  [("¿Por qué importa?", "Menos distancia = competencia por agua/luz. Más = desperdicio de espacio."),
   ("¿Siembra intercalada?", "Zanahoria entre tomate ahorra espacio y mejora sabor."),
   ("¿Altura?", "Trepadoras (chauchas) arriba. Tapizantes abajo."),
   ("¿Entre filas?", "Más que entre plantas para que circule aire."),
   ("¿Tutor/guía?", "Tomate, pepino necesitan. Calabaza rastrera.")],
  """  const d: Record<string, string> = { tomate: '60-80', lechuga: '25-30', zanahoria: '5-10', papa: '30-40', calabaza: '100-150' };
  const e = String(i.especie);
  return { distancia: (d[e] || '?') + ' cm', resumen: `${e}: ${d[e]} cm entre plantas.` };""")

M("cosecha-esperada-huerta-kg", "🍅", "Cosecha esperada huerta",
  "Rendimiento kg/m²/año por cultivo.", "tabla rendimiento",
  [("especie", "Cultivo", "select", [("tomate", "Tomate"), ("lechuga", "Lechuga"), ("zanahoria", "Zanahoria"), ("papa", "Papa"), ("calabaza", "Calabaza")]),
   ("m2", "m²", "number", "10")],
  [("kgTotal", "Kg estimados", None), ("resumen", "Interpretación", None)],
  ["Tomate 10 m²", "3 kg/m² × 10 = 30 kg/año"], "30 kg/año",
  [("¿Rendimiento según?", "Nutrición suelo, riego, sol, especie específica."),
   ("¿Aumentar?", "Compost + riego adecuado = +40% típico."),
   ("¿Verano vs invierno?", "Tomate solo primavera-verano. Lechuga 2-3 cosechas/año."),
   ("¿Orgánico vs convencional?", "Similar rendimiento con buen manejo. Calidad mejor."),
   ("¿Variedades?", "Híbridas más rendidoras pero requieren más inputs.")],
  """  const yield_: Record<string, number> = { tomate: 3, lechuga: 2, zanahoria: 4, papa: 2.5, calabaza: 5 };
  const m = Number(i.m2) || 0; const kg = (yield_[String(i.especie)] || 2) * m;
  return { kgTotal: kg.toFixed(1) + ' kg', resumen: `Cosecha estimada: ${kg.toFixed(0)} kg de ${i.especie} en ${m} m².` };""")

M("mulching-espesor-cantidad", "🍃", "Cantidad de mulch",
  "M² × espesor mulch = volumen y peso.", "V = m² × espesor",
  [("m2", "m²", "number", "20"), ("espesor", "Espesor (cm)", "number", "5")],
  [("m3", "m³", None), ("kg", "Kg (paja)", None), ("resumen", "Interpretación", None)],
  ["20 m² × 5 cm", "V = 1 m³ = ~100 kg paja"], "1 m³ (100 kg)",
  [("¿Tipos mulch?", "Paja (5 cm), corteza pino (3 cm), grava (10 cm), viruta, hojas secas."),
   ("¿Beneficios?", "Retiene humedad 30-50%, controla maleza, mejora suelo al descomponer."),
   ("¿Cuándo aplicar?", "Después de regar bien. Renovar cada año o 6 meses."),
   ("¿Grosor mínimo?", "3 cm mínimo para efectividad. 5-8 cm ideal."),
   ("¿Evitar contacto tallo?", "Sí, deja 3-5 cm libres cerca de la base para evitar pudrición.")],
  """  const m = Number(i.m2) || 0; const e = Number(i.espesor) || 5;
  const V = m * (e / 100); const kg = V * 100;
  return { m3: V.toFixed(2), kg: kg.toFixed(0), resumen: `${V.toFixed(1)} m³ = ${kg.toFixed(0)} kg paja para ${m} m² a ${e} cm espesor.` };""")

M("germinacion-tiempo-temperatura", "🌱", "Días germinación por temperatura",
  "Tiempo estimado germinación según especie y T suelo.", "tabla especie-temperatura",
  [("especie", "Especie", "select", [("lechuga", "Lechuga"), ("tomate", "Tomate"), ("zanahoria", "Zanahoria"), ("pimiento", "Pimiento"), ("pepino", "Pepino")]),
   ("temperatura", "T suelo (°C)", "number", "20")],
  [("dias", "Días", None), ("resumen", "Interpretación", None)],
  ["Tomate 20°C", "7-10 días"], "7-10 días",
  [("¿T ideal tomate?", "22-26°C. Bajo 15°C puede no germinar."),
   ("¿Por qué 'rango'?", "Depende humedad, calidad semilla, variedad."),
   ("¿Acelerar?", "Pre-remojo 24h + temperatura control + humedad alta."),
   ("¿No germina?", "Semilla vieja, T inadecuada, demasiado/poco agua."),
   ("¿Germinador casero?", "Plato con algodón húmedo bajo film o recipiente cerrado.")],
  """  const data: Record<string, Record<number, string>> = {
    lechuga: { 15: '7-10', 20: '5-7', 25: '3-5' },
    tomate: { 15: '14-21', 20: '7-10', 25: '5-7' },
    zanahoria: { 15: '14-21', 20: '10-14', 25: '7-10' },
    pimiento: { 15: '21-30', 20: '14-21', 25: '10-14' },
    pepino: { 15: '10-14', 20: '7-10', 25: '4-6' }
  };
  const e = String(i.especie); const t = Number(i.temperatura) || 20;
  const row = data[e] || {};
  const key = t < 18 ? 15 : t < 23 ? 20 : 25;
  const d = row[key] || 'Variable';
  return { dias: d + ' días', resumen: `${e} a ${t}°C: germina en ${d} días.` };""")

M("cantidad-plantas-seto-metros", "🌿", "Plantas para seto lineal",
  "Plantas necesarias para un seto según metros y distancia.", "plantas = m / dist",
  [("metros", "Metros lineales", "number", "10"), ("especie", "Especie", "select", [("tuya", "Tuya (0.8m)"), ("liguster", "Liguster (0.4m)"), ("bambu", "Bambú (1m)")])],
  [("cantidad", "Plantas", None), ("resumen", "Interpretación", None)],
  ["10 m tuya", "10/0.8 = 13 plantas"], "13 plantas",
  [("¿Cuándo plantar?", "Otoño o primavera. Evitar verano extremo."),
   ("¿Altura final?", "Tuya 2-4m. Liguster 1-3m. Bambú 3-6m."),
   ("¿Poda?", "Liguster cada 6 meses. Tuya 1×/año."),
   ("¿Mantenimiento?", "Tuya: poco. Liguster: mucho. Bambú: invasivo."),
   ("¿Riego?", "Frecuente primer año. Después tolerancia sequía variable.")],
  """  const m = Number(i.metros) || 0;
  const d: Record<string, number> = { tuya: 0.8, liguster: 0.4, bambu: 1 };
  const dist = d[String(i.especie)] || 0.5;
  const n = Math.ceil(m / dist);
  return { cantidad: n.toString(), resumen: `${n} plantas de ${i.especie} para ${m} m de seto (distancia ${dist}m).` };""")

M("hidroponia-nutrientes-ec-ppm", "🧪", "Nutrientes hidroponía EC/ppm",
  "Convertí EC (mS/cm) a ppm para hidroponía.", "ppm = EC × factor (500-700)",
  [("ec", "EC (mS/cm)", "number", "1.5"), ("escala", "Escala", "select", [("500", "Hanna/500 (NaCl)"), ("640", "Eutech/640"), ("700", "US/700")])],
  [("ppm", "PPM", None), ("resumen", "Interpretación", None)],
  ["EC=1.5, escala 500", "ppm = 750"], "750 ppm",
  [("¿Qué es EC?", "Conductividad eléctrica. Mide sales disueltas (nutrientes)."),
   ("¿EC ideal?", "Lechuga: 0.8-1.2. Tomate: 2-3.5. Planta joven < madura."),
   ("¿ppm ideal?", "Similar. 500-1800 ppm según especie/etapa."),
   ("¿Sobre/baja?", "Alto daña raíces. Bajo retarda crecimiento."),
   ("¿Medidor?", "EC meter ~$5000-15000 AR. Imprescindible en hidroponía.")],
  """  const ec = Number(i.ec) || 0;
  const factor = Number(i.escala) || 500;
  const ppm = ec * factor;
  return { ppm: ppm.toFixed(0), resumen: `EC ${ec} mS/cm × ${factor} = ${ppm.toFixed(0)} ppm (escala ${factor}).` };""")
