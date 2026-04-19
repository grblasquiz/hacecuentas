#!/usr/bin/env python3
"""
Agrega links internos contextuales en el explanation de cada calc.

Para cada calc, detecta menciones a:
- Otras calcs por keyword (ej. "sueldo bruto" → link a calcs de sueldo)
- Pillar pages relevantes (ej. "impuesto a las ganancias" → /guia/impuestos-argentina-2026)

Solo linkea la PRIMERA ocurrencia de cada keyword, con max 5-8 links por calc.
Evita auto-referenciar la misma calc.
"""
import json
import re
from pathlib import Path
from collections import defaultdict

CALCS_DIR = Path('src/content/calcs')
GUIAS_DIR = Path('src/content/guias')

# ============================================================
# KEYWORD → SLUG/URL mapping
# ============================================================
LINK_MAP = {
    # Sueldos
    "aguinaldo": "/calculadora-aguinaldo",
    "sac proporcional": "/calculadora-aguinaldo",
    "indemnización por despido": "/calculadora-indemnizacion-despido-sin-causa",
    "sueldo bruto": "/calculadora-sueldo-bruto-desde-neto",
    "sueldo en mano": "/calculadora-sueldo-en-mano-argentina",
    "hora extra": "/calculadora-sueldo-hora-extra-nocturna-feriado",
    "vacaciones": "/calculadora-vacaciones-dias-ley",
    "preaviso": "/calculadora-preaviso-despido",

    # Gremios
    "UOM": "/calculadora-sueldo-uom-metalurgico-basico-neto",
    "UOCRA": "/calculadora-sueldo-uocra-construccion-basico-neto",
    "Empleados de Comercio": "/calculadora-sueldo-empleados-comercio-cct-130-75",
    "CCT 130/75": "/calculadora-sueldo-empleados-comercio-cct-130-75",
    "SMATA": "/calculadora-sueldo-smata-mecanico-automotor-basico",
    "empleada doméstica": "/calculadora-sueldo-empleada-domestica-horas-retiro",

    # Impuestos
    "Ganancias": "/calculadora-ganancias-tramos-empleado-mensual-2026",
    "monotributo": "/calculadora-monotributo-cuota-2026-todas-categorias",
    "IVA": "/calculadora-iva-saldo-favor-contra-ri",
    "Bienes Personales": "/calculadora-bienes-personales-tramos-alicuota-2026",
    "IIBB": "/calculadora-ingresos-brutos-convenio-multilateral-jurisdicciones",
    "Ingresos Brutos": "/calculadora-ingresos-brutos-convenio-multilateral-jurisdicciones",
    "sellos": "/calculadora-sellos-compra-inmueble-caba-pba",
    "patente del auto": "/calculadora-patente-auto-valor-provincia-alicuota",
    "ABL": "/calculadora-abl-caba-valuacion-fiscal-vivienda",

    # Subsidios
    "AUH": "/calculadora-auh-asignacion-universal-hijo-monto-2026",
    "Tarjeta Alimentar": "/calculadora-tarjeta-alimentar-monto-hijos-2026",
    "Progresar": "/calculadora-progresar-beca-monto-requisitos-2026",
    "PUAM": "/calculadora-jubilacion-pua-prestacion-universal-adulto-mayor",
    "jubilación mínima": "/calculadora-jubilacion-anses-monto-minimo-maxima-2026",
    "PAMI": "/calculadora-pami-prestaciones-monto-copago-2026",
    "seguro de desempleo": "/calculadora-asignacion-desempleo-seguro-prestacion-anses",

    # Alquileres/hogar
    "ICL": "/calculadora-actualizacion-alquiler-icl-bcra-mensual",
    "expensas": "/calculadora-expensas-departamento-calcular-m2-categoria",
    "hipoteca UVA": "/calculadora-cuota-credito-hipotecario-uva-banco-nacion",
    "cuota hipoteca": "/calculadora-cuota-credito-hipotecario-uva-banco-nacion",

    # Salud/fitness
    "IMC": "/calculadora-imc",
    "índice de masa corporal": "/calculadora-imc",
    "TDEE": "/calculadora-tdee-calculadora-mifflin-st-jeor",
    "TMB": "/calculadora-tmb-basal-harris-benedict-metabolismo",
    "VO2 max": "/calculadora-vo2max-predecir-carrera-cooper-12min",
    "frecuencia cardíaca máxima": "/calculadora-ritmo-cardiaco-maximo-edad-formula",
    "déficit calórico": "/calculadora-deficit-calorico-perder-peso-semana",

    # Familia/embarazo
    "fecha probable de parto": "/calculadora-fecha-probable-parto-calcular-semanas",
    "FPP": "/calculadora-fecha-probable-parto-calcular-semanas",
    "semanas de gestación": "/calculadora-semanas-gestacion-hoy-bebe-trimestre",
    "percentil": "/calculadora-percentil-estatura-peso-bebe-oms",
    "ovulación": "/calculadora-ovulacion-dia-fertil-ciclo-regular",

    # Finanzas univ
    "interés compuesto": "/calculadora-interes-compuesto-aporte-mensual-crecimiento",
    "FIRE": "/calculadora-retiro-temprano-fire-25x-gastos-anuales",
    "DCA": "/calculadora-dca-dollar-cost-averaging-acciones-cripto",
    "regla del 72": "/calculadora-regla-72-duplicar-capital-anos",

    # Dólar/cripto/monedas
    "dólar blue": "/cambio-de-monedas",
    "dólar MEP": "/cambio-de-monedas",
    "dólar tarjeta": "/cambio-de-monedas",
    "dólar oficial": "/cambio-de-monedas",
    "Bitcoin": "/cotizacion-cripto",
    "Ethereum": "/cotizacion-cripto",
    "criptomonedas": "/cotizacion-cripto",
    "inflación": "/inflacion-argentina",
    "IPC": "/inflacion-argentina",
    "UVA": "/inflacion-argentina",

    # Pillar pages
    "CCT": "/guia/sueldos-argentina-2026",
    "convenio colectivo": "/guia/sueldos-argentina-2026",
    "AFIP": "/guia/impuestos-argentina-2026",
    "ANSES": "/guia/subsidios-anses-2026",
    "FSI": "/guia/productividad-aprendizaje",
    "MCER": "/guia/productividad-aprendizaje",
}


