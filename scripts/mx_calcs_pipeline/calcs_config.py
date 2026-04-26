"""Spec de las 7 calcs MX nuevas a generar."""

CALCS = [
    {
        "slug": "calculadora-sueldo-neto-mexico",
        "category": "finanzas",
        "icon": "💵",
        "formula_id": "sueldo-neto-mexico",
        "h1": "Calculadora de Sueldo Neto (México)",
        "search_intent": "Convertir sueldo bruto mensual a sueldo neto en mano descontando ISR + IMSS - subsidio empleo",
        "fields_spec": [
            {"id": "salarioBrutoMensual", "label": "Salario bruto mensual", "type": "number", "prefix": "$", "min": 0, "step": 100, "required": True},
            {"id": "numHijosCargo", "label": "Hijos a cargo (subsidio empleo)", "type": "number", "min": 0, "max": 10, "step": 1, "required": False, "default": 0},
        ],
        "outputs_spec": [
            {"id": "salarioNeto", "label": "Sueldo neto en mano", "format": "currency", "primary": True},
            {"id": "isrRetenido", "label": "ISR retenido", "format": "currency"},
            {"id": "imssObrero", "label": "Cuota IMSS (obrero)", "format": "currency"},
            {"id": "subsidioEmpleo", "label": "Subsidio para el empleo", "format": "currency"},
            {"id": "detalle", "label": "Detalle del cálculo", "format": "text"},
        ],
        "formula_logic": """
APLICAR ESCALA ISR MENSUAL SAT 2026 (referencia oficial — ART. 96 LISR):
  Tramos mensuales (LIM_INF | LIM_SUP | CUOTA_FIJA | TASA_EXCEDENTE):
  $0.01 - $746.04: $0.00 + 1.92%
  $746.05 - $6332.05: $14.32 + 6.40%
  $6332.06 - $11128.01: $371.83 + 10.88%
  $11128.02 - $12935.82: $893.63 + 16.00%
  $12935.83 - $15487.71: $1182.88 + 17.92%
  $15487.72 - $31236.49: $1640.18 + 21.36%
  $31236.50 - $49233.00: $5004.12 + 23.52%
  $49233.01 - $93993.90: $9236.89 + 30.00%
  $93993.91 - $125325.20: $22665.17 + 32.00%
  $125325.21 - $375975.61: $32691.18 + 34.00%
  > $375975.61: $117912.32 + 35.00%

CUOTAS IMSS OBRERO 2026 (porcentaje sobre salario base de cotización):
  Enfermedad y maternidad (especie excedente): 0.40% (sobre excedente 3 UMA)
  Enfermedad y maternidad (prestaciones dinero): 0.25%
  Invalidez y vida: 0.625%
  Cesantía y vejez: 1.125%
  Total obrero aprox: ~2.775% (simplificado para SBC < 25 UMA)

SUBSIDIO PARA EL EMPLEO MENSUAL 2026 (Tabla SAT — ingresos mensuales):
  $0.01 - $1768.96: $407.02
  $1768.97 - $2653.38: $406.83
  $2653.39 - $3472.84: $406.62
  $3472.85 - $3537.87: $392.77
  $3537.88 - $4446.15: $382.46
  $4446.16 - $4717.18: $354.23
  $4717.19 - $5335.42: $324.87
  $5335.43 - $6224.67: $294.63
  $6224.68 - $7113.90: $253.54
  $7113.91 - $7382.33: $217.61
  > $7382.33: $0
  El subsidio se entrega solo si ISR < subsidio (en ese caso se entrega la diferencia adicional al neto).

NETO = BRUTO - ISR - IMSS_OBRERO + SUBSIDIO_APLICABLE
""",
        "sources": [
            {"label": "SAT - Tarifa ISR mensual 2026 (Art. 96 LISR)", "url": "https://www.sat.gob.mx/articulo/76011/tarifas-para-el-calculo-del-ejercicio-fiscal-de-2026"},
            {"label": "IMSS - Cuotas obrero-patronales", "url": "https://www.imss.gob.mx/patrones/cuotas-obrero-patronales"},
            {"label": "DOF - Subsidio para el Empleo 2026", "url": "https://www.dof.gob.mx/"},
        ],
        "related_slugs": ["calculadora-isr-sueldo-mexico", "calculadora-cuotas-imss-obrero-patron", "calculadora-aguinaldo-mexico-lft", "calculadora-prima-vacacional-mexico"],
    },
    {
        "slug": "calculadora-vacaciones-dias-antiguedad-mexico",
        "category": "trabajo",
        "icon": "🌴",
        "formula_id": "vacaciones-dias-antiguedad-mexico",
        "h1": "Calculadora de Días de Vacaciones por Antigüedad (México)",
        "search_intent": "Cuántos días de vacaciones corresponden según años trabajados (LFT post-reforma 2023)",
        "fields_spec": [
            {"id": "aniosAntiguedad", "label": "Años de antigüedad cumplidos", "type": "number", "min": 0, "max": 50, "step": 1, "required": True},
        ],
        "outputs_spec": [
            {"id": "diasVacaciones", "label": "Días de vacaciones por año", "format": "number", "primary": True},
            {"id": "primaVacacional", "label": "Prima vacacional mínima (25%)", "format": "text"},
            {"id": "detalle", "label": "Detalle según LFT", "format": "text"},
            {"id": "fundamentoLegal", "label": "Fundamento legal", "format": "text"},
        ],
        "formula_logic": """
TABLA LFT 2026 (Art. 76 — REFORMADA por DOF 27/12/2022, vigente desde 1/ene/2023):
  Año 1: 12 días
  Año 2: 14 días
  Año 3: 16 días
  Año 4: 18 días
  Año 5: 20 días
  Años 6-10: 22 días
  Años 11-15: 24 días
  Años 16-20: 26 días
  Años 21-25: 28 días
  Años 26-30: 30 días
  Años 31-35: 32 días
  Cada 5 años adicionales: +2 días.

PRIMA VACACIONAL: Art. 80 LFT — mínimo 25% sobre los días que correspondan.
""",
        "sources": [
            {"label": "DOF - Reforma LFT vacaciones (27/12/2022)", "url": "https://www.dof.gob.mx/nota_detalle.php?codigo=5675779"},
            {"label": "STPS - Vacaciones dignas", "url": "https://www.gob.mx/stps"},
        ],
        "related_slugs": ["calculadora-prima-vacacional-mexico", "calculadora-aguinaldo-mexico-lft", "calculadora-finiquito-liquidacion-mexico", "calculadora-sueldo-neto-mexico"],
    },
    {
        "slug": "calculadora-horas-extras-doble-triple-mexico",
        "category": "trabajo",
        "icon": "⏰",
        "formula_id": "horas-extras-mexico",
        "h1": "Calculadora de Horas Extras Dobles y Triples (México)",
        "search_intent": "Calcular pago de horas extras LFT: primeras 9 a la semana al doble (200%), excedente al triple (300%)",
        "fields_spec": [
            {"id": "salarioDiario", "label": "Salario diario", "type": "number", "prefix": "$", "min": 0, "step": 50, "required": True},
            {"id": "jornadaDiaria", "label": "Jornada diaria (horas)", "type": "number", "min": 1, "max": 12, "step": 0.5, "required": True, "default": 8},
            {"id": "horasExtraSemana", "label": "Horas extra trabajadas esta semana", "type": "number", "min": 0, "max": 40, "step": 0.5, "required": True},
        ],
        "outputs_spec": [
            {"id": "pagoTotalExtras", "label": "Pago total horas extras", "format": "currency", "primary": True},
            {"id": "pagoDobles", "label": "Horas dobles (primeras 9)", "format": "currency"},
            {"id": "pagoTriples", "label": "Horas triples (excedente)", "format": "currency"},
            {"id": "detalle", "label": "Desglose", "format": "text"},
        ],
        "formula_logic": """
LFT Arts. 67-68 (vigente 2026):
  - Primeras 9 horas extra a la semana: pago al DOBLE (200% del valor por hora normal).
  - Horas extra que excedan 9 a la semana: pago al TRIPLE (300% del valor normal).
  - Trabajar más de 9 horas extra/semana es ilegal aunque se pague al triple (sanción al patrón).

CÁLCULO:
  valor_hora_normal = salario_diario / jornada_diaria
  horas_dobles = min(horas_extra_semana, 9)
  horas_triples = max(0, horas_extra_semana - 9)
  pago_dobles = horas_dobles * valor_hora_normal * 2
  pago_triples = horas_triples * valor_hora_normal * 3
  pago_total = pago_dobles + pago_triples
""",
        "sources": [
            {"label": "LFT Arts. 67-68 (Cámara de Diputados)", "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf"},
            {"label": "PROFEDET - Trabajo extraordinario", "url": "https://www.gob.mx/profedet"},
        ],
        "related_slugs": ["calculadora-sueldo-neto-mexico", "calculadora-aguinaldo-mexico-lft", "calculadora-prima-vacacional-mexico", "calculadora-finiquito-liquidacion-mexico"],
    },
    {
        "slug": "calculadora-cuanto-falta-grito-independencia-mexico",
        "category": "vida",
        "icon": "🇲🇽",
        "formula_id": "cuanto-falta-grito-independencia-mexico",
        "h1": "¿Cuánto Falta para el Grito de Independencia y el 16 de Septiembre?",
        "search_intent": "Cuenta regresiva al Grito de Independencia (15-sep noche) y al Día de la Independencia (16-sep)",
        "fields_spec": [],
        "outputs_spec": [
            {"id": "diasAlGrito", "label": "Días al Grito (15-sep)", "format": "number", "primary": True},
            {"id": "diasAlDia16", "label": "Días al 16 de septiembre", "format": "number"},
            {"id": "horasAlGrito", "label": "Horas al Grito", "format": "number"},
            {"id": "diaSemanaGrito", "label": "Día de semana del 15-sep", "format": "text"},
            {"id": "detalle", "label": "Resumen", "format": "text"},
        ],
        "formula_logic": """
- El "Grito de Independencia" es la noche del 15 de septiembre (~23:00 hrs hora central).
- El 16 de septiembre es feriado oficial obligatorio (Art. 74 LFT) — Día de la Independencia.
- CÁLCULO: días entre fecha actual y próximo 15-sep (si ya pasó, ir al año siguiente).
- Devolver también horas restantes hasta el grito (asumir 23:00 CDMX zona horaria America/Mexico_City).

NOTA: ningún input — la calc usa la fecha actual del navegador. Ejemplo en client-side JS:
  const hoy = new Date();
  const proximoGrito = new Date(hoy.getFullYear(), 8, 15, 23, 0, 0); // mes 8 = septiembre
  if (proximoGrito < hoy) proximoGrito.setFullYear(proximoGrito.getFullYear() + 1);
  const diasFaltan = Math.ceil((proximoGrito - hoy) / 86400000);

Como la calc no tiene inputs, los outputs deben ser dinámicos. La fórmula TS recibe input vacío {} pero retorna los días/horas calculados desde Date.now() en el cliente.
""",
        "sources": [
            {"label": "LFT Art. 74 - Días de descanso obligatorio", "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf"},
            {"label": "Gobierno de México - Independencia", "url": "https://www.gob.mx/independencia"},
            {"label": "INAH - Historia del Grito", "url": "https://www.inah.gob.mx/"},
        ],
        "related_slugs": ["calculadora-aguinaldo-mexico-lft", "calculadora-prima-vacacional-mexico", "calculadora-vacaciones-dias-antiguedad-mexico"],
    },
    {
        "slug": "calculadora-isn-impuesto-sobre-nominas-estado",
        "category": "impuestos",
        "icon": "🏛️",
        "formula_id": "isn-impuesto-nominas-mexico",
        "h1": "Calculadora del Impuesto Sobre Nóminas (ISN) por Estado",
        "search_intent": "ISN por estado: alícuota varía de 1% a 4% sobre el total de nómina, lo paga el patrón",
        "fields_spec": [
            {"id": "estado", "label": "Estado", "type": "select", "required": True,
             "options": [
                {"value": "CDMX", "label": "Ciudad de México (3%)"},
                {"value": "EDOMEX", "label": "Estado de México (3%)"},
                {"value": "JAL", "label": "Jalisco (2%)"},
                {"value": "NL", "label": "Nuevo León (3%)"},
                {"value": "PUE", "label": "Puebla (3%)"},
                {"value": "GTO", "label": "Guanajuato (2%)"},
                {"value": "QRO", "label": "Querétaro (2.5%)"},
                {"value": "VER", "label": "Veracruz (3%)"},
                {"value": "YUC", "label": "Yucatán (2.5%)"},
                {"value": "BC", "label": "Baja California (1.8%)"},
                {"value": "CHIH", "label": "Chihuahua (3%)"},
                {"value": "COAH", "label": "Coahuila (2%)"},
                {"value": "SLP", "label": "San Luis Potosí (2.5%)"},
                {"value": "TAB", "label": "Tabasco (2.5%)"},
                {"value": "SIN", "label": "Sinaloa (2.4%)"},
                {"value": "SON", "label": "Sonora (2%)"},
                {"value": "MICH", "label": "Michoacán (3%)"},
                {"value": "OAX", "label": "Oaxaca (3%)"},
                {"value": "GRO", "label": "Guerrero (2%)"},
                {"value": "CHIS", "label": "Chiapas (2%)"},
                {"value": "MOR", "label": "Morelos (2%)"},
                {"value": "HGO", "label": "Hidalgo (2.5%)"},
                {"value": "AGS", "label": "Aguascalientes (1.5%)"},
                {"value": "DGO", "label": "Durango (2%)"},
                {"value": "ZAC", "label": "Zacatecas (2.5%)"},
                {"value": "BCS", "label": "Baja California Sur (2.5%)"},
                {"value": "CAMP", "label": "Campeche (3%)"},
                {"value": "COL", "label": "Colima (2%)"},
                {"value": "NAY", "label": "Nayarit (2%)"},
                {"value": "QROO", "label": "Quintana Roo (3%)"},
                {"value": "TAMP", "label": "Tamaulipas (3%)"},
                {"value": "TLAX", "label": "Tlaxcala (3%)"},
             ]},
            {"id": "totalNominaMensual", "label": "Total nómina mensual", "type": "number", "prefix": "$", "min": 0, "step": 1000, "required": True},
        ],
        "outputs_spec": [
            {"id": "isnAPagar", "label": "ISN a pagar (mensual)", "format": "currency", "primary": True},
            {"id": "alicuota", "label": "Alícuota aplicada", "format": "text"},
            {"id": "isnAnual", "label": "ISN anualizado", "format": "currency"},
            {"id": "detalle", "label": "Detalle", "format": "text"},
        ],
        "formula_logic": """
LOOKUP por estado de la alícuota ISN 2026:
  CDMX 3%, EDOMEX 3%, JAL 2%, NL 3%, PUE 3%, GTO 2%, QRO 2.5%, VER 3%, YUC 2.5%, BC 1.8%,
  CHIH 3%, COAH 2%, SLP 2.5%, TAB 2.5%, SIN 2.4%, SON 2%, MICH 3%, OAX 3%, GRO 2%, CHIS 2%,
  MOR 2%, HGO 2.5%, AGS 1.5%, DGO 2%, ZAC 2.5%, BCS 2.5%, CAMP 3%, COL 2%, NAY 2%, QROO 3%,
  TAMP 3%, TLAX 3%.

ISN = total_nomina_mensual * alicuota
ISN_anual = ISN_mensual * 12

NOTA: lo paga el patrón (no se le retiene al trabajador). Es impuesto local.
Algunos estados ofrecen estímulos para PYMES o empresas nuevas.
""",
        "sources": [
            {"label": "Código Fiscal CDMX", "url": "https://data.consejeria.cdmx.gob.mx/"},
            {"label": "Códigos Financieros estatales", "url": "https://www.gob.mx/sat"},
        ],
        "related_slugs": ["calculadora-cuotas-imss-obrero-patron", "calculadora-sueldo-neto-mexico", "calculadora-isr-sueldo-mexico", "calculadora-aguinaldo-mexico-lft"],
    },
    {
        "slug": "calculadora-predial-cdmx-mexico",
        "category": "impuestos",
        "icon": "🏠",
        "formula_id": "predial-cdmx-mexico",
        "h1": "Calculadora de Predial CDMX por Valor Catastral",
        "search_intent": "Cuánto predial pago en CDMX según valor catastral del inmueble (Art. 130 Código Fiscal CDMX)",
        "fields_spec": [
            {"id": "valorCatastral", "label": "Valor catastral del inmueble", "type": "number", "prefix": "$", "min": 0, "step": 10000, "required": True},
            {"id": "tipoUso", "label": "Tipo de uso", "type": "select", "required": True, "default": "habitacional",
             "options": [
                {"value": "habitacional", "label": "Habitacional (uso de casa)"},
                {"value": "noHabitacional", "label": "No habitacional (comercial/industrial)"},
             ]},
        ],
        "outputs_spec": [
            {"id": "predialBimestral", "label": "Predial bimestral", "format": "currency", "primary": True},
            {"id": "predialAnual", "label": "Predial anual (6 bimestres)", "format": "currency"},
            {"id": "rangoTabla", "label": "Rango de tabla aplicable", "format": "text"},
            {"id": "detalle", "label": "Cálculo paso a paso", "format": "text"},
        ],
        "formula_logic": """
TABLA PREDIAL CDMX BIMESTRAL 2026 (Art. 130 Código Fiscal CDMX — valores oficiales):
  Tarifa progresiva por valor catastral (rangos en pesos, cuota fija + factor sobre excedente):

  Rango A: Hasta $260,506 → cuota fija $245.04 + 0.0376% sobre excedente del límite inferior
  Rango B: $260,506.01 - $521,011 → $342.85 + 0.0855% sobre excedente
  Rango C: $521,011.01 - $782,213 → $565.44 + 0.1219% sobre excedente
  Rango D: $782,213.01 - $1,043,022 → $884.20 + 0.1620% sobre excedente
  Rango E: $1,043,022.01 - $1,303,830 → $1306.71 + 0.1790% sobre excedente
  Rango F: $1,303,830.01 - $2,608,012 → $1773.69 + 0.2085% sobre excedente
  Rango G: $2,608,012.01 - $5,216,724 → $4493.27 + 0.2295% sobre excedente
  Rango H: $5,216,724.01 - $13,041,810 → $10481.05 + 0.2510% sobre excedente
  Rango I: $13,041,810.01 - $26,083,621 → $30121.45 + 0.2700% sobre excedente
  Rango J: > $26,083,621 → $65334.32 + 0.2900% sobre excedente

REDUCCIONES (uso habitacional):
  Hasta valor catastral $1,303,830: reducción del 30%
  $1,303,830.01 - $1,955,745: reducción del 25%
  $1,955,745.01 - $2,608,012: reducción del 20%
  > $2,608,012: sin reducción

USO NO HABITACIONAL: sin reducciones.

Resultado: cuota_fija + (valor_catastral - lim_inf_rango) * factor_excedente
Aplicar reducción si habitacional → cuota_bimestral_reducida
Anual = bimestral * 6 (6 bimestres en el año)
""",
        "sources": [
            {"label": "Código Fiscal CDMX Art. 130", "url": "https://data.consejeria.cdmx.gob.mx/portal_old/uploads/gacetas/codigo-fiscal.pdf"},
            {"label": "Tesorería CDMX - Predial", "url": "https://innovacion.finanzas.cdmx.gob.mx/predial"},
        ],
        "related_slugs": ["calculadora-tenencia-vehicular-mexico", "calculadora-isn-impuesto-sobre-nominas-estado", "calculadora-iva-mexico-trasladado-acreditable"],
    },
    {
        "slug": "calculadora-rfc-cuota-resico-pf-mexico",
        "category": "impuestos",
        "icon": "📊",
        "formula_id": "rfc-resico-pf-mexico",
        "h1": "Calculadora de Cuota RESICO Persona Física (1%-2.5%)",
        "search_intent": "Cuánto pago de impuesto en el Régimen Simplificado de Confianza (RESICO) PF según ingresos mensuales",
        "fields_spec": [
            {"id": "ingresosMensuales", "label": "Ingresos efectivamente cobrados (mes)", "type": "number", "prefix": "$", "min": 0, "step": 1000, "required": True},
        ],
        "outputs_spec": [
            {"id": "cuotaResico", "label": "Cuota RESICO mensual", "format": "currency", "primary": True},
            {"id": "tasaAplicada", "label": "Tasa aplicada", "format": "text"},
            {"id": "ingresoNeto", "label": "Ingreso neto en mano", "format": "currency"},
            {"id": "anualizado", "label": "Cuota anual estimada", "format": "currency"},
            {"id": "detalle", "label": "Detalle", "format": "text"},
        ],
        "formula_logic": """
TABLA SAT RESICO PF MENSUAL 2026 (Art. 113-E LISR — Régimen Simplificado de Confianza):
  Hasta $25,000.00: 1.00%
  $25,000.01 - $50,000.00: 1.10%
  $50,000.01 - $83,333.33: 1.50%
  $83,333.34 - $208,333.33: 2.00%
  > $208,333.33: 2.50%

TOPE: ingresos anuales máximos para RESICO PF = $3,500,000. Si supera, pasa a régimen general.

CUOTA = ingresos_mensuales * tasa_aplicable_segun_tramo

NOTA: la cuota es DEFINITIVA (no se anualiza ni se acumula con otros regímenes).
Sustituye al ISR tradicional para personas físicas con actividad empresarial / profesional.
RESICO PF NO permite deducciones de gastos (es tasa plana sobre ingresos brutos).
Sí se puede acreditar IVA pagado a proveedores normalmente.
""",
        "sources": [
            {"label": "SAT - RESICO Personas Físicas", "url": "https://www.sat.gob.mx/personas/regimen-simplificado-confianza"},
            {"label": "LISR Art. 113-E", "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf"},
        ],
        "related_slugs": ["calculadora-isr-honorarios-persona-fisica", "calculadora-isr-sueldo-mexico", "calculadora-iva-mexico-trasladado-acreditable", "calculadora-sueldo-neto-mexico"],
    },
]
