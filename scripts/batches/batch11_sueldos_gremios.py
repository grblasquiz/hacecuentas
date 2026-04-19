"""Batch 11 — Sueldos por gremio AR (20 calcs, alto tráfico)."""
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
    SPECS.append(spec(slug, "finanzas", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


def body_sueldo_gremio(basico, antig_pct_por_anio=0.01, sac_mensualizado=True):
    """Genera body TS estándar de sueldo gremio básico."""
    return f"""  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const basico={basico};
  const plusAntig=basico*{antig_pct_por_anio}*antig;
  const bruto=basico+plusAntig;
  const jubilacion=bruto*0.11;
  const obraSocial=bruto*0.03;
  const pami=bruto*0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=bruto/12;
  return {{
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\\B(?=(\\d{{3}})+(?!\\d))/g,'.'),
    resumen: `Básico: $${{basico.toLocaleString('es-AR')}}. Con antigüedad ${{antig}} años y cargas: neto ~$${{neto.toFixed(0)}}.`
  }};"""


# ======================================
# 20 CALCS DE SUELDOS POR GREMIO
# ======================================

# 1. Sueldo UOM (metalúrgico)
M("sueldo-uom-metalurgico-basico-neto", "🔧", "Sueldo UOM metalúrgico 2026 (básico + neto)",
  "Calculadora del sueldo básico, bruto y neto del gremio metalúrgico UOM según categoría y antigüedad.",
  "Básico × (1 + 1% × años antigüedad) − descuentos",
  [("categoria", "Categoría UOM", "select", [("1", "1ra"), ("2", "2da"), ("3", "3ra"), ("4", "4ta"), ("5", "5ta"), ("6", "Oficial múltiple"), ("7", "Oficial alto")]),
   ("antiguedad", "Años antigüedad", "number", None),
   ("cargas", "Cargas de familia", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto estimado", None), ("sac", "SAC (1/12)", None), ("resumen", "Interpretación", None)],
  ["Categoría 3, 5 años antigüedad", "Neto ~$720.000"], "~$720.000",
  [("¿Qué incluye el UOM?", "Gremio Unión Obrera Metalúrgica. Cubre trabajadores del sector metalúrgico, automotriz (mecánica), máquinas y herramientas, electrodomésticos, fundición."),
   ("¿Cómo se clasifica la categoría?", "Desde categoría 1 (operario peón) hasta categoría 7 (oficial alto con responsabilidades técnicas). Se define en el CCT 260/75."),
   ("¿Antigüedad cómo se paga?", "1% del básico por cada año trabajado en la empresa o actividad."),
   ("¿Paritaria actualizada?", "UOM paritaria suele cerrar en marzo-abril. Las categorías se actualizan por acuerdos trimestrales ante alta inflación."),
   ("¿Descuentos típicos?", "Jubilación 11% + Obra Social 3% + PAMI 3% + Ganancias si supera mínimo no imponible + Cuota sindical ~2%."),
   ("¿Adicional zona?", "Patagonia y zonas inhóspitas: +15-25% según convenio."),
   ("¿Horas extras UOM?", "50% días hábiles, 100% sábados desde las 13hs, domingos y feriados."),
   ("¿Presentismo?", "Algunas empresas pagan adicional por presentismo (4-8% del básico).")],
  body_sueldo_gremio(1150000, 0.01))

# 2. Sueldo Empleados de Comercio
M("sueldo-empleados-comercio-cct-130-75", "🏪", "Sueldo Empleados de Comercio 2026 (CCT 130/75)",
  "Calculadora del sueldo del gremio Empleados de Comercio según categoría y antigüedad (CCT 130/75).",
  "Básico + antigüedad + presentismo − descuentos",
  [("categoria", "Categoría", "select", [("administ-a", "Administrativo A"), ("administ-b", "Administrativo B"), ("administ-c", "Administrativo C"), ("vendedor-a", "Vendedor A"), ("vendedor-b", "Vendedor B"), ("maestranza-a", "Maestranza A"), ("cajero", "Cajero")]),
   ("antiguedad", "Años antigüedad", "number", None),
   ("cargas", "Cargas de familia", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto estimado", None), ("sac", "SAC", None), ("resumen", "Interpretación", None)],
  ["Administrativo B, 3 años", "Neto ~$680.000"], "~$680.000",
  [("¿Qué es CCT 130/75?", "Convenio Colectivo de Trabajo 130/75, el más usado en Argentina. Cubre a empleados de comercio bajo el gremio Mercantil (FAECYS)."),
   ("¿Categorías principales?", "Administrativo (A, B, C), Vendedor (A, B), Maestranza (A, B, C), Cajero, Auxiliar. Se define por la función."),
   ("¿Antigüedad?", "1% del básico por cada año."),
   ("¿Presentismo?", "Puede llegar al 8.33% del básico si no tiene ausencias injustificadas."),
   ("¿Paritaria?", "FAECYS negocia aumentos con la CAC, CAME y UDECA. Típicamente trimestrales."),
   ("¿Vacaciones CCT 130/75?", "Según Ley de Contrato de Trabajo: 14 días (hasta 5 años), 21 días (5-10), 28 días (10-20), 35 días (+20 años)."),
   ("¿Adicional título?", "Algunas empresas pagan adicional por título profesional o idiomas."),
   ("¿Diferencia con UOM?", "Comercio agrupa empleados de comercio en general; UOM es metalúrgica específicamente. Básicos suelen ser más bajos en Comercio.")],
  body_sueldo_gremio(950000, 0.01))

# 3. Sueldo UOCRA (construcción)
M("sueldo-uocra-construccion-basico-neto", "🏗️", "Sueldo UOCRA construcción 2026 (básico por categoría)",
  "Sueldo del gremio de la construcción UOCRA según categoría (oficial, medio oficial, ayudante) y zona.",
  "Básico × zona × (1 + antigüedad) − descuentos",
  [("categoria", "Categoría", "select", [("ayudante", "Ayudante"), ("mediof", "Medio Oficial"), ("oficial", "Oficial"), ("especializado", "Oficial Especializado"), ("sereno", "Sereno")]),
   ("zona", "Zona", "select", [("general", "General"), ("patagonia", "Patagonia +23%"), ("tdf", "Tierra del Fuego +50%")]),
   ("antiguedad", "Años antigüedad", "number", None)],
  [("basico", "Básico por hora", None), ("bruto", "Bruto mensual", None), ("neto", "Neto mensual", None), ("resumen", "Interpretación", None)],
  ["Oficial, zona general, 2 años", "Neto ~$900.000"], "~$900.000",
  [("¿UOCRA?", "Unión Obrera de la Construcción de la República Argentina. Gremio con mayoría de trabajadores en obras."),
   ("¿Categorías típicas?", "Ayudante, Medio Oficial, Oficial, Oficial Especializado. Se diferencia por capacidad técnica."),
   ("¿Se paga por hora o por día?", "UOCRA paga por hora trabajada, 200 horas mensuales de jornada normal."),
   ("¿Zonas diferenciadas?", "Patagonia +23%, Tierra del Fuego +50% al básico."),
   ("¿Fondo de cese laboral?", "UOCRA aporta a Fondo de Cese Laboral (similar a SAC que se retira al dejar el empleo)."),
   ("¿Riesgos de trabajo?", "Construcción tiene ART especial con mayor cobertura por actividad riesgosa."),
   ("¿Vacaciones en obra?", "Se suele prorratear en el sueldo dada la naturaleza discontinua del empleo."),
   ("¿Alta rotación?", "Construcción tiene alta rotación. El FCL y aportes jubilatorios compensan.")],
  body_sueldo_gremio(1050000, 0.005))

# 4. Sueldo docente
M("sueldo-docente-argentina-cargo-antiguedad", "🎓", "Sueldo docente Argentina 2026 (cargo + antigüedad)",
  "Sueldo de docentes nacionales/provinciales por cargo (maestro, profesor, preceptor) y años de antigüedad.",
  "Básico × (1 + antig%) + adicionales",
  [("cargo", "Cargo", "select", [("maestro-pri", "Maestro primaria"), ("prof-sec", "Profesor secundaria"), ("preceptor", "Preceptor"), ("vice", "Vicedirector"), ("director", "Director")]),
   ("antiguedad", "Años antigüedad", "number", None),
   ("horas", "Horas semanales", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Maestro primaria 10 años, 36h", "Neto ~$620.000"], "~$620.000",
  [("¿Paritaria docente?", "Nacional: CTERA. Por provincia: SUTEBA (BA), UDA (CABA), etc. Aumentos típicamente trimestrales."),
   ("¿Antigüedad docente?", "10% del básico por cada año, capped en 100% (a los 10+ años)."),
   ("¿Salario inicial?", "Incentivo docente nacional + básico provincial. Hay grandes diferencias entre provincias."),
   ("¿Jubilación docente?", "Régimen especial: 60% último sueldo, con 30 años de servicio y 60 años (mujer) o 65 (hombre)."),
   ("¿Cargo jerárquico?", "Vicedirector +15-25%, Director +25-40%, Supervisor +30-45%."),
   ("¿Adicional zona desfavorable?", "Escuelas rurales o barriales conflictivas: +15-30%."),
   ("¿Incentivo docente?", "Suma no remunerativa que complementa el básico."),
   ("¿Doble cargo?", "Máximo 60 horas cátedra total. Pueden sumar dos escuelas.")],
  body_sueldo_gremio(1050000, 0.10))

# 5. Sueldo empleada doméstica
M("sueldo-empleada-domestica-horas-retiro", "🏠", "Sueldo empleada doméstica 2026 (por hora + retiro)",
  "Sueldo de personal de casas particulares según horas mensuales, con o sin retiro y categoría.",
  "Hora × horas/mes + ART + plus",
  [("categoria", "Categoría", "select", [("supervisor", "Supervisor/a"), ("tareas-gen", "Tareas generales"), ("cuidado-per", "Cuidado personas"), ("cocinera", "Cocinera"), ("caseros", "Caseros")]),
   ("horas", "Horas semanales", "number", None),
   ("conRetiro", "Con retiro", "select", [("si", "Sí"), ("no", "No")])],
  [("porHora", "Valor hora", None), ("mensual", "Mensual", None), ("aportes", "Aportes empleador", None), ("resumen", "Interpretación", None)],
  ["Tareas generales 40h/sem con retiro", "~$540.000"], "~$540.000",
  [("¿Ley 26844?", "Régimen Especial de Contrato de Trabajo para el Personal de Casas Particulares (2013)."),
   ("¿Categorías?", "Supervisor/a, Tareas generales, Cuidado de personas, Cocinera, Caseros/as (5 categorías)."),
   ("¿Con retiro vs sin retiro?", "Sin retiro (viven en la casa) tienen hora más alta pero cubren alojamiento. Con retiro es lo habitual."),
   ("¿Sueldo mínimo horario?", "Publicado por el Ministerio de Trabajo cada trimestre. Varía por categoría."),
   ("¿Aportes ART?", "Obligatorio ART + seguro de vida. Cubren accidentes de trabajo."),
   ("¿AFIP registración?", "Obligatorio por internet (Servicio Personal Casas Particulares) si trabajan +6 horas semanales."),
   ("¿Vacaciones?", "Proporcionales según antigüedad, como cualquier trabajador."),
   ("¿Aguinaldo?", "Sí, se paga SAC en junio y diciembre.")],
  """  const cat=String(i.categoria||'tareas-gen');
  const h=Number(i.horas)||0; const r=String(i.conRetiro||'si')==='si';
  const base: Record<string,number> = { supervisor:3500, 'tareas-gen':2800, 'cuidado-per':3000, cocinera:3100, caseros:3300 };
  const b=(base[cat]||2800)*(r?1:1.15);
  const mensual=b*h*4.33;
  const aportes=mensual*0.17;
  return { porHora:'$'+b.toFixed(0), mensual:'$'+mensual.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), aportes:'$'+aportes.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${cat}: ${h}h/sem a $${b.toFixed(0)}/h = $${mensual.toFixed(0)}/mes (${r?'con':'sin'} retiro).` };""")

# 6. Sueldo SMATA (mecánico)
M("sueldo-smata-mecanico-automotor-basico", "🔩", "Sueldo SMATA mecánico 2026 (automotor)",
  "Sueldo del Sindicato de Mecánicos y Afines del Transporte Automotor por categoría.",
  "Básico × (1 + antig) − descuentos",
  [("categoria", "Categoría", "select", [("oper", "Operario"), ("mediof", "Medio Oficial"), ("oficial", "Oficial"), ("maestro", "Maestro")]),
   ("antiguedad", "Años antigüedad", "number", None),
   ("cargas", "Cargas", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Oficial 5 años", "Neto ~$850.000"], "~$850.000",
  [("¿SMATA?", "Sindicato de Mecánicos y Afines del Transporte Automotor de la República Argentina. Cubre talleres y concesionarias."),
   ("¿Diferencia con UOM?", "UOM es industria metalúrgica. SMATA es mecánica del transporte automotor (talleres, agencias)."),
   ("¿Paritaria?", "SMATA negocia con ACARA (concesionarias) por separado de UOM."),
   ("¿Adicional título?", "Algunos convenios pagan adicional por título técnico superior o idioma."),
   ("¿Horas extras?", "50% y 100% según días, con topes de horas semanales."),
   ("¿Adicional zona?", "Patagonia: +15-25%."),
   ("¿Beneficios SMATA?", "Obra social OSECAC (compartida con Comercio en algunas regiones), mutual y descuentos."),
   ("¿Categorías oficio?", "Operario, Medio Oficial, Oficial, Maestro según experiencia y evaluación.")],
  body_sueldo_gremio(1200000, 0.01))

# 7. Sueldo AEFIP / empleado estado nacional
M("sueldo-empleado-publico-nacional-sinep-agrupamiento", "🏛️", "Sueldo empleado público nacional 2026 (SINEP)",
  "Sueldo en el Sistema Nacional de Empleo Público (SINEP) por agrupamiento y grado.",
  "Básico SINEP + adicionales",
  [("agrupamiento", "Agrupamiento", "select", [("gene", "General"), ("prof", "Profesional"), ("cien", "Científico-Técnico"), ("adm", "Administrativo")]),
   ("nivel", "Nivel", "select", [("e", "E"), ("d", "D"), ("c", "C"), ("b", "B"), ("a", "A")]),
   ("grado", "Grado", "number", None),
   ("antiguedad", "Años antigüedad", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Profesional B grado 3, 8 años", "Neto ~$1.100.000"], "~$1.100.000",
  [("¿SINEP?", "Sistema Nacional de Empleo Público (decreto 2098/08). Cubre la mayoría de empleados de la administración pública nacional."),
   ("¿Agrupamientos?", "General, Profesional, Científico-Técnico, Administrativo. Define el encuadre."),
   ("¿Niveles?", "De E (más bajo) a A (más alto). El nivel depende del título y función."),
   ("¿Grados?", "Dentro de cada nivel: 0 al 10. Cada 2 años se avanza un grado (carrera)."),
   ("¿Adicional por funciones ejecutivas?", "Cargos jerárquicos tienen suplementos del 25-80%."),
   ("¿UPCN/ATE?", "Los dos principales sindicatos del sector público nacional. Negocian paritarias juntos."),
   ("¿Retiro voluntario?", "Solo en programas específicos. No es un beneficio general."),
   ("¿Pase a planta permanente?", "Exige concurso público abierto.")],
  body_sueldo_gremio(1400000, 0.02))

# 8. Sueldo bancario
M("sueldo-bancario-bco-nacion-provincia", "🏦", "Sueldo bancario 2026 (La Bancaria)",
  "Sueldo del gremio bancario La Bancaria, por categoría y antigüedad.",
  "Básico + producto bruto + antigüedad",
  [("categoria", "Categoría", "select", [("adm1", "Administrativo 1"), ("adm2", "Administrativo 2"), ("cajero", "Cajero"), ("jefe", "Jefe de Sección"), ("gerente", "Gerente")]),
   ("antiguedad", "Años", "number", None),
   ("productoBruto", "Producto bruto (prima)", "number", "%")],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Cajero 5 años, prod 15%", "Neto ~$1.400.000"], "~$1.400.000",
  [("¿La Bancaria?", "Asociación Bancaria (gremio de empleados bancarios). Histórico de sueldos altos por paritaria libre."),
   ("¿Producto bruto?", "Adicional por productividad (ROE) que se distribuye entre empleados. Puede ser 10-30% del sueldo."),
   ("¿Antigüedad?", "Escalonada: 5% a 5 años, 10% a 10 años, 15% a 15, etc."),
   ("¿Caja de ahorro gratis?", "Bancarios suelen tener cuentas sin costo y préstamos con tasa preferencial."),
   ("¿Paritaria bancaria?", "Suelen ser anuales con revisiones por inflación. Incrementos > promedio."),
   ("¿Jubilación bancaria?", "Régimen especial, algunas provincias tienen caja bancaria separada."),
   ("¿Plan de carrera?", "Clasificador: Administrativo → Jefe → Gerente asistente → Gerente de sucursal → Gerente regional."),
   ("¿Riesgo caja?", "Cajeros reciben adicional por manejo de efectivo.")],
  body_sueldo_gremio(1800000, 0.05))

# 9. Sueldo camionero
M("sueldo-camionero-fedcam-basico-adicionales", "🚛", "Sueldo camionero 2026 (Fedcam)",
  "Sueldo del gremio Camioneros (Hugo Moyano/Pablo Moyano) según categoría y rama.",
  "Básico + viáticos + adicionales",
  [("rama", "Rama", "select", [("corta", "Corta distancia"), ("larga", "Larga distancia"), ("recolec", "Recolección residuos"), ("correo", "Correo")]),
   ("categoria", "Categoría", "select", [("ayudante", "Ayudante"), ("conductor", "Conductor"), ("espec", "Conductor Especializado")]),
   ("antiguedad", "Años", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Conductor larga distancia 3 años", "~$1.500.000"], "~$1.500.000",
  [("¿Camioneros?", "Sindicato de Choferes de Camiones. Uno de los gremios con mayor poder de negociación en AR."),
   ("¿Ramas?", "Corta distancia (urbana), Larga distancia (interurbana), Recolección (residuos), Correo, Granel, Combustible."),
   ("¿Viáticos?", "En larga distancia: comida, alojamiento (cuando no duermen en casa). Suelen ser 30-50% extra del básico."),
   ("¿Adicional por kilo/tonelada?", "En algunas ramas hay bonos por volumen transportado."),
   ("¿Horas de conducción?", "Reglamentadas por ley: máximo 8hs diarias, 48 semanales."),
   ("¿Registro profesional?", "Conductor necesita registro profesional clase E (camiones pesados)."),
   ("¿Camión propio vs empresa?", "Si es camión propio: fletero autónomo, factura. Si es empleado: sueldo + convenio."),
   ("¿Paritaria Camioneros?", "Suele ser agresiva, con aumentos por encima del IPC.")],
  body_sueldo_gremio(1550000, 0.015))

# 10. Sueldo gastronómico
M("sueldo-gastronomico-uthgra-mozo-cocinero", "🍽️", "Sueldo gastronómico UTHGRA 2026",
  "Sueldo del gremio gastronómico UTHGRA (mozo, cocinero, bacharista, encargado).",
  "Básico + propinas + adicionales",
  [("puesto", "Puesto", "select", [("mozo", "Mozo"), ("cocinero", "Cocinero"), ("ayuda-coc", "Ayudante cocina"), ("bach", "Bachero/Lavacopas"), ("enc", "Encargado")]),
   ("antiguedad", "Años", "number", None),
   ("horas", "Horas semanales", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Mozo 3 años, 40h", "Neto ~$650.000"], "~$650.000",
  [("¿UTHGRA?", "Unión de Trabajadores del Turismo, Hoteleros y Gastronómicos de la República Argentina."),
   ("¿Categorías?", "Mozo/Moza, Cocinero, Ayudante de cocina, Bachero, Recepcionista, Mucama, Encargado."),
   ("¿Propinas?", "No son salario, son beneficio del empleado. Empresa no puede quedarse con ellas."),
   ("¿10% obligatorio?", "Desde ley 2024: algunas mesas incluyen propina sugerida 10%. Sigue siendo voluntario."),
   ("¿Doble sueldo diciembre?", "SAC: medio sueldo en junio y medio en diciembre (aguinaldo) como cualquier empleado."),
   ("¿Turnos fraccionados?", "Gastronomía suele tener turno doble (mediodía + noche) con descanso en el medio."),
   ("¿Adicional hotelero?", "Hoteles: puede haber adicional por categoría (5 estrellas vs 3)."),
   ("¿Feriado gastronómico?", "Abiertos en feriados, con pago doble por ley.")],
  body_sueldo_gremio(970000, 0.01))

# 11. Sueldo chofer colectivo
M("sueldo-chofer-colectivo-uta-urbano", "🚌", "Sueldo chofer colectivo UTA 2026 (urbano)",
  "Sueldo del chofer de colectivos urbanos (UTA) por categoría y antigüedad.",
  "Básico + productividad + adicionales",
  [("categoria", "Categoría", "select", [("chofer", "Chofer 1ra"), ("chofer2", "Chofer 2da"), ("boletero", "Boletero")]),
   ("antiguedad", "Años", "number", None),
   ("horas", "Horas mensuales", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Chofer 1ra, 8 años", "Neto ~$1.050.000"], "~$1.050.000",
  [("¿UTA?", "Unión Tranviarios Automotor. Gremio de choferes de colectivos urbanos y cortos recorridos."),
   ("¿Subsidios transporte?", "Sueldos subsidiados por el Estado (compensa tarifa de boleto regulada)."),
   ("¿Horario?", "Rotativos 6-14, 14-22, 22-6 (noche). Feriados y fines de semana."),
   ("¿Descanso mínimo?", "12 horas entre turnos por ley."),
   ("¿Licencia D2?", "Obligatoria para transporte de pasajeros. Renovación periódica."),
   ("¿Paritarias?", "UTA negocia con las empresas (AAETA, CEAP, CATA). Conflictivas."),
   ("¿Diferencia chofer 1ra vs 2da?", "Por tipo de colectivo (largo/corto) y años de experiencia."),
   ("¿Adicional por productividad?", "Bonos por asistencia, siniestralidad y tiempo de servicio.")],
  body_sueldo_gremio(1200000, 0.015))

# 12. Sueldo policía federal
M("sueldo-policia-federal-grado-antiguedad", "👮", "Sueldo policía federal 2026 (grado + antigüedad)",
  "Sueldo de la Policía Federal argentina por grado (agente a comisario) y años de servicio.",
  "Básico + suplementos",
  [("grado", "Grado", "select", [("agente", "Agente"), ("cabo", "Cabo"), ("cabo1", "Cabo 1ro"), ("sargento", "Sargento"), ("subofsub", "Suboficial Subayudante"), ("ofasis", "Oficial Ayudante"), ("ofprin", "Oficial Principal"), ("subcomi", "Subcomisario"), ("comi", "Comisario")]),
   ("antiguedad", "Años", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Sargento 10 años", "Neto ~$1.050.000"], "~$1.050.000",
  [("¿Escala jerárquica?", "Agente → Cabo → Cabo 1ro → Sargento → Sargento 1ro → Subofsub → Suboficial → Oficial → Comisario → Comisario Gral."),
   ("¿Retiro policial?", "Régimen especial: 25 años de servicio para retiro (edad menor a empleados comunes)."),
   ("¿Grado vs antigüedad?", "Se asciende por antigüedad + examen + evaluación."),
   ("¿Suplementos?", "Función peligrosa, zona, antigüedad, título profesional."),
   ("¿Horas extras?", "Remuneradas por adicionales y servicios especiales (eventos)."),
   ("¿Obra Social?", "OSFPF (Obra Social Policía Federal)."),
   ("¿Licencias?", "25-35 días según antigüedad."),
   ("¿Diferencia federal vs provincial?", "PFA depende de Nación. Provinciales (Bonaerense, CABA, Córdoba) tienen escala propia.")],
  body_sueldo_gremio(1250000, 0.02))

# 13. Sueldo enfermero
M("sueldo-enfermero-hospital-publico-categoria", "⚕️", "Sueldo enfermero 2026 (público y privado)",
  "Sueldo de enfermería en hospital público, privado y domiciliario por categoría.",
  "Básico + guardias + adicionales",
  [("sector", "Sector", "select", [("pub", "Público"), ("priv", "Privado/Prepaga"), ("dom", "Domiciliario")]),
   ("categoria", "Categoría", "select", [("auxi", "Auxiliar"), ("prof", "Profesional"), ("lic", "Licenciado/a")]),
   ("guardias", "Guardias/mes", "number", None)],
  [("basico", "Básico", None), ("guardiasM", "Guardias mensuales", None), ("neto", "Neto total", None), ("resumen", "Interpretación", None)],
  ["Profesional público, 4 guardias", "~$900.000"], "~$900.000",
  [("¿Categorías enfermería?", "Auxiliar (curso corto), Enfermero Profesional (3 años), Licenciado (5 años universitarios)."),
   ("¿FATSA / ATSA?", "Gremios de sanidad (Federación Argentina de Trabajadores de Sanidad Argentina). Cubre privados."),
   ("¿Guardias?", "Turnos de 12 o 24 horas adicionales al sueldo base. Se pagan aparte."),
   ("¿Insalubridad?", "Enfermería es trabajo insalubre: jubilación con 25 años de servicio y edad reducida."),
   ("¿Público vs privado?", "Privado suele pagar más pero con más trabajo. Público estabilidad y mejores beneficios."),
   ("¿Obra social?", "FATSA: OSPERYH. Público: IOMA, PAMI o la del empleador."),
   ("¿Adicional título?", "Licenciados cobran más que profesionales. Universitarios +15-25%."),
   ("¿Turnos noche?", "Adicional nocturno del 25-35%.")],
  """  const sec=String(i.sector||'pub'); const cat=String(i.categoria||'prof'); const g=Number(i.guardias)||0;
  const bases: Record<string,Record<string,number>> = {
    pub: { auxi:800000, prof:900000, lic:1100000 },
    priv: { auxi:900000, prof:1050000, lic:1250000 },
    dom: { auxi:700000, prof:850000, lic:950000 }
  };
  const b=(bases[sec]||bases.pub)[cat]||900000;
  const guardia=(sec==='priv'?90000:70000)*g;
  const bruto=b+guardia;
  const neto=bruto*0.83;
  return { basico:'$'+b.toLocaleString('es-AR'), guardiasM:'$'+guardia.toLocaleString('es-AR'), neto:'$'+neto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${cat} ${sec} + ${g} guardias: neto ~$${neto.toFixed(0)}.` };""")

# 14. Sueldo aeronáutico
M("sueldo-aeronautico-piloto-azafata-tripulante", "✈️", "Sueldo aeronáutico 2026 (piloto, tripulante)",
  "Sueldo de pilotos, copilotos y tripulantes de cabina según compañía y experiencia.",
  "Básico + horas vuelo + viáticos",
  [("puesto", "Puesto", "select", [("piloto-com", "Piloto comercial"), ("copilot", "Copiloto"), ("trip", "Tripulante cabina (TCP)"), ("despach", "Despachante de aeronaves")]),
   ("horasVuelo", "Horas vuelo/mes", "number", None),
   ("antiguedad", "Años empresa", "number", None)],
  [("basico", "Básico", None), ("horasPago", "Horas voladas (pago)", None), ("neto", "Neto total", None), ("resumen", "Interpretación", None)],
  ["Copiloto 50hs vuelo/mes", "~$3.500.000"], "~$3.500.000",
  [("¿APLA / APA / AAA?", "Pilotos (APLA), Aeronáuticos (APA), Aviadores (AAA). Gremios del sector."),
   ("¿Horas vuelo máximas?", "Por OACI: 100 horas/mes, 1000/año. Con descansos reglamentados."),
   ("¿Viáticos?", "Trayectos largos: estadía, comida, traslados. Suelen sumar mucho al sueldo base."),
   ("¿Compañía mayor vs menor?", "Aerolíneas Argentinas vs LATAM/JetSmart: AR puede pagar más, con beneficios específicos."),
   ("¿Jubilación aeronáutica?", "Régimen especial: edad reducida, menos años de aporte."),
   ("¿Licencia piloto?", "Requiere renovación anual con examen médico psicofísico."),
   ("¿Tripulante cabina?", "Requiere curso IATA + habilitación anual. Cobran horas de vuelo + adicionales."),
   ("¿Diferencias internacionales vs locales?", "Rutas internacionales pagan más por duración de vuelo.")],
  """  const p=String(i.puesto||'trip'); const hv=Number(i.horasVuelo)||0; const ant=Number(i.antiguedad)||0;
  const bases: Record<string,[number,number]> = {
    'piloto-com': [3500000, 45000],
    'copilot': [2200000, 32000],
    'trip': [900000, 12000],
    'despach': [1100000, 0]
  };
  const [b,hora]=bases[p]||bases.trip;
  const basicoAntig=b*(1+ant*0.01);
  const horas=hora*hv;
  const bruto=basicoAntig+horas;
  const neto=bruto*0.80;
  return { basico:'$'+basicoAntig.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), horasPago:'$'+horas.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${p} con ${hv} horas vuelo + antigüedad ${ant}y: neto ~$${neto.toFixed(0)}.` };""")

# 15. Sueldo municipal
M("sueldo-municipal-empleado-buenos-aires-categoria", "🏢", "Sueldo empleado municipal Buenos Aires 2026",
  "Sueldo de empleados municipales en la Provincia de Buenos Aires por categoría SUM.",
  "Básico + antigüedad + función",
  [("categoria", "Categoría", "select", [("cat1", "Categoría 1"), ("cat4", "Categoría 4"), ("cat7", "Categoría 7"), ("cat10", "Categoría 10"), ("cat12", "Categoría 12")]),
   ("antiguedad", "Años", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Categoría 7, 10 años", "Neto ~$950.000"], "~$950.000",
  [("¿SUM / UPCN?", "Sindicato Unificado Municipal + UPCN. Cubren empleados municipales en BA."),
   ("¿Categorías?", "1 al 14 (más alta). Se asciende por antigüedad + evaluación + concurso."),
   ("¿IOMA?", "Obra social de empleados públicos provincial y municipal."),
   ("¿Carga horaria?", "35-40hs/semana típicamente. Con horario flexible."),
   ("¿Pase a planta?", "Muchos municipales son contratados o monotributistas. El pase a planta es objetivo laboral."),
   ("¿Diferencias entre municipios?", "Cada municipio tiene autonomía: básicos distintos según presupuesto local."),
   ("¿Jubilación municipal?", "IPS (Instituto de Previsión Social Bonaerense) tiene régimen especial."),
   ("¿Adicional título?", "Profesional: +15-25%. Técnico: +10-15%.")],
  body_sueldo_gremio(1050000, 0.01))

# 16. Sueldo militar FFAA
M("sueldo-militar-ffaa-suboficial-oficial", "🎖️", "Sueldo militar Fuerzas Armadas 2026",
  "Sueldo de las Fuerzas Armadas (Ejército, Armada, Fuerza Aérea) por grado.",
  "Básico + suplementos",
  [("fuerza", "Fuerza", "select", [("ej", "Ejército"), ("arm", "Armada"), ("fa", "Fuerza Aérea")]),
   ("grado", "Grado", "select", [("sold", "Soldado Voluntario"), ("cabo", "Cabo"), ("sarg", "Sargento"), ("subof", "Suboficial"), ("teniente", "Teniente"), ("capitan", "Capitán"), ("mayor", "Mayor"), ("tenCor", "Teniente Coronel"), ("coronel", "Coronel")]),
   ("antiguedad", "Años", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Sargento Ejército 12 años", "Neto ~$1.100.000"], "~$1.100.000",
  [("¿Fuerzas Armadas?", "Ejército Argentino, Armada (Marina), Fuerza Aérea. Ministerio de Defensa."),
   ("¿Retiro militar?", "25-30 años de servicio (según categoría). Edad reducida."),
   ("¿Suplementos?", "Zona (Patagonia, islas), peligrosidad, comando, vuelo, submarinismo, etc."),
   ("¿Escalafón?", "Suboficiales (Soldado → Sargento Mayor) y Oficiales (Subteniente → General/Brigadier/Almirante)."),
   ("¿Operativo externo?", "Misiones de paz ONU: bonificaciones significativas."),
   ("¿IOSFA?", "Obra social de las FFAA."),
   ("¿Edad de retiro?", "Varía por grado: oficiales hasta 55-60, suboficiales hasta 50-55 típicamente."),
   ("¿Cadete a oficial?", "Colegio Militar / Naval / Aeronáutico: 4 años, egresa como Subteniente/Guardiamarina/Alférez.")],
  body_sueldo_gremio(1200000, 0.015))

# 17. Sueldo abogado trabajo relación
M("sueldo-abogado-relacion-dependencia-estudio", "⚖️", "Sueldo abogado en relación de dependencia 2026",
  "Sueldo de abogados empleados en estudios, empresas y organismos públicos según antigüedad.",
  "Rango por empleador + antigüedad",
  [("empleador", "Empleador", "select", [("estudio-s", "Estudio pequeño"), ("estudio-m", "Estudio mediano"), ("estudio-g", "Estudio grande"), ("empresa", "Empresa in-house"), ("publico", "Estado / Poder Judicial")]),
   ("antiguedad", "Años de recibido", "number", None)],
  [("rango", "Rango estimado", None), ("promedio", "Promedio", None), ("resumen", "Interpretación", None)],
  ["Estudio mediano, 5 años", "~$1.500.000"], "~$1.500.000",
  [("¿Abogado junior?", "Recién recibido: $800k-1.5M típicamente en 2026."),
   ("¿Abogado senior?", "+10 años: $2-4M + retención de honorarios (en estudios)."),
   ("¿Poder Judicial?", "Empleado del PJN: por categoría. Jueces y funcionarios tienen régimen especial."),
   ("¿Abogado empresa?", "In-house: remuneración fija + bonos. Suele ser estable."),
   ("¿Matrícula?", "Obligatoria en el CPACF (CABA) o Colegio provincial. Cuota mensual."),
   ("¿Participación en honorarios?", "Algunos estudios grandes dan % al abogado del juicio que gana."),
   ("¿Monotributo vs relación dependencia?", "Abogado puede ser ambos: relación de dependencia + ejercicio particular."),
   ("¿Internacional?", "Estudios globales pagan sueldos USD 1000-5000 a juniors.")],
  """  const emp=String(i.empleador||'estudio-m'); const ant=Number(i.antiguedad)||0;
  const bases: Record<string,[number,number]> = {
    'estudio-s': [800000, 1500000],
    'estudio-m': [1200000, 2500000],
    'estudio-g': [2000000, 5000000],
    'empresa': [1500000, 3500000],
    'publico': [1400000, 2800000]
  };
  const [min,max]=bases[emp]||bases['estudio-m'];
  const factor=Math.min(1, 0.5+ant*0.06);
  const prom=min+(max-min)*factor;
  return { rango:`$${min.toLocaleString('es-AR')} - $${max.toLocaleString('es-AR')}`, promedio:'$'+prom.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${emp} con ${ant} años: ~$${prom.toFixed(0)}.` };""")

# 18. Sueldo médico residente
M("sueldo-medico-residente-hospital-publico", "🩺", "Sueldo médico residente 2026 (público)",
  "Sueldo de residentes médicos en hospitales públicos (CABA, PBA, nacional) por año.",
  "Beca según año",
  [("anioResidencia", "Año de residencia", "select", [("r1", "R1"), ("r2", "R2"), ("r3", "R3"), ("r4", "R4"), ("r5", "R5")]),
   ("juridiccion", "Jurisdicción", "select", [("caba", "CABA"), ("pba", "PBA"), ("nac", "Nacional"), ("interior", "Interior provincia")])],
  [("basico", "Básico (beca)", None), ("guardias", "Guardias", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["R2 CABA", "~$900.000"], "~$900.000",
  [("¿Residencia médica?", "Programa de especialización post-título de grado. Duración 3-5 años."),
   ("¿Es beca o sueldo?", "Técnicamente 'beca'. Pero se cobra como sueldo + aportes en la mayoría de jurisdicciones."),
   ("¿Guardias residente?", "Adicional por cada guardia (12-24hs). Parte importante del ingreso."),
   ("¿Diferencia CABA vs PBA?", "CABA suele pagar más que PBA (hospital municipal)."),
   ("¿Residencia privada?", "Sanatorios privados también tienen residencias. Suelen ser mejor pagas pero con más carga."),
   ("¿Ingreso como tomás?", "Concurso anual con examen único nacional. Muy competitivo para especialidades top."),
   ("¿R1 a R5?", "R1 (primer año) a R5 (quinto año) según la especialidad (clínica 3, cirugía 5+, etc)."),
   ("¿Especialidades mejor pagas?", "Anestesia, cardiología intervencionista, cirugía plástica. Pero la residencia no paga más — el ingreso viene después.")],
  """  const a=String(i.anioResidencia||'r1'); const j=String(i.juridiccion||'caba');
  const base: Record<string,number> = { r1:780000, r2:880000, r3:980000, r4:1100000, r5:1200000 };
  const mult: Record<string,number> = { caba:1.0, pba:0.88, nac:0.95, interior:0.85 };
  const b=(base[a]||780000)*(mult[j]||1);
  const guardias=b*0.45;
  const neto=(b+guardias)*0.87;
  return { basico:'$'+b.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), guardias:'$'+guardias.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${a.toUpperCase()} ${j.toUpperCase()}: básico ${b.toFixed(0)} + guardias = ${neto.toFixed(0)} neto.` };""")

# 19. Sueldo programador IT
M("sueldo-programador-desarrollador-argentina-seniority", "💻", "Sueldo programador/desarrollador 2026",
  "Sueldo de desarrollador/a en Argentina según seniority (junior, semi-senior, senior) y si factura a exterior.",
  "Rango + conversión USD",
  [("seniority", "Seniority", "select", [("trainee", "Trainee"), ("jr", "Junior"), ("ssr", "Semi-Senior"), ("sr", "Senior"), ("lead", "Tech Lead"), ("arch", "Architect / Staff")]),
   ("modo", "Modalidad", "select", [("relacion", "Relación dependencia AR"), ("freelanceUSD", "Freelance USD"), ("mono", "Monotributo / SRL")]),
   ("dolar", "Dólar estimado", "number", "$")],
  [("rangoAr", "Rango ARS", None), ("rangoUsd", "Rango USD (si export)", None), ("resumen", "Interpretación", None)],
  ["Semi-Senior freelance USD", "USD 2000-3500"], "USD 2500 prom",
  [("¿Sueldos IT en AR?", "Muy variables. Relación AR: $1.5M-6M. Freelance USD: 1500-6000 USD."),
   ("¿Factura al exterior?", "Monotributo con servicios al exterior (régimen especial). Hasta tope anual."),
   ("¿Stock options?", "Startups USA/UE: parte del paquete en equity. Ilíquido pero potencial."),
   ("¿Diferencias por stack?", "React/Node senior > PHP senior. Data Engineer / ML > Backend estándar."),
   ("¿Remoto vs presencial?", "Remoto 100%: rangos USD. Presencial AR: rangos ARS (menor en USD equivalente)."),
   ("¿Cómo subir de seniority?", "2-3 años promedio entre escalones. Junior → SSR → Senior → Lead → Staff/Arch."),
   ("¿Empresa argentina vs extranjera?", "Extranjera paga 2-3x más. Pero requiere inglés y skill evaluation."),
   ("¿Bootcamp vs universidad?", "No afecta el sueldo una vez tenés experiencia. Skills > credenciales en IT.")],
  """  const s=String(i.seniority||'jr'); const m=String(i.modo||'relacion'); const d=Number(i.dolar)||1400;
  const rangosUsd: Record<string,[number,number]> = {
    trainee:[700,1200], jr:[1200,2200], ssr:[2200,3500], sr:[3500,5500], lead:[5000,8000], arch:[7000,12000]
  };
  const [minU,maxU]=rangosUsd[s]||rangosUsd.jr;
  let minAr:number, maxAr:number;
  if (m==='relacion') { minAr=minU*d*0.55; maxAr=maxU*d*0.55; }
  else if (m==='mono') { minAr=minU*d*0.80; maxAr=maxU*d*0.80; }
  else { minAr=minU*d; maxAr=maxU*d; }
  return { rangoAr:`$${Math.round(minAr).toLocaleString('es-AR')} - $${Math.round(maxAr).toLocaleString('es-AR')}`, rangoUsd:`USD ${minU}-${maxU}`, resumen:`${s} ${m}: ${m==='freelanceUSD'?'USD '+minU+'-'+maxU:'$'+Math.round(minAr).toLocaleString('es-AR')+'-'+Math.round(maxAr).toLocaleString('es-AR')}.` };""")

# 20. Sueldo panadero
M("sueldo-panadero-basico-feriado-nocturno", "🥖", "Sueldo panadero 2026 (con adicional nocturno)",
  "Sueldo del gremio Panaderos (UPAP) según categoría, con adicional nocturno y feriados.",
  "Básico + 20% nocturno + feriados",
  [("categoria", "Categoría", "select", [("medio", "Medio oficial"), ("oficial", "Oficial"), ("ayudante", "Ayudante")]),
   ("antiguedad", "Años", "number", None),
   ("horasNocturnas", "Horas noche/sem", "number", None)],
  [("basico", "Básico", None), ("bruto", "Bruto + nocturno", None), ("neto", "Neto", None), ("resumen", "Interpretación", None)],
  ["Oficial panadero + 20h noche", "~$900.000"], "~$900.000",
  [("¿UPAP?", "Unión de Pasteleros Confiteros, Heladeros y Afines. Cubre panaderías y confiterías."),
   ("¿Trabajo nocturno?", "Panaderos suelen trabajar de noche para tener pan fresco a la mañana. Adicional +25-35%."),
   ("¿Feriados?", "Panadería abre mayoría de feriados. Pago doble obligatorio."),
   ("¿Categorías?", "Ayudante (sin experiencia), Medio Oficial (1-3 años), Oficial (3+ años con técnica completa)."),
   ("¿Doble cobertura?", "Muchos panaderos hacen su propio producto y venden — alternativa al empleo en relación dependencia."),
   ("¿Insalubridad?", "Panadería tiene adicional por insalubridad (humedad, calor, harinas). Jubilación con 25 años."),
   ("¿Propinas?", "Panadero en atención al público: tiene derecho a propinas (no salario)."),
   ("¿Horarios extensos?", "Jornadas de 8 horas pero divididas: 3am-11am típicamente.")],
  """  const cat=String(i.categoria||'oficial'); const ant=Number(i.antiguedad)||0; const hn=Number(i.horasNocturnas)||0;
  const base: Record<string,number> = { ayudante:920000, medio:1050000, oficial:1200000 };
  const b=(base[cat]||1050000)*(1+ant*0.01);
  const nocturno=(b/160)*hn*4.33*0.30;
  const bruto=b+nocturno;
  const neto=bruto*0.83;
  return { basico:'$'+b.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), bruto:'$'+bruto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'), resumen:`${cat} con ${hn}h noche/sem: neto ~$${neto.toFixed(0)}.` };""")


def collect():
    return SPECS