def add_links(text, calc_slug):
    """Agrega links a la primera ocurrencia de cada keyword en text."""
    if not text or len(text) < 100:
        return text, 0

    links_added = 0
    max_links = 8

    # Ordenar keywords por longitud descendente (priorizar matches más específicos)
    sorted_keys = sorted(LINK_MAP.keys(), key=len, reverse=True)

    for keyword in sorted_keys:
        if links_added >= max_links:
            break
        url = LINK_MAP[keyword]
        # Evitar auto-link (si el slug es el target)
        if url.endswith(f"/{calc_slug}") or url.endswith(f"/calculadora-{calc_slug}"):
            continue

        # Solo primera ocurrencia, no dentro de markdown links ya existentes, code o HTML
        # Regex: word boundary + keyword + word boundary
        pattern = re.compile(r'(?<!\[)(?<!\()\b' + re.escape(keyword) + r'\b(?![\]\)])', re.IGNORECASE)

        # Verificar que no esté ya linkeado
        def replace_first(match):
            nonlocal links_added
            if links_added >= max_links:
                return match.group(0)
            # Verificar contexto: no reemplazar si ya es parte de link markdown o HTML
            start = match.start()
            # Check if inside a code block, existing link, etc.
            context_before = text[max(0, start-3):start]
            if '](' in context_before or '[' in text[max(0, start-30):start].split('\n')[-1]:
                return match.group(0)
            links_added += 1
            return f"[{match.group(0)}]({url})"

        new_text = pattern.sub(replace_first, text, count=1)
        if new_text != text:
            text = new_text

    return text, links_added


def main():
    calcs = list(CALCS_DIR.glob('*.json'))
    guias = list(GUIAS_DIR.glob('*.json'))
    total_processed = 0
    total_links = 0

    for f in calcs + guias:
        try:
            d = json.loads(f.read_text())
        except:
            continue

        slug = d.get('slug', f.stem)
        modified = False
        call_links = 0

        # Linkear en explanation
        if 'explanation' in d and d['explanation']:
            new_exp, n = add_links(d['explanation'], slug)
            if n > 0:
                d['explanation'] = new_exp
                call_links += n
                modified = True

        # Linkear en intro (max 2 links)
        if 'intro' in d and d['intro']:
            orig = d['intro']
            # temporarily limit by using max_links=2 via a re-invocation
            sorted_keys = sorted(LINK_MAP.keys(), key=len, reverse=True)
            temp_text = orig
            links_here = 0
            for keyword in sorted_keys:
                if links_here >= 2: break
                url = LINK_MAP[keyword]
                if url.endswith(f"/{slug}"): continue
                pattern = re.compile(r'(?<!\[)(?<!\()\b' + re.escape(keyword) + r'\b(?![\]\)])', re.IGNORECASE)
                new_text = pattern.sub(lambda m: f"[{m.group(0)}]({url})", temp_text, count=1)
                if new_text != temp_text:
                    temp_text = new_text
                    links_here += 1
            if links_here > 0:
                d['intro'] = temp_text
                call_links += links_here
                modified = True

        if modified:
            f.write_text(json.dumps(d, ensure_ascii=False, indent=2))
            total_processed += 1
            total_links += call_links

    print(f"✅ Procesadas: {total_processed}/{len(calcs)+len(guias)}")
    print(f"✅ Links internos agregados: {total_links}")


if __name__ == "__main__":
    main()
