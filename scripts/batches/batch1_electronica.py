"""Batch 1 — Electrónica (26 calcs restantes).
Specs compactos con template expansion vía helper add_calc().
"""

SPECS = []


def add_calc(slug, h1, desc, intro, kt, fields, outputs, example, faq_pairs, formula_code,
             use_cases=None, explanation_md="", related_slugs=None, icon="⚡", category="electronica"):
    """Add a calc with full template expansion."""
    related = related_slugs or [
        "calculadora-ley-ohm-voltaje-corriente-resistencia",
        "calculadora-potencia-electrica-p-vi",
        "calculadora-resistencia-led-serie-paralelo",
        "calculadora-divisor-voltaje-resistencias"
    ]
    uc = use_cases or [
        f"Diseño y análisis de circuitos que involucran {h1.lower()}",
        "Validar cálculos teóricos antes de montar el circuito",
        "Enseñanza de electrónica básica y avanzada",
        "Estimar parámetros para proyectos de microcontroladores (Arduino, ESP32, STM32)",
        "Troubleshooting de circuitos existentes"
    ]
    faq = [{"q": q, "a": a} for q, a in faq_pairs]

    SPECS.append({
        "slug": slug,
        "json": {
            "title": f"Calculadora {h1.split(' ')[-1] if len(h1) > 55 else h1} 2026 | Hacé Cuentas",
            "h1": h1,
            "description": desc,
            "category": category,
            "audience": "global",
            "icon": icon,
            "formulaId": slug,
            "intro": intro,
            "keyTakeaway": kt,
            "useCases": uc,
            "fields": fields,
            "outputs": outputs,
            "example": example,
            "explanation": explanation_md,
            "faq": faq,
            "sources": [
                {"name": "All About Circuits — Electronics Textbook", "url": "https://www.allaboutcircuits.com"},
                {"name": "IEEE Standards Association", "url": "https://standards.ieee.org"},
                {"name": "Electronics Tutorials", "url": "https://www.electronics-tutorials.ws"}
            ],
            "relatedSlugs": related,
        },
        "formula": formula_code,
    })


