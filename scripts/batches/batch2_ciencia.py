"""Batch 2 — Ciencia (30 calcs)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _helper import spec  # noqa

SPECS = []


def T(fn_name, body):
    """Builder TypeScript minimal."""
    return f"""export interface Inputs {{ [k: string]: number | string; }}
export interface Outputs {{ [k: string]: string | number; }}
export function {fn_name}(i: Inputs): Outputs {{
{body}
}}
"""


# 1 — Velocidad caída libre
SPECS.append(spec(
    "velocidad-caida-libre-tiempo", "ciencia", "🌍",
    "Velocidad en caída libre por tiempo",
    "Calculá la velocidad de un objeto en caída libre después de t segundos sin resistencia del aire.",
    "v = g·t (donde g ≈ 9.81 m/s²)",
    [("t", "Tiempo (s)", "number", "3"), ("g", "Gravedad (m/s²)", "number", "9.81")],
    [("velocidad", "Velocidad", "m/s"), ("resumen", "Interpretación")],
    ["t=3s en la Tierra", "v = 9.81 × 3 = 29.43 m/s", "Equivale a ~106 km/h"],
    "~29.4 m/s a los 3 segundos",
    [("¿Qué es caída libre?", "Movimiento sin más fuerza que la gravedad."), ("¿Por qué g=9.81?", "Valor medio en superficie de Tierra. En Luna g=1.62. En Marte g=3.71."),
     ("¿Hasta qué velocidad cae?", "Sin aire, infinitamente. Con aire alcanza velocidad terminal ~55 m/s para humano."),
     ("¿Afecta la masa?", "No en caída libre (Galileo). Una pluma y martillo caen igual sin aire."),
     ("¿Aplica paracaidismo?", "Solo al inicio. Después la fricción del aire compensa y no hay caída libre.")],
    T("velocidadCaidaLibreTiempo", """  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error('Ingresá tiempo');
  const v = g * t;
  return { velocidad: v.toFixed(2) + ' m/s', resumen: `A ${t}s: velocidad ${v.toFixed(1)} m/s (${(v*3.6).toFixed(1)} km/h).` };"""),
))

# 2 — Distancia caída libre
SPECS.append(spec(
    "distancia-caida-libre-altura", "ciencia", "⬇️",
    "Altura o distancia en caída libre por tiempo",
    "Calculá qué altura cae un objeto en tiempo t bajo gravedad.",
    "h = ½·g·t²",
    [("t", "Tiempo (s)", "number", "3"), ("g", "Gravedad (m/s²)", "number", "9.81")],
    [("altura", "Altura caída", "m"), ("resumen", "Interpretación")],
    ["t=3s", "h = ½ × 9.81 × 9 = 44.1 m", "Desde 10 pisos aprox"],
    "44.1 m en 3s de caída",
    [("¿Sin considerar aire?", "Sí. Con aire la fórmula es más compleja (ecuación diferencial)."),
     ("¿Para calcular tiempo desde altura?", "t = √(2h/g). Ejemplo: caer desde 20m = √(4.08) = 2.02s."),
     ("¿Puedo usar para saltar?", "Sí para la fase sin aire (primer segundo). Después el aire empieza a importar."),
     ("¿En otros planetas?", "Cambiá g: Luna 1.62, Marte 3.71, Júpiter 24.79."),
     ("¿Desde qué altura es peligroso?", "Tóngalo: 15m = 1.75s = 17 m/s ~ 62 km/h — lesiones graves.")],
    T("distanciaCaidaLibreAltura", """  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error('Ingresá tiempo');
  const h = 0.5 * g * t * t;
  return { altura: h.toFixed(2) + ' m', resumen: `En ${t}s cae ${h.toFixed(1)} m.` };"""),
))

# 3 — Fuerza de fricción
SPECS.append(spec(
    "fuerza-friccion-coeficiente", "ciencia", "🔩",
    "Fuerza de fricción (f = μ·N)",
    "Calculá la fuerza de fricción entre superficies dado el coeficiente μ y la fuerza normal N.",
    "f = μ × N",
    [("mu", "Coef. fricción μ", "number", "0.3"), ("n", "Fuerza normal N (N)", "number", "100")],
    [("friccion", "Fuerza de fricción", "N"), ("resumen", "Interpretación")],
    ["μ=0.3, N=100 N", "f = 0.3 × 100 = 30 N", "Fuerza opositora al movimiento"],
    "30 N de fricción",
    [("¿Estática vs cinética?", "Estática μs > cinética μk. Más fuerza para INICIAR que para mantener."),
     ("¿Cero fricción?", "Teórica. En la vida real siempre hay micro fricción (gases, líquidos)."),
     ("¿Valores típicos?", "Goma seca: 1.0. Metal-metal: 0.4. Madera seca: 0.5. Hielo: 0.02. Aceitado: 0.03."),
     ("¿Qué es N?", "Fuerza normal = peso perpendicular a la superficie. Plano horizontal: N=m·g."),
     ("¿Depende del área?", "No directamente. Solo de μ y N. Pero μ puede variar con presión extrema.")],
    T("fuerzaFriccionCoeficiente", """  const mu = Number(i.mu); const n = Number(i.n);
  if (!mu || !n) throw new Error('Completá μ y N');
  const f = mu * n;
  return { friccion: f.toFixed(2) + ' N', resumen: `Fricción ${f.toFixed(1)} N con μ=${mu} y N=${n}.` };"""),
))

# 4 — Momento angular
SPECS.append(spec(
    "momento-angular-rotacion", "ciencia", "🌀",
    "Momento angular L = I·ω",
    "Calculá el momento angular de un cuerpo en rotación dado su momento de inercia I y velocidad angular ω.",
    "L = I × ω",
    [("inercia", "Momento inercia I (kg·m²)", "number", "0.5"), ("omega", "Velocidad angular ω (rad/s)", "number", "10")],
    [("momento", "Momento angular", "kg·m²/s"), ("resumen", "Interpretación")],
    ["I=0.5, ω=10", "L = 0.5 × 10 = 5 kg·m²/s"],
    "5 kg·m²/s",
    [("¿Qué es L?", "Cantidad conservada en sistemas sin torque externo (como patinador girando)."),
     ("¿Conservación?", "Sí. Patinador que recoge brazos baja I y para mantener L aumenta ω (gira más rápido)."),
     ("¿Diferencia con momento lineal?", "p=mv es lineal. L es angular. En traslación vs rotación."),
     ("¿I de cuerpos comunes?", "Anillo fino: mr². Disco: ½mr². Esfera: ⅖mr². Varilla: ⅓ML²."),
     ("¿Planetas tienen?", "Sí. Tierra L ≈ 7.07×10³³ kg·m²/s. Afecta dinámica del sistema solar.")],
    T("momentoAngularRotacion", """  const I = Number(i.inercia); const w = Number(i.omega);
  if (!I || !w) throw new Error('Completá');
  const L = I * w;
  return { momento: L.toFixed(3) + ' kg·m²/s', resumen: `L = ${L.toFixed(2)} kg·m²/s con I=${I} y ω=${w} rad/s.` };"""),
))

# 5 — Energía cinética
SPECS.append(spec(
    "energia-cinetica-ec", "ciencia", "⚡",
    "Energía cinética (Ec = ½mv²)",
    "Calculá la energía cinética de un objeto por su masa y velocidad.",
    "Ec = ½ × m × v²",
    [("masa", "Masa (kg)", "number", "10"), ("velocidad", "Velocidad (m/s)", "number", "5")],
    [("energia", "Energía cinética", "J"), ("resumen", "Interpretación")],
    ["m=10 kg, v=5 m/s", "Ec = ½ × 10 × 25 = 125 J"],
    "125 J",
    [("¿Qué son joules?", "1 J = 1 kg·m²/s². Energía de 1N de fuerza aplicada 1m."),
     ("¿Cómo crece?", "Cuadráticamente con v. Duplicar velocidad → 4× energía."),
     ("¿Aplicación vehicular?", "Auto 1000kg a 50 km/h = 96 kJ. A 100 km/h = 386 kJ (4×). Por eso frenar es 4× más difícil."),
     ("¿Qué pasa al chocar?", "Ec se transforma — deformación, sonido, calor. 100 kJ deforma mucho metal."),
     ("¿Para rotación?", "Análoga: Ec_rot = ½·I·ω². Girando también guarda energía.")],
    T("energiaCineticaEc", """  const m = Number(i.masa); const v = Number(i.velocidad);
  if (!m || v === undefined) throw new Error('Completá');
  const Ec = 0.5 * m * v * v;
  return { energia: Ec.toFixed(2) + ' J', resumen: `Ec = ${Ec.toFixed(1)} J con m=${m}kg a ${v}m/s.` };"""),
))

# 6 — Energía potencial gravitatoria
SPECS.append(spec(
    "energia-potencial-gravitatoria", "ciencia", "⛰️",
    "Energía potencial gravitatoria (Ep = mgh)",
    "Calculá la energía potencial de un objeto por masa, gravedad y altura.",
    "Ep = m × g × h",
    [("masa", "Masa (kg)", "number", "10"), ("h", "Altura (m)", "number", "5"), ("g", "Gravedad (m/s²)", "number", "9.81")],
    [("energia", "Energía potencial", "J"), ("resumen", "Interpretación")],
    ["m=10 kg, h=5 m", "Ep = 10 × 9.81 × 5 = 490.5 J"],
    "490.5 J",
    [("¿Dónde está h=0?", "Convención del problema. Generalmente nivel del suelo o referencia."),
     ("¿Se conserva con Ec?", "Sí. Ep + Ec = constante en sistema sin fricción."),
     ("¿Cuánta energía tiene un rayo?", "Rayo ~1 billón J. Equivalente a 10 años de Ep de un piano caído del 10º piso."),
     ("¿En otros planetas?", "Cambiás g. Luna: 1 kg a 10m = 16.2 J. Tierra: 98.1 J."),
     ("¿Sirve para pendientes?", "Sí. Es la misma Ep independiente del camino (fuerza conservativa).")],
    T("energiaPotencialGravitatoria", """  const m = Number(i.masa); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!m || h === undefined) throw new Error('Completá');
  const Ep = m * g * h;
  return { energia: Ep.toFixed(2) + ' J', resumen: `Ep = ${Ep.toFixed(1)} J con m=${m}kg a altura ${h}m.` };"""),
))

# 7 — Trabajo mecánico
SPECS.append(spec(
    "trabajo-mecanico-fuerza-distancia", "ciencia", "💪",
    "Trabajo mecánico W = F·d·cos(θ)",
    "Calculá el trabajo realizado por una fuerza a lo largo de una distancia, con ángulo θ.",
    "W = F × d × cos(θ)",
    [("fuerza", "Fuerza (N)", "number", "100"), ("distancia", "Distancia (m)", "number", "5"), ("angulo", "Ángulo (°)", "number", "0")],
    [("trabajo", "Trabajo", "J"), ("resumen", "Interpretación")],
    ["F=100N, d=5m, θ=0°", "W = 100 × 5 × 1 = 500 J"],
    "500 J",
    [("¿Qué pasa si θ=90°?", "W=0. Fuerza perpendicular no hace trabajo (ej: peso de objeto en movimiento horizontal)."),
     ("¿Unidades?", "1 J = 1 N·m = 0.738 ft·lb. Watt es J/s (potencia)."),
     ("¿Trabajo negativo?", "Sí, cuando F y d apuntan opuestos. Fricción hace trabajo negativo."),
     ("¿Cómo mido F?", "Dinamómetro o multiplicando masa × aceleración (F=ma)."),
     ("¿Con varias fuerzas?", "W_total = Σ W_i. Cada fuerza hace su propio trabajo.")],
    T("trabajoMecanicoFuerzaDistancia", """  const F = Number(i.fuerza); const d = Number(i.distancia); const a = Number(i.angulo) || 0;
  if (!F || d === undefined) throw new Error('Completá');
  const W = F * d * Math.cos(a * Math.PI / 180);
  return { trabajo: W.toFixed(2) + ' J', resumen: `W = ${W.toFixed(1)} J (F=${F}N × d=${d}m × cos(${a}°)).` };"""),
))

# 8 — Presión hidrostática
SPECS.append(spec(
    "presion-hidrostatica-profundidad", "ciencia", "🌊",
    "Presión hidrostática por profundidad",
    "Calculá la presión de un fluido a una profundidad, según densidad del fluido.",
    "P = ρ × g × h",
    [("rho", "Densidad fluido (kg/m³)", "number", "1000"), ("h", "Profundidad (m)", "number", "10"), ("g", "Gravedad (m/s²)", "number", "9.81")],
    [("presion", "Presión", "Pa"), ("presionBar", "En bar"), ("resumen", "Interpretación")],
    ["Agua (1000 kg/m³), 10m", "P = 1000×9.81×10 = 98100 Pa ≈ 0.98 bar", "Casi 1 atmósfera adicional"],
    "98.1 kPa ≈ 0.98 bar",
    [("¿Por qué cada 10m más presión?", "Densidad del agua: 1000 kg/m³. Cada 10m = ~1 atm adicional."),
     ("¿Presión total en el mar?", "Presión hidrostática + atmosférica. A 10m mar = 1 atm atmosférica + 1 atm hidrostática = 2 atm."),
     ("¿Para mercurio?", "ρ = 13550 kg/m³. Mucha más presión por metro. Base de manómetro Hg."),
     ("¿Afecta el área?", "No. Solo depende de h y ρ. Pascal lo descubrió."),
     ("¿Submarinos cuánto resisten?", "Deep sub militares: 500-700m (~70 atm). Challenger Deep (10.9 km): 1100 atm.")],
    T("presionHidrostaticaProfundidad", """  const rho = Number(i.rho); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!rho || h === undefined) throw new Error('Completá');
  const P = rho * g * h;
  return { presion: P.toFixed(0) + ' Pa', presionBar: (P/100000).toFixed(3) + ' bar', resumen: `P = ${P.toFixed(0)} Pa (${(P/100000).toFixed(2)} bar) a ${h}m de profundidad.` };"""),
))

# 9 — Empuje Arquímedes
SPECS.append(spec(
    "empuje-arquimedes-volumen", "ciencia", "🛟",
    "Empuje de Arquímedes por volumen sumergido",
    "Calculá la fuerza de empuje de un fluido sobre un objeto sumergido.",
    "E = ρ × V × g",
    [("rho", "Densidad fluido (kg/m³)", "number", "1000"), ("vol", "Volumen sumergido (m³)", "number", "0.1"), ("g", "Gravedad", "number", "9.81")],
    [("empuje", "Empuje", "N"), ("resumen", "Interpretación")],
    ["Agua, V=0.1 m³", "E = 1000×0.1×9.81 = 981 N"],
    "981 N de empuje",
    [("¿Qué descubrió Arquímedes?", "Que un cuerpo sumergido sufre empuje igual al peso del fluido desplazado."),
     ("¿Por qué flota madera?", "Su ρ < ρ_agua. El empuje balancea su peso con parte fuera del agua."),
     ("¿Barcos de metal?", "Aunque acero pesa más que agua, el barco desplaza MÁS agua que su peso total (forma hueca)."),
     ("¿En el aire?", "Sí, globos de helio. Aire: ρ=1.2 kg/m³. Helio: ρ=0.18 kg/m³. Diferencia = empuje."),
     ("¿Útil en submarinos?", "Sí, tanques de lastre se llenan con agua para sumergirse o aire para subir.")],
    T("empujeArquimedesVolumen", """  const rho = Number(i.rho); const V = Number(i.vol); const g = Number(i.g) || 9.81;
  if (!rho || !V) throw new Error('Completá');
  const E = rho * V * g;
  return { empuje: E.toFixed(2) + ' N', resumen: `Empuje = ${E.toFixed(1)} N con V=${V}m³ de fluido ρ=${rho}kg/m³.` };"""),
))

# 10 — Péndulo simple
SPECS.append(spec(
    "pendulo-simple-periodo", "ciencia", "🕰️",
    "Período de péndulo simple",
    "Calculá el período de oscilación T de un péndulo simple de longitud L.",
    "T = 2π × √(L/g)",
    [("L", "Longitud (m)", "number", "1"), ("g", "Gravedad (m/s²)", "number", "9.81")],
    [("periodo", "Período", "s"), ("frecuencia", "Frecuencia", "Hz"), ("resumen", "Interpretación")],
    ["L=1m, g=9.81", "T = 2π × √(1/9.81) = 2.007 s"],
    "T = 2.01s, f = 0.498 Hz",
    [("¿Depende de la masa?", "No (sorprendente). Solo de longitud y gravedad. Galileo lo demostró."),
     ("¿Amplitud importa?", "Para amplitudes pequeñas (<15°) no. Para grandes, T aumenta ~1% por cada 10°."),
     ("¿Reloj de péndulo?", "Reloj abuelo L=1m → T=2s. Péndulo cuenta segundos de ida y vuelta."),
     ("¿En la Luna?", "g menor, T mayor. Péndulo de 1m en Luna: T=4.94s."),
     ("¿Para medir g?", "Sí. Midiendo T y L calculás g. Método histórico pre-GPS.")],
    T("penduloSimplePeriodo", """  const L = Number(i.L); const g = Number(i.g) || 9.81;
  if (!L || L <= 0) throw new Error('Completá L');
  const T = 2 * Math.PI * Math.sqrt(L / g);
  return { periodo: T.toFixed(3) + ' s', frecuencia: (1/T).toFixed(3) + ' Hz', resumen: `Período T = ${T.toFixed(2)}s, frecuencia ${(1/T).toFixed(2)} Hz (L=${L}m).` };"""),
))

# 11 — Ley de Hooke
SPECS.append(spec(
    "resorte-ley-hooke-constante", "ciencia", "🪀",
    "Ley de Hooke — fuerza del resorte",
    "Calculá la fuerza o la deformación de un resorte según la Ley de Hooke (F = k·x).",
    "F = k × x",
    [("modo", "Calcular", "select", [("F", "F (fuerza)"), ("x", "x (deformación)"), ("k", "k (constante)")]),
     ("val1", "Valor 1", "number", "100"), ("val2", "Valor 2", "number", "0.05")],
    [("resultado", "Resultado"), ("resumen", "Interpretación")],
    ["k=100 N/m, x=0.05m", "F = 100 × 0.05 = 5 N"],
    "F = 5 N",
    [("¿Qué es k?", "Constante elástica del resorte (N/m). A mayor k, resorte más rígido."),
     ("¿Límite?", "La ley vale hasta el 'límite elástico'. Más allá, el resorte se deforma permanentemente."),
     ("¿Cómo calcular k?", "Midiendo x con una F conocida: k = F/x. Método simple de caracterización."),
     ("¿En paralelo/serie?", "Paralelo: k_t = k1+k2 (más rígido). Serie: 1/k_t = 1/k1 + 1/k2 (menos)."),
     ("¿Energía almacenada?", "U = ½·k·x². Un resorte comprimido guarda energía elástica.")],
    T("resorteLeyHookeConstante", """  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let result: number; let label: string;
  if (modo === 'F') { result = v1 * v2; label = result.toFixed(2) + ' N'; }
  else if (modo === 'x') { if (!v2) throw new Error('k no puede ser 0'); result = v1 / v2; label = result.toFixed(4) + ' m'; }
  else { if (!v2) throw new Error('x no puede ser 0'); result = v1 / v2; label = result.toFixed(2) + ' N/m'; }
  return { resultado: label, resumen: `${modo} = ${label} (con valores ${v1} y ${v2}).` };"""),
))

# 12 — Doppler
SPECS.append(spec(
    "efecto-doppler-velocidad-frecuencia", "ciencia", "🚨",
    "Efecto Doppler de sonido",
    "Calculá la frecuencia percibida por el observador según velocidad relativa entre emisor y receptor.",
    "f' = f × (v ± vo) / (v ∓ vs)",
    [("f", "Frecuencia emisor (Hz)", "number", "440"), ("vs", "Velocidad emisor (m/s)", "number", "30"),
     ("vo", "Velocidad observador (m/s)", "number", "0"), ("v", "Velocidad sonido (m/s)", "number", "343"),
     ("direccion", "Dirección", "select", [("acerca", "Se acerca"), ("aleja", "Se aleja")])],
    [("fPercibida", "Frecuencia percibida", "Hz"), ("resumen", "Interpretación")],
    ["f=440Hz, vs=30m/s acercándose", "f' = 440 × 343 / (343-30) = 482 Hz"],
    "482 Hz (más aguda)",
    [("¿Por qué cambia el tono?", "Las ondas se comprimen al acercarse (más agudas) y se estiran al alejarse (más graves)."),
     ("¿Ejemplo cotidiano?", "Ambulancia. Sirena parece más aguda al acercarse y más grave al alejarse."),
     ("¿Con luz también?", "Sí — redshift astronómico. Galaxias alejándose muestran luz desplazada al rojo."),
     ("¿Radar policial?", "Usa Doppler para medir velocidad de tu auto. Emite onda y mide frecuencia de retorno."),
     ("¿Medicina?", "Doppler ultrasónico para medir flujo sanguíneo (eco Doppler).")],
    T("efectoDopplerVelocidadFrecuencia", """  const f = Number(i.f); const vs = Number(i.vs); const vo = Number(i.vo) || 0;
  const v = Number(i.v) || 343; const dir = String(i.direccion);
  if (!f || vs === undefined) throw new Error('Completá');
  let fp: number;
  if (dir === 'acerca') fp = f * (v + vo) / (v - vs);
  else fp = f * (v - vo) / (v + vs);
  return { fPercibida: fp.toFixed(1) + ' Hz', resumen: `Frecuencia percibida: ${fp.toFixed(0)} Hz ${dir === 'acerca' ? '(más aguda)' : '(más grave)'}.` };"""),
))

# 13 — pH desde H+
SPECS.append(spec(
    "ph-concentracion-h-plus", "ciencia", "🧪",
    "pH desde concentración [H+]",
    "Calculá el pH de una solución conociendo la concentración de iones hidrógeno.",
    "pH = -log₁₀[H⁺]",
    [("h", "[H⁺] en mol/L", "number", "0.001")],
    [("ph", "pH"), ("clasificacion", "Clasificación"), ("resumen", "Interpretación")],
    ["[H⁺]=0.001", "pH = -log(0.001) = 3", "Ácido"],
    "pH 3 (ácido)",
    [("¿Qué es pH?", "Medida de acidez. 0-14. 7=neutro. <7 ácido. >7 alcalino/básico."),
     ("¿Agua pura?", "pH=7. [H⁺]=10⁻⁷ mol/L."),
     ("¿Ácidos fuertes?", "HCl 0.1M: pH=1. Estómago: pH 1.5-3.5."),
     ("¿Bases fuertes?", "NaOH 0.1M: pH=13. Lejía: pH 12-13."),
     ("¿Escala logarítmica?", "Sí. pH 3 es 10× más ácido que pH 4. 100× más que pH 5.")],
    T("phConcentracionHPlus", """  const h = Number(i.h);
  if (!h || h <= 0) throw new Error('Ingresá [H+] > 0');
  const ph = -Math.log10(h);
  let clasif: string;
  if (ph < 3) clasif = 'Muy ácido'; else if (ph < 7) clasif = 'Ácido';
  else if (ph === 7 || Math.abs(ph - 7) < 0.1) clasif = 'Neutro';
  else if (ph < 11) clasif = 'Alcalino'; else clasif = 'Muy alcalino';
  return { ph: ph.toFixed(2), clasificacion: clasif, resumen: `pH ${ph.toFixed(2)} — ${clasif} (con [H⁺] = ${h} mol/L).` };"""),
))

# 14 — pOH
SPECS.append(spec(
    "poh-concentracion-oh", "ciencia", "🧪",
    "pOH y relación pH + pOH = 14",
    "Calculá el pOH de una solución y su pH equivalente usando la relación pH + pOH = 14.",
    "pOH = -log₁₀[OH⁻]; pH + pOH = 14",
    [("oh", "[OH⁻] en mol/L", "number", "0.001")],
    [("poh", "pOH"), ("ph", "pH equivalente"), ("resumen", "Interpretación")],
    ["[OH⁻]=0.001", "pOH = 3, pH = 14-3 = 11"],
    "pOH 3, pH 11 (alcalino)",
    [("¿Por qué 14?", "Producto iónico del agua: Kw = [H⁺][OH⁻] = 10⁻¹⁴. Tomando -log: pH+pOH=14."),
     ("¿Cuando uso pOH?", "Para soluciones alcalinas es más directo medir [OH⁻] que [H⁺]."),
     ("¿Neutro?", "[H⁺]=[OH⁻]=10⁻⁷. pH=pOH=7."),
     ("¿Relación con pKw?", "pKw = -log(Kw) = 14 a 25°C. A 100°C, pKw ≈ 12."),
     ("¿Usos?", "Química industrial, biología, acuarios, piscinas, suelo agrícola.")],
    T("pohConcentracionOh", """  const oh = Number(i.oh);
  if (!oh || oh <= 0) throw new Error('Ingresá [OH⁻]');
  const poh = -Math.log10(oh);
  const ph = 14 - poh;
  return { poh: poh.toFixed(2), ph: ph.toFixed(2), resumen: `pOH = ${poh.toFixed(2)}, pH = ${ph.toFixed(2)} (${ph > 7 ? 'alcalino' : 'ácido'}).` };"""),
))

# 15 — Dilución
SPECS.append(spec(
    "dilucion-concentracion-c1v1-c2v2", "ciencia", "⚗️",
    "Dilución C1V1 = C2V2",
    "Calculá el volumen o concentración final tras diluir una solución.",
    "C1 × V1 = C2 × V2",
    [("modo", "Calcular", "select", [("v2", "V2 (volumen final)"), ("c2", "C2 (conc final)"), ("v1", "V1 (volumen inicial)")]),
     ("c1", "C1 (molar o %)", "number", "1"), ("v1", "V1 (mL o L)", "number", "10"),
     ("c2", "C2 (si aplica)", "number", "0.1"), ("v2", "V2 (si aplica)", "number", "100")],
    [("resultado", "Resultado"), ("resumen", "Interpretación")],
    ["C1=1M, V1=10mL, C2=0.1M", "V2 = 1×10/0.1 = 100 mL", "Agregar 90 mL de solvente"],
    "V2 = 100 mL (agregar 90 mL)",
    [("¿Es para molaridad?", "Sí, y para cualquier unidad de concentración que mantenga proporcionalidad."),
     ("¿Solo soluciones líquidas?", "Principalmente sí. Para gases aplica PV=nRT."),
     ("¿Cómo preparo 100 mL 0.1M desde stock 1M?", "Tomo 10 mL y agrego 90 mL agua. Enrazo en 100."),
     ("¿Perdida de moles?", "No. Los moles se conservan, solo se distribuyen en más volumen."),
     ("¿Y si es dilución en serie?", "Aplicás la fórmula varias veces. Cada etapa es una dilución.")],
    T("dilucionConcentracionC1v1C2v2", """  const modo = String(i.modo); const c1 = Number(i.c1); const v1 = Number(i.v1);
  const c2 = Number(i.c2); const v2 = Number(i.v2);
  let r: number; let unit: string;
  if (modo === 'v2') { r = c1 * v1 / c2; unit = 'vol final'; }
  else if (modo === 'c2') { r = c1 * v1 / v2; unit = 'conc final'; }
  else { r = c2 * v2 / c1; unit = 'vol inicial'; }
  return { resultado: r.toFixed(3), resumen: `${unit} = ${r.toFixed(3)}. Para diluir ${c1} en ${v1} a ${c2}: preparar ${r.toFixed(1)} de vol total.` };"""),
))

# 16 — Moles desde masa
SPECS.append(spec(
    "moles-masa-formula-molecular", "ciencia", "🧬",
    "Moles a partir de masa y peso molecular",
    "Convertí masa a moles conociendo el peso molecular (MW) del compuesto.",
    "n = m / MW",
    [("m", "Masa (g)", "number", "18"), ("mw", "Peso molecular (g/mol)", "number", "18.015")],
    [("moles", "Moles"), ("moleculas", "Moléculas"), ("resumen", "Interpretación")],
    ["18g de agua (MW=18)", "n = 18/18 = 1 mol", "6.022×10²³ moléculas"],
    "1 mol = 6.022×10²³ moléculas",
    [("¿Qué es 1 mol?", "6.022×10²³ unidades (número de Avogadro). Como 'docena' pero mucho más."),
     ("¿MW típico?", "Agua: 18. Etanol: 46. NaCl: 58.5. Glucosa: 180. Hemoglobina: 64.500."),
     ("¿Cómo calculo MW?", "Sumá los pesos atómicos. H₂O: 2(1) + 16 = 18. CO₂: 12 + 2(16) = 44."),
     ("¿Para contar moléculas?", "N = n × Nₐ = n × 6.022×10²³."),
     ("¿Sirve para soluciones?", "Sí, junto con volumen: M = n/V.")],
    T("molesMasaFormulaMolecular", """  const m = Number(i.m); const mw = Number(i.mw);
  if (!m || !mw) throw new Error('Completá');
  const n = m / mw;
  const molec = n * 6.022e23;
  return { moles: n.toFixed(4) + ' mol', moleculas: molec.toExponential(3), resumen: `${m}g / ${mw}g/mol = ${n.toFixed(3)} mol (${molec.toExponential(2)} moléculas).` };"""),
))

# 17 — Gas ideal
SPECS.append(spec(
    "gas-ideal-pv-nrt", "ciencia", "💨",
    "Ley de gases ideales (PV = nRT)",
    "Calculá cualquier variable (P, V, n, T) conociendo las otras tres. R = 8.314 J/(mol·K).",
    "PV = nRT",
    [("p", "Presión (Pa)", "number", "101325"), ("v", "Volumen (m³)", "number", "0.024"),
     ("t", "Temperatura (K)", "number", "273")],
    [("n", "Moles"), ("resumen", "Interpretación")],
    ["1 atm, 22.4 L, 273K", "n = 101325×0.0224/(8.314×273) = 1 mol"],
    "~1 mol (condiciones normales)",
    [("¿Qué es R?", "Constante universal de los gases = 8.314 J/(mol·K)."),
     ("¿CNPT?", "Condiciones normales: 0°C (273K) y 1 atm (101325 Pa). 1 mol ocupa 22.4 L."),
     ("¿Cuándo NO aplica?", "Gases a alta presión o baja temperatura se desvían (no ideales)."),
     ("¿Aplicación cotidiana?", "Volumen de globo, presión de neumático, densidad del aire."),
     ("¿Air acondicionado?", "Principio detrás. Gas se comprime/expande cambiando T.")],
    T("gasIdealPvNrt", """  const p = Number(i.p); const v = Number(i.v); const t = Number(i.t);
  if (!p || !v || !t) throw new Error('Completá P, V, T');
  const R = 8.314;
  const n = (p * v) / (R * t);
  return { n: n.toFixed(4) + ' mol', resumen: `n = ${n.toFixed(3)} mol para P=${(p/1000).toFixed(1)}kPa, V=${v}m³, T=${t}K.` };"""),
))

# 18 — Calor específico
SPECS.append(spec(
    "calor-especifico-delta-t", "ciencia", "🔥",
    "Calor por cambio de temperatura (Q = mcΔT)",
    "Calculá la energía calórica necesaria para cambiar la temperatura de una masa.",
    "Q = m × c × ΔT",
    [("m", "Masa (kg)", "number", "1"), ("c", "Calor específico (J/kg·K)", "number", "4186"),
     ("dt", "ΔT (°C o K)", "number", "80")],
    [("calor", "Calor", "J"), ("kcal", "En kcal"), ("resumen", "Interpretación")],
    ["1kg agua (c=4186), ΔT=80°C (de 20 a 100)", "Q = 1×4186×80 = 334.880 J", "= 80 kcal"],
    "335 kJ para hervir 1L agua",
    [("¿c del agua?", "4186 J/kg·K (o 1 cal/g·K). Es muy alto — por eso modera la temperatura planetaria."),
     ("¿c de otros?", "Aceite: 2000. Aluminio: 900. Cobre: 385. Aire: 1005. Hielo: 2050."),
     ("¿Y los fases?", "Si hay cambio de fase, necesitás calor latente extra (fusión o vaporización)."),
     ("¿Cuánto tarda microondas?", "Microondas 800W para 1L: Q=335kJ, t=335/800 = 419s ≈ 7 min. (parcial por pérdidas)."),
     ("¿Para enfriar?", "Q negativo si ΔT negativo. Calor sale del sistema.")],
    T("calorEspecificoDeltaT", """  const m = Number(i.m); const c = Number(i.c); const dt = Number(i.dt);
  if (!m || !c || dt === undefined) throw new Error('Completá');
  const Q = m * c * dt;
  return { calor: Q.toFixed(0) + ' J', kcal: (Q/4184).toFixed(1) + ' kcal', resumen: `Q = ${(Q/1000).toFixed(1)} kJ (${(Q/4184).toFixed(1)} kcal) para calentar ${m}kg en ${dt}°C.` };"""),
))

# 19 — Energía fotón
SPECS.append(spec(
    "energia-fotones-frecuencia-longitud-onda", "ciencia", "💡",
    "Energía de fotones (E = hν)",
    "Calculá la energía de un fotón desde su frecuencia o longitud de onda.",
    "E = hν = hc/λ",
    [("modo", "Dato conocido", "select", [("freq", "Frecuencia"), ("lambda", "Longitud onda")]),
     ("valor", "Valor", "number", "5e14"), ("unidad", "Unidad", "select", [("Hz", "Hz (freq)"), ("nm", "nm (λ)"), ("THz", "THz"), ("um", "µm")])],
    [("energia", "Energía fotón", "J"), ("ev", "En eV"), ("resumen", "Interpretación")],
    ["Luz visible verde 5×10¹⁴ Hz", "E = 6.626×10⁻³⁴ × 5×10¹⁴ = 3.3×10⁻¹⁹ J", "= 2.07 eV"],
    "~2 eV (fotón visible típico)",
    [("¿Constante h?", "h = 6.626×10⁻³⁴ J·s (constante de Planck)."),
     ("¿Por qué eV?", "Electrón-volts son más prácticos. 1 eV = 1.6×10⁻¹⁹ J. Luz visible: 1.5-3 eV."),
     ("¿Luz UV?", "UV-A: 3.3-4.1 eV. UV-B: 4.1-4.4 eV. UV-C: 4.4-12 eV. Más E = más dañino."),
     ("¿Rayos X?", "50-500 eV y hasta 100 keV. Ionizan tejido."),
     ("¿Rayos gamma?", "> 100 keV. Núcleos inestables. Penetra todo.")],
    T("energiaFotonesFrecuenciaLongitudOnda", """  const h = 6.626e-34; const c = 3e8;
  const modo = String(i.modo); const v = Number(i.valor); const u = String(i.unidad);
  if (!v) throw new Error('Completá valor');
  let freq: number;
  if (modo === 'freq') { freq = u === 'THz' ? v * 1e12 : v; }
  else { const lam = u === 'um' ? v * 1e-6 : v * 1e-9; freq = c / lam; }
  const E = h * freq;
  const eV = E / 1.602e-19;
  return { energia: E.toExponential(3) + ' J', ev: eV.toFixed(3) + ' eV', resumen: `E = ${E.toExponential(2)} J (${eV.toFixed(2)} eV).` };"""),
))

# 20 — Snell
SPECS.append(spec(
    "angulo-refraccion-snell", "ciencia", "🔍",
    "Ley de Snell (refracción)",
    "Calculá el ángulo de refracción al pasar un rayo de luz entre 2 medios con distintos índices.",
    "n₁ × sin(θ₁) = n₂ × sin(θ₂)",
    [("n1", "Índice medio 1 (n₁)", "number", "1"), ("theta1", "Ángulo incidencia (°)", "number", "30"),
     ("n2", "Índice medio 2 (n₂)", "number", "1.33")],
    [("theta2", "Ángulo refracción", "°"), ("resumen", "Interpretación")],
    ["Aire → agua, θ₁=30°", "θ₂ = arcsin(1×sin30/1.33) = 22.08°"],
    "22° de refracción",
    [("¿Índices típicos?", "Aire: 1.0. Agua: 1.33. Vidrio: 1.5. Diamante: 2.4."),
     ("¿Reflexión total?", "Si θ₁ supera crítico, rayo no pasa. Útil en fibra óptica."),
     ("¿Ángulo crítico?", "sin θc = n₂/n₁ (saliendo del medio más denso)."),
     ("¿Arco iris?", "Por Snell: luz blanca se refracta distinto según λ. Separación de colores."),
     ("¿Mirajes?", "Capas de aire con índices distintos doblan la luz.")],
    T("anguloRefraccionSnell", """  const n1 = Number(i.n1); const t1 = Number(i.theta1); const n2 = Number(i.n2);
  if (!n1 || t1 === undefined || !n2) throw new Error('Completá');
  const sinT2 = n1 * Math.sin(t1 * Math.PI / 180) / n2;
  if (Math.abs(sinT2) > 1) return { theta2: 'Reflexión total', resumen: 'Ángulo de incidencia supera el crítico — reflexión total interna.' };
  const t2 = Math.asin(sinT2) * 180 / Math.PI;
  return { theta2: t2.toFixed(2) + '°', resumen: `θ₂ = ${t2.toFixed(1)}° (rayo se ${n2 > n1 ? 'acerca' : 'aleja'} de la normal).` };"""),
))

# 21 — Distancia focal lente
SPECS.append(spec(
    "distancia-focal-lente-delgada", "ciencia", "🔍",
    "Ecuación de lente delgada",
    "Calculá distancia focal, posición objeto o imagen usando 1/f = 1/s + 1/s'.",
    "1/f = 1/s + 1/s'",
    [("modo", "Calcular", "select", [("f", "Focal f"), ("s", "Objeto s"), ("si", "Imagen s'")]),
     ("val1", "Valor 1 (cm)", "number", "20"), ("val2", "Valor 2 (cm)", "number", "30")],
    [("resultado", "Resultado", "cm"), ("resumen", "Interpretación")],
    ["s=30cm, s'=20cm", "1/f = 1/30+1/20 = 1/12", "f = 12 cm"],
    "f = 12 cm",
    [("¿Lente convergente vs divergente?", "Convergente f>0. Divergente f<0."),
     ("¿Aumento?", "M = -s'/s. Negativo = invertido."),
     ("¿Cámara?", "Lente con f ajustable. Objeto s grande, s' ≈ f."),
     ("¿Ojo humano?", "Lente biológica. Acomodación cambia f para enfocar cerca o lejos."),
     ("¿Diopría?", "D = 1/f (f en metros). Lentes de -3D para miopía.")],
    T("distanciaFocalLenteDelgada", """  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let r: number;
  if (modo === 'f') { r = 1 / (1/v1 + 1/v2); }
  else if (modo === 's') { r = 1 / (1/v1 - 1/v2); }
  else { r = 1 / (1/v1 - 1/v2); }
  return { resultado: r.toFixed(2) + ' cm', resumen: `${modo} = ${r.toFixed(1)} cm (ecuación de lente delgada).` };"""),
))

# 22 — Paralaje
SPECS.append(spec(
    "paralaje-distancia-estrella-parsec", "ciencia", "🌟",
    "Paralaje a distancia en parsecs",
    "Convertí paralaje estelar (en arcos segundos) a distancia en parsecs.",
    "d (pc) = 1 / paralaje (arcsec)",
    [("paralaje", "Paralaje (arcsec)", "number", "0.1")],
    [("distanciaPc", "Distancia (pc)"), ("distanciaAL", "En años luz"), ("resumen", "Interpretación")],
    ["p=0.1 arcsec", "d = 1/0.1 = 10 pc", "= 32.6 años luz"],
    "10 pc (32.6 al)",
    [("¿Qué es paralaje?", "Ángulo aparente de una estrella al observar desde 2 puntos opuestos de la órbita terrestre."),
     ("¿Parsec vs año luz?", "1 pc = 3.26 al = 3.09×10¹³ km."),
     ("¿Próxima Centauri?", "Paralaje 0.77 arcsec → d = 1.3 pc = 4.24 al."),
     ("¿Límite del método?", "~100 pc desde la Tierra (Hipparcos). Gaia alcanza 10 kpc."),
     ("¿Para galaxias?", "No. Cefeidas variables o supernovas tipo Ia.")],
    T("paralajeDistanciaEstrellaParsec", """  const p = Number(i.paralaje);
  if (!p || p <= 0) throw new Error('Ingresá paralaje positivo');
  const pc = 1 / p;
  const al = pc * 3.26;
  return { distanciaPc: pc.toFixed(2) + ' pc', distanciaAL: al.toFixed(2) + ' al', resumen: `Distancia ${pc.toFixed(1)} pc (${al.toFixed(1)} años luz).` };"""),
))

# 23 — Redshift
SPECS.append(spec(
    "redshift-velocidad-radial", "ciencia", "🔴",
    "Redshift a velocidad radial",
    "Convertí redshift z (no relativista) a velocidad radial de alejamiento de galaxia.",
    "v = z × c (para z pequeños)",
    [("z", "Redshift z", "number", "0.05")],
    [("vKms", "Velocidad", "km/s"), ("resumen", "Interpretación")],
    ["z=0.05", "v = 0.05 × 300000 = 15000 km/s"],
    "15.000 km/s",
    [("¿Qué es z?", "Corrimiento relativo de λ observada vs emitida. z = (λ_obs - λ_emit)/λ_emit."),
     ("¿Alto z?", "Fórmula cambia: v = c × [(1+z)² - 1] / [(1+z)² + 1]. Para z=1: v=0.6c."),
     ("¿Objetos más alejados?", "Quásares z~7, galaxias tempranas z~10-11 (James Webb)."),
     ("¿Expansión del universo?", "Ley de Hubble: v = H₀ × d. H₀ ≈ 70 km/s/Mpc."),
     ("¿Cómo se mide?", "Líneas espectrales (H-alpha, He, etc.) desplazadas al rojo.")],
    T("redshiftVelocidadRadial", """  const z = Number(i.z);
  if (z === undefined) throw new Error('Ingresá z');
  const c = 299792;
  let v: number;
  if (Math.abs(z) < 0.1) v = z * c;
  else v = c * ((Math.pow(1+z, 2) - 1) / (Math.pow(1+z, 2) + 1));
  return { vKms: v.toFixed(0) + ' km/s', resumen: `v = ${v.toFixed(0)} km/s (${z < 0.1 ? 'Doppler clásico' : 'relativista'}).` };"""),
))

# 24 — Desintegración radioactiva
SPECS.append(spec(
    "desintegracion-radioactiva-vida-media", "ciencia", "☢️",
    "Desintegración radioactiva por vida media",
    "Calculá el % de átomos restantes después de un tiempo, según la vida media del isótopo.",
    "N(t) = N₀ × (½)^(t/t½)",
    [("tMedia", "Vida media (años)", "number", "5730"), ("t", "Tiempo transcurrido (años)", "number", "11460")],
    [("porcentaje", "% restante"), ("resumen", "Interpretación")],
    ["t½=5730a (C-14), t=11460a", "N/N₀ = (½)² = 25%"],
    "25% restante tras 2 vidas medias",
    [("¿Qué es vida media?", "Tiempo para que decaiga la mitad de la muestra. Constante para cada isótopo."),
     ("¿C-14 datación?", "Vida media 5730 años. Útil hasta ~50000 años."),
     ("¿Uranio-238?", "4.5 mil millones años. Mide edad de la Tierra."),
     ("¿Iodo-131?", "8 días. Uso médico. Descomposición rápida evita exposición prolongada."),
     ("¿Dose seguro?", "Depende del tipo. Alpha externo: seguro. Interno (ingerido): peligroso.")],
    T("desintegracionRadioactivaVidaMedia", """  const tm = Number(i.tMedia); const t = Number(i.t);
  if (!tm || t === undefined) throw new Error('Completá');
  const pct = Math.pow(0.5, t / tm) * 100;
  return { porcentaje: pct.toFixed(2) + '%', resumen: `Tras ${t} años quedan ${pct.toFixed(1)}% (${(t/tm).toFixed(1)} vidas medias de ${tm}a).` };"""),
))

# 25 — MRUA ecuaciones
SPECS.append(spec(
    "ecuaciones-cinematicas-mru-mrua", "ciencia", "➡️",
    "Ecuaciones cinemáticas MRUA",
    "Resolvé cualquier variable de movimiento rectilíneo uniformemente acelerado (MRUA): v=v₀+at, d=v₀t+½at², v²=v₀²+2ad.",
    "v = v₀ + a·t  |  d = v₀t + ½at²  |  v² = v₀² + 2a·d",
    [("v0", "v₀ inicial (m/s)", "number", "0"), ("a", "Aceleración (m/s²)", "number", "9.81"),
     ("t", "Tiempo (s)", "number", "3"), ("d", "Distancia (m)", "number", "0")],
    [("vFinal", "v final", "m/s"), ("distancia", "Distancia", "m"), ("resumen", "Interpretación")],
    ["v₀=0, a=9.81, t=3s", "v = 29.43 m/s, d = 44.1 m"],
    "v=29.4 m/s, d=44.1 m",
    [("¿Cuándo aplica MRUA?", "Aceleración constante. Caída libre, plano inclinado, frenado uniforme."),
     ("¿Y si a no es constante?", "Cálculo integral. Integrá a(t) para v(t), v(t) para x(t)."),
     ("¿Aceleración negativa?", "Frenado. Mismo a pero signo opuesto al movimiento."),
     ("¿Caída libre?", "a = g = 9.81 m/s² (hacia abajo)."),
     ("¿Distancia de frenado?", "d = v² / (2·a). Si duplicás v, cuadriplicás d.")],
    T("ecuacionesCinematicasMruMrua", """  const v0 = Number(i.v0) || 0; const a = Number(i.a) || 0;
  const t = Number(i.t) || 0; const d0 = Number(i.d) || 0;
  if (!a || !t) throw new Error('Ingresá a y t');
  const v = v0 + a * t;
  const d = v0 * t + 0.5 * a * t * t;
  return { vFinal: v.toFixed(2) + ' m/s', distancia: d.toFixed(2) + ' m', resumen: `Con v₀=${v0} y a=${a} m/s²: en ${t}s → v=${v.toFixed(1)} m/s y d=${d.toFixed(1)} m.` };"""),
))

# 26 — Dalton
SPECS.append(spec(
    "presion-parcial-dalton", "ciencia", "💨",
    "Presión parcial (Ley de Dalton)",
    "Calculá la presión parcial de un gas en una mezcla conociendo fracción molar y presión total.",
    "P_i = x_i × P_total",
    [("fraccion", "Fracción molar", "number", "0.21"), ("pTotal", "Presión total (atm)", "number", "1")],
    [("presionParcial", "Presión parcial", "atm"), ("resumen", "Interpretación")],
    ["Oxígeno en aire: x=0.21, P=1 atm", "P_O2 = 0.21 × 1 = 0.21 atm"],
    "0.21 atm de O₂ a nivel del mar",
    [("¿Qué es fracción molar?", "Moles del gas / moles totales en la mezcla."),
     ("¿Composición aire?", "N₂ 78%, O₂ 21%, Ar 0.9%, CO₂ 0.04%."),
     ("¿Presión oxígeno Everest?", "P_total 33% → P_O2 0.07 atm. Por eso se usa oxígeno suplementario."),
     ("¿Aplica a líquidos?", "No directamente. Para líquidos vale ley de Henry."),
     ("¿Buceo?", "Cada 10m suma 1 atm. A 40m: P=5 atm, P_O2=1.05 atm. Toxicidad si supera 1.4.")],
    T("presionParcialDalton", """  const x = Number(i.fraccion); const p = Number(i.pTotal);
  if (x === undefined || !p) throw new Error('Completá');
  const pp = x * p;
  return { presionParcial: pp.toFixed(3) + ' atm', resumen: `Presión parcial: ${pp.toFixed(3)} atm (fracción ${x} de ${p} atm total).` };"""),
))

# 27 — Entropía cambio fase
SPECS.append(spec(
    "entropia-cambio-fase", "ciencia", "❄️",
    "Cambio de entropía en fase (ΔS = Q/T)",
    "Calculá el cambio de entropía al absorber o liberar calor a temperatura constante.",
    "ΔS = Q / T",
    [("q", "Calor Q (J)", "number", "334000"), ("t", "Temperatura K", "number", "273")],
    [("deltaS", "ΔS", "J/K"), ("resumen", "Interpretación")],
    ["Fusión hielo: 334 kJ a 273K", "ΔS = 334000/273 = 1223.8 J/K"],
    "~1224 J/K (hielo → agua, 1kg)",
    [("¿Qué es entropía?", "Medida del desorden o dispersión de energía. 2ª ley: ΔS_universo siempre ≥ 0."),
     ("¿Reversible?", "Fórmula asume proceso reversible a T constante (fase, expansión isotérmica)."),
     ("¿Fusión del hielo?", "ΔH_fusion = 334 J/g. Para 1 kg a 0°C: ΔS = 1223 J/K."),
     ("¿Evaporación?", "Mayor ΔS que fusión. Agua a 100°C: ΔS = 2260J/g / 373K = 6.06 J/g·K."),
     ("¿Unidades?", "J/K en SI. Cal/K en thermochemistry.")],
    T("entropiaCambioFase", """  const q = Number(i.q); const t = Number(i.t);
  if (q === undefined || !t) throw new Error('Completá');
  const dS = q / t;
  return { deltaS: dS.toFixed(2) + ' J/K', resumen: `ΔS = ${dS.toFixed(1)} J/K (absorbiendo ${(q/1000).toFixed(1)}kJ a ${t}K).` };"""),
))

# 28 — Carnot
SPECS.append(spec(
    "eficiencia-carnot-termodinamica", "ciencia", "♻️",
    "Eficiencia del ciclo Carnot",
    "Calculá la eficiencia teórica máxima de una máquina térmica entre dos reservorios.",
    "η = 1 - T_frío/T_caliente",
    [("tCalor", "T caliente (K)", "number", "573"), ("tFrio", "T fría (K)", "number", "373")],
    [("eficiencia", "Eficiencia Carnot", "%"), ("resumen", "Interpretación")],
    ["300°C (573K) y 100°C (373K)", "η = 1 - 373/573 = 34.9%"],
    "Máx 34.9% eficiencia",
    [("¿Por qué 'máxima'?", "Ningún ciclo real supera Carnot. Es límite termodinámico absoluto."),
     ("¿Motor auto?", "Gasolina real ~25%. Carnot ~60% (con T_c=2500K). Pérdidas reales enormes."),
     ("¿Refrigerador?", "COP = T_c/(T_h - T_c). Invierso del Carnot."),
     ("¿Cómo mejorar?", "Aumentar T_h o bajar T_c. Plantas térmicas buscan vapor sobrecalentado."),
     ("¿Central nuclear?", "T_h ~600K. Eficiencia real ~33%. Cerca del límite teórico.")],
    T("eficienciaCarnotTermodinamica", """  const tc = Number(i.tCalor); const tf = Number(i.tFrio);
  if (!tc || !tf) throw new Error('Completá T_h y T_c');
  if (tf >= tc) throw new Error('T fría debe ser menor');
  const eta = 1 - tf / tc;
  return { eficiencia: (eta * 100).toFixed(2) + '%', resumen: `Eficiencia Carnot máx ${(eta*100).toFixed(1)}% entre ${tc}K y ${tf}K.` };"""),
))

# 29 — CO2 forcing
SPECS.append(spec(
    "efecto-invernadero-co2-ppm", "ciencia", "🌡️",
    "Forzamiento radiativo CO₂ atmosférico",
    "Estimá el forzamiento radiativo ΔF en W/m² según concentración de CO₂ en ppm vs línea base.",
    "ΔF = 5.35 × ln(C/C₀)",
    [("c", "Concentración actual (ppm)", "number", "420"), ("c0", "Concentración base (ppm)", "number", "280")],
    [("forzamiento", "Forzamiento radiativo", "W/m²"), ("resumen", "Interpretación")],
    ["C actual 420, pre-industrial 280", "ΔF = 5.35 × ln(420/280) = 2.17 W/m²"],
    "+2.17 W/m² forzamiento (IPCC)",
    [("¿Qué es W/m²?", "Energía extra absorbida por la atmósfera por m² de superficie. Efecto calentador."),
     ("¿Valor hoy?", "Pre-industrial 280 ppm. 2024: 420+ ppm. ΔF ≈ 2.2 W/m²."),
     ("¿Equivalente a...?", "~0.7% del flujo solar incidente (341 W/m²). Pequeño pero acumulativo."),
     ("¿Cuánto calentamiento?", "Sensibilidad climática ~3°C por duplicación CO₂ (según IPCC)."),
     ("¿Otros gases?", "Metano (CH₄) tiene 28× potencial de CO₂. N₂O: 273×. SF₆: 22800×.")],
    T("efectoInvernaderoCo2Ppm", """  const c = Number(i.c); const c0 = Number(i.c0) || 280;
  if (!c) throw new Error('Ingresá concentración');
  const dF = 5.35 * Math.log(c / c0);
  return { forzamiento: dF.toFixed(2) + ' W/m²', resumen: `Forzamiento radiativo ΔF = ${dF.toFixed(2)} W/m² (CO₂ ${c} ppm vs ${c0} pre-industrial).` };"""),
))

# 30 — Escala Richter
SPECS.append(spec(
    "escala-richter-magnitud-energia", "ciencia", "🌋",
    "Escala Richter — magnitud a energía sísmica",
    "Convertí magnitud de Richter a energía liberada por un terremoto (Joules).",
    "log E = 4.8 + 1.5 × M  (E en Joules)",
    [("magnitud", "Magnitud Richter", "number", "7")],
    [("energia", "Energía liberada", "J"), ("equivalente", "Equivalente TNT"), ("resumen", "Interpretación")],
    ["M=7", "log E = 4.8 + 10.5 = 15.3", "E = 2×10¹⁵ J", "= 478 kt TNT"],
    "~480 kt TNT (tipo Hiroshima × 30)",
    [("¿Qué es Richter?", "Escala logarítmica de magnitud sísmica. Moderna es Mw (momento)."),
     ("¿Cada grado?", "×31.6 energía. M7 es ~31.6× más energético que M6."),
     ("¿Mayor registrado?", "Valdivia 1960, Chile: M9.5. Energía 2×10¹⁹ J."),
     ("¿Peligro por magnitud?", "M<4: imperceptible. 5-5.9: ligeros daños. 6-6.9: graves. 7+: destructivos."),
     ("¿TNT equivalente?", "1 kg TNT = 4.18×10⁶ J. M7 = ~480 kt. Bomba Hiroshima: 15 kt.")],
    T("escalaRichterMagnitudEnergia", """  const m = Number(i.magnitud);
  if (!m) throw new Error('Ingresá magnitud');
  const E = Math.pow(10, 4.8 + 1.5 * m);
  const tntKg = E / 4.18e6;
  let eqTnt: string;
  if (tntKg >= 1e6) eqTnt = (tntKg / 1e6).toFixed(2) + ' Mt TNT';
  else if (tntKg >= 1e3) eqTnt = (tntKg / 1e3).toFixed(2) + ' kt TNT';
  else eqTnt = tntKg.toFixed(0) + ' kg TNT';
  return { energia: E.toExponential(2) + ' J', equivalente: eqTnt, resumen: `M${m}: ${E.toExponential(1)} J (${eqTnt}).` };"""),
))
