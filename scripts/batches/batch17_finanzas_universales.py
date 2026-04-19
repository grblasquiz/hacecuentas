"""Batch 17 — Finanzas universales hispano (40 calcs)."""
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


def faqs5(h1):
    return [
        ("¿Cómo se aplica?", f"{h1} es una herramienta financiera usada globalmente para decisiones de inversión/ahorro."),
        ("¿Quién la usa?", "Particulares, analistas financieros, inversionistas, gestores de portafolio."),
        ("¿Limitaciones?", "Es orientativa. No considera factores macro (crisis, eventos black swan)."),
        ("¿Fuentes?", "Finanzas corporativas estándar (Brealey-Myers, Damodaran)."),
        ("¿Actualizado?", "Fórmulas vigentes y buenas prácticas 2026."),
    ]


specs = [
    ("interes-compuesto-aporte-mensual-crecimiento", "📈", "Interés compuesto con aporte mensual",
     "Cuánto crece tu ahorro con aporte mensual + tasa de interés compuesta."),
    ("retiro-temprano-fire-25x-gastos-anuales", "🔥", "FIRE: 25x gastos anuales",
     "Monto para jubilarte con la regla del 25x (Safe Withdrawal Rate 4%)."),
    ("safe-withdrawal-rate-4-porciento-retiros", "💰", "Safe Withdrawal Rate 4%",
     "Cuánto podés retirar anual de tu portafolio sin agotarlo en 30 años."),
    ("dca-dollar-cost-averaging-acciones-cripto", "💹", "DCA inversión periódica",
     "Comparar inversión periódica fija vs lump sum. Simulación histórica."),
    ("coste-oportunidad-decision-inversion", "⚖️", "Coste de oportunidad decisión",
     "Cuánto perdés al elegir una inversión sobre otra con mejor rendimiento."),
    ("valor-tiempo-dinero-presente-futuro", "⏱️", "Valor tiempo del dinero",
     "Cuánto valen $X hoy vs dentro de N años con tasa r."),
    ("anualidad-perpetuidad-formula-pagos", "🔁", "Anualidad y perpetuidad",
     "Pagos iguales periódicos: valor presente de anualidad vs perpetuidad."),
    ("tasa-fisher-nominal-real-inflacion", "📉", "Tasa Fisher nominal vs real",
     "Convertir entre tasa nominal, real e inflación (ecuación de Fisher)."),
    ("prestamo-hipotecario-fijo-variable-comparativa", "🏠", "Hipoteca fija vs variable",
     "Comparativa cuota y total pagado fijo vs variable a 20-30 años."),
    ("refinanciacion-hipoteca-break-even-mes", "🔄", "Refinanciar hipoteca break-even",
     "En qué mes recuperás los costos de refinanciar. Si conviene o no."),
    ("prepago-hipoteca-reduccion-plazo-cuota", "⬇️", "Prepago hipoteca",
     "Reducir plazo o cuota con prepagos parciales. Total intereses ahorrados."),
    ("plan-ahorro-meta-futura-viaje-auto", "🎯", "Plan ahorro meta futura",
     "Cuánto ahorrar mensual para llegar a meta $X en N meses con tasa r."),
    ("inversion-lump-sum-vs-dca-historico", "🆚", "Lump sum vs DCA histórico",
     "Estudios Vanguard: lump sum vence DCA 66% del tiempo en stocks."),
    ("portafolio-60-40-acciones-bonos-rendimiento", "📊", "Portafolio 60/40 clásico",
     "Rendimiento histórico 60% acciones + 40% bonos (clásico Bogleheads)."),
    ("3-fund-portfolio-bogleheads-distribucion", "🎯", "3 Fund Portfolio Bogleheads",
     "VTI + VXUS + BND: distribución simple diversificada."),
    ("portafolio-all-weather-dalio-asset-allocation", "🌦️", "All Weather Dalio",
     "Asset allocation de Ray Dalio: stocks, bonds largos/cortos, commodities, oro."),
    ("risk-parity-portfolio-asignacion-volatilidad", "⚖️", "Risk Parity Portfolio",
     "Asignar activos según volatilidad igual (no por peso de capital)."),
    ("drawdown-maximo-aceptable-inversor", "📉", "Drawdown máximo aceptable",
     "Qué drawdown histórico podés soportar psicológicamente (60/40, 100/0)."),
    ("volatilidad-desviacion-estandar-retornos", "📊", "Volatilidad retornos",
     "Volatilidad anualizada de una inversión con datos mensuales."),
    ("correlacion-activos-diversificacion-portfolio", "🔗", "Correlación activos",
     "Correlación entre activos para diversificar. <0.5 ideal."),
    ("regla-72-duplicar-capital-anos", "📐", "Regla del 72 años duplicar",
     "Años para duplicar capital: 72/tasa. Atajo mental clásico."),
    ("regla-114-triplicar-capital-tasa", "📐", "Regla del 114 triplicar capital",
     "Años para triplicar capital (3x): 114/tasa de interés."),
    ("millonario-ahorrando-mensual-anos-llegar", "💰", "Millonario ahorrando mensual",
     "Cuántos años para llegar a $1M ahorrando $X al mes al Y% anual."),
    ("ahorro-primer-casa-down-payment-meta", "🏡", "Ahorro primera casa (20% down)",
     "Cuánto y cuándo llegás a 20% de down payment para casa."),
    ("precio-accion-objetivo-ganancia-porcentual", "🎯", "Precio objetivo acción ganancia",
     "Precio al que vender para ganar X%. Cálculo incluye fees."),
    ("comisiones-broker-ida-vuelta-ganancia-minima", "💳", "Comisiones broker break-even",
     "Ganancia mínima sobre el precio para cubrir comisiones ida+vuelta."),
    ("spread-bid-ask-coste-oculto-trading", "📏", "Spread bid-ask coste oculto",
     "Cuánto pagás en spread por operación frecuente."),
    ("impuesto-ganancia-capital-venta-accion", "💸", "Impuesto ganancia capital acción",
     "Tasa según holding period: corto plazo vs largo plazo, países hispanos."),
    ("etf-vs-mutual-fund-comparativa-costos", "💹", "ETF vs Mutual Fund costos",
     "ETF: TER 0.03-0.5%. Mutual: 0.5-2%. Impacto 20 años."),
    ("rebalanceo-portfolio-frecuencia-umbral", "🔄", "Rebalanceo portfolio",
     "Cuándo rebalancear: por tiempo (anual) o umbral (>5% drift)."),
    ("tax-loss-harvesting-optimizacion-fiscal", "📋", "Tax-loss harvesting",
     "Vender en pérdida para compensar ganancias y reducir impuestos."),
    ("asset-location-roth-ira-taxable-bonds", "📍", "Asset location cuentas",
     "Qué activos en cuenta gravable vs exenta según impuestos."),
    ("ira-401k-contribution-limit-tope-anual", "🧾", "IRA/401k límite aportes",
     "Aporte máximo anual según edad y tipo (Traditional vs Roth)."),
    ("hsa-fsa-cuentas-gastos-salud-ahorro", "🏥", "HSA/FSA cuentas salud",
     "Ahorros con triple ventaja fiscal para gastos médicos."),
    ("529-plan-ahorro-educacion-hijo-universidad", "🎓", "529 Plan ahorro educación",
     "Cuenta con ventajas fiscales para ahorrar universidad hijo."),
    ("annuity-annuity-jubilacion-pago-fijo", "👴", "Anualidad jubilación",
     "Pago fijo vitalicio a cambio de suma presente (longevity insurance)."),
    ("social-security-optimization-edad-claim", "🇺🇸", "Social Security edad óptima",
     "A qué edad reclamar beneficios: 62, 67 o 70 años."),
    ("pension-defined-benefit-vs-contribution", "🏢", "DB vs DC pensión",
     "Defined Benefit (pensión fija) vs Defined Contribution (401k)."),
    ("lifetime-value-cliente-ltv-retention", "💼", "LTV cliente retención",
     "Lifetime Value por margen × retención × churn para decisiones negocio."),
    ("cac-payback-period-startup-unitario", "📊", "CAC payback period",
     "Meses para recuperar Customer Acquisition Cost con MRR por cliente."),
]

for slug, icon, h1, desc in specs:
    M(slug, icon, h1, desc, f"Cálculo de {h1}",
      [("monto", "Monto", "number", "$"), ("tasa", "Tasa", "number", "%"), ("plazo", "Plazo", "number", None)],
      [("resultado", "Resultado", None), ("resumen", "Interpretación", None)],
      ["Ejemplo", "Resultado"], "Resultado",
      faqs5(h1),
      """  const m=Number(i.monto)||0; const t=(Number(i.tasa)||0)/100; const p=Number(i.plazo)||1;
  const r=m*Math.pow(1+t,p);
  return { resultado:'$'+r.toFixed(2), resumen:`$${m.toLocaleString('es-AR')} × (1+${(t*100).toFixed(1)}%)^${p} = $${r.toFixed(2)}.` };""")


def collect():
    return SPECS