# ============ 1 — Resistencia por código de colores ============
add_calc(
    slug="resistencia-codigo-colores-4-5-bandas",
    h1="Calculadora de resistencia por código de colores",
    desc="Decodificá el valor de una resistencia por sus bandas de colores (4 o 5 bandas). Valor nominal, tolerancia, mínimo y máximo.",
    intro="Las resistencias comerciales se marcan con bandas de colores. **4 bandas** = 2 dígitos + multiplicador + tolerancia. **5 bandas** = 3 dígitos + multiplicador + tolerancia (precisión).",
    kt="Colores dígitos: Negro=0, Marrón=1, Rojo=2, Naranja=3, Amarillo=4, Verde=5, Azul=6, Violeta=7, Gris=8, Blanco=9. Tolerancia dorado=±5%, plateado=±10%, marrón=±1%.",
    fields=[
        {"id": "tipo", "label": "Tipo", "type": "select", "required": True, "default": "4", "options": [{"value": "4", "label": "4 bandas"}, {"value": "5", "label": "5 bandas"}]},
        {"id": "banda1", "label": "Banda 1", "type": "select", "required": True, "default": "rojo", "options": [{"value": c, "label": c.capitalize()} for c in ["negro", "marron", "rojo", "naranja", "amarillo", "verde", "azul", "violeta", "gris", "blanco"]]},
        {"id": "banda2", "label": "Banda 2", "type": "select", "required": True, "default": "rojo", "options": [{"value": c, "label": c.capitalize()} for c in ["negro", "marron", "rojo", "naranja", "amarillo", "verde", "azul", "violeta", "gris", "blanco"]]},
        {"id": "banda3", "label": "Banda 3 (3er dígito o multiplicador)", "type": "select", "required": True, "default": "marron", "options": [{"value": c, "label": c.capitalize()} for c in ["negro", "marron", "rojo", "naranja", "amarillo", "verde", "azul", "violeta", "gris", "blanco", "dorado", "plateado"]]},
        {"id": "banda4", "label": "Banda 4", "type": "select", "required": True, "default": "dorado", "options": [{"value": c, "label": c.capitalize()} for c in ["negro", "marron", "rojo", "naranja", "amarillo", "verde", "azul", "violeta", "dorado", "plateado"]]},
        {"id": "banda5", "label": "Banda 5 (solo 5 bandas)", "type": "select", "required": False, "default": "marron", "options": [{"value": c, "label": c.capitalize()} for c in ["marron", "rojo", "verde", "azul", "violeta", "dorado", "plateado"]]}
    ],
    outputs=[
        {"id": "valor", "label": "Valor nominal", "primary": True},
        {"id": "tolerancia", "label": "Tolerancia"},
        {"id": "minimo", "label": "Mínimo"},
        {"id": "maximo", "label": "Máximo"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    example={
        "title": "Ejemplo: Rojo-Rojo-Marrón-Dorado",
        "steps": ["Banda1 Rojo = 2", "Banda2 Rojo = 2", "Banda3 Marrón = ×10", "Banda4 Dorado = ±5%", "Valor: 22 × 10 = 220 Ω ± 5%"],
        "result": "220 Ω ± 5% (209-231 Ω)"
    },
    explanation_md="## Código estándar\n\n| Color | Dígito | Mult | Tolerancia |\n|---|---|---|---|\n| Negro | 0 | ×1 | — |\n| Marrón | 1 | ×10 | ±1% |\n| Rojo | 2 | ×100 | ±2% |\n| Naranja | 3 | ×1K | — |\n| Amarillo | 4 | ×10K | — |\n| Verde | 5 | ×100K | ±0.5% |\n| Azul | 6 | ×1M | ±0.25% |\n| Violeta | 7 | ×10M | ±0.1% |\n| Dorado | — | ×0.1 | ±5% |\n| Plateado | — | ×0.01 | ±10% |\n\n## Cómo leer\n\n1. Orientá con tolerancia a la derecha (dorada/plateada suele estar separada)\n2. Leé izquierda a derecha\n3. 4 bandas = 2 dígitos + mult + tol. 5 bandas = 3 dígitos + mult + tol (precisión)\n\n## SMD\n\nNo usan colores sino código numérico: 103 = 10×10³ = 10 kΩ. 4R7 = 4.7 Ω.",
    faq_pairs=[
        ("¿Cómo sé si es 4 o 5 bandas?", "Contá las bandas. 4 bandas = tolerancia ±5% o ±10% (general). 5 bandas = precisión ±1% o mejor."),
        ("¿Desde qué lado leo?", "Orientá la banda de tolerancia (dorada o plateada) a la DERECHA. Leé izquierda a derecha."),
        ("¿Y si no tiene 4ta banda?", "Sin banda de tolerancia = ±20% (resistencias antiguas). Muy raro hoy."),
        ("¿Por qué 5 bandas son más caras?", "Tolerancia ±1% requiere fabricación más controlada. 5% vale $5, 1% $15, 0.1% $100 en AR."),
        ("¿Sirve para SMD?", "No. Las SMD usan código numérico (3-4 dígitos): 103=10kΩ, 4R7=4.7Ω."),
        ("¿Colores gastados?", "Medí con multímetro en modo Ω — más confiable que interpretar colores dudosos."),
        ("¿Qué es la 6ta banda?", "Coeficiente térmico (ppm/°C): marrón=100, rojo=50, naranja=15, azul=10. Solo en precisión.")
    ],
    formula_code="""const DIG: Record<string, number> = { negro: 0, marron: 1, rojo: 2, naranja: 3, amarillo: 4, verde: 5, azul: 6, violeta: 7, gris: 8, blanco: 9 };
const MULT: Record<string, number> = { negro: 1, marron: 10, rojo: 100, naranja: 1e3, amarillo: 1e4, verde: 1e5, azul: 1e6, violeta: 1e7, dorado: 0.1, plateado: 0.01 };
const TOL: Record<string, number> = { marron: 1, rojo: 2, verde: 0.5, azul: 0.25, violeta: 0.1, dorado: 5, plateado: 10 };

export interface ResistenciaCodigoColoresInputs { tipo: string; banda1: string; banda2: string; banda3: string; banda4: string; banda5?: string; }
export interface ResistenciaCodigoColoresOutputs { valor: string; tolerancia: string; minimo: string; maximo: string; resumen: string; }

function fmt(ohms: number): string {
  if (ohms >= 1e6) return (ohms / 1e6).toFixed(2) + ' MΩ';
  if (ohms >= 1e3) return (ohms / 1e3).toFixed(2) + ' kΩ';
  return ohms.toFixed(2) + ' Ω';
}

export function resistenciaCodigoColores4_5Bandas(i: ResistenciaCodigoColoresInputs): ResistenciaCodigoColoresOutputs {
  const t = String(i.tipo);
  let v: number, tol: number;
  if (t === '5') {
    v = ((DIG[i.banda1] ?? 0) * 100 + (DIG[i.banda2] ?? 0) * 10 + (DIG[i.banda3] ?? 0)) * (MULT[i.banda4] ?? 1);
    tol = TOL[i.banda5 ?? 'marron'] ?? 1;
  } else {
    v = ((DIG[i.banda1] ?? 0) * 10 + (DIG[i.banda2] ?? 0)) * (MULT[i.banda3] ?? 1);
    tol = TOL[i.banda4] ?? 20;
  }
  const mn = v * (1 - tol / 100);
  const mx = v * (1 + tol / 100);
  return {
    valor: fmt(v),
    tolerancia: `±${tol}%`,
    minimo: fmt(mn),
    maximo: fmt(mx),
    resumen: `Resistencia ${fmt(v)} con tolerancia ±${tol}%. Rango real: ${fmt(mn)} a ${fmt(mx)}.`
  };
}
"""
)


# ============ 2 — Carga capacitor RC ============
add_calc(
    slug="carga-capacitor-constante-rc",
    h1="Calculadora de constante RC (carga/descarga de capacitor)",
    desc="Calculá la constante τ=RC y el voltaje del capacitor en cualquier instante durante carga o descarga. Incluye tiempos para 63%, 95% y 99%.",
    intro="Cuando un capacitor se carga a través de una resistencia, su voltaje crece exponencialmente: V(t) = V₀·(1 − e^(−t/τ)) con τ = R·C. En 1τ llega al 63%, en 3τ al 95% y en 5τ al 99%.",
    kt="**τ = R × C**. Carga: V(t) = V₀·(1 − e^(−t/τ)). Descarga: V(t) = V₀·e^(−t/τ). Regla: **5τ = completo**. Para 1 MΩ + 1 µF → τ = 1 s.",
    fields=[
        {"id": "r", "label": "Resistencia R (Ω)", "type": "number", "required": True, "placeholder": "1000", "min": 0.001, "step": 0.01},
        {"id": "c", "label": "Capacitancia C", "type": "number", "required": True, "placeholder": "1", "min": 0.000001, "step": 0.000001},
        {"id": "unidadC", "label": "Unidad C", "type": "select", "required": True, "default": "uF", "options": [{"value": "pF", "label": "pF"}, {"value": "nF", "label": "nF"}, {"value": "uF", "label": "µF"}, {"value": "mF", "label": "mF"}, {"value": "F", "label": "F"}]},
        {"id": "vFuente", "label": "Voltaje fuente (V)", "type": "number", "required": False, "placeholder": "5", "default": 5, "min": 0},
        {"id": "tInstante", "label": "Tiempo (s)", "type": "number", "required": False, "placeholder": "0.001", "min": 0, "step": 0.0001},
        {"id": "modo", "label": "Modo", "type": "select", "required": True, "default": "carga", "options": [{"value": "carga", "label": "Carga"}, {"value": "descarga", "label": "Descarga"}]}
    ],
    outputs=[
        {"id": "tau", "label": "τ (constante tiempo)", "primary": True},
        {"id": "t63", "label": "1τ (63%)"}, {"id": "t95", "label": "3τ (95%)"}, {"id": "t99", "label": "5τ (>99%)"},
        {"id": "voltajeInstante", "label": "V(t)"}, {"id": "porcentaje", "label": "% del final"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    example={
        "title": "R=10kΩ, C=100µF, V=12V, t=1s",
        "steps": ["τ = 10k × 100µF = 1 s", "En t=1s (1τ): V = 12×(1 − e⁻¹) = 7.58 V (63%)", "Tiempo 95% = 3 s", "Tiempo 99% = 5 s"],
        "result": "V(1s) = 7.58 V, carga completa en 5 s"
    },
    explanation_md="## Ecuaciones\n\n**Carga**: V(t) = V_fuente × (1 − e^(−t/τ))\n\n**Descarga**: V(t) = V_inicial × e^(−t/τ)\n\nDonde τ = R × C (segundos).\n\n## Porcentajes\n\n| τ | % |\n|---|---|\n| 1τ | 63% |\n| 2τ | 86% |\n| 3τ | 95% |\n| 5τ | 99% |\n\n## Aplicaciones\n\n- **Debouncing**: τ=10-50 ms\n- **Filtro RC**: fc = 1/(2π·τ)\n- **555 monoestable**: pulso = 1.1·RC",
    faq_pairs=[
        ("¿Qué es la constante RC?", "τ = R × C (segundos). Indica cuánto tarda el capacitor en llegar al 63% del valor final."),
        ("¿Por qué 63%?", "Es el resultado natural de V(τ) = V₀(1 − e⁻¹) = V₀ × 0.632. No arbitrario."),
        ("¿Cuándo considero completo?", "5τ = 99.3% es suficiente. Para precisión extrema: 7τ = 99.9%."),
        ("¿Si R es muy chica?", "τ baja, carga casi instantánea. Cuidado con picos de corriente inrush."),
        ("¿Con otra carga conectada?", "Vfinal ya no es Vfuente sino el divisor resultante. Recalcular Vfinal con Ley Ohm."),
        ("¿Vale para capacitores polarizados?", "Sí, pero respetá la polaridad — voltaje inverso destruye electrolíticos."),
        ("¿Cómo calculo C para τ específico?", "C = τ / R. Ejemplo: τ=1s con R=10k → C=100µF.")
    ],
    formula_code="""export interface CargaCapacitorConstanteRcInputs { r: number; c: number; unidadC: string; vFuente?: number; tInstante?: number; modo: string; }
export interface CargaCapacitorConstanteRcOutputs { tau: string; t63: string; t95: string; t99: string; voltajeInstante: string; porcentaje: string; resumen: string; }

const MU: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6, mF: 1e-3, F: 1 };

function fmtT(s: number): string {
  if (s >= 1) return s.toFixed(3) + ' s';
  if (s >= 1e-3) return (s * 1e3).toFixed(2) + ' ms';
  if (s >= 1e-6) return (s * 1e6).toFixed(2) + ' µs';
  return (s * 1e9).toFixed(2) + ' ns';
}

export function cargaCapacitorConstanteRc(i: CargaCapacitorConstanteRcInputs): CargaCapacitorConstanteRcOutputs {
  const r = Number(i.r); const c = Number(i.c) * (MU[i.unidadC] ?? 1e-6);
  if (!r || r <= 0) throw new Error('Ingresá R');
  if (!c || c <= 0) throw new Error('Ingresá C');
  const tau = r * c; const v = Number(i.vFuente ?? 5); const t = Number(i.tInstante ?? tau);
  const ratio = Math.exp(-t / tau);
  const vInst = i.modo === 'carga' ? v * (1 - ratio) : v * ratio;
  const pct = i.modo === 'carga' ? (1 - ratio) * 100 : ratio * 100;
  return {
    tau: fmtT(tau), t63: fmtT(tau), t95: fmtT(3 * tau), t99: fmtT(5 * tau),
    voltajeInstante: vInst.toFixed(3) + ' V', porcentaje: pct.toFixed(1) + '%',
    resumen: `τ = ${fmtT(tau)}. En ${fmtT(t)}: ${vInst.toFixed(2)} V (${pct.toFixed(1)}%). Completo (99%) en ${fmtT(5 * tau)}.`
  };
}
"""
)


# ============ 3 — Frecuencia corte filtro RC ============
add_calc(
    slug="frecuencia-corte-filtro-rc",
    h1="Calculadora de frecuencia de corte filtro RC pasa-bajos/altos",
    desc="Calculá la frecuencia de corte fc = 1/(2π·R·C) de un filtro RC pasa-bajos o pasa-altos. Incluye atenuación en varias frecuencias y ganancia en dB.",
    intro="Un filtro RC es el más simple para atenuar frecuencias. **Pasa-bajos**: deja pasar <fc, atenúa >fc. **Pasa-altos**: lo inverso. La frecuencia de corte fc = 1/(2π·RC) es donde la ganancia cae 3 dB (≈ 70.7% de la amplitud).",
    kt="**fc = 1/(2π × R × C)**. Para R=10kΩ y C=100nF → fc = 159 Hz. A fc: -3 dB. Cada década arriba/abajo: -20 dB/década.",
    fields=[
        {"id": "r", "label": "R (Ω)", "type": "number", "required": True, "placeholder": "10000", "min": 0.001},
        {"id": "c", "label": "C", "type": "number", "required": True, "placeholder": "100", "min": 0.000001},
        {"id": "unidadC", "label": "Unidad C", "type": "select", "required": True, "default": "nF", "options": [{"value": "pF", "label": "pF"}, {"value": "nF", "label": "nF"}, {"value": "uF", "label": "µF"}]},
        {"id": "tipo", "label": "Tipo", "type": "select", "required": True, "default": "pasa-bajos", "options": [{"value": "pasa-bajos", "label": "Pasa-bajos"}, {"value": "pasa-altos", "label": "Pasa-altos"}]}
    ],
    outputs=[
        {"id": "fc", "label": "Frecuencia corte (fc)", "primary": True},
        {"id": "fc2", "label": "fc × 2"}, {"id": "fc10", "label": "fc × 10"}, {"id": "fc100", "label": "fc × 100"},
        {"id": "atenuacionEnFc", "label": "Atenuación en fc"}, {"id": "resumen", "label": "Interpretación"}
    ],
    example={
        "title": "R=10kΩ, C=100nF pasa-bajos",
        "steps": ["fc = 1/(2π × 10000 × 100e-9)", "fc = 159 Hz", "A 1.6 kHz (10× fc): -20 dB (10%)", "A 16 kHz (100× fc): -40 dB (1%)"],
        "result": "fc = 159 Hz. Atenúa alta frecuencia 20 dB/década."
    },
    explanation_md="## Fórmula\n\n```\nfc = 1 / (2π × R × C)\n```\n\n## Pasa-bajos vs pasa-altos\n\n| Tipo | <fc | fc | >fc |\n|---|---|---|---|\n| Pasa-bajos | 0 dB | -3 dB | -20 dB/dec |\n| Pasa-altos | -20 dB/dec | -3 dB | 0 dB |\n\n## Aplicaciones\n\n- **Audio**: elimina ruido >20 kHz\n- **Anti-aliasing ADC**: fc = fs/2 (Nyquist)\n- **Sensor smoothing**: fc = 1-10 Hz\n- **Debouncing**: fc ≈ 100 Hz",
    faq_pairs=[
        ("¿Qué significa -3 dB en fc?", "Es donde la amplitud cae a 70.7% del valor original (70.7% = 10^(−3/20)). Es el punto 'half-power'."),
        ("¿Por qué 20 dB/década?", "Es la pendiente asintótica de un filtro de primer orden. Cada década (×10 en frecuencia) atenúa 20 dB más."),
        ("¿Cómo obtener mayor atenuación?", "Cascada de filtros (2º, 3º orden). Cada orden agrega 20 dB/década adicional."),
        ("¿Impacta la impedancia?", "Sí — el filtro RC tiene impedancia de salida ≈ R. Para cargar con otra etapa, usar buffer op-amp."),
        ("¿Vale para señal DC?", "No, el filtro solo filtra componentes AC. DC pasa por el filtro pasa-bajos con 0 dB (sin atenuación)."),
        ("¿Cómo calcular C para fc deseada?", "C = 1/(2π × R × fc). Para fc=100 Hz y R=10k: C = 159 nF."),
        ("¿fc del filtro pasa-altos?", "Misma fórmula. La diferencia es qué banda se atenúa. Circuito: C en serie + R a tierra (en lugar de R serie + C a tierra del pasa-bajos).")
    ],
    formula_code="""export interface FrecuenciaCorteFiltroRcInputs { r: number; c: number; unidadC: string; tipo: string; }
export interface FrecuenciaCorteFiltroRcOutputs { fc: string; fc2: string; fc10: string; fc100: string; atenuacionEnFc: string; resumen: string; }

const MU: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6 };

function fmtHz(f: number): string {
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
  return f.toFixed(1) + ' Hz';
}

export function frecuenciaCorteFiltroRc(i: FrecuenciaCorteFiltroRcInputs): FrecuenciaCorteFiltroRcOutputs {
  const r = Number(i.r); const c = Number(i.c) * (MU[i.unidadC] ?? 1e-9);
  if (!r || r <= 0 || !c || c <= 0) throw new Error('Ingresá R y C');
  const fc = 1 / (2 * Math.PI * r * c);
  return {
    fc: fmtHz(fc), fc2: fmtHz(fc * 2), fc10: fmtHz(fc * 10), fc100: fmtHz(fc * 100),
    atenuacionEnFc: '-3 dB (70.7%)',
    resumen: `fc = ${fmtHz(fc)} (${i.tipo}). Atenuación -3 dB en fc, -20 dB/década fuera de banda.`
  };
}
"""
)


# ============ 4 — Resonancia LC ============
add_calc(
    slug="resonancia-lc-circuito",
    h1="Calculadora de frecuencia de resonancia LC",
    desc="Calculá la frecuencia de resonancia f = 1/(2π√LC) de un circuito LC serie o paralelo. Incluye impedancia a la resonancia y factor Q.",
    intro="La **frecuencia de resonancia** de un circuito LC es donde la reactancia inductiva iguala la capacitiva (XL = XC). En ese punto la energía oscila entre L y C sin pérdidas. Se usa en osciladores, filtros pasabanda y sintonizadores de radio.",
    kt="**f = 1/(2π√(L×C))**. Para L=1 µH + C=1 nF → f = 5.03 MHz. En serie: impedancia MÍNIMA en resonancia. En paralelo: impedancia MÁXIMA.",
    fields=[
        {"id": "l", "label": "Inductancia L", "type": "number", "required": True, "placeholder": "1", "min": 0.000001},
        {"id": "unidadL", "label": "Unidad L", "type": "select", "required": True, "default": "uH", "options": [{"value": "nH", "label": "nH"}, {"value": "uH", "label": "µH"}, {"value": "mH", "label": "mH"}, {"value": "H", "label": "H"}]},
        {"id": "c", "label": "Capacitancia C", "type": "number", "required": True, "placeholder": "1", "min": 0.000001},
        {"id": "unidadC", "label": "Unidad C", "type": "select", "required": True, "default": "nF", "options": [{"value": "pF", "label": "pF"}, {"value": "nF", "label": "nF"}, {"value": "uF", "label": "µF"}]},
        {"id": "r", "label": "R total (opcional, para Q)", "type": "number", "required": False, "placeholder": "10", "min": 0}
    ],
    outputs=[
        {"id": "fResonancia", "label": "Frecuencia de resonancia", "primary": True},
        {"id": "angFrec", "label": "ω = 2πf"},
        {"id": "xL", "label": "XL a fr"}, {"id": "xC", "label": "XC a fr"},
        {"id": "q", "label": "Factor Q (si R)"}, {"id": "resumen", "label": "Interpretación"}
    ],
    example={
        "title": "L=10 µH, C=100 pF",
        "steps": ["f = 1/(2π√(10e-6 × 100e-12))", "= 1/(2π × 3.16e-8)", "= **5.03 MHz**"],
        "result": "Resonancia a 5.03 MHz — banda FM baja."
    },
    explanation_md="## Fórmula\n\n```\nf_r = 1 / (2π × √(L × C))\nω_r = 2π × f_r = 1 / √(L × C)\n```\n\n## Serie vs paralelo\n\n| | Serie | Paralelo |\n|---|---|---|\n| Impedancia en fr | MÍNIMA (=R) | MÁXIMA (=L/(RC)) |\n| Corriente | MÁXIMA | MÍNIMA |\n| Uso | Filtro pasabanda | Filtro rechazabanda |\n\n## Factor Q\n\n**Q = 1/R × √(L/C)**. Alto Q = filtro selectivo. Q típico: osciladores 50-500, cristales 10.000-100.000.\n\n## Aplicaciones\n\n- Sintonizador AM/FM\n- Osciladores Colpitts/Hartley\n- Transferencia inalámbrica de energía (Qi)",
    faq_pairs=[
        ("¿Cómo funciona en radio?", "Cada estación tiene su frecuencia. Ajustando L o C (generalmente C variable), coincidís con una estación y la circulación selectiva maximiza esa señal."),
        ("¿Serie o paralelo?", "Depende de la aplicación. Serie para filtros pasabanda. Paralelo para notch filter o tanque de oscilador."),
        ("¿Qué es Q alto?", "Selectividad. Q alto = pico resonante estrecho, rechaza bien frecuencias vecinas. Típico radio: Q=100 suficiente; cristales Q>10,000."),
        ("¿Qué afecta la frecuencia real?", "Capacidad parásita del inductor, resistencia del alambre, tolerancia de L y C (±10-20% típica). En radiofrecuencia, importante compensar."),
        ("¿Cómo calculo si sé la frecuencia deseada?", "Elegí L o C libremente: C = 1/((2πf)²×L). Ejemplo: f=10 MHz con L=1µH → C = 253 pF."),
        ("¿Y si hay resistencia?", "Reduce el Q y ensancha el pico. Inductores reales tienen R ~0.1-10 Ω dependiendo del calibre y número de vueltas."),
        ("¿Qué son RLC?", "LC con resistencia agregada. R determina Q y amortiguamiento. Si R es muy alta, el circuito no resuena (sobreamortiguado).")
    ],
    formula_code="""export interface ResonanciaLcCircuitoInputs { l: number; unidadL: string; c: number; unidadC: string; r?: number; }
export interface ResonanciaLcCircuitoOutputs { fResonancia: string; angFrec: string; xL: string; xC: string; q: string; resumen: string; }

const ML: Record<string, number> = { nH: 1e-9, uH: 1e-6, mH: 1e-3, H: 1 };
const MC: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6 };

function fmtHz(f: number): string { if (f >= 1e6) return (f/1e6).toFixed(3)+' MHz'; if (f >= 1e3) return (f/1e3).toFixed(2)+' kHz'; return f.toFixed(1)+' Hz'; }
function fmtOhm(o: number): string { if (o >= 1e3) return (o/1e3).toFixed(2)+' kΩ'; return o.toFixed(2)+' Ω'; }

export function resonanciaLcCircuito(i: ResonanciaLcCircuitoInputs): ResonanciaLcCircuitoOutputs {
  const l = Number(i.l) * (ML[i.unidadL] ?? 1e-6);
  const c = Number(i.c) * (MC[i.unidadC] ?? 1e-9);
  if (!l || l <= 0 || !c || c <= 0) throw new Error('Ingresá L y C');
  const fr = 1 / (2 * Math.PI * Math.sqrt(l * c));
  const omega = 2 * Math.PI * fr;
  const xL = omega * l; const xC = 1 / (omega * c);
  const r = Number(i.r ?? 0);
  const q = r > 0 ? Math.sqrt(l / c) / r : 0;
  return {
    fResonancia: fmtHz(fr), angFrec: (omega / 1e6).toFixed(3) + ' Mrad/s',
    xL: fmtOhm(xL), xC: fmtOhm(xC),
    q: r > 0 ? q.toFixed(1) : 'Ingresá R para calcular Q',
    resumen: `Resonancia a ${fmtHz(fr)}. XL = XC = ${fmtOhm(xL)} en el punto resonante.${r > 0 ? ' Factor Q = ' + q.toFixed(1) + '.' : ''}`
  };
}
"""
)


# ============ 5 — Reactancia inductiva / capacitiva ============
add_calc(
    slug="reactancia-inductiva-capacitiva",
    h1="Calculadora de reactancia inductiva (XL) y capacitiva (XC)",
    desc="Calculá la reactancia inductiva XL = 2πfL y capacitiva XC = 1/(2πfC) de bobinas y capacitores a cualquier frecuencia. Comparativa y visualización.",
    intro="La **reactancia** es la oposición al paso de corriente alterna que presentan inductores (XL) y capacitores (XC). XL aumenta con frecuencia, XC disminuye. Se mide en ohms como una resistencia, pero introduce desfase 90°.",
    kt="**XL = 2π × f × L** (crece con f). **XC = 1/(2π × f × C)** (decrece con f). A f=0 (DC): inductor = cortocircuito, capacitor = circuito abierto.",
    fields=[
        {"id": "modo", "label": "Tipo", "type": "select", "required": True, "default": "ambas", "options": [{"value": "XL", "label": "Solo XL (inductor)"}, {"value": "XC", "label": "Solo XC (capacitor)"}, {"value": "ambas", "label": "Ambas"}]},
        {"id": "f", "label": "Frecuencia (Hz)", "type": "number", "required": True, "placeholder": "1000", "min": 0.000001},
        {"id": "l", "label": "Inductancia (mH)", "type": "number", "required": False, "placeholder": "10", "min": 0},
        {"id": "c", "label": "Capacitancia (µF)", "type": "number", "required": False, "placeholder": "1", "min": 0}
    ],
    outputs=[
        {"id": "xL", "label": "Reactancia inductiva", "primary": True},
        {"id": "xC", "label": "Reactancia capacitiva"},
        {"id": "ratio", "label": "XL/XC"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    example={
        "title": "L=10 mH, C=1 µF, f=1 kHz",
        "steps": ["XL = 2π × 1000 × 0.01 = 62.8 Ω", "XC = 1/(2π × 1000 × 1e-6) = 159 Ω", "A esta f, el capacitor bloquea más que el inductor"],
        "result": "XL=62.8 Ω, XC=159 Ω. Circuito domina capacitivamente."
    },
    explanation_md="## Fórmulas\n\n```\nXL = 2π × f × L     (reactancia inductiva)\nXC = 1 / (2π × f × C)  (reactancia capacitiva)\n```\n\nAmbas en ohms.\n\n## Comportamiento con frecuencia\n\n| f | XL | XC | Notas |\n|---|---|---|---|\n| DC (0 Hz) | 0 (corto) | ∞ (abierto) | Inductor conduce, cap bloquea |\n| Baja f | Bajo | Alto | Capacitor domina |\n| Alta f | Alto | Bajo | Inductor domina |\n| Resonancia | XL = XC | iguales | Anulación mutua |\n\n## Uso\n\n- **Separación DC/AC**: capacitor bloquea DC, pasa AC\n- **Choke inductivo**: bloquea AC alta frecuencia, pasa DC\n- **Filtros LC**: combinación para resonancia o rechazo",
    faq_pairs=[
        ("¿Diferencia con resistencia?", "La resistencia disipa energía como calor. La reactancia almacena energía en campo magnético (L) o eléctrico (C). No disipa — devuelve en cada ciclo."),
        ("¿XL en DC?", "Cero (cortocircuito). Un inductor en DC estable solo tiene la resistencia del alambre."),
        ("¿XC en DC?", "Infinita (circuito abierto). El capacitor se carga y bloquea el paso de corriente continua."),
        ("¿Es la impedancia?", "Z = R + jX (resistencia + reactancia compleja). Para inductor puro: Z = jXL. Para capacitor: Z = −jXC."),
        ("¿Por qué desfase?", "En inductor: corriente atrasa 90° al voltaje. En capacitor: corriente adelanta 90°. Energía va y viene cíclicamente."),
        ("¿Qué pasa en resonancia?", "XL = XC en magnitud pero opuestas en signo. Se cancelan y la impedancia queda solo R (serie) o muy alta (paralelo)."),
        ("¿Cómo mido en la práctica?", "Medidor RLC específico o usando generador + osciloscopio para medir corriente/voltaje y calcular Z=V/I.")
    ],
    formula_code="""export interface ReactanciaInductivaCapacitivaInputs { modo: string; f: number; l?: number; c?: number; }
export interface ReactanciaInductivaCapacitivaOutputs { xL: string; xC: string; ratio: string; resumen: string; }

function fmtOhm(o: number): string { if (o >= 1e6) return (o/1e6).toFixed(2)+' MΩ'; if (o >= 1e3) return (o/1e3).toFixed(2)+' kΩ'; return o.toFixed(2)+' Ω'; }

export function reactanciaInductivaCapacitiva(i: ReactanciaInductivaCapacitivaInputs): ReactanciaInductivaCapacitivaOutputs {
  const f = Number(i.f); if (!f || f <= 0) throw new Error('Ingresá frecuencia');
  const l = Number(i.l ?? 0) * 1e-3; // mH → H
  const c = Number(i.c ?? 0) * 1e-6; // µF → F
  const xL = l > 0 ? 2 * Math.PI * f * l : 0;
  const xC = c > 0 ? 1 / (2 * Math.PI * f * c) : 0;
  const ratio = (xL > 0 && xC > 0) ? (xL / xC).toFixed(3) : 'N/A';
  let resumen = `A ${f} Hz:`;
  if (l > 0) resumen += ` XL = ${fmtOhm(xL)}.`;
  if (c > 0) resumen += ` XC = ${fmtOhm(xC)}.`;
  if (l > 0 && c > 0) {
    if (xL > xC) resumen += ' Circuito domina inductivamente.';
    else if (xC > xL) resumen += ' Circuito domina capacitivamente.';
    else resumen += ' Circuito en resonancia.';
  }
  return {
    xL: l > 0 ? fmtOhm(xL) : 'Ingresá L',
    xC: c > 0 ? fmtOhm(xC) : 'Ingresá C',
    ratio, resumen
  };
}
"""
)


# ============ 6-26 (compactas) ============
# Helper ultra-compacto para batchear rápido

def quick(slug, h1, desc, kt, fields, outputs, example_steps, example_result, explanation, faq_pairs, formula_code, intro=None):
    add_calc(
        slug=slug, h1=h1, desc=desc,
        intro=intro or f"{h1} — cálculos técnicos con fórmulas estándar de la electrónica.",
        kt=kt, fields=fields, outputs=outputs,
        example={"title": "Ejemplo", "steps": example_steps, "result": example_result},
        explanation_md=explanation, faq_pairs=faq_pairs, formula_code=formula_code
    )


# 6 — Impedancia RLC
quick(
    "impedancia-circuito-rlc",
    "Calculadora de impedancia Z en circuito RLC serie",
    "Calculá la impedancia total Z = √(R² + (XL−XC)²) de un circuito RLC serie. Incluye ángulo de fase y magnitud compleja.",
    "**Z = √(R² + (XL−XC)²)**. Ángulo φ = arctan((XL−XC)/R). Serie RLC resuena cuando XL = XC.",
    [
        {"id": "r", "label": "R (Ω)", "type": "number", "required": True, "placeholder": "100"},
        {"id": "xL", "label": "XL (Ω)", "type": "number", "required": True, "placeholder": "50"},
        {"id": "xC", "label": "XC (Ω)", "type": "number", "required": True, "placeholder": "30"}
    ],
    [{"id": "z", "label": "Impedancia |Z|", "primary": True}, {"id": "fase", "label": "Ángulo de fase"}, {"id": "resumen", "label": "Interpretación"}],
    ["R=100, XL=50, XC=30", "Z = √(100² + (50-30)²) = √(10000+400) = 101.98 Ω", "Ángulo = arctan(20/100) = 11.3°"],
    "Z = 101.98 Ω, fase 11.3°",
    "## Fórmula\n\n```\nZ = √(R² + (XL − XC)²)\nφ = arctan((XL − XC) / R)\n```\n\n## Casos\n\n- XL > XC: inductivo, corriente atrasa\n- XL < XC: capacitivo, corriente adelanta\n- XL = XC: resonancia, Z = R\n\n## Uso\n\nSelección de cables, compensación de cos φ, diseño de filtros.",
    [
        ("¿Qué es impedancia?", "Oposición total al flujo de corriente AC, incluye componente resistiva y reactiva."),
        ("¿Por qué ángulo de fase?", "Indica desfase entre voltaje y corriente. 0°=resistivo puro, ±90°=reactivo puro."),
        ("¿Serie vs paralelo?", "Fórmula distinta. Esta es para serie. En paralelo: 1/Z = √((1/R)² + (1/XL − 1/XC)²)."),
        ("¿Aplicable en DC?", "No. DC: XL=0 y XC=∞. Z = R en estado estable."),
        ("¿Mide lo mismo un multímetro?", "No. Los multímetros miden solo R en modo Ω. Para Z se usa medidor RLC o osciloscopio."),
    ],
    """export interface ImpedanciaCircuitoRlcInputs { r: number; xL: number; xC: number; }
export interface ImpedanciaCircuitoRlcOutputs { z: string; fase: string; resumen: string; }
export function impedanciaCircuitoRlc(i: ImpedanciaCircuitoRlcInputs): ImpedanciaCircuitoRlcOutputs {
  const r = Number(i.r); const xL = Number(i.xL); const xC = Number(i.xC);
  const z = Math.sqrt(r*r + Math.pow(xL - xC, 2));
  const fase = Math.atan2(xL - xC, r) * 180 / Math.PI;
  return { z: z.toFixed(2) + ' Ω', fase: fase.toFixed(1) + '°',
    resumen: `Z = ${z.toFixed(2)} Ω, ángulo ${fase.toFixed(1)}°. ${fase > 5 ? 'Inductivo' : fase < -5 ? 'Capacitivo' : 'Cerca de resonancia'}.` };
}
"""
)

# 7 — Factor potencia
quick(
    "factor-potencia-corregir",
    "Calculadora de factor de potencia y capacitor corrector",
    "Calculá el factor de potencia cos(φ) y el capacitor necesario para corregirlo. P (W), S (VA), Q (VAR) y kVAR de compensación.",
    "**cos(φ) = P/S**. Ideal > 0.95. Capacitor corrector: Qc = P × (tan(φ1) − tan(φ2)). Evita penalización de empresa eléctrica.",
    [
        {"id": "p", "label": "Potencia activa P (W)", "type": "number", "required": True, "placeholder": "1000"},
        {"id": "cosFi1", "label": "cos(φ) actual", "type": "number", "required": True, "placeholder": "0.7", "min": 0.1, "max": 1, "step": 0.01},
        {"id": "cosFi2", "label": "cos(φ) objetivo", "type": "number", "required": True, "placeholder": "0.95", "min": 0.5, "max": 1, "step": 0.01},
        {"id": "v", "label": "Voltaje (V)", "type": "number", "required": True, "placeholder": "220"},
        {"id": "f", "label": "Frecuencia (Hz)", "type": "number", "required": True, "placeholder": "50", "default": 50}
    ],
    [
        {"id": "qc", "label": "Potencia reactiva a compensar (kVAR)", "primary": True},
        {"id": "capacitor", "label": "Capacitor necesario"},
        {"id": "s1", "label": "Potencia aparente actual"},
        {"id": "s2", "label": "Potencia aparente corregida"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["P=1000W, cos1=0.7, cos2=0.95, V=220, f=50", "Q1 = 1000 × tan(45.6°) = 1020 VAR", "Q2 = 1000 × tan(18.2°) = 329 VAR", "Qc = 691 VAR ≈ 0.69 kVAR"],
    "Capacitor de 45 µF mejora cos(φ) de 0.7 a 0.95",
    "## Fórmulas\n\n```\ntan(φ) = sin(φ)/cos(φ) = √(1-cos²)/cos\nQc = P × (tan(φ1) − tan(φ2))\nC = Qc / (2π × f × V²)\n```\n\n## Beneficios\n\n- Evita recargo por cos(φ) bajo (penalización industrial desde 0.95)\n- Reduce corriente por mismo P (cables, disyuntores menos cargados)\n- Menos pérdidas I²R en distribución\n\n## Factor de potencia típico\n\n- Calefactor puro: 1.0\n- Heladera moderna: 0.85-0.95\n- Motor industrial: 0.6-0.85\n- Iluminación LED: 0.5-0.9",
    [
        ("¿Penalización por bajo cos(φ)?", "Las empresas eléctricas cobran recargo a usuarios comerciales/industriales si cos(φ) < 0.95. Residencial generalmente no."),
        ("¿Sirve para casas?", "En residencial no hay penalización pero sí ahorrás un poco de pérdidas de cable. Raro instalar corrector en casa."),
        ("¿Es un solo capacitor?", "Para cargas fijas sí. Para cargas variables se usa banco de capacitores con contactores automáticos."),
        ("¿Funciona en DC?", "No aplica — cos(φ) solo tiene sentido en AC."),
        ("¿Sobrecorrección?", "Peligroso — lleva cos(φ) a ser capacitivo. Genera problemas similares pero en otro signo. Objetivo: 0.95-0.98, no 1.0 exacto."),
    ],
    """export interface FactorPotenciaCorregirInputs { p: number; cosFi1: number; cosFi2: number; v: number; f: number; }
export interface FactorPotenciaCorregirOutputs { qc: string; capacitor: string; s1: string; s2: string; resumen: string; }
export function factorPotenciaCorregir(i: FactorPotenciaCorregirInputs): FactorPotenciaCorregirOutputs {
  const p = Number(i.p); const c1 = Number(i.cosFi1); const c2 = Number(i.cosFi2);
  const v = Number(i.v); const f = Number(i.f);
  if (c1 >= c2) throw new Error('cos(φ) objetivo debe ser mayor que actual');
  const tan1 = Math.tan(Math.acos(c1)); const tan2 = Math.tan(Math.acos(c2));
  const qc = p * (tan1 - tan2);
  const cFarads = qc / (2 * Math.PI * f * v * v);
  const s1 = p / c1; const s2 = p / c2;
  return {
    qc: (qc / 1000).toFixed(3) + ' kVAR',
    capacitor: (cFarads * 1e6).toFixed(1) + ' µF',
    s1: (s1 / 1000).toFixed(2) + ' kVA',
    s2: (s2 / 1000).toFixed(2) + ' kVA',
    resumen: `Capacitor de ${(cFarads * 1e6).toFixed(0)} µF corrige cos(φ) de ${c1} a ${c2}. Reducción de carga aparente: ${((s1-s2)/1000).toFixed(2)} kVA.`
  };
}
"""
)

# 8 — Transformador
quick(
    "transformador-relacion-vueltas",
    "Calculadora de transformador — relación vueltas N1/N2",
    "Calculá la relación de vueltas, voltaje secundario, corriente secundaria o potencia de un transformador ideal. N1/N2 = V1/V2 = I2/I1.",
    "**N1/N2 = V1/V2 = I2/I1**. Potencia: P1 = P2 en ideal. Relación 10:1 baja 220V a 22V y aumenta corriente 10×.",
    [
        {"id": "modo", "label": "Calcular", "type": "select", "required": True, "default": "v2", "options": [{"value": "v2", "label": "V2 (voltaje secundario)"}, {"value": "n2", "label": "N2 (vueltas secundario)"}, {"value": "i2", "label": "I2 (corriente secundario)"}]},
        {"id": "v1", "label": "V1 (primario, V)", "type": "number", "required": True, "placeholder": "220"},
        {"id": "n1", "label": "N1 (vueltas primario)", "type": "number", "required": False, "placeholder": "1000"},
        {"id": "n2", "label": "N2 (vueltas secundario, si lo sabés)", "type": "number", "required": False, "placeholder": "100"},
        {"id": "i1", "label": "I1 (primario, A)", "type": "number", "required": False, "placeholder": "2"}
    ],
    [
        {"id": "v2", "label": "V2 secundario", "primary": True},
        {"id": "i2", "label": "I2 secundario"},
        {"id": "relacion", "label": "Relación vueltas"},
        {"id": "potencia", "label": "Potencia (igual en ambos lados)"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["V1=220V, N1=1000, N2=100", "Relación 10:1", "V2 = 220 × 100/1000 = 22 V", "Si I1=2 A → I2 = 20 A"],
    "Transformador reductor 10:1 entrega 22 V a 20 A del secundario",
    "## Fórmula transformador ideal\n\n```\nV1/V2 = N1/N2 = I2/I1\nP1 = V1 × I1 = P2 = V2 × I2\n```\n\n## Tipos\n\n- **Reductor** (step-down): N1 > N2, V baja, I sube (red → electrónica)\n- **Elevador** (step-up): N1 < N2, V sube, I baja (inversor solar)\n- **1:1** (aislación): protección galvánica\n\n## Eficiencia real\n\nTransformadores reales tienen pérdidas (90-98%). Hierro pierde en histéresis, cobre pierde en I²R. Para cálculo profesional usar rendimiento η.",
    [
        ("¿Funciona con DC?", "No. Los transformadores solo funcionan con AC por ser el campo magnético variable el que induce voltaje en el secundario."),
        ("¿Qué pasa si conecto mal V1?", "Un transformador en 110V conectado a 220V se quema por exceso de flujo magnético en el núcleo. Respeta tensiones nominales."),
        ("¿Puede ir al revés?", "Sí. Un step-down puede trabajar como step-up si conectás al secundario con voltaje bajo y saca amplificado del primario. Pero respetá límites de corriente."),
        ("¿Por qué hay 1:1?", "Aislación galvánica: separa eléctricamente dos circuitos por razones de seguridad. Muy usado en equipos médicos y reparación."),
        ("¿Diferencia con autotransformador?", "Autotrafo usa una sola bobina con tap. Más chico/barato pero no da aislación galvánica."),
    ],
    """export interface TransformadorRelacionVueltasInputs { modo: string; v1: number; n1?: number; n2?: number; i1?: number; }
export interface TransformadorRelacionVueltasOutputs { v2: string; i2: string; relacion: string; potencia: string; resumen: string; }
export function transformadorRelacionVueltas(i: TransformadorRelacionVueltasInputs): TransformadorRelacionVueltasOutputs {
  const v1 = Number(i.v1); const n1 = Number(i.n1 ?? 0); const n2 = Number(i.n2 ?? 0); const i1 = Number(i.i1 ?? 0);
  if (!v1 || v1 <= 0) throw new Error('Ingresá V1');
  if (!n1 || !n2) throw new Error('Ingresá N1 y N2');
  const v2 = v1 * n2 / n1;
  const i2 = i1 > 0 ? i1 * n1 / n2 : 0;
  const p = v1 * i1;
  const rel = n1 / n2;
  return {
    v2: v2.toFixed(2) + ' V',
    i2: i2 > 0 ? i2.toFixed(2) + ' A' : 'Ingresá I1',
    relacion: `${rel.toFixed(2)}:1`,
    potencia: i1 > 0 ? p.toFixed(1) + ' W' : 'Ingresá I1',
    resumen: `Transformador ${rel > 1 ? 'reductor' : 'elevador'} ${rel.toFixed(1)}:1. V2 = ${v2.toFixed(1)} V${i1 > 0 ? ', I2 = ' + i2.toFixed(1) + ' A' : ''}.`
  };
}
"""
)

# 9 — Fuente DC watts amperaje
quick(
    "fuente-dc-watts-amperaje",
    "Calculadora de fuente DC — watts y amperaje necesarios",
    "Calculá la potencia (W) y amperaje (A) que debe entregar tu fuente DC según cargas conectadas. Suma de consumos + margen de seguridad del 25%.",
    "**P_total = Σ cargas**. **I = P/V**. Regla: elegí fuente con **1.3× P_total** de margen. Fuente 12V con 30W total → usar de 40W.",
    [
        {"id": "v", "label": "Voltaje de fuente (V)", "type": "number", "required": True, "placeholder": "12", "default": 12},
        {"id": "cargas", "label": "Consumos totales (W, suma)", "type": "number", "required": True, "placeholder": "30"},
        {"id": "factor", "label": "Factor de seguridad", "type": "number", "required": False, "placeholder": "1.3", "default": 1.3, "step": 0.1, "min": 1, "max": 3}
    ],
    [
        {"id": "potencia", "label": "Potencia fuente recomendada", "primary": True},
        {"id": "corriente", "label": "Amperaje fuente recomendada"},
        {"id": "corrienteMinima", "label": "Amperaje mínimo (sin margen)"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["V=12, cargas=30W, factor=1.3", "P fuente = 30 × 1.3 = 39 W", "I = 39 / 12 = 3.25 A", "Fuente recomendada: 12V 4A (48W, comercial)"],
    "Fuente 12V 4A (48W) con margen adecuado",
    "## Por qué el factor\n\nFuentes operando al 100% de su capacidad degradan rápido por calor. Regla estándar: **operar al 70-80% de capacidad**. Factor 1.3 cubre picos + envejecimiento.\n\n## Valores comerciales típicos\n\n| Voltaje | Amperajes comunes |\n|---|---|\n| 5V | 1, 2, 3, 5, 10 A |\n| 12V | 1, 2, 3, 5, 10, 20 A |\n| 24V | 1, 2, 5, 10, 15 A |\n\n## Eficiencia\n\nFuentes switching modernas: 85-94%. Fuentes lineales viejas: 40-60%. Para cálculo exacto: P_consumo = P_carga / η.",
    [
        ("¿Por qué no usar 100% de la fuente?", "Calor. Operar al 100% acorta vida útil drásticamente. 70-80% es el sweet spot entre costo y durabilidad."),
        ("¿Fuente más grande de la que necesito?", "No hace daño. La fuente entrega solo la corriente que la carga demanda. Comprá la más grande si la diferencia de precio es chica."),
        ("¿Factor de 1.5 o 2?", "Para cargas con picos de inrush (motores, capacitores grandes): 2x. Para cargas resistivas estables: 1.3-1.5 alcanza."),
        ("¿Diferencia entre W y VA?", "W = potencia activa (lo que realmente consume). VA = potencia aparente (la carga nominal de la fuente). En DC: W ≈ VA. En AC con cos(φ)<1: W < VA."),
        ("¿Fuente switching o lineal?", "Switching para 90% de los casos (más eficiente, más liviano). Lineal solo para audio analógico de alta gama o labs de precisión."),
    ],
    """export interface FuenteDcWattsAmperajeInputs { v: number; cargas: number; factor?: number; }
export interface FuenteDcWattsAmperajeOutputs { potencia: string; corriente: string; corrienteMinima: string; resumen: string; }
export function fuenteDcWattsAmperaje(i: FuenteDcWattsAmperajeInputs): FuenteDcWattsAmperajeOutputs {
  const v = Number(i.v); const p = Number(i.cargas); const f = Number(i.factor ?? 1.3);
  if (!v || v <= 0 || !p || p <= 0) throw new Error('Ingresá V y cargas');
  const pRec = p * f; const iMin = p / v; const iRec = pRec / v;
  return {
    potencia: pRec.toFixed(1) + ' W',
    corriente: iRec.toFixed(2) + ' A',
    corrienteMinima: iMin.toFixed(2) + ' A',
    resumen: `Fuente ${v}V ${iRec.toFixed(1)}A (${pRec.toFixed(0)} W) con ${((f-1)*100).toFixed(0)}% de margen. Mínimo absoluto: ${iMin.toFixed(1)} A.`
  };
}
"""
)

# 10 — Batería capacidad runtime
quick(
    "bateria-capacidad-runtime-ah",
    "Calculadora de autonomía de batería (Ah / runtime)",
    "Calculá cuántas horas dura una batería según capacidad (Ah) y consumo (A o W). Considera eficiencia de descarga y profundidad DoD máxima recomendada.",
    "**t = (Ah × V × η × DoD) / P_consumo**. Para batería 100Ah/12V al 80% DoD con carga 100W → 9.6 horas. Plomo-ácido: DoD ≤ 50%. LiFePO4: DoD ≤ 80%.",
    [
        {"id": "ah", "label": "Capacidad batería (Ah)", "type": "number", "required": True, "placeholder": "100"},
        {"id": "v", "label": "Voltaje batería (V)", "type": "number", "required": True, "placeholder": "12", "default": 12},
        {"id": "consumo", "label": "Consumo (W)", "type": "number", "required": True, "placeholder": "100"},
        {"id": "dod", "label": "Profundidad descarga máxima (%)", "type": "number", "required": True, "placeholder": "80", "default": 80, "min": 10, "max": 100},
        {"id": "eficiencia", "label": "Eficiencia (%)", "type": "number", "required": False, "placeholder": "95", "default": 95}
    ],
    [
        {"id": "horas", "label": "Autonomía", "primary": True},
        {"id": "wh", "label": "Energía útil"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["Ah=100, V=12, W=100, DoD=80%, η=95%", "Energía útil = 100 × 12 × 0.8 × 0.95 = 912 Wh", "Runtime = 912 / 100 = 9.12 h"],
    "Batería 100Ah 12V alimenta 100W durante 9.1 horas",
    "## DoD máximo por química\n\n| Tipo | DoD máx | Ciclos típicos |\n|---|---|---|\n| Plomo ácido sellada (AGM) | 50% | 400-800 |\n| Plomo ácido ciclo profundo | 70% | 600-1200 |\n| Li-ion (18650, 21700) | 80% | 500-1000 |\n| LiFePO4 | 80-90% | 2000-5000 |\n| Gel | 50-60% | 500-1000 |\n\n## Regla \"descarga C/20\"\n\nLa capacidad nominal (ej 100Ah) asume descarga en 20 h (5 A constante). A corrientes más altas, la capacidad efectiva cae (\"efecto Peukert\"): una batería 100Ah entregando 50A dura ~1h (no 2h).\n\n## Recomendaciones\n\n- Solar off-grid: LiFePO4 es el estándar actual\n- UPS: Plomo ácido AGM (descarga corta, rara)\n- Backup: Gel o LiFePO4 según budget",
    [
        ("¿Por qué no usar 100% DoD?", "Descargar totalmente acorta vida útil drásticamente. Plomo totalmente descargado puede sulfatarse y perder capacidad permanente."),
        ("¿Litio reemplaza plomo?", "Cada vez más. LiFePO4 cuesta 2-3× más pero dura 5-10× más y pesa 40% menos. Solar y náutico está migrando a Li."),
        ("¿Cómo calculo con cargas variables?", "Suma los Wh de cada carga (W × horas) y dividí por la energía útil total de la batería. Para flujo de cargas simula hora por hora."),
        ("¿Pierdo capacidad con el tiempo?", "Sí. Li-ion pierde ~2-3%/año + por ciclo. LiFePO4 pierde 1-2%/año. Plomo 5-10%/año según uso."),
        ("¿Efecto Peukert?", "Descargas rápidas reducen capacidad efectiva. Relevante si descargás en <10h. Para horas largas no afecta mucho."),
    ],
    """export interface BateriaCapacidadRuntimeAhInputs { ah: number; v: number; consumo: number; dod: number; eficiencia?: number; }
export interface BateriaCapacidadRuntimeAhOutputs { horas: string; wh: string; resumen: string; }
export function bateriaCapacidadRuntimeAh(i: BateriaCapacidadRuntimeAhInputs): BateriaCapacidadRuntimeAhOutputs {
  const ah = Number(i.ah); const v = Number(i.v); const w = Number(i.consumo);
  const dod = Number(i.dod) / 100; const eff = Number(i.eficiencia ?? 95) / 100;
  if (!ah || !v || !w) throw new Error('Ingresá Ah, V y consumo');
  const whUtil = ah * v * dod * eff;
  const horas = whUtil / w;
  return {
    horas: horas >= 1 ? horas.toFixed(1) + ' h' : (horas * 60).toFixed(0) + ' min',
    wh: whUtil.toFixed(0) + ' Wh',
    resumen: `Batería ${ah}Ah ${v}V alimenta ${w}W durante ${horas.toFixed(1)} h con DoD ${(dod*100).toFixed(0)}% y eficiencia ${(eff*100).toFixed(0)}%.`
  };
}
"""
)

# 11 — Panel solar kWh dimensionar
quick(
    "panel-solar-kwh-dimensionar",
    "Calculadora de dimensionado de panel solar (kWp)",
    "Calculá los kWp de paneles solares necesarios para cubrir tu consumo mensual. Considera horas pico solar (HPS) por región y eficiencia del sistema.",
    "**kWp = (Consumo_kWh_mes / 30) / (HPS × η)**. Argentina HPS ~4-5 h/día. Sistema grid-tie eficiencia ~85%. Para 500 kWh/mes → ~3.5 kWp.",
    [
        {"id": "consumoMes", "label": "Consumo mensual (kWh)", "type": "number", "required": True, "placeholder": "500"},
        {"id": "hps", "label": "Horas pico solar (HPS)", "type": "number", "required": True, "placeholder": "4.5", "step": 0.1},
        {"id": "eficiencia", "label": "Eficiencia sistema (%)", "type": "number", "required": False, "placeholder": "85", "default": 85},
        {"id": "tipoSistema", "label": "Tipo", "type": "select", "required": True, "default": "grid-tie", "options": [{"value": "grid-tie", "label": "Grid-tie (red)"}, {"value": "off-grid", "label": "Off-grid (aislado)"}, {"value": "hibrido", "label": "Híbrido"}]}
    ],
    [
        {"id": "kwp", "label": "Potencia paneles (kWp)", "primary": True},
        {"id": "cantidadPaneles", "label": "Cantidad paneles 400W"},
        {"id": "areaEstimada", "label": "Área aprox (m²)"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["500 kWh/mes, HPS=4.5, η=85%", "Consumo diario = 500/30 = 16.67 kWh", "kWp = 16.67 / (4.5 × 0.85) = 4.35", "Redondear a 5 kWp → 13 paneles 400W"],
    "5 kWp = 13 paneles 400W, ~25 m² de techo",
    "## HPS por región Argentina\n\n| Zona | HPS promedio |\n|---|---|\n| NOA (Jujuy, Salta) | 5.5-6.0 |\n| Centro (BA, Córdoba) | 4.5-5.0 |\n| Patagonia | 3.5-4.5 |\n| Litoral (Rosario, Misiones) | 4.5-5.0 |\n\n## Eficiencias típicas\n\n- **Grid-tie**: 80-90% (solo inversor)\n- **Off-grid con baterías**: 65-75% (inversor + controlador + baterías)\n- **Híbrido**: 75-85%\n\n## Panel típico 2026\n\n400-500 W, área ~2 m², tecnología mono-PERC o TOPCon. Vida útil 25+ años con garantía 80% capacidad a los 25.",
    [
        ("¿Cuántos paneles en mi techo?", "Panel 400W mide ~1.7×1.0 m. Para 5 kWp necesitás ~13 paneles y ~25 m² libre de sombra con orientación norte (hemisferio sur)."),
        ("¿Qué incluye el sistema completo?", "Paneles + inversor + cableado + estructura + tablero + protecciones. Costo 2026 AR: ~USD 1000-1300 por kWp instalado."),
        ("¿Grid-tie necesita baterías?", "No. Grid-tie inyecta sobrante a la red (net metering). Off-grid sí necesita baterías para cubrir noches."),
        ("¿Cuánto ahorra?", "Sistema 5kWp en AR con tarifa $100/kWh puede ahorrar ~50000 AR/mes. Payback típico 4-7 años."),
        ("¿Se puede ampliar después?", "Sí, agregando paneles e inversor. Diseñar el tablero y cableado con margen al inicio facilita."),
    ],
    """export interface PanelSolarKwhDimensionarInputs { consumoMes: number; hps: number; eficiencia?: number; tipoSistema: string; }
export interface PanelSolarKwhDimensionarOutputs { kwp: string; cantidadPaneles: string; areaEstimada: string; resumen: string; }
export function panelSolarKwhDimensionar(i: PanelSolarKwhDimensionarInputs): PanelSolarKwhDimensionarOutputs {
  const kwh = Number(i.consumoMes); const hps = Number(i.hps);
  const effDefault = i.tipoSistema === 'off-grid' ? 70 : (i.tipoSistema === 'hibrido' ? 80 : 85);
  const eff = Number(i.eficiencia ?? effDefault) / 100;
  if (!kwh || !hps) throw new Error('Ingresá consumo y HPS');
  const kWp = (kwh / 30) / (hps * eff);
  const paneles = Math.ceil(kWp * 1000 / 400);
  const area = paneles * 2;
  return {
    kwp: kWp.toFixed(2) + ' kWp',
    cantidadPaneles: `${paneles} paneles de 400W`,
    areaEstimada: area + ' m²',
    resumen: `Para ${kwh} kWh/mes necesitás ${kWp.toFixed(1)} kWp (${paneles} paneles 400W, ~${area} m²). Sistema ${i.tipoSistema}.`
  };
}
"""
)

# Continúa con 12-26 en formato ULTRA compacto
# 12 — Inversor solar potencia
quick(
    "inversor-solar-potencia",
    "Calculadora de potencia de inversor solar",
    "Calculá la potencia nominal del inversor según cargas simultáneas. Suma picos + margen 25%. Considera pico inrush de motores (×3).",
    "**P_inversor = Σ cargas × 1.25**. Motores: picos 3× potencia nominal. Elegí inversor con suficiente pico para arranques.",
    [
        {"id": "cargasContinuas", "label": "Cargas continuas (W)", "type": "number", "required": True, "placeholder": "1500"},
        {"id": "cargasPicoMotores", "label": "Motores (W nominales)", "type": "number", "required": False, "placeholder": "500", "default": 0}
    ],
    [
        {"id": "nominal", "label": "Potencia nominal", "primary": True},
        {"id": "pico", "label": "Potencia pico necesaria"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["Cargas=1500W, motores=500W", "P_nominal = 2000 × 1.25 = 2500W", "Pico = 1500 + (500×3) = 3000W", "Inversor 2500W nominal / 5000W pico"],
    "Inversor 2500W nominal con capacidad pico 5000W",
    "## Pico vs nominal\n\nInversores indican 2 valores:\n- **Nominal**: lo que entregan continuo\n- **Pico**: 2-3× nominal por 5-10 segundos\n\nMotores (heladera, bomba de agua, compresor) tienen pico de arranque 3-5× su consumo nominal durante <1 seg.\n\n## Inversores 2026\n\n- **Onda senoidal pura**: obligatorio para electrónica moderna (PCs, TVs modernas, bombas)\n- **Onda modificada**: más barato pero solo para cargas resistivas (heladeras viejas, calefactores)",
    [
        ("¿Sinusoidal pura o modificada?", "Pura siempre, excepto para cargas puramente resistivas. Modificada rompe electrónica moderna y hace ruido en audio."),
        ("¿Necesito 3× por el motor?", "Sí, durante <1 segundo de arranque. Si tu inversor no tiene capacidad pico suficiente, no arranca el motor."),
        ("¿Y las cargas de heladera ciclo on/off?", "Sumar el pico (3× consumo nominal) al total. Inversor debe manejar ese pico de arranque."),
        ("¿Puro vs híbrido?", "Puro: AC → AC. Híbrido: trabaja con red y baterías simultáneamente. Híbrido más flexible."),
        ("¿Puedo tener múltiples inversores?", "Sí, en paralelo para subir potencia. Requieren comunicación entre sí (master-slave)."),
    ],
    """export interface InversorSolarPotenciaInputs { cargasContinuas: number; cargasPicoMotores?: number; }
export interface InversorSolarPotenciaOutputs { nominal: string; pico: string; resumen: string; }
export function inversorSolarPotencia(i: InversorSolarPotenciaInputs): InversorSolarPotenciaOutputs {
  const c = Number(i.cargasContinuas); const m = Number(i.cargasPicoMotores ?? 0);
  if (!c) throw new Error('Ingresá cargas continuas');
  const total = c + m;
  const nominal = total * 1.25;
  const pico = c + m * 3;
  return { nominal: nominal.toFixed(0) + ' W', pico: pico.toFixed(0) + ' W',
    resumen: `Inversor ${(nominal/1000).toFixed(1)} kW nominal con capacidad pico ${(pico/1000).toFixed(1)} kW. ${m > 0 ? 'Importante: pico por arranque de motores.' : ''}` };
}
"""
)

# 13 — Banco baterías solar
quick(
    "banco-baterias-solar-dias-autonomia",
    "Calculadora de banco de baterías solar (días autonomía)",
    "Calculá la capacidad en Ah del banco de baterías solar según consumo diario, días de autonomía y voltaje del banco. Considera DoD y eficiencia.",
    "**Ah = (kWh_día × días) / (V × DoD × η)**. Off-grid AR: 3-5 días autonomía típico. LiFePO4 80% DoD. Plomo 50% DoD.",
    [
        {"id": "kwhDia", "label": "Consumo diario (kWh)", "type": "number", "required": True, "placeholder": "5"},
        {"id": "dias", "label": "Días de autonomía", "type": "number", "required": True, "placeholder": "3", "min": 1, "max": 7},
        {"id": "v", "label": "Voltaje banco (V)", "type": "number", "required": True, "placeholder": "48", "default": 48},
        {"id": "dod", "label": "DoD máxima (%)", "type": "number", "required": True, "placeholder": "80", "default": 80},
        {"id": "eficiencia", "label": "Eficiencia (%)", "type": "number", "required": False, "placeholder": "90", "default": 90}
    ],
    [
        {"id": "ah", "label": "Capacidad banco", "primary": True},
        {"id": "whTotal", "label": "Energía total"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["5kWh/día, 3 días, 48V, DoD 80%, η 90%", "Wh total = 5000 × 3 = 15000", "Ah = 15000 / (48 × 0.8 × 0.9)", "Ah = 434 Ah a 48V"],
    "Banco de 434Ah a 48V (≈ 20.8 kWh) cubre 3 días",
    "## Voltajes típicos\n\n- **12V**: sistemas chicos (<3 kW)\n- **24V**: medianos (3-6 kW)\n- **48V**: grandes (>6 kW, casa completa)\n\nMás voltaje = menos corriente = cables más chicos + menos pérdidas.\n\n## Cantidad de baterías\n\nSi querés 48V con baterías 12V: 4 en serie. Si cada una es 200Ah: 4×200 = 48V/200Ah. Para 400Ah totales: 2 strings paralelas de 4 en serie.",
    [
        ("¿Cuántos días de autonomía?", "Depende de clima. Sol constante: 1-2 días alcanza. Región nublada o invierno: 4-5 días. Backup para apagones: solo 1 día."),
        ("¿Por qué 48V mejor que 12V?", "Con misma potencia, 48V usa 4× menos corriente. Cables más baratos, menos pérdidas, componentes más eficientes."),
        ("¿LiFePO4 o plomo?", "LiFePO4 si tenés budget — dura 4-6× más, 40% más liviano, DoD más alto. Plomo si inicial es prioritario."),
        ("¿Qué pasa si sobredimensiono?", "Más caro pero durable. Baterías con menos ciclos profundos duran más años."),
        ("¿Cuánto cuesta en AR?", "LiFePO4 48V 200Ah ≈ USD 1800-2500. Plomo AGM 48V 200Ah ≈ USD 800-1200."),
    ],
    """export interface BancoBateriasSolarDiasAutonomiaInputs { kwhDia: number; dias: number; v: number; dod: number; eficiencia?: number; }
export interface BancoBateriasSolarDiasAutonomiaOutputs { ah: string; whTotal: string; resumen: string; }
export function bancoBateriasSolarDiasAutonomia(i: BancoBateriasSolarDiasAutonomiaInputs): BancoBateriasSolarDiasAutonomiaOutputs {
  const kwhDia = Number(i.kwhDia); const d = Number(i.dias); const v = Number(i.v);
  const dod = Number(i.dod) / 100; const eff = Number(i.eficiencia ?? 90) / 100;
  if (!kwhDia || !d || !v) throw new Error('Completá campos');
  const whTotal = kwhDia * 1000 * d;
  const ah = whTotal / (v * dod * eff);
  return {
    ah: ah.toFixed(0) + ' Ah a ' + v + 'V',
    whTotal: (whTotal / 1000).toFixed(1) + ' kWh',
    resumen: `Banco ${ah.toFixed(0)}Ah a ${v}V cubre ${d} día${d>1?'s':''} con DoD ${(dod*100).toFixed(0)}% y eficiencia ${(eff*100).toFixed(0)}%. Energía total: ${(whTotal/1000).toFixed(1)} kWh.`
  };
}
"""
)

# 14 — Motor DC RPM voltaje
quick(
    "motor-dc-rpm-voltaje",
    "Calculadora de RPM de motor DC por voltaje (Kv)",
    "Calculá las RPM de un motor DC según voltaje aplicado y constante Kv (RPM por volt). Sin carga: RPM = V × Kv. Con carga cae proporcional al torque.",
    "**RPM = V × Kv** (sin carga). Bajo carga la velocidad cae. Kv típico: 2000-10000 para motores RC, 50-300 para industriales.",
    [
        {"id": "voltaje", "label": "Voltaje aplicado (V)", "type": "number", "required": True, "placeholder": "12"},
        {"id": "kv", "label": "Constante Kv (RPM/V)", "type": "number", "required": True, "placeholder": "1000"},
        {"id": "carga", "label": "Carga aplicada (%)", "type": "number", "required": False, "placeholder": "0", "default": 0, "min": 0, "max": 100}
    ],
    [
        {"id": "rpm", "label": "RPM estimado", "primary": True},
        {"id": "rps", "label": "Rev/segundo"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["V=12V, Kv=1000, carga=20%", "RPM sin carga = 12 × 1000 = 12000", "Con 20% carga: ~9600 RPM"],
    "12000 RPM sin carga, ~9600 RPM con 20% de carga",
    "## Kv característico\n\n| Motor | Kv típico | Uso |\n|---|---|---|\n| Motor RC micro | 5000-10000 | Drones, aviones pequeños |\n| Motor RC mediano | 2000-5000 | Aviones grandes |\n| Motor RC de alto torque | 300-1500 | Helicópteros, barcos |\n| Motor industrial DC | 50-500 | Cintas, bombas |\n\n## Relación torque-velocidad\n\nSin carga: RPM max. A stall (motor bloqueado): torque máximo, RPM=0. La curva es aproximadamente lineal entre estos extremos.",
    [
        ("¿Qué es Kv?", "Constante de velocidad del motor, en RPM por volt. Si aplicás 1V el motor gira Kv RPM sin carga."),
        ("¿Y con carga?", "La velocidad baja linealmente con el torque. A plena carga (stall): RPM=0 y corriente máxima."),
        ("¿Reemplaza la especificación de corriente?", "No. Kv es independiente de la corriente. Corriente depende del torque demandado por la carga."),
        ("¿Motor brushless vs brushed?", "Brushless mucho más eficiente (>90%) y durable. Brushed más barato pero las escobillas se desgastan."),
        ("¿PWM afecta Kv?", "PWM cambia el voltaje promedio. Si duty cycle 50% en 12V, el motor ve 6V efectivos y gira la mitad."),
    ],
    """export interface MotorDcRpmVoltajeInputs { voltaje: number; kv: number; carga?: number; }
export interface MotorDcRpmVoltajeOutputs { rpm: string; rps: string; resumen: string; }
export function motorDcRpmVoltaje(i: MotorDcRpmVoltajeInputs): MotorDcRpmVoltajeOutputs {
  const v = Number(i.voltaje); const kv = Number(i.kv); const c = Number(i.carga ?? 0) / 100;
  if (!v || !kv) throw new Error('Ingresá V y Kv');
  const rpmSinCarga = v * kv;
  const rpm = rpmSinCarga * (1 - c * 0.4); // carga reduce ~40% a 100%
  return {
    rpm: rpm.toFixed(0) + ' RPM',
    rps: (rpm / 60).toFixed(1) + ' rev/s',
    resumen: `A ${v}V con Kv=${kv}: ${rpmSinCarga.toFixed(0)} RPM sin carga${c > 0 ? ', ~' + rpm.toFixed(0) + ' RPM con ' + (c*100).toFixed(0) + '% carga' : ''}.`
  };
}
"""
)

# 15 — Servo PWM
quick(
    "servo-pwm-angulo",
    "Calculadora de ángulo servo por pulso PWM",
    "Calculá el ángulo de salida de un servo según el ancho de pulso PWM. Estándar: 1ms = 0°, 1.5ms = 90°, 2ms = 180°.",
    "Servo estándar: pulsos de 1-2 ms cada 20 ms (50 Hz). **Ángulo = (pulso − 1) × 180**. Pulso 1.5ms = centro 90°.",
    [
        {"id": "pulso", "label": "Ancho de pulso (ms)", "type": "number", "required": True, "placeholder": "1.5", "step": 0.01, "min": 0.5, "max": 2.5},
        {"id": "rango", "label": "Rango del servo (°)", "type": "number", "required": False, "placeholder": "180", "default": 180}
    ],
    [
        {"id": "angulo", "label": "Ángulo", "primary": True},
        {"id": "porcentaje", "label": "% del rango"},
        {"id": "resumen", "label": "Interpretación"}
    ],
    ["Pulso=1.5ms, rango=180°", "Ángulo = (1.5 − 1) × 180 = 90°", "Centro exacto del servo"],
    "Pulso 1.5ms = 90° (centro)",
    "## Protocolo PWM estándar\n\n| Pulso | Ángulo (servo 180°) |\n|---|---|\n| 1.0 ms | 0° (extremo izquierdo) |\n| 1.25 ms | 45° |\n| 1.5 ms | 90° (centro) |\n| 1.75 ms | 135° |\n| 2.0 ms | 180° (extremo derecho) |\n\nFrecuencia de actualización: **50 Hz** (período 20 ms).\n\n## Servos continuos\n\nLos servos de rotación continua usan mismo protocolo pero:\n- 1.5 ms = parar\n- 1.0 ms = velocidad máxima en sentido inverso\n- 2.0 ms = velocidad máxima hacia delante",
    [
        ("¿Frecuencia PWM?", "50 Hz para servos estándar. Servos digitales modernos aceptan hasta 300 Hz para mejor respuesta."),
        ("¿Por qué 50 Hz y no más?", "Convención histórica de los primeros servos. Los digitales modernos responden mejor a 200-300 Hz."),
        ("¿Rango extendido?", "Algunos servos aceptan 0.5-2.5 ms para cubrir 270° o más. Verificá datasheet."),
        ("¿Con Arduino?", "Usá library Servo.h. servo.write(grados) maneja el PWM automáticamente."),
        ("¿Torque vs velocidad?", "Datasheet especifica kg·cm (torque) y sec/60° (velocidad). Servo 20 kg·cm es industrial, 1-3 kg·cm es hobby."),
    ],
    """export interface ServoPwmAnguloInputs { pulso: number; rango?: number; }
export interface ServoPwmAnguloOutputs { angulo: string; porcentaje: string; resumen: string; }
export function servoPwmAngulo(i: ServoPwmAnguloInputs): ServoPwmAnguloOutputs {
  const p = Number(i.pulso); const r = Number(i.rango ?? 180);
  if (!p || p < 0.5 || p > 2.5) throw new Error('Pulso entre 0.5 y 2.5 ms');
  const angulo = (p - 1) * r;
  const pct = ((p - 1) / 1) * 100;
  return { angulo: angulo.toFixed(1) + '°', porcentaje: pct.toFixed(0) + '%',
    resumen: `Pulso ${p} ms → ángulo ${angulo.toFixed(0)}° (${pct.toFixed(0)}% del rango de ${r}°).` };
}
"""
)


# 16 — Stepper pasos grado
quick(
    "stepper-pasos-grado",
    "Calculadora de pasos por grado de motor stepper",
    "Calculá los pasos por grado y por revolución de un motor stepper según ángulo de paso (step angle). Con microstepping.",
    "**Pasos/rev = 360° / step_angle**. Típico 1.8° = 200 pasos/rev. Microstepping 1/16 = 3200 microsteps/rev.",
    [
        {"id": "angulo", "label": "Ángulo por paso (°)", "type": "number", "required": True, "placeholder": "1.8", "step": 0.1},
        {"id": "microstep", "label": "Microstepping", "type": "select", "required": True, "default": "1", "options": [{"value": "1", "label": "Full step (1/1)"}, {"value": "2", "label": "Half step (1/2)"}, {"value": "4", "label": "1/4"}, {"value": "8", "label": "1/8"}, {"value": "16", "label": "1/16"}, {"value": "32", "label": "1/32"}]}
    ],
    [{"id": "pasosPorRev", "label": "Pasos por revolución", "primary": True}, {"id": "pasosPorGrado", "label": "Pasos por grado"}, {"id": "resumen", "label": "Interpretación"}],
    ["1.8°/paso con micro 1/16", "Pasos/rev = 360/1.8 = 200 × 16 = 3200", "Pasos/° = 3200/360 = 8.89"],
    "3200 microsteps/rev, 8.89 steps/grado",
    "## Steppers comunes\n\n- **NEMA 17**: 1.8°/paso (200 pasos/rev) — impresoras 3D, CNC pequeñas\n- **NEMA 23**: 1.8°/paso, más torque — CNC mediano\n- **NEMA 34**: 0.9°/paso (400 pasos/rev) — industriales grandes\n\n## Microstepping\n\nDivide cada paso en fracciones electrónicas. Ventajas: movimiento más suave, menos vibración. Desventaja: pierde torque proporcional a subdivisión.",
    [
        ("¿Qué es microstepping?", "El driver divide cada paso en sub-pasos electrónicos modulando la corriente. 1/16 = 16 microsteps por paso físico."),
        ("¿Pierdo torque con microstepping?", "Sí. El torque baja ~30% con 1/16 vs full step. Para aplicaciones exigentes usar half-step (compromise)."),
        ("¿Servo vs stepper?", "Stepper: simple, abierto, preciso. Servo: cerrado con encoder, más rápido, más caro."),
        ("¿NEMA 17 vs 23?", "NEMA 17 (4.2cm): 30-70 oz·in, liviano. NEMA 23 (5.7cm): 180-420 oz·in, más torque."),
        ("¿Puede perder pasos?", "Sí, si la carga excede el torque disponible. Por eso en CNC se usan con margen 40%+."),
    ],
    """export interface StepperPasosGradoInputs { angulo: number; microstep: string; }
export interface StepperPasosGradoOutputs { pasosPorRev: string; pasosPorGrado: string; resumen: string; }
export function stepperPasosGrado(i: StepperPasosGradoInputs): StepperPasosGradoOutputs {
  const a = Number(i.angulo); const ms = Number(i.microstep);
  if (!a || a <= 0) throw new Error('Ingresá ángulo por paso');
  const ppr = (360 / a) * ms;
  const ppg = ppr / 360;
  return { pasosPorRev: ppr.toFixed(0), pasosPorGrado: ppg.toFixed(2),
    resumen: `Stepper ${a}°/paso con microstepping 1/${ms}: ${ppr} pasos/rev (${ppg.toFixed(1)} pasos/°).` };
}
"""
)

# 17 — USB velocidad transferencia
quick(
    "velocidad-usb-transferencia-archivo",
    "Calculadora de tiempo de transferencia por USB",
    "Calculá tiempo de transferencia USB 2.0/3.0/3.1/3.2/4.0 para un archivo de tamaño dado. Considera overhead real (~70% de velocidad teórica).",
    "**t = tamaño / velocidad_real**. USB 2.0: ~35 MB/s real (480 Mbps). USB 3.0: ~400 MB/s. USB 4: ~4 GB/s. La velocidad real es 70% del teórico.",
    [
        {"id": "tamano", "label": "Tamaño archivo (GB)", "type": "number", "required": True, "placeholder": "10"},
        {"id": "version", "label": "Versión USB", "type": "select", "required": True, "default": "3.0", "options": [{"value": "2.0", "label": "USB 2.0 (480 Mbps)"}, {"value": "3.0", "label": "USB 3.0 / 3.1 Gen 1 (5 Gbps)"}, {"value": "3.1", "label": "USB 3.1 Gen 2 (10 Gbps)"}, {"value": "3.2", "label": "USB 3.2 Gen 2x2 (20 Gbps)"}, {"value": "4.0", "label": "USB 4 (40 Gbps)"}]}
    ],
    [{"id": "tiempo", "label": "Tiempo de transferencia", "primary": True}, {"id": "velocidadReal", "label": "Velocidad real"}, {"id": "resumen", "label": "Interpretación"}],
    ["10 GB por USB 3.0", "Velocidad real ~400 MB/s", "Tiempo = 10000 MB / 400 MB/s = 25 s"],
    "10 GB tarda ~25 segundos por USB 3.0",
    "## Velocidades teóricas vs reales\n\n| Versión | Teórico | Real típico |\n|---|---|---|\n| USB 2.0 | 480 Mbps (60 MB/s) | 35-40 MB/s |\n| USB 3.0 | 5 Gbps (625 MB/s) | 350-450 MB/s |\n| USB 3.1 Gen 2 | 10 Gbps | 700-900 MB/s |\n| USB 3.2 Gen 2x2 | 20 Gbps | 1.4-1.8 GB/s |\n| USB 4 | 40 Gbps | 3-4 GB/s |\n\n## Cuellos de botella\n\n- **Cable malo**: puede limitar incluso USB 2.0\n- **Disco destino**: HDD 100 MB/s, SSD SATA 500 MB/s, NVMe 3-7 GB/s\n- **Overhead protocolo**: ~20-30% de la velocidad teórica\n- **Muchos archivos chicos**: pierde velocidad por seeks",
    [
        ("¿Por qué la velocidad real es menor?", "Overhead del protocolo, control de flujo, CRC, encoding 8b/10b o 128b/132b. Aproximadamente 70% del teórico."),
        ("¿USB-C = USB 4?", "No necesariamente. USB-C es el conector físico. USB 4 es el protocolo (30× más rápido que USB 2.0)."),
        ("¿Thunderbolt vs USB 4?", "TB3/TB4 y USB 4 son compatibles a 40 Gbps, pero TB tiene certificación más estricta."),
        ("¿Cable importa?", "Mucho. Cable USB-C barato puede ser USB 2.0 internamente. Buscá certificación 'USB-IF Certified' o 'Thunderbolt 3'."),
        ("¿Cuántos archivos caben en USB 3?", "5 GB en ~12s real. 100 GB en ~4 minutos. 1 TB en ~40 minutos."),
    ],
    """const SPEEDS: Record<string, number> = { '2.0': 35, '3.0': 400, '3.1': 800, '3.2': 1500, '4.0': 3500 };
export interface VelocidadUsbTransferenciaArchivoInputs { tamano: number; version: string; }
export interface VelocidadUsbTransferenciaArchivoOutputs { tiempo: string; velocidadReal: string; resumen: string; }
export function velocidadUsbTransferenciaArchivo(i: VelocidadUsbTransferenciaArchivoInputs): VelocidadUsbTransferenciaArchivoOutputs {
  const gb = Number(i.tamano); const mbs = SPEEDS[i.version] ?? 400;
  if (!gb || gb <= 0) throw new Error('Ingresá tamaño');
  const segundos = (gb * 1024) / mbs;
  let tFmt: string;
  if (segundos < 60) tFmt = segundos.toFixed(1) + ' s';
  else if (segundos < 3600) tFmt = (segundos / 60).toFixed(1) + ' min';
  else tFmt = (segundos / 3600).toFixed(2) + ' h';
  return { tiempo: tFmt, velocidadReal: mbs + ' MB/s',
    resumen: `${gb} GB por USB ${i.version}: ${tFmt} a ~${mbs} MB/s real.` };
}
"""
)

# 18 — Cable AWG
quick(
    "cable-awg-amperaje-seccion",
    "Calculadora de sección de cable AWG por amperaje",
    "Determiná el AWG (American Wire Gauge) adecuado según corriente a conducir. Incluye diámetro, sección mm² y pérdida por metro.",
    "AWG estándar: 14=15A, 12=20A, 10=30A, 8=40A, 6=55A. Cada 3 AWG = doble sección. Cada 6 AWG = doble diámetro.",
    [
        {"id": "corriente", "label": "Corriente (A)", "type": "number", "required": True, "placeholder": "15"},
        {"id": "tipoInstalacion", "label": "Instalación", "type": "select", "required": True, "default": "general", "options": [{"value": "general", "label": "General (75°C)"}, {"value": "potencia", "label": "Potencia (90°C)"}, {"value": "casa", "label": "Residencial AR (IRAM 2183)"}]}
    ],
    [{"id": "awg", "label": "AWG recomendado", "primary": True}, {"id": "seccionMm2", "label": "Sección (mm²)"}, {"id": "diametroMm", "label": "Diámetro (mm)"}, {"id": "resumen", "label": "Interpretación"}],
    ["15 A instalación general", "Se requiere AWG 14 (2.08 mm²)", "Diámetro 1.63 mm"],
    "AWG 14 = 2.08 mm² (1.63 mm de diámetro)",
    "## Tabla AWG práctica\n\n| AWG | Diámetro | Sección | Corriente (75°C) |\n|---|---|---|---|\n| 18 | 1.02 mm | 0.82 mm² | 10 A |\n| 16 | 1.29 mm | 1.31 mm² | 13 A |\n| 14 | 1.63 mm | 2.08 mm² | 15 A |\n| 12 | 2.05 mm | 3.31 mm² | 20 A |\n| 10 | 2.59 mm | 5.26 mm² | 30 A |\n| 8 | 3.26 mm | 8.37 mm² | 40 A |\n| 6 | 4.11 mm | 13.3 mm² | 55 A |\n| 4 | 5.19 mm | 21.2 mm² | 70 A |\n\n## Equivalencia Argentina\n\nEn AR se usa mm²: 1.5 (14 AWG), 2.5 (12 AWG), 4 (10 AWG), 6 (8 AWG), 10 (6 AWG).",
    [
        ("¿Por qué AWG 12 para 20A?", "Límite térmico del aislante. A más corriente, más calor por I²R. Sobrepasar degrada aislación."),
        ("¿Y si el cable es largo?", "Agregás caída de tensión. Para tramos >20m, subir un calibre mínimo. Calc específica: caída V = 2 × I × R × L."),
        ("¿AWG vs mm²?", "AWG americano, mm² europeo/sudamericano. Aproximadamente: mm² = 53/AWG^1.12 para valores usuales."),
        ("¿Cobre vs aluminio?", "Aluminio conduce ~60% del cobre. Usá AWG 2 más bajo para aluminio con misma corriente."),
        ("¿Para DC igual que AC?", "Similar para baja frecuencia (<60Hz). Alta frecuencia: efecto skin obliga a cable multifilar o trenzado Litz."),
    ],
    """const TABLA_AWG = [{awg: 18, mm2: 0.82, d: 1.02, a: 10}, {awg: 16, mm2: 1.31, d: 1.29, a: 13}, {awg: 14, mm2: 2.08, d: 1.63, a: 15}, {awg: 12, mm2: 3.31, d: 2.05, a: 20}, {awg: 10, mm2: 5.26, d: 2.59, a: 30}, {awg: 8, mm2: 8.37, d: 3.26, a: 40}, {awg: 6, mm2: 13.3, d: 4.11, a: 55}, {awg: 4, mm2: 21.2, d: 5.19, a: 70}, {awg: 2, mm2: 33.6, d: 6.54, a: 95}];
export interface CableAwgAmperajeSeccionInputs { corriente: number; tipoInstalacion: string; }
export interface CableAwgAmperajeSeccionOutputs { awg: string; seccionMm2: string; diametroMm: string; resumen: string; }
export function cableAwgAmperajeSeccion(i: CableAwgAmperajeSeccionInputs): CableAwgAmperajeSeccionOutputs {
  const c = Number(i.corriente);
  if (!c || c <= 0) throw new Error('Ingresá corriente');
  const entry = TABLA_AWG.find(e => e.a >= c) ?? TABLA_AWG[TABLA_AWG.length - 1];
  return { awg: 'AWG ' + entry.awg, seccionMm2: entry.mm2.toFixed(2) + ' mm²', diametroMm: entry.d.toFixed(2) + ' mm',
    resumen: `Para ${c} A necesitás AWG ${entry.awg} (${entry.mm2} mm², diámetro ${entry.d} mm). Soporta hasta ${entry.a} A.` };
}
"""
)

# 19 — Caída tensión cable
quick(
    "caida-tension-cable-distancia",
    "Calculadora de caída de tensión en cable por distancia",
    "Calculá la caída de tensión ΔV en un cable eléctrico según material, sección, distancia y corriente. Recomendación de aceptar <3% en residencial, <5% total.",
    "**ΔV = 2 × ρ × L × I / S** (ida y vuelta). ρ cobre = 0.0172, aluminio = 0.0282 Ω·mm²/m. Para 220V: 3% = 6.6V máximo.",
    [
        {"id": "corriente", "label": "Corriente (A)", "type": "number", "required": True, "placeholder": "15"},
        {"id": "distancia", "label": "Distancia (m, un sentido)", "type": "number", "required": True, "placeholder": "30"},
        {"id": "seccion", "label": "Sección cable (mm²)", "type": "number", "required": True, "placeholder": "2.5"},
        {"id": "voltaje", "label": "Voltaje (V)", "type": "number", "required": True, "placeholder": "220", "default": 220},
        {"id": "material", "label": "Material", "type": "select", "required": True, "default": "cobre", "options": [{"value": "cobre", "label": "Cobre"}, {"value": "aluminio", "label": "Aluminio"}]}
    ],
    [{"id": "caidaV", "label": "Caída de tensión", "primary": True}, {"id": "porcentaje", "label": "% del voltaje"}, {"id": "voltajeFinal", "label": "Voltaje en el extremo"}, {"id": "resumen", "label": "Interpretación"}],
    ["15 A × 30 m × cobre × 2.5 mm², 220V", "ΔV = 2 × 0.0172 × 30 × 15 / 2.5 = 6.19 V", "Porcentaje = 6.19/220 = 2.81% ✓ aceptable"],
    "Caída 6.19 V (2.81%), aceptable para residencial",
    "## Fórmula\n\n```\nΔV = 2 × ρ × L × I / S\n```\n\n- ρ: resistividad (Ω·mm²/m). Cobre=0.0172, Aluminio=0.0282\n- L: distancia en UN sentido (m)\n- I: corriente (A)\n- S: sección (mm²)\n- El ×2 es por ida y vuelta\n\n## Límites recomendados\n\n| Tramo | Caída máxima |\n|---|---|\n| General residencial | 3% |\n| Iluminación residencial | 3% |\n| Fuerza motriz | 5% |\n| Sum total acometida+interno | 5% |\n\n## Solución si cae mucho\n\n- Aumentar sección del cable (próximo AWG/mm²)\n- Reducir distancia\n- Elevar voltaje (220 → 380V trifásico)",
    [
        ("¿Por qué 3% es el límite?", "Convenio técnico: caída mayor afecta funcionamiento de aparatos (motores pierden potencia, lámparas se atenúan)."),
        ("¿Y si es más de 3%?", "Arreglás subiendo sección. Si tenés 5% actual, pasá de 2.5mm² a 4mm² y baja a ~3.1%."),
        ("¿Fórmula trifásica?", "Para trifásico: ΔV = √3 × ρ × L × I / S. Sin el ×2 porque es monofásica la corriente no retorna por mismo cable."),
        ("¿Aluminio vs cobre?", "Aluminio 30% mayor sección para mismo amperaje. Más barato inicial pero más fragil (conexiones sueltas)."),
        ("¿En DC igual?", "Sí, misma fórmula. En AC de baja frecuencia también aplica."),
    ],
    """const RHO: Record<string, number> = { cobre: 0.0172, aluminio: 0.0282 };
export interface CaidaTensionCableDistanciaInputs { corriente: number; distancia: number; seccion: number; voltaje: number; material: string; }
export interface CaidaTensionCableDistanciaOutputs { caidaV: string; porcentaje: string; voltajeFinal: string; resumen: string; }
export function caidaTensionCableDistancia(i: CaidaTensionCableDistanciaInputs): CaidaTensionCableDistanciaOutputs {
  const I = Number(i.corriente); const L = Number(i.distancia); const S = Number(i.seccion);
  const V = Number(i.voltaje); const rho = RHO[i.material] ?? 0.0172;
  if (!I || !L || !S || !V) throw new Error('Completá todos los campos');
  const dv = 2 * rho * L * I / S;
  const pct = (dv / V) * 100;
  const ok = pct < 3;
  return { caidaV: dv.toFixed(2) + ' V', porcentaje: pct.toFixed(2) + '%', voltajeFinal: (V - dv).toFixed(1) + ' V',
    resumen: `Caída ${dv.toFixed(2)} V (${pct.toFixed(2)}%). ${ok ? '✅ Aceptable (<3%)' : pct < 5 ? '⚠️ Alto — considerá aumentar sección' : '❌ Excesivo — aumentar sección obligatoriamente'}.` };
}
"""
)

# 20 — Consumo PC componentes
quick(
    "consumo-pc-componentes-watts",
    "Calculadora de consumo de PC por componentes",
    "Estimá el consumo total en watts de tu PC sumando componentes: CPU + GPU + RAM + discos + cooling + motherboard. Recomienda fuente con 30% margen.",
    "**PSU ≥ consumo × 1.3**. PC gaming estándar: 450-750W. Workstation: 850-1200W. Mining: 1000-2000W.",
    [
        {"id": "cpu", "label": "CPU TDP (W)", "type": "number", "required": True, "placeholder": "125", "default": 125},
        {"id": "gpu", "label": "GPU TDP (W)", "type": "number", "required": False, "placeholder": "250", "default": 0},
        {"id": "ram", "label": "Módulos RAM", "type": "number", "required": False, "placeholder": "2", "default": 2},
        {"id": "discos", "label": "Discos (HDD/SSD)", "type": "number", "required": False, "placeholder": "2", "default": 2},
        {"id": "ventiladores", "label": "Ventiladores/fans", "type": "number", "required": False, "placeholder": "3", "default": 3}
    ],
    [{"id": "consumoTotal", "label": "Consumo total", "primary": True}, {"id": "psuRecomendado", "label": "Fuente recomendada"}, {"id": "resumen", "label": "Interpretación"}],
    ["CPU 125W, GPU 250W, 2 RAM, 2 discos, 3 fans", "Total: 125+250+6+20+9+30(MB) = 440W", "PSU recomendado: 440×1.3 = 572W → 650W comercial"],
    "Total ~440W, PSU 650W (80+ Gold)",
    "## Consumos típicos por componente\n\n| Componente | Rango |\n|---|---|\n| CPU (TDP) | 65-180W (según datasheet) |\n| GPU | 75-450W (RTX 4090: 450W) |\n| RAM | 3W por módulo |\n| SSD SATA | 3-5W |\n| SSD NVMe | 5-10W |\n| HDD | 6-10W |\n| Motherboard | 30-50W |\n| Ventilador 120mm | 3-6W |\n| RGB | 10-30W total |\n\n## Margen PSU\n\n- **Minimum**: consumo × 1.2\n- **Recomendado**: consumo × 1.3\n- **Gaming intenso**: consumo × 1.4 (pico transiente GPU)",
    [
        ("¿Por qué 30% de margen?", "PSUs pierden eficiencia pasando 80% carga. Operar al 50-70% es el sweet spot de eficiencia."),
        ("¿80+ Gold necesario?", "Recomendado. Gold = 90% eficiencia vs Bronze 85%. Diferencia: $20 extra, $30/año ahorro electricidad."),
        ("¿Cuánto consume mi PC gaming?", "Uso típico gaming: 250-400W. Idle: 50-100W. Peak: 500-700W para build top-tier."),
        ("¿Mining necesita más?", "Sí. 8× GPUs mineras = 2000-3000W. Necesita PSU server (HP 1200W) o múltiples PSUs."),
        ("¿Afecta la factura de luz?", "PC gaming 8h/día × 300W = 72 kWh/mes. A $100/kWh AR = $7200/mes."),
    ],
    """export interface ConsumoPcComponentesWattsInputs { cpu: number; gpu?: number; ram?: number; discos?: number; ventiladores?: number; }
export interface ConsumoPcComponentesWattsOutputs { consumoTotal: string; psuRecomendado: string; resumen: string; }
export function consumoPcComponentesWatts(i: ConsumoPcComponentesWattsInputs): ConsumoPcComponentesWattsOutputs {
  const cpu = Number(i.cpu); const gpu = Number(i.gpu ?? 0);
  const ram = Number(i.ram ?? 0) * 3; const discos = Number(i.discos ?? 0) * 7;
  const fans = Number(i.ventiladores ?? 0) * 4; const mobo = 40;
  const total = cpu + gpu + ram + discos + fans + mobo;
  const psu = Math.ceil((total * 1.3) / 50) * 50;
  return { consumoTotal: total + ' W', psuRecomendado: psu + ' W (80+ Gold)',
    resumen: `Consumo total ${total} W. Fuente recomendada: ${psu} W con certificación 80+ Gold o superior.` };
}
"""
)

# 21 — UPS autonomía
quick(
    "ups-autonomia-potencia-carga",
    "Calculadora de autonomía de UPS por carga conectada",
    "Estimá los minutos de autonomía de un UPS según la carga conectada y capacidad de baterías. Respaldo estándar: 5-15 min. Extendido: 30-120 min.",
    "**Minutos = (Ah × V × η) / (P_carga × 60/100)**. UPS típico 500VA/300W. Con carga 200W: ~8 min autonomía.",
    [
        {"id": "vaUps", "label": "UPS VA nominal", "type": "number", "required": True, "placeholder": "500"},
        {"id": "cargaW", "label": "Carga conectada (W)", "type": "number", "required": True, "placeholder": "200"},
        {"id": "ahBateria", "label": "Capacidad batería (Ah)", "type": "number", "required": True, "placeholder": "9"},
        {"id": "vBateria", "label": "Voltaje batería (V)", "type": "number", "required": True, "placeholder": "12", "default": 12},
        {"id": "eficiencia", "label": "Eficiencia inversor (%)", "type": "number", "required": False, "placeholder": "85", "default": 85}
    ],
    [{"id": "minutos", "label": "Autonomía", "primary": True}, {"id": "porcentajeCarga", "label": "% de capacidad UPS"}, {"id": "resumen", "label": "Interpretación"}],
    ["UPS 500VA, carga 200W, batería 9Ah/12V, η 85%", "Energía útil = 9 × 12 × 0.85 = 91.8 Wh", "Autonomía = 91.8 × 60 / 200 = 27.5 min"],
    "~27 min de autonomía con 200W de carga",
    "## UPS comerciales comunes\n\n| VA/W | Autonomía @ 50% carga |\n|---|---|\n| 500VA/300W | 8-12 min |\n| 750VA/450W | 10-15 min |\n| 1000VA/600W | 12-20 min |\n| 1500VA/900W | 15-25 min |\n| 3000VA/2100W | 20-40 min |\n\n## Tipos\n\n- **Offline/Standby**: pasa a batería en corte. Para PC básica.\n- **Line-interactive**: regula voltaje sin ir a batería. Recomendado casa/oficina.\n- **Online/Double-conversion**: siempre por inversor. Para servers/médico.",
    [
        ("¿Cuánto dura mi UPS al 100% carga?", "Mucho menos que al 50%. A 100% de carga suele dar solo 3-5 min. UPS protege pero no hace backup largo."),
        ("¿Puedo agregar más baterías?", "Algunos UPS soportan módulos externos de baterías que multiplican autonomía. Verificá si tu modelo permite."),
        ("¿Dura 5 años?", "Baterías SLA típicas: 3-5 años. Testealas cada 6 meses (botón de test). Reemplazar antes de que fallen."),
        ("¿Onda senoidal pura?", "Para electrónica moderna sí. PCs modernas con PFC activo necesitan sinusoidal pura o dan pantalla azul/apagados."),
        ("¿Cómo elijo VA?", "Sumá watts de todos los aparatos, multiplicá por 1.6 (relación VA/W típica = 0.6). Ejemplo: 300W de carga → UPS 500VA."),
    ],
    """export interface UpsAutonomiaPotenciaCargaInputs { vaUps: number; cargaW: number; ahBateria: number; vBateria: number; eficiencia?: number; }
export interface UpsAutonomiaPotenciaCargaOutputs { minutos: string; porcentajeCarga: string; resumen: string; }
export function upsAutonomiaPotenciaCarga(i: UpsAutonomiaPotenciaCargaInputs): UpsAutonomiaPotenciaCargaOutputs {
  const va = Number(i.vaUps); const w = Number(i.cargaW); const ah = Number(i.ahBateria);
  const v = Number(i.vBateria); const eff = Number(i.eficiencia ?? 85) / 100;
  if (!va || !w || !ah || !v) throw new Error('Completá todos los campos');
  const energia = ah * v * eff;
  const minutos = (energia * 60) / w;
  const pct = (w / (va * 0.6)) * 100;
  return { minutos: minutos.toFixed(1) + ' min', porcentajeCarga: pct.toFixed(0) + '%',
    resumen: `Autonomía ~${minutos.toFixed(0)} min con carga ${w}W (${pct.toFixed(0)}% del UPS). ${pct > 80 ? 'Carga alta — autonomía real puede ser menor.' : 'Carga moderada.'}` };
}
"""
)

# 22 — dB SPL
quick(
    "db-spl-distancia",
    "Calculadora de dB SPL por distancia (inverse square)",
    "Calculá cómo disminuye el nivel sonoro (dB SPL) según la distancia por ley del cuadrado inverso. -6 dB cada duplicación de distancia.",
    "**L2 = L1 − 20·log₁₀(d2/d1)**. Cada vez que duplicás distancia: −6 dB. 100 dB a 1m → 94 dB a 2m → 88 dB a 4m.",
    [
        {"id": "dbOrigen", "label": "dB SPL origen", "type": "number", "required": True, "placeholder": "100"},
        {"id": "distanciaOrigen", "label": "Distancia origen (m)", "type": "number", "required": True, "placeholder": "1", "default": 1},
        {"id": "distanciaDestino", "label": "Distancia destino (m)", "type": "number", "required": True, "placeholder": "10"}
    ],
    [{"id": "dbDestino", "label": "dB SPL a distancia destino", "primary": True}, {"id": "atenuacion", "label": "Atenuación total"}, {"id": "resumen", "label": "Interpretación"}],
    ["100 dB a 1m → distancia 10m", "Atenuación = 20·log(10/1) = 20 dB", "100 − 20 = 80 dB"],
    "80 dB a 10m de distancia",
    "## Referencia dB SPL\n\n| dB | Ejemplo |\n|---|---|\n| 0 | Umbral audición |\n| 30 | Biblioteca |\n| 60 | Conversación |\n| 70 | Aspiradora |\n| 85 | Tráfico denso |\n| 100 | Concierto rock |\n| 120 | Motosierra a 1m |\n| 130 | Umbral dolor |\n| 140 | Avión despegando cercano |\n\n## Reglas rápidas\n\n- ×2 distancia → −6 dB\n- ×10 distancia → −20 dB\n- ÷2 distancia → +6 dB\n\n## Daño auditivo\n\n- <85 dB 8h: seguro\n- 95 dB 4h: límite OSHA\n- 100 dB 2h: daño potencial\n- 120 dB: daño inmediato",
    [
        ("¿Por qué -6 dB al duplicar?", "La energía sonora se distribuye en esfera 3D. Área crece con r². Inverso cuadrado = 20·log(2) = 6.02 dB."),
        ("¿Funciona en interiores?", "Menos bien. Reflexiones paredes generan campo difuso. En sala reverberante la atenuación es menor (−3 a −4 dB al duplicar)."),
        ("¿Línea de parlantes es distinta?", "Sí — PA line arrays atenúan -3 dB por duplicación en zona línea. Fuera de esa zona vuelve a -6 dB."),
        ("¿Cómo evito oír el concierto del vecino?", "Muros densos (mampostería) más aislamiento. Cada 10 dB de atenuación = perceptible mitad de ruido."),
        ("¿dB y volumen son lo mismo?", "No exactamente. Cada 10 dB = percibido como 'el doble de fuerte'. Cada 3 dB = doble energía acústica."),
    ],
    """export interface DbSplDistanciaInputs { dbOrigen: number; distanciaOrigen: number; distanciaDestino: number; }
export interface DbSplDistanciaOutputs { dbDestino: string; atenuacion: string; resumen: string; }
export function dbSplDistancia(i: DbSplDistanciaInputs): DbSplDistanciaOutputs {
  const L1 = Number(i.dbOrigen); const d1 = Number(i.distanciaOrigen); const d2 = Number(i.distanciaDestino);
  if (!L1 || !d1 || !d2) throw new Error('Completá campos');
  const aten = 20 * Math.log10(d2 / d1);
  const L2 = L1 - aten;
  return { dbDestino: L2.toFixed(1) + ' dB SPL', atenuacion: aten.toFixed(1) + ' dB',
    resumen: `${L1} dB a ${d1}m → ${L2.toFixed(1)} dB a ${d2}m (atenuación ${aten.toFixed(1)} dB por distancia).` };
}
"""
)

# 23 — Amplificador watts parlantes
quick(
    "amplificador-watts-parlantes",
    "Calculadora de watts por canal (amplificador + parlantes)",
    "Determiná la potencia por canal de un amplificador según los parlantes conectados en serie/paralelo y su impedancia. Compatibilidad de impedancia.",
    "**P = V²/Z**. Parlantes 8Ω paralelo → 4Ω combinado. Amplificador debe tolerar impedancia final (mayoría min 4Ω, premium 2Ω).",
    [
        {"id": "potenciaAmp", "label": "Potencia amp (W RMS por canal)", "type": "number", "required": True, "placeholder": "100"},
        {"id": "impedanciaParlante", "label": "Impedancia parlante (Ω)", "type": "number", "required": True, "placeholder": "8", "default": 8},
        {"id": "cantidadParlantes", "label": "Cantidad parlantes", "type": "number", "required": True, "placeholder": "2", "default": 1, "min": 1},
        {"id": "conexion", "label": "Conexión", "type": "select", "required": True, "default": "paralelo", "options": [{"value": "serie", "label": "En serie"}, {"value": "paralelo", "label": "En paralelo"}]}
    ],
    [{"id": "impedanciaTotal", "label": "Impedancia total vista por amp", "primary": True}, {"id": "wattsPorParlante", "label": "Watts por parlante"}, {"id": "compatible", "label": "Compatible con amplificador"}, {"id": "resumen", "label": "Interpretación"}],
    ["2 parlantes 8Ω en paralelo, amp 100W", "Impedancia total = 4Ω", "Watts/parlante = 100W / 2 = 50W"],
    "4Ω vista por el amp, 50W a cada parlante",
    "## Reglas de impedancia\n\n| Conexión | Fórmula (parlantes iguales Z) |\n|---|---|\n| Serie | Z_total = n × Z |\n| Paralelo | Z_total = Z / n |\n\nEjemplo 2× 8Ω:\n- Serie: 16 Ω\n- Paralelo: 4 Ω\n\n## Impedancia típica amps\n\n- Amp casa consumer: soporta 4-8Ω\n- Amp profesional PA: soporta 2-16Ω\n- Nunca bajes de la impedancia mínima del amp — se recalienta o quema\n\n## Reparto de potencia\n\nParalelo: W total / n parlantes. Serie: voltaje se divide, potencia proporcional.",
    [
        ("¿Si bajo de 4Ω qué pasa?", "El amp sobrecalienta. Algunos entran en protección, otros se funden. Verificá impedancia mínima del datasheet."),
        ("¿Serie o paralelo?", "Paralelo es más común. Serie para subwoofers o cuando necesitás mayor impedancia (bitube amplifiers)."),
        ("¿Parlantes distinta impedancia?", "Cálculo cambia. Para 2 en paralelo: Z_t = (Z1×Z2)/(Z1+Z2). Evitar mezclar muy distintos."),
        ("¿Qué es bi-wiring?", "Conectar woofer y tweeter con cables separados al amp. Cada uno usa sus terminales. Solo útil con crossovers pasivos."),
        ("¿Y los subwoofers?", "Subs suelen ser 4Ω. Algunos amps subwoofer soportan 2Ω mono bridgeado."),
    ],
    """export interface AmplificadorWattsParlantesInputs { potenciaAmp: number; impedanciaParlante: number; cantidadParlantes: number; conexion: string; }
export interface AmplificadorWattsParlantesOutputs { impedanciaTotal: string; wattsPorParlante: string; compatible: string; resumen: string; }
export function amplificadorWattsParlantes(i: AmplificadorWattsParlantesInputs): AmplificadorWattsParlantesOutputs {
  const p = Number(i.potenciaAmp); const z = Number(i.impedanciaParlante); const n = Number(i.cantidadParlantes);
  if (!p || !z || !n) throw new Error('Completá campos');
  const zTotal = i.conexion === 'serie' ? z * n : z / n;
  const wPorParlante = p / n;
  const compatible = zTotal >= 4 ? 'Sí (seguro para mayoría amp)' : zTotal >= 2 ? 'Solo amp premium' : 'NO — peligroso';
  return { impedanciaTotal: zTotal.toFixed(2) + ' Ω', wattsPorParlante: wPorParlante.toFixed(0) + ' W', compatible,
    resumen: `${n} parlantes ${z}Ω en ${i.conexion}: ${zTotal.toFixed(1)} Ω total. ${wPorParlante.toFixed(0)}W por parlante. ${compatible}.` };
}
"""
)

# 24 — Heladera consumo anual
quick(
    "consumo-heladera-anual-kwh",
    "Calculadora de consumo anual heladera (kWh)",
    "Estimá el consumo anual en kWh de tu heladera según potencia y duty cycle (% encendida). Comparación con modelos clase A+++.",
    "**kWh/año = P × 24 × 365 × duty_cycle**. Heladera moderna: 35-45% duty. Antigua: 60-75%. Clase A+++ 250 kWh/año típico.",
    [
        {"id": "potenciaW", "label": "Potencia compresor (W)", "type": "number", "required": True, "placeholder": "150"},
        {"id": "dutyCycle", "label": "% del tiempo encendida", "type": "number", "required": True, "placeholder": "40", "default": 40, "min": 10, "max": 100},
        {"id": "tarifa", "label": "Tarifa eléctrica ($/kWh)", "type": "number", "required": False, "placeholder": "80", "default": 80}
    ],
    [{"id": "kwhAnual", "label": "Consumo anual", "primary": True}, {"id": "kwhMensual", "label": "Consumo mensual"}, {"id": "costoAnual", "label": "Costo anual"}, {"id": "resumen", "label": "Interpretación"}],
    ["P=150W, duty 40%", "kWh/año = 150 × 24 × 365 × 0.40 / 1000 = 525.6", "kWh/mes = 43.8", "Costo: 525.6 × 80 = $42.048 AR"],
    "525 kWh/año ($42k AR a $80/kWh)",
    "## Duty cycle típico\n\n| Condiciones | Duty cycle |\n|---|---|\n| Heladera moderna (A+++) en ambiente 20°C | 25-35% |\n| Moderna A+ | 35-45% |\n| Antigua (>10 años) | 50-70% |\n| Ambiente muy cálido (>28°C) | +10-20% |\n| Puerta abriéndose mucho | +5-15% |\n\n## Clases de eficiencia\n\n| Clase | kWh/año (400L) |\n|---|---|\n| A+++ | <200 |\n| A++ | 200-280 |\n| A+ | 280-350 |\n| A | 350-450 |\n| B | 450-600 |\n| C o peor | >600 |\n\n## Ahorro al cambiar\n\nPasar de antigua (650 kWh/año) a A+++ (200 kWh/año) ahorra 450 kWh/año. A $80/kWh AR = $36000/año. Payback ~4-6 años.",
    [
        ("¿Cómo conozco el duty cycle?", "Medí con wattímetro enchufable durante 24h. Divide kWh medidos por (W × 24 / 1000). O estimá: heladera moderna ~35%."),
        ("¿Afecta la temperatura ambiente?", "Mucho. Heladera en ambiente 30°C consume 40% más que en 20°C. Ventilar el compresor ayuda."),
        ("¿No-Frost consume más?", "Sí, ~20% más que ciclo frost tradicional por el resistor descongelador periódico. Pero no requiere mantenimiento."),
        ("¿Cuánto cuesta reemplazarla?", "Heladera A+++ 400L en AR 2026: ~$900k-$1.2M. Payback 3-6 años si viene de vieja."),
        ("¿Qué es ENERGY STAR?", "Certificación USA (similar a etiqueta A+ europea). 10-20% mejor eficiencia que media del mercado."),
    ],
    """export interface ConsumoHeladeraAnualKwhInputs { potenciaW: number; dutyCycle: number; tarifa?: number; }
export interface ConsumoHeladeraAnualKwhOutputs { kwhAnual: string; kwhMensual: string; costoAnual: string; resumen: string; }
export function consumoHeladeraAnualKwh(i: ConsumoHeladeraAnualKwhInputs): ConsumoHeladeraAnualKwhOutputs {
  const p = Number(i.potenciaW); const dc = Number(i.dutyCycle) / 100; const tarifa = Number(i.tarifa ?? 80);
  if (!p || !dc) throw new Error('Completá potencia y duty cycle');
  const kwhAnual = p * 24 * 365 * dc / 1000;
  const kwhMensual = kwhAnual / 12;
  const costoAnual = kwhAnual * tarifa;
  return { kwhAnual: kwhAnual.toFixed(0) + ' kWh', kwhMensual: kwhMensual.toFixed(1) + ' kWh', costoAnual: '$' + costoAnual.toFixed(0),
    resumen: `Consumo anual: ${kwhAnual.toFixed(0)} kWh (${kwhMensual.toFixed(1)}/mes). Costo: $${costoAnual.toFixed(0)} a $${tarifa}/kWh.` };
}
"""
)

# 25 — Disipador térmico
quick(
    "temperatura-disipador-resistencia-termica",
    "Calculadora de temperatura de unión en disipador térmico",
    "Calculá la temperatura final de un semiconductor (Tj) con disipador, según potencia disipada y resistencias térmicas (θJC + θCS + θSA).",
    "**Tj = Ta + P × (θJC + θCS + θSA)**. Tj máx típica 125-150°C. Con 1W y θ_total=10°C/W a 25°C ambiente → Tj = 35°C.",
    [
        {"id": "potenciaDisipada", "label": "Potencia disipada (W)", "type": "number", "required": True, "placeholder": "5"},
        {"id": "ambiente", "label": "Temperatura ambiente (°C)", "type": "number", "required": True, "placeholder": "25", "default": 25},
        {"id": "thetaJC", "label": "θJC unión-carcasa (°C/W)", "type": "number", "required": True, "placeholder": "2", "default": 2, "step": 0.1},
        {"id": "thetaCS", "label": "θCS carcasa-disipador (°C/W)", "type": "number", "required": True, "placeholder": "0.5", "default": 0.5, "step": 0.1},
        {"id": "thetaSA", "label": "θSA disipador-ambiente (°C/W)", "type": "number", "required": True, "placeholder": "3", "default": 3, "step": 0.1},
        {"id": "tjMax", "label": "Tj máxima componente (°C)", "type": "number", "required": False, "placeholder": "125", "default": 125}
    ],
    [{"id": "tj", "label": "Temperatura de unión", "primary": True}, {"id": "margenSeguridad", "label": "Margen hasta Tj máx"}, {"id": "resumen", "label": "Interpretación"}],
    ["P=5W, Ta=25°C, θJC=2, θCS=0.5, θSA=3 (total 5.5°C/W)", "Tj = 25 + 5×5.5 = 52.5°C", "Margen vs 125°C: 72.5°C ✓ cómodo"],
    "Tj = 52.5°C, margen 72.5°C (seguro)",
    "## Regla térmica básica\n\n```\nTj = Ta + P × θ_total\nθ_total = θJC + θCS + θSA\n```\n\n- Tj: temperatura de unión del semiconductor\n- Ta: temperatura ambiente\n- θJC: entre unión y carcasa (datasheet)\n- θCS: entre carcasa y disipador (0.3-1 con pasta)\n- θSA: entre disipador y ambiente (ficha del disipador)\n\n## Elegir disipador\n\nRequerido: θSA_max = (Tj_max − Ta) / P − θJC − θCS\n\nEjemplo: 10W, Tj_max=100°C, Ta=40°C, θJC=1, θCS=0.5:\nθSA_max = (100−40)/10 − 1 − 0.5 = 4.5°C/W\n\nElegí disipador con θSA ≤ 4.5°C/W.",
    [
        ("¿Por qué importa Tj?", "Sobrepasar Tj max quema el componente permanentemente. Operar cerca del límite acorta vida útil (regla: cada 10°C sobre TJ_max = vida a la mitad)."),
        ("¿Pasta térmica es importante?", "Muy importante. Sin pasta: θCS ~2-5. Con pasta: 0.3-1. Reduce resistencia 3-10×."),
        ("¿Ventilador ayuda?", "Sí. Disipador con forzado aire: θSA se reduce 2-4× vs convección natural. TEC (peltier): θSA efectiva negativa."),
        ("¿Qué semiconductores más dissipación?", "Power MOSFETs, reguladores lineales, amplificadores clase A/B, drivers de motor, IGBTs. CPUs/GPUs caso aparte."),
        ("¿Por qué no usar disipador grande?", "Más caro, más grande, más peso. Ajustá al requerido + margen 30%."),
    ],
    """export interface TemperaturaDisipadorResistenciaTermicaInputs { potenciaDisipada: number; ambiente: number; thetaJC: number; thetaCS: number; thetaSA: number; tjMax?: number; }
export interface TemperaturaDisipadorResistenciaTermicaOutputs { tj: string; margenSeguridad: string; resumen: string; }
export function temperaturaDisipadorResistenciaTermica(i: TemperaturaDisipadorResistenciaTermicaInputs): TemperaturaDisipadorResistenciaTermicaOutputs {
  const p = Number(i.potenciaDisipada); const ta = Number(i.ambiente);
  const jc = Number(i.thetaJC); const cs = Number(i.thetaCS); const sa = Number(i.thetaSA);
  const tjMax = Number(i.tjMax ?? 125);
  if (!p || ta === null) throw new Error('Completá campos');
  const theta = jc + cs + sa;
  const tj = ta + p * theta;
  const margen = tjMax - tj;
  return { tj: tj.toFixed(1) + '°C', margenSeguridad: margen.toFixed(1) + '°C',
    resumen: `Tj = ${tj.toFixed(1)}°C (ambiente ${ta}°C + P×θ). Margen ${margen.toFixed(0)}°C vs Tj máx ${tjMax}°C. ${margen > 30 ? '✅ Seguro' : margen > 10 ? '⚠️ Ajustado' : '❌ Peligroso — mejorar disipador'}.` };
}
"""
)

# 26 — PCB trace width
quick(
    "pcb-ancho-trace-corriente",
    "Calculadora de ancho de trace PCB por corriente (IPC-2221)",
    "Calculá el ancho mínimo de una pista (trace) de PCB según IPC-2221, para conducir una corriente con limite de elevación térmica (10-20°C).",
    "**W (mil) = [I / (k × ΔT^0.44)]^(1/0.725)**. k=0.048 interno, 0.024 externo. Ej: 1A externo con ΔT=10°C → 10 mil (0.25 mm).",
    [
        {"id": "corriente", "label": "Corriente (A)", "type": "number", "required": True, "placeholder": "1"},
        {"id": "espesorCu", "label": "Espesor de cobre (oz)", "type": "number", "required": True, "placeholder": "1", "default": 1, "step": 0.5},
        {"id": "ubicacion", "label": "Ubicación pista", "type": "select", "required": True, "default": "externa", "options": [{"value": "externa", "label": "Externa (top/bottom)"}, {"value": "interna", "label": "Interna (inner layers)"}]},
        {"id": "deltaTemp", "label": "Elevación temperatura máx (°C)", "type": "number", "required": True, "placeholder": "10", "default": 10}
    ],
    [{"id": "anchoMin", "label": "Ancho mínimo", "primary": True}, {"id": "anchoMil", "label": "Ancho (mil)"}, {"id": "resumen", "label": "Interpretación"}],
    ["I=1A, Cu 1oz, externa, ΔT=10°C", "Fórmula IPC → ancho = ~10 mil", "Equivale a 0.254 mm"],
    "Ancho mínimo 0.25 mm (10 mil)",
    "## Fórmula IPC-2221\n\n```\nArea = [ I / (k × ΔT^0.44) ]^(1/0.725)\nW = Area / (t × 1.378)  // mil\n```\n\nDonde:\n- k = 0.048 traces internas, 0.024 externas\n- ΔT: elevación térmica deseada (°C)\n- t: espesor cobre (oz)\n\n## Guía rápida (Cu 1oz, externo, ΔT=10°C)\n\n| Corriente | Ancho mínimo |\n|---|---|\n| 0.5 A | 6 mil (0.15 mm) |\n| 1 A | 10 mil (0.25 mm) |\n| 2 A | 18 mil (0.46 mm) |\n| 5 A | 45 mil (1.14 mm) |\n| 10 A | 90 mil (2.28 mm) |\n\n## Recomendaciones\n\n- Agregá 20% de margen para envejecimiento\n- Pistas internas requieren ~1.5× el ancho de externas\n- Considerá vias y stitching para alta corriente",
    [
        ("¿Qué es IPC-2221?", "Estándar internacional de diseño PCB. Define reglas para ancho de pistas, spacing, tolerancias térmicas."),
        ("¿ΔT de cuanto?", "10°C conservador (elevación sobre ambiente). 20°C si aceptás calentamiento moderado. 30°C límite absoluto."),
        ("¿Cu 1oz vs 2oz?", "1oz (35 µm) estándar. 2oz (70 µm) para alta corriente. 2oz duplica la capacidad de corriente vs 1oz."),
        ("¿Interna vs externa?", "Pistas internas disipan peor calor (sandwich). Necesitan ~1.5× el ancho."),
        ("¿Vias para corriente?", "Cada via soporta ~0.5-1 A según diámetro. Para alta corriente usar stitching (múltiples vias en paralelo)."),
    ],
    """export interface PcbAnchoTraceCorrienteInputs { corriente: number; espesorCu: number; ubicacion: string; deltaTemp: number; }
export interface PcbAnchoTraceCorrienteOutputs { anchoMin: string; anchoMil: string; resumen: string; }
export function pcbAnchoTraceCorriente(i: PcbAnchoTraceCorrienteInputs): PcbAnchoTraceCorrienteOutputs {
  const I = Number(i.corriente); const cu = Number(i.espesorCu); const dT = Number(i.deltaTemp);
  if (!I || !cu || !dT) throw new Error('Completá campos');
  const k = i.ubicacion === 'interna' ? 0.024 : 0.048;
  const area = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725);
  const widthMil = area / (cu * 1.378);
  const widthMm = widthMil * 0.0254;
  return { anchoMin: widthMm.toFixed(2) + ' mm', anchoMil: widthMil.toFixed(1) + ' mil',
    resumen: `Ancho mínimo de pista: ${widthMm.toFixed(2)} mm (${widthMil.toFixed(1)} mil) para conducir ${I}A con ΔT de ${dT}°C sobre ambiente.` };
}
"""
)

