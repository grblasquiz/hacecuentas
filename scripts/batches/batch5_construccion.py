"""Batch 5 — Construcción (20 calcs)."""
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
    SPECS.append(spec(slug, "construccion", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


M("zapata-corrida-m3-hormigon", "🏗️", "Zapata corrida — m³ hormigón",
  "Volumen hormigón para zapata corrida según largo, ancho y altura.", "V = L × A × h",
  [("L", "Largo (m)", "number", "20"), ("A", "Ancho (m)", "number", "0.4"), ("h", "Alto (m)", "number", "0.3")],
  [("m3", "m³", None), ("bolsasCemento", "Bolsas cemento", None), ("resumen", "Interpretación", None)],
  ["20×0.4×0.3", "V = 2.4 m³"], "2.4 m³ (10 bolsas cemento)",
  [("¿Dosaje?", "H21: 350 kg cemento/m³. 1:2:3 (cemento:arena:piedra)."),
   ("¿Armado?", "Zapata corrida usa 4-6 hierros φ8-10 + estribos."),
   ("¿Profundidad?", "Por debajo de nivel helada. Mínimo 50 cm típico."),
   ("¿Encofrado?", "Tablones de 2.5-3 cm. Reutilizable 3-5 veces."),
   ("¿Curado?", "7 días húmedo mínimo. Mejor 28 días.")],
  """  const L = Number(i.L) || 0; const A = Number(i.A) || 0; const h = Number(i.h) || 0;
  const V = L * A * h;
  const bolsas = Math.ceil(V * 10);
  return { m3: V.toFixed(2), bolsasCemento: bolsas.toString(), resumen: `V = ${V.toFixed(2)} m³, ~${bolsas} bolsas cemento 50kg.` };""")

M("zapata-aislada-columnas", "🏛️", "Zapata aislada — dimensión",
  "Dimensionado zapata aislada según carga de columna.", "A = P / σ_adm",
  [("cargaKN", "Carga (kN)", "number", "200"), ("sigmaAdm", "σ admisible suelo (kPa)", "number", "150")],
  [("areaNecesaria", "Área necesaria", None), ("ladoCuadrada", "Lado (si cuadrada)", None), ("resumen", "Interpretación", None)],
  ["200 kN, σ=150 kPa", "A = 200/150 = 1.33 m²", "Lado 1.16 m"], "1.2×1.2 m",
  [("¿σ admisible típico?", "Suelo firme: 150-300 kPa. Blando: 50-100 kPa. Roca: 500+."),
   ("¿Profundidad?", "Bajo línea de helada + 0.5m mínimo."),
   ("¿Margen?", "Redondear hacia arriba 20%. Ej 1.16 → 1.20 m."),
   ("¿Armado?", "Hierros bidireccionales φ10-12. Estribos si h > 40cm."),
   ("¿Estudio suelo?", "Obligatorio en construcciones importantes. Costo 300-1500 USD.")],
  """  const P = Number(i.cargaKN) || 0; const s = Number(i.sigmaAdm) || 150;
  const A = P / s; const lado = Math.sqrt(A);
  return { areaNecesaria: A.toFixed(2) + ' m²', ladoCuadrada: lado.toFixed(2) + ' m', resumen: `Zapata ${lado.toFixed(1)}×${lado.toFixed(1)} m (A = ${A.toFixed(2)} m²).` };""")

M("viga-hormigon-h-b-dimensiones", "🏗️", "Dimensionado viga hormigón",
  "Altura y ancho viga hormigón según luz libre.", "h ≈ L/12, b = h/2",
  [("luz", "Luz libre (m)", "number", "6")],
  [("altura", "Altura (cm)", None), ("ancho", "Ancho (cm)", None), ("resumen", "Interpretación", None)],
  ["Luz 6 m", "h = 6/12 = 50 cm, b = 25 cm"], "50×25 cm",
  [("¿Regla L/12?", "Estimación rápida. Cálculo real con cargas requerido."),
   ("¿Apoyada simple vs empotrada?", "Empotrada puede ser más baja (L/15)."),
   ("¿Armado?", "Hierros φ12-16 + estribos φ6-8 cada 15-25 cm."),
   ("¿Concreto H21?", "Mínimo. Para luces grandes H25 o pretensado."),
   ("¿Flecha?", "Calcular deflexión si L > 7m.")],
  """  const L = Number(i.luz) || 0;
  const h = L * 100 / 12; const b = h / 2;
  return { altura: h.toFixed(0), ancho: b.toFixed(0), resumen: `Viga ${h.toFixed(0)}×${b.toFixed(0)} cm para luz ${L} m.` };""")

M("acero-kg-m2-losa", "🔩", "Hierro por m² de losa",
  "Kg de acero por m² según tipo de losa.", "kg/m² según espesor",
  [("tipo", "Tipo losa", "select", [("viguetas", "Viguetas pretensadas"), ("maciza", "Maciza tradicional"), ("aliviana", "Aliviana")])],
  [("kgPorM2", "Kg/m²", None), ("resumen", "Interpretación", None)],
  ["Losa maciza tradicional", "10-15 kg/m²"], "10-15 kg/m²",
  [("¿Ejemplo concreto?", "Losa maciza 15cm: ~12 kg/m². 60m² = 720 kg hierro."),
   ("¿Tipos hierro?", "Dureza natural (ADN 420) o conformado en frío. Φ6, 8, 10, 12, 16."),
   ("¿Gastos totales?", "Hierro: 20-30% del costo de losa. Hormigón 40-50%."),
   ("¿Cadenas?", "Vigas que conectan columnas. 4φ10-12."),
   ("¿Normativa?", "CIRSOC 201/202. Profesional matriculado obligatorio en AR.")],
  """  const tipo = String(i.tipo);
  const rangos: Record<string, string> = { viguetas: '7-10 kg/m²', maciza: '10-15 kg/m²', aliviana: '8-12 kg/m²' };
  return { kgPorM2: rangos[tipo] || '?', resumen: `Losa ${tipo}: ${rangos[tipo]}. Multiplicar por m² totales.` };""")

M("escalera-huella-contrahuella-ley-blondel", "🪜", "Escalera — ley de Blondel",
  "Dimensionado óptimo huella + contrahuella según ley Blondel (62-64 cm).", "H + 2C = 62-64 cm",
  [("altura", "Altura total (cm)", "number", "270"), ("profundidad", "Profundidad disponible (cm)", "number", "240")],
  [("escalones", "Escalones", None), ("huella", "Huella (cm)", None), ("contrahuella", "Contrahuella (cm)", None), ("resumen", "Interpretación", None)],
  ["270 cm alt, 240 cm prof", "15 escalones", "h=18 cm, C=16 cm", "H+2C = 26+2(16)=58 ✗ (algo justo)"],
  "15 esc, h=18, C=16",
  [("¿Ley Blondel?", "H + 2C = 62-64 cm. Cómodo y seguro."),
   ("¿Contrahuella ideal?", "17-18 cm. Comercial máx 20 cm. Mínimo 16 cm."),
   ("¿Huella ideal?", "28-30 cm. Menos = apretado. Más = agotador."),
   ("¿Pendiente máxima?", "35-37°. Más pronunciada = peligroso."),
   ("¿Escalera caracol?", "Requiere 1.5 m Ø mínimo por normativa.")],
  """  const H = Number(i.altura) || 0; const P = Number(i.profundidad) || 0;
  const nEscalones = Math.ceil(H / 18);
  const c = H / nEscalones; const h = P / nEscalones;
  const blondel = h + 2 * c;
  return {
    escalones: nEscalones.toString(), huella: h.toFixed(1), contrahuella: c.toFixed(1),
    resumen: `${nEscalones} escalones: huella ${h.toFixed(0)} cm, contrahuella ${c.toFixed(0)} cm. Blondel: ${blondel.toFixed(0)} ${blondel >= 62 && blondel <= 64 ? '✓' : '(ajustar)'}.`
  };""")

M("pintura-litros-m2-manos", "🎨", "Litros pintura por m² + manos",
  "Calculá litros pintura según área, rendimiento y manos.", "L = m² × manos / rendimiento",
  [("m2", "m²", "number", "50"), ("manos", "Manos", "number", "2"), ("rendimiento", "Rendimiento (m²/L)", "number", "10")],
  [("litros", "Litros", None), ("galones", "Galones", None), ("resumen", "Interpretación", None)],
  ["50 m² × 2 manos / 10", "10 L = 2.5 gal"], "10 L de pintura",
  [("¿Rendimiento real?", "Látex interior 8-12 m²/L. Esmalte 10-14. Antihumedad 6-8."),
   ("¿Primera mano?", "Sobre superficies porosas descubrir bebe más. A veces 3 manos."),
   ("¿Rollos vs pincel?", "Rollo 20% menos desperdicio. Pincel para esquinas/detalles."),
   ("¿Exterior?", "2-3 manos obligatorio. Acrílico látex exterior o esmalte sintético."),
   ("¿Colores oscuros?", "Requieren 1 mano extra por opacidad.")],
  """  const m = Number(i.m2) || 0; const ma = Number(i.manos) || 1; const r = Number(i.rendimiento) || 10;
  const L = (m * ma) / r;
  const gal = L * 0.264;
  return { litros: L.toFixed(1), galones: gal.toFixed(2), resumen: `${L.toFixed(1)} L (${gal.toFixed(1)} gal) para ${m} m² con ${ma} manos.` };""")

M("impermeabilizante-techo-kg-m2", "🏠", "Impermeabilizante techo kg/m²",
  "Kg de impermeabilizante líquido o acrílico según m² y espesor.", "kg = m² × 2-3 kg/m²",
  [("m2", "m²", "number", "50"), ("tipo", "Tipo", "select", [("liquido", "Impermeabilizante líquido"), ("membrana", "Membrana asfáltica")])],
  [("cantidad", "Cantidad", None), ("resumen", "Interpretación", None)],
  ["50 m² líquido", "50 × 2.5 = 125 kg"], "125 kg",
  [("¿Cuándo aplicar?", "Temp > 10°C, sin lluvia próxima 48h, superficie limpia."),
   ("¿Preparación?", "Limpiar + reparar fisuras + sellador + 2-3 manos."),
   ("¿Duración?", "Acrílico 5-7 años. Membrana asfáltica 15-20."),
   ("¿Colores claros?", "Reflejan calor — techo 10°C más frío."),
   ("¿Traslapes?", "10 cm mínimo en membranas asfálticas.")],
  """  const m = Number(i.m2) || 0;
  const kg_m2 = i.tipo === 'membrana' ? 8 : 2.5;
  const total = m * kg_m2;
  return { cantidad: total.toFixed(0) + ' kg', resumen: `${total.toFixed(0)} kg de ${i.tipo} para ${m} m² de techo.` };""")

M("aislacion-termica-k-minimo-zona", "🌡️", "Aislación térmica K mínimo por zona",
  "Transmitancia K mínima según zona climática (IRAM 11605).", "K según zona",
  [("zona", "Zona bioclimática", "select", [("I-II", "I-II cálida/templada"), ("III", "III templada"), ("IV-V", "IV-V fría"), ("VI", "VI muy fría")])],
  [("kMaximo", "K máx (W/m²K)", None), ("resumen", "Interpretación", None)],
  ["Zona III templada", "K máx 1.0"], "1.0 W/m²K",
  [("¿Qué es K?", "Transmitancia térmica: cuánto calor pasa por m² y °C de diferencia."),
   ("¿Menor K?", "Más aislante. K=0.5 es 2× mejor que K=1.0."),
   ("¿Zonas AR?", "I-II (NOA/Litoral), III (Pampa centro), IV-V (Patagonia), VI (cordillera)."),
   ("¿Cómo mejorar?", "Poliestireno 5cm: K≈0.6. Lana de vidrio 10cm: K≈0.4."),
   ("¿Normativa?", "Ley 4.458 CABA obligatorio en obra nueva. Nacional: voluntario.")],
  """  const zonas: Record<string, string> = { 'I-II': '1.2', 'III': '1.0', 'IV-V': '0.85', 'VI': '0.74' };
  const z = String(i.zona);
  return { kMaximo: zonas[z] || '1.0', resumen: `Zona ${z}: K máx ${zonas[z]} W/m²K (IRAM 11605).` };""")

M("membrana-asfaltica-rollos", "🏠", "Rollos membrana asfáltica",
  "Cantidad rollos según m² (1 rollo = 10 m²).", "rollos = m² / 10",
  [("m2", "m² a impermeabilizar", "number", "60")],
  [("rollos", "Rollos", None), ("resumen", "Interpretación", None)],
  ["60 m² + 10% solape", "7 rollos"], "7 rollos",
  [("¿Rollo estándar?", "1 m × 10 m = 10 m².  Varían espesor (3, 4, 5 mm)."),
   ("¿Solapes?", "10 cm. Suma 10-15% extra al m² total."),
   ("¿Aplicación?", "Con soplete (profesional) o adhesivo."),
   ("¿Bicapa?", "Dos capas cruzadas para mayor durabilidad."),
   ("¿Protegida?", "Aluminio/gravilla protege del UV. Sin protección: 5-7 años.")],
  """  const m = Number(i.m2) || 0;
  const rollos = Math.ceil((m * 1.1) / 10);
  return { rollos: rollos.toString(), resumen: `${rollos} rollos para ${m} m² (incluyendo 10% solape).` };""")

M("pared-ladrillos-metros-m2", "🧱", "Ladrillos por m² de pared",
  "Cantidad ladrillos según tipo y m² de pared.", "Tabla según ladrillo",
  [("tipo", "Tipo ladrillo", "select", [("comun", "Común 18×8×6"), ("portante", "Portante 18×14×33"), ("cerramiento", "Cerramiento 20×12×33")]),
   ("m2", "m²", "number", "20")],
  [("cantidad", "Ladrillos", None), ("resumen", "Interpretación", None)],
  ["Común, 20 m²", "20 × 60 = 1200 ladrillos"], "1200 ladrillos",
  [("¿Desperdicio?", "Sumar 5-10% extra por cortes y roturas."),
   ("¿Mortero?", "Común: 0.06 m³/m². Portante: 0.04. Arena+cemento."),
   ("¿Peso?", "Común 1.3 kg c/u. Pared 15 cm: ~150 kg/m²."),
   ("¿Portante vs común?", "Portante soporta carga estructural. Común es cerramiento."),
   ("¿Alternativas?", "Bloque hormigón (más rápido). Termoarcilla (aislante). Ladrillo visto (estética).")],
  """  const rates: Record<string, number> = { comun: 60, portante: 16, cerramiento: 20 };
  const r = rates[String(i.tipo)] || 60;
  const m = Number(i.m2) || 0;
  const total = Math.ceil(m * r * 1.08);
  return { cantidad: total.toString(), resumen: `${total} ladrillos ${i.tipo} para ${m} m² (+8% desperdicio).` };""")

M("revoque-grueso-m3-m2", "🏠", "Arena/cemento para revoque grueso",
  "m³ de mortero para revoque grueso según m² y espesor.", "V = m² × espesor",
  [("m2", "m² pared", "number", "30"), ("espesor", "Espesor (cm)", "number", "2")],
  [("m3Mortero", "m³ mortero", None), ("bolsasCemento", "Bolsas cemento", None), ("m3Arena", "m³ arena", None), ("resumen", "Interpretación", None)],
  ["30 m² × 2 cm", "0.6 m³ mortero, 3 bolsas cemento, 0.5 m³ arena"], "0.6 m³ mortero",
  [("¿Dosaje grueso?", "1:4 (cemento:arena). 6 bolsas/m³."),
   ("¿Fino?", "1:3:0.5 con cal. 8 bolsas/m³."),
   ("¿Hidratación?", "Mojar pared antes. Humedad controla fisuras."),
   ("¿Espesor máximo?", "2 cm por capa. Más = riesgo desprendimiento."),
   ("¿Curado?", "3-7 días húmedo.")],
  """  const m = Number(i.m2) || 0; const e = Number(i.espesor) || 2;
  const V = m * (e / 100);
  const bolsas = Math.ceil(V * 6);
  const arena = V * 0.9;
  return { m3Mortero: V.toFixed(2), bolsasCemento: bolsas.toString(), m3Arena: arena.toFixed(2),
    resumen: `${V.toFixed(2)} m³ mortero para ${m} m² × ${e}cm. Materiales: ${bolsas} bolsas cemento + ${arena.toFixed(1)} m³ arena.` };""")

M("ceramicos-m2-cajas", "🔲", "Cerámicos cajas por m² +descarte",
  "Cantidad cajas cerámicos según m² piso + descarte 10%.", "cajas = m² × 1.10 / m²_caja",
  [("m2", "m²", "number", "25"), ("m2PorCaja", "m²/caja", "number", "1.5")],
  [("cajas", "Cajas", None), ("m2Comprar", "m² a comprar", None), ("resumen", "Interpretación", None)],
  ["25 m² piso, caja 1.5 m²", "ceil(27.5/1.5) = 19 cajas"], "19 cajas (27.5 m²)",
  [("¿Por qué 10% extra?", "Cortes, roturas, y 1 caja reserva para futuras reparaciones."),
   ("¿Diseño diagonal?", "+15% en vez de 10%."),
   ("¿Lotes?", "Sí — cerámicos del mismo lote para evitar diferencias de tono."),
   ("¿Pegamento?", "Pegamento cerámico: 5 kg/m². No mezclar con mezcla común."),
   ("¿Pastina?", "Después del secado (24-48h). Ancho junta 2-5 mm.")],
  """  const m = Number(i.m2) || 0; const cpc = Number(i.m2PorCaja) || 1.5;
  const total_m2 = m * 1.10;
  const cajas = Math.ceil(total_m2 / cpc);
  return { cajas: cajas.toString(), m2Comprar: (cajas * cpc).toFixed(1),
    resumen: `${cajas} cajas = ${(cajas*cpc).toFixed(1)} m² (${m} m² + 10% descarte).` };""")

M("zocalo-metros-lineal", "📏", "Zócalo — metros lineales",
  "Perímetro para zócalo según dimensiones ambiente.", "P = 2(L + A) - puertas",
  [("largo", "Largo ambiente (m)", "number", "5"), ("ancho", "Ancho (m)", "number", "4"), ("puertas", "Ancho total puertas (m)", "number", "1.6")],
  [("metrosLineales", "m lineales", None), ("varillas", "Varillas 2.4m", None), ("resumen", "Interpretación", None)],
  ["5×4 - 1.6m puertas", "2×(5+4)-1.6 = 16.4 m"], "16.4 m = 7 varillas",
  [("¿Material?", "PVC: más económico. Madera: tradicional. Aluminio: moderno."),
   ("¿Altura?", "8-12 cm típico. Con calefacción rodapié: 14-20 cm."),
   ("¿Desperdicio?", "Sumar 5-10% por cortes. Esquinas consumen."),
   ("¿Instalación?", "Clavo, adhesivo PL Premium, o sistema clip."),
   ("¿Pintar junta?", "Sellar unión con pared + pintar.")],
  """  const L = Number(i.largo) || 0; const A = Number(i.ancho) || 0; const p = Number(i.puertas) || 0;
  const m = 2 * (L + A) - p;
  const total = m * 1.08;
  const var_ = Math.ceil(total / 2.4);
  return { metrosLineales: m.toFixed(1) + ' m', varillas: var_.toString(),
    resumen: `${m.toFixed(1)} m lineales de zócalo = ${var_} varillas de 2.4 m.` };""")

M("rejilla-trampa-desague", "🔽", "Rejilla trampa — Ø por uso",
  "Diámetro rejilla desagüe según uso sanitario.", "Tabla uso",
  [("uso", "Uso", "select", [("lavatorio", "Lavatorio"), ("cocina", "Cocina"), ("patio", "Patio/lluvia"), ("ducha", "Ducha")])],
  [("diametro", "Ø recomendado", None), ("resumen", "Interpretación", None)],
  ["Patio lluvia", "100 mm"], "100 mm",
  [("¿Medida estándar AR?", "50 mm (lavatorio), 75-100 mm (cocina, ducha), 110-150 mm (patio)."),
   ("¿Material?", "Plástico ABS (más común), PVC, aluminio, bronce."),
   ("¿Sifón?", "Trampa de agua evita mal olor. Obligatoria."),
   ("¿Pendiente?", "1-2% para flujo correcto."),
   ("¿Capacidad lluvia?", "Por cada 50 m² techo: rejilla 100 mm basta.")],
  """  const usos: Record<string, string> = { lavatorio: '50 mm', cocina: '75-100 mm', patio: '100-150 mm', ducha: '75-100 mm' };
  const u = String(i.uso);
  return { diametro: usos[u] || '100 mm', resumen: `${u}: rejilla Ø ${usos[u]}.` };""")

M("tanque-agua-litros-personas", "💧", "Tanque agua L por personas",
  "Capacidad tanque agua según personas y reserva.", "L = personas × 200 × reserva",
  [("personas", "Personas", "number", "4"), ("reserva", "Días reserva", "number", "2")],
  [("litrosTotal", "L totales", None), ("tanqueComercial", "Tanque comercial", None), ("resumen", "Interpretación", None)],
  ["4 personas × 200 L × 2 días", "1600 L"], "1600 L → Tanque 1500-2000 L",
  [("¿200 L/persona/día?", "Norma sanitaria AR. Reducido (eco): 150 L. Urbano abundante: 250."),
   ("¿Reserva típica?", "1 día urbano con red confiable. 2-3 días suburbano."),
   ("¿Material?", "Polietileno tricapa (más común). Fibrocemento (obsoleto)."),
   ("¿Sobre losa?", "Sí, con base plana. Nunca sobre terreno blando."),
   ("¿Presión?", "Altura 8-10 m da presión típica (3-5 mca).")],
  """  const p = Number(i.personas) || 1; const r = Number(i.reserva) || 1;
  const L = p * 200 * r;
  const comerciales = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000, 5000];
  const next = comerciales.find(x => x >= L) || L;
  return { litrosTotal: L.toFixed(0) + ' L', tanqueComercial: next.toString() + ' L',
    resumen: `${L.toFixed(0)} L necesarios (${p} personas × 200 L × ${r} días reserva). Tanque comercial ${next} L.` };""")

M("bombeo-cisterna-tanque-watts", "⚙️", "Bomba agua — potencia",
  "Potencia bomba para elevar agua según caudal, altura y eficiencia.", "P = Q × ρ × g × H / η",
  [("Q", "Caudal (L/min)", "number", "30"), ("H", "Altura (m)", "number", "15"), ("eff", "Eficiencia (%)", "number", "60")],
  [("watts", "Potencia bomba", None), ("hp", "En HP", None), ("resumen", "Interpretación", None)],
  ["30 L/min, H=15 m, η=60%", "P = 122 W"], "0.16 HP",
  [("¿Bomba sumergible vs superficie?", "Sumergible mejor para > 8 m. Superficie para poco H."),
   ("¿Caudal típico?", "Casa 4 personas: 30-60 L/min. Quinta: 60-200 L/min."),
   ("¿HP comerciales?", "½, ¾, 1, 1.5, 2, 3 HP. Elegir siguiente arriba."),
   ("¿Nivel de agua?", "Altura succión (pozo) + impulsión (tanque) = H total."),
   ("¿Automatizar?", "Presostato + boya de tanque evita funcionamiento innecesario.")],
  """  const Q = Number(i.Q) || 0; const H = Number(i.H) || 0; const eff = (Number(i.eff) || 60) / 100;
  const Qm3s = Q / 60000;
  const P = Qm3s * 1000 * 9.81 * H / eff;
  const hp = P / 746;
  return { watts: P.toFixed(0) + ' W', hp: hp.toFixed(2) + ' HP',
    resumen: `Bomba ${P.toFixed(0)} W (${hp.toFixed(2)} HP) para ${Q} L/min a ${H} m con η=${(eff*100).toFixed(0)}%.` };""")

M("cano-agua-diametro-caudal", "🚰", "Caño agua — diámetro por caudal",
  "Diámetro caño según caudal y velocidad máxima.", "Q = V × A",
  [("Q", "Caudal (L/s)", "number", "1")],
  [("diametro", "Ø interior (mm)", None), ("canoComercial", "Caño comercial", None), ("resumen", "Interpretación", None)],
  ["Q=1 L/s, velocidad 1 m/s", "Ø ≈ 36 mm"], "Caño 40 mm",
  [("¿Velocidad máxima?", "Potable: 1.5-2.5 m/s. Menos = mayor Ø (más caro)."),
   ("¿Pérdidas de carga?", "Mayor con caudal alto, menor Ø, más longitud."),
   ("¿PVC vs cobre?", "PVC más barato. Cobre más durable. PPR térmico para caliente."),
   ("¿Caño principal?", "Al menos 25 mm en casa mediana."),
   ("¿Bajadas a canillas?", "13-20 mm típico.")],
  """  const Q_ls = Number(i.Q) || 0;
  const Qm3s = Q_ls / 1000;
  const V = 1.5;
  const A = Qm3s / V;
  const d = Math.sqrt(4 * A / Math.PI) * 1000;
  const comerciales = [13, 20, 25, 32, 40, 50, 63, 75, 90, 110];
  const next = comerciales.find(x => x >= d) || d;
  return { diametro: d.toFixed(0) + ' mm', canoComercial: next + ' mm',
    resumen: `Ø ${d.toFixed(0)} mm necesario (V=1.5 m/s). Comercial: ${next} mm.` };""")

M("caldera-kw-m2-calefaccion", "🔥", "Caldera kW por m² calefacción",
  "Potencia caldera según m² y aislamiento.", "kW ≈ m² × 0.08-0.10",
  [("m2", "m² a calefaccionar", "number", "100"), ("aislamiento", "Aislamiento", "select", [("bueno", "Bueno"), ("normal", "Normal"), ("malo", "Malo")])],
  [("kw", "Potencia caldera", None), ("resumen", "Interpretación", None)],
  ["100 m² normal", "9 kW"], "9 kW",
  [("¿Factor por aislamiento?", "Bueno: 0.07. Normal: 0.09. Malo: 0.12 kW/m²."),
   ("¿Clima?", "Patagonia: +30%. Tropical: -20%."),
   ("¿Caldera comercial?", "10, 20, 24, 28, 32 kW. Elegir el siguiente arriba."),
   ("¿Radiadores?", "Aprox 100 W por m² a calefaccionar."),
   ("¿Piso radiante?", "45-60 W/m². Más eficiente a largo plazo.")],
  """  const m = Number(i.m2) || 0;
  const factores: Record<string, number> = { bueno: 0.07, normal: 0.09, malo: 0.12 };
  const f = factores[String(i.aislamiento)] || 0.09;
  const kw = m * f;
  return { kw: kw.toFixed(1) + ' kW', resumen: `Caldera ${kw.toFixed(0)} kW para ${m} m² con aislamiento ${i.aislamiento}.` };""")

M("aire-acondicionado-btu-split", "❄️", "Split AC BTU por ambiente",
  "BTU necesarios para aire acondicionado según m² y clima.", "BTU = m² × factor_clima",
  [("m2", "m²", "number", "20"), ("clima", "Clima", "select", [("templado", "Templado"), ("calido", "Cálido"), ("muy-calido", "Muy cálido")])],
  [("btu", "BTU necesarios", None), ("frigorias", "Frigorías", None), ("comercialSplit", "Split comercial", None), ("resumen", "Interpretación", None)],
  ["20 m² clima cálido", "BTU = 20 × 700 = 14000"], "Split 2500F (3000 BTU)",
  [("¿BTU vs frigorías?", "1 BTU/h = 0.252 frigorías. Split 3000 frigorías ≈ 12000 BTU."),
   ("¿Factor clima?", "Templado 600 BTU/m². Cálido 700. Muy cálido 850."),
   ("¿Exposición solar?", "Ambiente sur (HS) + vidriado: +20% BTU."),
   ("¿Gente?", "+600 BTU por persona adicional."),
   ("¿Cocina/electrodomésticos?", "+4000 BTU si hay fuente de calor importante.")],
  """  const m = Number(i.m2) || 0;
  const factores: Record<string, number> = { templado: 600, calido: 700, 'muy-calido': 850 };
  const f = factores[String(i.clima)] || 700;
  const btu = m * f;
  const frigorias = btu * 0.252;
  const splits = [2200, 2500, 3000, 4500, 6000, 9000];
  const next = splits.find(x => x >= frigorias) || frigorias;
  return { btu: btu.toFixed(0), frigorias: frigorias.toFixed(0), comercialSplit: next.toString() + 'F',
    resumen: `${btu.toFixed(0)} BTU (${frigorias.toFixed(0)} frigorías) para ${m} m². Split comercial: ${next}F.` };""")

M("ventilacion-cfm-ambiente", "💨", "CFM ventilación ambiente",
  "Calculá CFM para ventilación según volumen y cambios por hora.", "CFM = V × N/60",
  [("largo", "Largo (m)", "number", "4"), ("ancho", "Ancho (m)", "number", "3"), ("alto", "Alto (m)", "number", "2.5"),
   ("cambios", "Cambios/hora", "number", "8")],
  [("cfm", "CFM requeridos", None), ("m3h", "m³/h", None), ("resumen", "Interpretación", None)],
  ["4×3×2.5=30 m³, 8 cambios", "CFM = 30×35.3×8/60 = 141"], "141 CFM (240 m³/h)",
  [("¿Cambios recomendados?", "Baño: 8. Cocina: 10-15. Living: 3-5. Dormitorio: 2-3."),
   ("¿Tipos extractor?", "Mural (baño), ventana, techo (bañera, sauna)."),
   ("¿Ruido?", "dB: < 30 silencioso, 40-50 aceptable, >60 molesto."),
   ("¿Humedad?", "Extractor obligatorio en baño y cocina sin ventanas."),
   ("¿Recuperación calor?", "Equipo HRV recupera 70-90% calor del aire extraído.")],
  """  const V = Number(i.largo) * Number(i.ancho) * Number(i.alto);
  const N = Number(i.cambios) || 8;
  const m3h = V * N;
  const cfm = m3h * 0.588;
  return { cfm: cfm.toFixed(0), m3h: m3h.toFixed(0) + ' m³/h',
    resumen: `Necesitás ${cfm.toFixed(0)} CFM (${m3h.toFixed(0)} m³/h) para ${V.toFixed(0)} m³ con ${N} cambios/h.` };""")
