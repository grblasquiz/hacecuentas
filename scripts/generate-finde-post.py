#!/usr/bin/env python3
"""
Motor Discover — pieza EVERGREEN ESTACIONAL de FIN DE SEMANA.

Ángulo de finde: el catálogo pesa a intención de día hábil (fiscal/laboral), así
que el orgánico se cae ~48% sáb/dom. Esta pieza alimenta Google Discover los
findes con una guía PRÁCTICA y útil (no relleno), pegada a la estación/mes (AR,
hemisferio sur: jun=invierno, dic=verano). El número exacto siempre lo da la calc
enlazada — acá van reglas de oro establecidas, cero invención de cifras precisas.

Anti-thin-content (dominio joven en sandbox + campaña anti scaled-content):
  - Como MUCHO 1 post por semana ISO (skip-if-exists por semana).
  - Rota entre 6 temas GENUINAMENTE distintos y oportunos (no el mismo template).
  - No colisiona con finde-largo-* (±4 días) ni con el Mundial (11-jun/19-jul,
    que ya tiene su propio generador generate-mundial-weekend-post.py).

Gates (TODOS deben pasar para escribir), en orden:
  a. Día: corre cualquier día (pensado para jue-sáb). Fecha el post HOY.
  b. skip-if-exists: ya hay un finde-*.json de ESTA semana ISO → no escribe.
  c. anti-colisión finde-largo: existe finde-largo-*.json con date a ±4 días → no.
  d. anti-colisión Mundial: hoy entre 2026-06-11 y 2026-07-19 → no.

  python3 scripts/generate-finde-post.py
  python3 scripts/generate-finde-post.py --date 2026-08-08          # simular
  python3 scripts/generate-finde-post.py --date 2026-08-08 --force  # ignorar skip semana
"""
import sys
import json
import glob
import datetime
from pathlib import Path

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
BLOG = Path('src/content/blog')
HUB = '/calculadoras-fin-de-semana'
CUP_START = datetime.date(2026, 6, 11)
CUP_END = datetime.date(2026, 7, 19)

# ─────────────────────────────────────────────────────────────────────────────
# Pool de temas. `meses` = meses (1-12) en que el tema es OPORTUNO; lista vacía =
# todo el año. relatedCalcs verificados contra el campo `slug` de los JSON.
# El `content` es HTML sustancioso (3-5 <h2> con guía real + tabla/lista útil),
# siempre enlaza al hub /calculadoras-fin-de-semana y a las calcs. FAQ >= 7.
# ─────────────────────────────────────────────────────────────────────────────


def _hub_link(texto='guía de calculadoras para el fin de semana'):
    return f'<a href="{HUB}">{texto}</a>'


TEMAS = [
    # 1) ASADO ───────────────────────────────────────────────────────────────
    {
        'key': 'asado',
        'meses': [],  # todo el año (más fuerte en primavera/verano)
        'emoji': '🔥',
        'category': 'cocina',
        'title_tpl': 'Cuánto comprar para el asado del finde (carne, achuras, cerveza y empanadas)',
        'og_tpl': 'Asado del finde: cuánto comprar sin que falte ni sobre',
        'desc': ('La guía para comprar el asado del fin de semana sin pasarte ni quedarte corto: '
                 'cuánta carne, achuras, cerveza y empanadas por persona, con la regla de oro y la calculadora exacta.'),
        'keywords': ['cuanta carne por persona asado', 'cuanto comprar asado',
                     'asado para cuantas personas', 'cuanta cerveza por persona',
                     'asado del fin de semana'],
        'reading': 4,
        'related': [
            'calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo',
            'calculadora-cerveza-por-invitado-duracion-fiesta',
            'calculadora-empanadas-por-invitado-juntada',
            'calculadora-pizza-por-invitado-porciones',
        ],
        'content': f'''<p>El asado del finde se arruina por una sola cosa: comprar mal. O te quedás corto y alguien se va con hambre, o sobra medio costillar que termina en el freezer. La buena noticia es que las cantidades por persona están bastante estandarizadas — acá tenés las reglas de oro, y el número exacto para tu cantidad de invitados lo sacás con las calculadoras enlazadas.</p>

<h2 id="carne">Cuánta carne por persona</h2>
<p>La regla establecida para un asado de adultos con buen apetito es <strong>≈350-400 g de carne por persona</strong> (peso de la carne cruda, ya descontado el hueso). Si hay achuras, entrada o muchos chicos, podés bajar a 300 g. Si es un asado "de varones" sin guarnición, subí a 450 g.</p>
<ul>
<li><strong>Adultos:</strong> 350-400 g c/u de carne sin hueso.</li>
<li><strong>Chicos:</strong> contá medio adulto (≈180-200 g).</li>
<li><strong>Con achuras y chorizos:</strong> restá ≈80-100 g de carne por persona, porque "llenan" antes.</li>
</ul>
<p>Para el número fino según tus cortes (tira, vacío, pollo) y tu lista de invitados, usá la <a href="/calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo">calculadora de kilos de asado por persona</a>.</p>

<h2 id="achuras-chorizos">Achuras, chorizos y la previa</h2>
<p>La picada de entrada y los chorizos definen cuánta hambre llega al plato fuerte. Calculá <strong>1 chorizo y media morcilla por persona</strong> como piso, más una entrada para que la espera no se haga eterna. Si arrancás con <a href="/calculadora-empanadas-por-invitado-juntada">empanadas (calculá cuántas por invitado)</a>, contá 2-3 por persona de entrada.</p>

<h2 id="bebida">Cuánta cerveza y bebida</h2>
<p>La regla de bar: <strong>≈1 litro de bebida por adulto</strong> para un asado de tarde (mezcla de cerveza, vino y agua/gaseosa). En verano subí un 20-30% porque el calor multiplica la sed. Para la cuenta según cuántas horas dura la junta y cuántos toman alcohol, mirá la <a href="/calculadora-cerveza-por-invitado-duracion-fiesta">calculadora de cerveza por invitado</a>.</p>
<table>
<thead><tr><th>Ítem</th><th>Regla de oro por adulto</th></tr></thead>
<tbody>
<tr><td>Carne sin hueso</td><td>350-400 g</td></tr>
<tr><td>Chorizo</td><td>1 unidad</td></tr>
<tr><td>Pan</td><td>1 mignon / 80-100 g</td></tr>
<tr><td>Bebida total</td><td>≈1 litro</td></tr>
<tr><td>Hielo (verano)</td><td>≈1 kg cada 3-4 personas</td></tr>
</tbody>
</table>

<h2 id="resto">¿Y si después cae más gente?</h2>
<p>Siempre cae alguien de más. La jugada segura es sumar pizza o más empanadas, que se estiran fácil: tenés la <a href="/calculadora-pizza-por-invitado-porciones">calculadora de pizza por invitado</a> para no quedar mal. Y si el plan se arma seguido, guardate la {_hub_link()} con todo lo que se calcula un sábado.</p>'''
    },

    # 2) ESCAPADA EN AUTO ──────────────────────────────────────────────────────
    {
        'key': 'escapada-auto',
        'meses': [],  # todo el año
        'emoji': '🚗',
        'category': 'viajes',
        'title_tpl': 'Escapada del finde en auto: nafta, peajes y a qué hora salir',
        'og_tpl': 'Escapada en auto: cuánto vas a gastar y a qué hora llegás',
        'desc': ('Antes de salir de escapada el finde: cuánta nafta vas a gastar, cuánto suman los peajes '
                 'y a qué hora conviene salir para llegar con luz. Reglas prácticas + calculadoras exactas.'),
        'keywords': ['cuanta nafta gasto en viaje', 'costo de viaje en auto',
                     'cuanto sale ir en auto', 'consumo nafta cada 100 km',
                     'escapada en auto fin de semana'],
        'reading': 4,
        'related': [
            'calculadora-combustible-viaje-auto',
            'calculadora-consumo-nafta-litros-100km',
            'calculadora-costo-peaje-ruta',
            'calculadora-horario-llegada-zona-horaria',
        ],
        'content': f'''<p>La escapada de finde se planea en cinco minutos si tenés tres números claros: cuánta nafta vas a quemar, cuánto suman los peajes y a qué hora tenés que salir para no manejar de noche. Acá van las reglas, y la cuenta exacta para tu auto y tu ruta la sacás con las calculadoras.</p>

<h2 id="nafta">Cuánta nafta vas a gastar</h2>
<p>El gasto depende de tres cosas: los kilómetros, el consumo de tu auto y el precio del litro. Como referencia, un auto naftero promedio en ruta hace <strong>≈6-8 litros cada 100 km</strong> (un SUV o una camioneta, 9-12 L). Si no sabés tu consumo real, medilo una vez con la <a href="/calculadora-consumo-nafta-litros-100km">calculadora de consumo cada 100 km</a> y después estimás cualquier viaje.</p>
<p>Para el costo total del viaje (ida y vuelta, con el precio del litro de hoy), usá la <a href="/calculadora-combustible-viaje-auto">calculadora de combustible para el viaje</a>.</p>

<h2 id="peajes">Los peajes, que siempre se olvidan</h2>
<p>Los peajes son el costo fantasma de toda escapada: nadie los suma hasta que está en la cabina. Antes de salir, calculá el total ida y vuelta con la <a href="/calculadora-costo-peaje-ruta">calculadora de costo de peajes por ruta</a> y sumalo al presupuesto de nafta. Regla práctica: en los corredores principales el peaje pesa un <strong>15-25% extra</strong> sobre la nafta.</p>

<h2 id="hora">A qué hora salir para llegar con luz</h2>
<p>La regla de oro de la escapada: <strong>llegá siempre con luz de día</strong>. Restale al horario de atardecer el tiempo de viaje más un 20% de colchón (parada para cargar, baño, tráfico de salida). Si cruzás de provincia hacia el oeste, ojo con el huso: usá la <a href="/calculadora-horario-llegada-zona-horaria">calculadora de horario de llegada</a> para no confundirte la hora local.</p>
<table>
<thead><tr><th>Concepto</th><th>Regla práctica</th></tr></thead>
<tbody>
<tr><td>Consumo auto naftero en ruta</td><td>6-8 L/100 km</td></tr>
<tr><td>Consumo SUV / camioneta</td><td>9-12 L/100 km</td></tr>
<tr><td>Colchón de tiempo sobre el GPS</td><td>+20%</td></tr>
<tr><td>Parada de descanso</td><td>cada 2 h / 200 km</td></tr>
<tr><td>Peajes sobre el costo de nafta</td><td>+15-25%</td></tr>
</tbody>
</table>

<h2 id="checklist">Checklist de 2 minutos antes de arrancar</h2>
<ul>
<li>Presión de neumáticos y nivel de aceite (un neumático bajo te sube el consumo).</li>
<li>Tanque lleno antes de la ruta — en pueblo chico la nafta sale más cara.</li>
<li>Efectivo o telepeaje para las cabinas.</li>
<li>Hora de salida calculada para llegar con sol.</li>
</ul>
<p>Si te escapás seguido, tené a mano la {_hub_link()}: ahí están todas las cuentas de viaje y las del finde juntas.</p>'''
    },

    # 3) FITNESS RESET ──────────────────────────────────────────────────────────
    {
        'key': 'fitness-reset',
        'meses': [1, 9],  # fuerte en enero (año nuevo) y septiembre (pre-verano AR)
        'emoji': '💪',
        'category': 'salud',
        'title_tpl': 'Reset del finde: IMC, calorías y cuánta agua tomar para arrancar bien',
        'og_tpl': 'Reset del finde: tus números base de salud en 10 minutos',
        'desc': ('El finde es el momento para resetear hábitos: calculá tu IMC, las calorías que necesitás, '
                 'el déficit para bajar de peso y el agua diaria. Reglas claras + las calculadoras exactas.'),
        'keywords': ['como calcular imc', 'cuantas calorias necesito por dia',
                     'cuanta agua tomar por dia', 'deficit calorico para bajar de peso',
                     'reset fitness fin de semana'],
        'reading': 4,
        'related': [
            'calculadora-imc',
            'calculadora-tdee-calculadora-mifflin-st-jeor',
            'calculadora-deficit-calorico-semanal',
            'calculadora-agua-diaria-litros-segun-peso',
        ],
        'content': f'''<p>Arrancar una rutina nueva el lunes nunca funciona: para el martes ya te olvidaste. El finde, en cambio, tenés diez minutos tranquilos para sacar tus cuatro números base — IMC, calorías de mantenimiento, déficit y agua — y empezar la semana con un plan real, no con buena voluntad. Las cifras exactas las da cada calculadora; acá te explico qué significan.</p>

<h2 id="imc">1. Tu punto de partida: el IMC</h2>
<p>El IMC (índice de masa corporal) es la foto rápida de dónde estás parado. La referencia de la OMS: <strong>18,5-24,9 es peso normal</strong>, 25-29,9 sobrepeso, 30+ obesidad. Es una orientación poblacional, no un diagnóstico (no distingue músculo de grasa), pero sirve para fijar el norte. Calculá el tuyo con la <a href="/calculadora-imc">calculadora de IMC</a>.</p>

<h2 id="calorias">2. Cuántas calorías necesitás (TDEE)</h2>
<p>Tu gasto diario total —el famoso TDEE— es cuántas calorías quemás por día contando tu metabolismo basal más la actividad. Es el número del que cuelga todo lo demás: si comés por debajo, bajás; por arriba, subís. Sacalo según tu peso, altura, edad y nivel de actividad con la <a href="/calculadora-tdee-calculadora-mifflin-st-jeor">calculadora de TDEE (Mifflin-St Jeor)</a>.</p>

<h2 id="deficit">3. El déficit para bajar sin sufrir</h2>
<p>Para bajar de peso de forma sostenible, la regla establecida es un déficit de <strong>≈300-500 kcal por día</strong> sobre tu TDEE — eso da en torno a 0,3-0,5 kg por semana, que es el ritmo que el cuerpo aguanta sin rebote. Bajar más rápido casi siempre se recupera. Calculá tu déficit semanal con la <a href="/calculadora-deficit-calorico-semanal">calculadora de déficit calórico semanal</a>.</p>

<h2 id="agua">4. Cuánta agua tomar</h2>
<p>La regla práctica más usada: <strong>≈35 ml de agua por kg de peso</strong> por día (una persona de 70 kg, ≈2,4 litros). Suma o resta según calor, ejercicio y café. El número fino para tu peso lo da la <a href="/calculadora-agua-diaria-litros-segun-peso">calculadora de agua diaria según peso</a>.</p>
<table>
<thead><tr><th>Número base</th><th>Regla de oro</th></tr></thead>
<tbody>
<tr><td>IMC normal (OMS)</td><td>18,5 – 24,9</td></tr>
<tr><td>Déficit para bajar</td><td>300-500 kcal/día</td></tr>
<tr><td>Ritmo sano de bajada</td><td>0,3-0,5 kg/semana</td></tr>
<tr><td>Agua diaria</td><td>≈35 ml por kg</td></tr>
</tbody>
</table>

<h2 id="plan">Cómo usar estos números el lunes</h2>
<ul>
<li>Anotá tu TDEE y restale 400: ese es tu objetivo de calorías diario.</li>
<li>Llená una botella que sepas cuántos litros tiene y apuntá a vaciarla X veces.</li>
<li>Pesate una vez por semana, mismo día y hora — no todos los días.</li>
</ul>
<p>Tenés todas estas calculadoras (y las de fitness, cocina y mascotas) juntas en la {_hub_link()}.</p>'''
    },

    # 4) JUNTADA ────────────────────────────────────────────────────────────────
    {
        'key': 'juntada',
        'meses': [],  # todo el año
        'emoji': '🍻',
        'category': 'cocina',
        'title_tpl': 'Juntada del finde: cuánta bebida y picada por persona',
        'og_tpl': 'Juntada del finde: bebida y picada justas, sin que falte',
        'desc': ('Organizás la juntada del finde: cuánta cerveza, picada y snacks por persona para que no '
                 'falte ni te sobre medio supermercado. Reglas de oro + las calculadoras exactas.'),
        'keywords': ['cuanta bebida por persona', 'cuanta picada por persona',
                     'cuanta cerveza juntada', 'que comprar para una juntada',
                     'picada para cuantas personas'],
        'reading': 3,
        'related': [
            'calculadora-cerveza-por-invitado-duracion-fiesta',
            'calculadora-fiambre-queso-por-invitado-picada',
            'calculadora-snacks-por-invitado-juntada',
            'calculadora-pizza-por-invitado-porciones',
        ],
        'content': f'''<p>La juntada de finde se cae por dos extremos: o comprás de menos y a las dos horas no queda nada, o llenás la heladera de cosas que después tirás. Las cantidades por persona están bastante estandarizadas — acá tenés las reglas, y la cuenta exacta para tu cantidad de gente la sacás con las calculadoras.</p>

<h2 id="bebida">Cuánta bebida por persona</h2>
<p>Para una junta de varias horas, la regla de bar es <strong>≈1 bebida por persona por hora</strong> la primera hora y media, y baja después. En la práctica: contá <strong>≈1 litro de cerveza por adulto que toma</strong> en una junta de tarde, más agua y gaseosa para los que no. Ajustá según cuánto dura y cuántos toman con la <a href="/calculadora-cerveza-por-invitado-duracion-fiesta">calculadora de cerveza por invitado</a>.</p>

<h2 id="picada">La picada: el corazón de la junta</h2>
<p>Una picada que "alcanza" arranca en <strong>≈150-200 g de fiambre y queso por persona</strong> si es lo único que hay para comer; baja a ≈100 g si después viene pizza o algo más. Sumá aceitunas, papas y maní para estirar. El cálculo fino de fiambre y queso lo hacés con la <a href="/calculadora-fiambre-queso-por-invitado-picada">calculadora de picada por invitado</a>, y los <a href="/calculadora-snacks-por-invitado-juntada">snacks por persona</a> aparte.</p>
<table>
<thead><tr><th>Ítem</th><th>Regla de oro por persona</th></tr></thead>
<tbody>
<tr><td>Cerveza (junta de tarde)</td><td>≈1 litro</td></tr>
<tr><td>Fiambre + queso (picada principal)</td><td>150-200 g</td></tr>
<tr><td>Snacks (papas, maní)</td><td>50-80 g</td></tr>
<tr><td>Hielo (verano)</td><td>≈1 kg cada 3-4 personas</td></tr>
</tbody>
</table>

<h2 id="plato-fuerte">Si después cae algo más fuerte</h2>
<p>Cuando la junta se estira, la pizza es la salvación: se pide rápido y rinde. Calculá cuántas según la gente con la <a href="/calculadora-pizza-por-invitado-porciones">calculadora de pizza por invitado</a> y ajustá la picada hacia abajo para no llenar a todos antes. Para organizar cualquier plan de finde, tené a mano la {_hub_link()}.</p>'''
    },

    # 5) REPOSTERÍA / COCINA ────────────────────────────────────────────────────
    {
        'key': 'reposteria',
        'meses': [4, 5, 6, 7, 8],  # otoño/invierno AR: tarde de cocina
        'emoji': '🧁',
        'category': 'cocina',
        'title_tpl': 'Tarde de cocina del finde: medidas, conversiones y proporciones que siempre dudás',
        'og_tpl': 'Tarde de cocina: tazas a gramos, huevos y temperaturas sin dudar',
        'desc': ('La tarde fría de finde es para cocinar: convertí tazas a gramos, ajustá los huevos de la receta, '
                 'clavá la proporción del arroz y traducí grados Fahrenheit. Tablas útiles + las calculadoras.'),
        'keywords': ['cuantos gramos tiene una taza', 'conversion tazas a gramos',
                     'proporcion arroz agua', 'cuantos huevos lleva la receta',
                     'fahrenheit a celsius cocina'],
        'reading': 4,
        'related': [
            'calculadora-conversion-medidas-cocina-tazas-gramos',
            'calculadora-huevos-por-receta-comensales',
            'calculadora-arroz-agua-proporcion-coccion',
            'conversor-celsius-fahrenheit-temperatura',
        ],
        'content': f'''<p>Las tardes frías de finde son las mejores para meterse en la cocina sin apuro. Lo único que frena son siempre las mismas dudas: ¿cuántos gramos tiene una taza?, ¿alcanzan los huevos para el doble de gente?, ¿qué proporción de agua lleva el arroz?, ¿cuánto es 350 °F en grados de acá? Acá tenés las tablas que resuelven el 90% de los casos, y el número fino lo da cada calculadora.</p>

<h2 id="tazas">Tazas a gramos: la conversión que más se busca</h2>
<p>El problema es que una taza de harina no pesa lo mismo que una de azúcar. Como referencia (taza estándar de 240 ml):</p>
<table>
<thead><tr><th>Ingrediente</th><th>1 taza ≈</th></tr></thead>
<tbody>
<tr><td>Harina 0000</td><td>120-130 g</td></tr>
<tr><td>Azúcar blanca</td><td>200 g</td></tr>
<tr><td>Azúcar impalpable</td><td>120 g</td></tr>
<tr><td>Manteca</td><td>225 g</td></tr>
<tr><td>Arroz crudo</td><td>185 g</td></tr>
</tbody>
</table>
<p>Para cualquier ingrediente y cualquier medida (cucharadas, mililitros), usá la <a href="/calculadora-conversion-medidas-cocina-tazas-gramos">calculadora de conversión de tazas a gramos</a>.</p>

<h2 id="huevos">Cuántos huevos cuando agrandás la receta</h2>
<p>Si una receta es para 4 y cocinás para 10, los huevos no escalan "a ojo". La regla: calculá la proporción exacta de comensales y redondeá hacia arriba (medio huevo no existe en la práctica — usá uno entero). Lo resuelve la <a href="/calculadora-huevos-por-receta-comensales">calculadora de huevos por receta y comensales</a>.</p>

<h2 id="arroz">La proporción del arroz, de memoria</h2>
<p>La regla clásica es <strong>1 parte de arroz por 2 de agua</strong> para arroz blanco común, pero cambia según el tipo (el integral pide más agua y más tiempo). Clavá la proporción y el tiempo con la <a href="/calculadora-arroz-agua-proporcion-coccion">calculadora de proporción arroz-agua</a>.</p>

<h2 id="horno">Grados Fahrenheit del horno y de las recetas de internet</h2>
<p>Media internet de cocina viene en °F. Reglas para tener a mano: <strong>180 °C ≈ 350 °F</strong> (el horno "moderado" de toda receta), 200 °C ≈ 400 °F, 220 °C ≈ 425 °F. Para cualquier valor exacto, usá el <a href="/conversor-celsius-fahrenheit-temperatura">conversor de Celsius a Fahrenheit</a>.</p>

<h2 id="tips">Tres reglas que salvan cualquier receta</h2>
<ul>
<li>Pesá la harina, no la midas en taza: 10 g de más arruinan un bizcochuelo.</li>
<li>Huevos a temperatura ambiente para que la masa monte mejor.</li>
<li>No abras el horno los primeros 20 minutos o se baja el batido.</li>
</ul>
<p>Tenés estas conversiones y las demás cuentas de finde en la {_hub_link()}.</p>'''
    },

    # 6) MASCOTA ────────────────────────────────────────────────────────────────
    {
        'key': 'mascota',
        'meses': [],  # todo el año
        'emoji': '🐶',
        'category': 'mascotas',
        'title_tpl': 'El finde con tu mascota: comida, paseos y peso ideal según la raza',
        'og_tpl': 'El finde con tu perro: comida, paseos y peso ideal sin adivinar',
        'desc': ('El finde tenés tiempo para tu mascota: cuántos gramos de comida por día, su peso ideal según '
                 'la raza, su edad en años humanos y cuántos paseos necesita. Reglas claras + las calculadoras.'),
        'keywords': ['cuanta comida darle a mi perro', 'peso ideal perro por raza',
                     'edad de mi perro en años humanos', 'cuantos paseos necesita mi perro',
                     'cuidados perro fin de semana'],
        'reading': 4,
        'related': [
            'calculadora-comida-diaria-raza-perro',
            'calculadora-peso-ideal-perro-raza',
            'calculadora-edad-perro-anos-humanos',
            'calculadora-paseos-diarios-perro-raza',
        ],
        'content': f'''<p>El finde es cuando de verdad tenés tiempo para tu perro: sacarlo a caminar bien, revisar si está en su peso y, si querés, ordenar de una vez cuánto debería comer. Son cuatro cuentas simples que muchos hacen "a ojo" toda la vida. Acá van las reglas, y el número exacto para tu raza lo dan las calculadoras.</p>

<h2 id="comida">Cuánta comida por día</h2>
<p>La cantidad de alimento balanceado depende del <strong>peso, la edad y el nivel de actividad</strong> — no de cuánto te pide con cara de hambre. Como orientación muy general, un perro adulto come en torno al <strong>2-3% de su peso corporal en balanceado seco</strong> por día, pero la cifra real varía mucho según la marca y las calorías del alimento. Sacala bien con la <a href="/calculadora-comida-diaria-raza-perro">calculadora de comida diaria por raza</a> y respetá lo que dice la bolsa.</p>

<h2 id="peso">¿Está en su peso ideal?</h2>
<p>El sobrepeso es el problema de salud más común y más silencioso en perros. La prueba casera: tenés que <strong>poder palpar las costillas sin apretar</strong> y verle "cintura" desde arriba. Para el rango de peso ideal según su raza, usá la <a href="/calculadora-peso-ideal-perro-raza">calculadora de peso ideal por raza</a> y ajustá la comida si está fuera de rango.</p>

<h2 id="paseos">Cuántos paseos necesita</h2>
<p>La regla cambia muchísimo entre un bulldog y un border collie. Orientación general:</p>
<table>
<thead><tr><th>Tipo de perro</th><th>Ejercicio diario aprox.</th></tr></thead>
<tbody>
<tr><td>Razas tranquilas / braquicéfalas</td><td>30-45 min</td></tr>
<tr><td>Tamaño medio activo</td><td>1 - 1,5 h</td></tr>
<tr><td>Razas de trabajo / alta energía</td><td>2 h o más</td></tr>
</tbody>
</table>
<p>El detalle para tu raza lo da la <a href="/calculadora-paseos-diarios-perro-raza">calculadora de paseos diarios por raza</a>. El finde es ideal para sumar el paseo largo que durante la semana no sale.</p>

<h2 id="edad">Su edad en años humanos</h2>
<p>El viejo mito de "1 año perro = 7 humanos" es falso: los primeros dos años envejecen mucho más rápido y después depende del tamaño (los grandes envejecen antes). Calculá la edad real de tu perro con la <a href="/calculadora-edad-perro-anos-humanos">calculadora de edad en años humanos</a> — sirve para saber cuándo pasa a "senior" y ajustar comida y controles.</p>

<h2 id="finde">Aprovechá el finde para los controles</h2>
<ul>
<li>Pesalo en casa (subite a la balanza con y sin él) y anotá el dato.</li>
<li>Revisá almohadillas y uñas después del paseo largo.</li>
<li>Si está pasado de peso, bajá un 10% la ración y sumá caminata, no ayuno.</li>
</ul>
<p>Tenés estas calculadoras de mascotas (y las de cocina, viajes y fitness) en la {_hub_link()}.</p>'''
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# FAQ por tema — mínimo 7, reales y específicas. El número exacto remite a la calc.
# ─────────────────────────────────────────────────────────────────────────────
FAQS = {
    'asado': [
        {'q': '¿Cuántos kilos de carne por persona para el asado?',
         'a': 'La regla establecida es ≈350-400 g de carne sin hueso por adulto con buen apetito. Bajá a 300 g si hay achuras, entrada o muchos chicos; subí a 450 g si es un asado sin guarnición. El número exacto para tus cortes lo da la calculadora de kilos de asado por persona.'},
        {'q': '¿Cuánta cerveza llevo por persona?',
         'a': 'Contá ≈1 litro de bebida total por adulto para un asado de tarde, mezclando cerveza, vino y agua. En verano subí un 20-30%. La calculadora de cerveza por invitado lo ajusta según cuántas horas dura y cuántos toman alcohol.'},
        {'q': '¿Cuántos chorizos y achuras por persona?',
         'a': 'Como piso, 1 chorizo y media morcilla por persona. Si servís muchas achuras, restá ≈80-100 g de carne por persona porque llenan antes de llegar al plato fuerte.'},
        {'q': '¿Cuánta carne para los chicos?',
         'a': 'Contá medio adulto: unos 180-200 g de carne por chico. Y dejales lugar para postre, que comen menos asado de lo que se cree.'},
        {'q': '¿Cuántas empanadas pongo de entrada?',
         'a': 'Unas 2-3 empanadas por persona de entrada, antes del asado. Para el número fino según tus invitados está la calculadora de empanadas por invitado.'},
        {'q': '¿Cómo calculo el pan y el hielo?',
         'a': 'Pan: 1 mignon o 80-100 g por persona. Hielo en verano: ≈1 kg cada 3-4 personas para enfriar bebidas durante toda la tarde.'},
        {'q': '¿Qué hago si cae más gente de la prevista?',
         'a': 'Sumá pizza o más empanadas, que se estiran fácil. La calculadora de pizza por invitado te dice cuántas pedir para no quedar corto.'},
    ],
    'escapada-auto': [
        {'q': '¿Cuánta nafta voy a gastar en el viaje?',
         'a': 'Depende de los kilómetros, el consumo de tu auto (≈6-8 L/100 km un naftero promedio en ruta) y el precio del litro. La calculadora de combustible para el viaje te da el costo exacto ida y vuelta con el precio actual.'},
        {'q': '¿Cómo sé el consumo real de mi auto?',
         'a': 'Medilo una vez: cargá tanque lleno, anotá el cuentakilómetros, manejá y volvé a llenar. Con esos datos la calculadora de consumo cada 100 km te da tu cifra real, mucho más confiable que la de fábrica.'},
        {'q': '¿Los peajes cuánto suman sobre el viaje?',
         'a': 'En los corredores principales, el peaje suele pesar un 15-25% extra sobre el costo de la nafta. Calculá el total ida y vuelta con la calculadora de costo de peajes por ruta antes de salir.'},
        {'q': '¿A qué hora conviene salir?',
         'a': 'Apuntá a llegar siempre con luz de día. Restale al horario de atardecer el tiempo de viaje más un 20% de colchón por paradas y tráfico de salida.'},
        {'q': '¿Cada cuánto debería parar a descansar?',
         'a': 'La recomendación es parar cada 2 horas o cada 200 km, aunque no sientas cansancio. Estira las piernas y revisá presión de neumáticos en la primera parada.'},
        {'q': '¿Qué pasa con la hora si cruzo de provincia?',
         'a': 'Algunas zonas tienen huso horario distinto. Para no confundirte la hora local de llegada, usá la calculadora de horario de llegada con zona horaria.'},
        {'q': '¿Conviene cargar nafta antes de salir o en la ruta?',
         'a': 'Cargá lleno antes de tomar la ruta: en pueblos chicos y estaciones de paso la nafta suele salir más cara, y te evitás manejar pendiente del nivel del tanque.'},
    ],
    'fitness-reset': [
        {'q': '¿Cómo calculo mi IMC?',
         'a': 'El IMC es tu peso en kilos dividido por tu altura en metros al cuadrado. La referencia OMS: 18,5-24,9 es normal, 25-29,9 sobrepeso, 30+ obesidad. La calculadora de IMC te lo saca al instante. Es orientativo, no un diagnóstico.'},
        {'q': '¿Cuántas calorías necesito por día?',
         'a': 'Es tu TDEE: el gasto total diario contando metabolismo basal más actividad. Depende de peso, altura, edad y nivel de movimiento. Lo calcula la calculadora de TDEE con la fórmula Mifflin-St Jeor.'},
        {'q': '¿Qué déficit hago para bajar de peso?',
         'a': 'La regla sostenible es 300-500 kcal por día por debajo de tu TDEE, lo que da unos 0,3-0,5 kg por semana. Bajar más rápido casi siempre rebota. La calculadora de déficit semanal te lo ordena.'},
        {'q': '¿Cuánta agua tengo que tomar por día?',
         'a': 'La regla práctica más usada es ≈35 ml por kg de peso: una persona de 70 kg, unos 2,4 litros. Sumá si hace calor o entrenás. El número fino lo da la calculadora de agua diaria según peso.'},
        {'q': '¿El IMC sirve si entreno con pesas?',
         'a': 'Tiene un límite: no distingue músculo de grasa, así que una persona muy musculosa puede dar "sobrepeso" sin estarlo. Úsalo como orientación y combinalo con cómo te queda la ropa y tu porcentaje de grasa.'},
        {'q': '¿Cada cuánto me peso para ver progreso?',
         'a': 'Una vez por semana, mismo día y horario (idealmente en ayunas). El peso diario fluctúa por agua y comida y te confunde; la tendencia semanal es lo que importa.'},
        {'q': '¿Por qué arrancar el finde y no el lunes?',
         'a': 'Porque el finde tenés tiempo tranquilo para sacar tus números base y dejar el plan armado. Empezar el lunes "de la nada" casi siempre se diluye para el martes.'},
    ],
    'juntada': [
        {'q': '¿Cuánta bebida calculo por persona?',
         'a': 'Para una junta de tarde, ≈1 litro de cerveza por adulto que toma, más agua y gaseosa para el resto. La calculadora de cerveza por invitado lo ajusta según cuántas horas dura y cuántos toman alcohol.'},
        {'q': '¿Cuánta picada por persona?',
         'a': 'Si la picada es lo único para comer, calculá 150-200 g de fiambre y queso por persona; baja a ≈100 g si después viene pizza u otra cosa. El cálculo fino lo da la calculadora de picada por invitado.'},
        {'q': '¿Cuántos snacks (papas, maní) pongo?',
         'a': 'Unos 50-80 g de snacks por persona para acompañar. La calculadora de snacks por invitado te da la cantidad según cuánta gente venga.'},
        {'q': '¿Qué hago si la junta se estira y da hambre?',
         'a': 'La pizza es la mejor jugada: se pide rápido y rinde. Calculá cuántas con la calculadora de pizza por invitado y bajá un poco la picada para no llenar a todos antes.'},
        {'q': '¿Cuánto hielo necesito?',
         'a': 'En verano, ≈1 kg de hielo cada 3-4 personas para mantener las bebidas frías toda la junta. Comprá un poco de más: el hielo es lo primero que falta.'},
        {'q': '¿Cómo evito que sobre la mitad?',
         'a': 'Calculá por persona y no "por las dudas" a ojo. Lo que más sobra es bebida y picada compradas sin cuenta; las calculadoras por invitado están justo para eso.'},
        {'q': '¿Y si hay gente que no toma alcohol?',
         'a': 'Descontá esas personas del cálculo de cerveza y sumá agua saborizada y gaseosa por ellas. En general 1 litro de bebida sin alcohol por persona cubre bien la tarde.'},
    ],
    'reposteria': [
        {'q': '¿Cuántos gramos tiene una taza?',
         'a': 'Depende del ingrediente: una taza estándar de harina pesa 120-130 g, de azúcar 200 g, de manteca 225 g. La calculadora de conversión de tazas a gramos lo resuelve para cualquier ingrediente y medida.'},
        {'q': '¿Cómo escalo los huevos si agrando la receta?',
         'a': 'No los estimes a ojo: calculá la proporción exacta de comensales y redondeá hacia arriba a huevo entero. La calculadora de huevos por receta y comensales lo hace por vos.'},
        {'q': '¿Qué proporción de agua lleva el arroz?',
         'a': 'La regla clásica es 1 parte de arroz por 2 de agua para arroz blanco común; el integral pide más agua y más tiempo. La calculadora de proporción arroz-agua te da la cantidad y el tiempo exactos.'},
        {'q': '¿Cuánto es 350 °F en grados centígrados?',
         'a': '350 °F equivale a ≈180 °C, el horno "moderado" de casi toda receta. Otras referencias: 400 °F ≈ 200 °C, 425 °F ≈ 220 °C. Para cualquier valor usá el conversor de Celsius a Fahrenheit.'},
        {'q': '¿Por qué pesar la harina en vez de medirla en taza?',
         'a': 'Porque la taza varía según cuánto la compactes: 10-20 g de más o de menos arruinan un bizcochuelo. Si podés, usá balanza; si no, llená la taza sin apretar y nivelá al ras.'},
        {'q': '¿Los huevos van fríos o a temperatura ambiente?',
         'a': 'A temperatura ambiente: la masa monta e integra mejor. Sacalos de la heladera 30-40 minutos antes de empezar, sobre todo para tortas y batidos.'},
        {'q': '¿Por qué no hay que abrir el horno al principio?',
         'a': 'Los primeros 20 minutos el batido está levando: abrir la puerta baja la temperatura de golpe y se desinfla. Esperá a que esté firme antes de espiar.'},
    ],
    'mascota': [
        {'q': '¿Cuánta comida le doy a mi perro por día?',
         'a': 'Depende del peso, la edad y la actividad, no de cuánto pida. Como orientación general ronda el 2-3% del peso corporal en balanceado seco, pero varía según las calorías del alimento. La calculadora de comida diaria por raza te da la cifra precisa.'},
        {'q': '¿Cómo sé si mi perro está en su peso ideal?',
         'a': 'Prueba casera: tenés que poder palparle las costillas sin apretar y verle cintura desde arriba. Para el rango exacto según su raza usá la calculadora de peso ideal por raza.'},
        {'q': '¿Cuántos paseos necesita mi perro?',
         'a': 'Cambia mucho por raza: 30-45 min para razas tranquilas, 1-1,5 h para tamaño medio activo, 2 h o más para razas de trabajo. La calculadora de paseos diarios por raza te da el detalle.'},
        {'q': '¿Cuántos años humanos tiene mi perro?',
         'a': 'El "1 año = 7 humanos" es un mito: los primeros dos años envejecen más rápido y después depende del tamaño. La calculadora de edad en años humanos te da la cifra real según raza y tamaño.'},
        {'q': '¿Cómo peso a mi perro en casa?',
         'a': 'Subite a la balanza con él en brazos, anotá el peso, pesate solo y restá. Para perros grandes, la balanza de la veterinaria es más precisa, pero el método casero sirve para seguir la tendencia.'},
        {'q': '¿Qué hago si mi perro está pasado de peso?',
         'a': 'Bajá la ración un 10% y sumá caminata; nunca ayuno. Recalculá la comida con la calculadora por raza y controlá el peso cada un par de semanas para ver si baja gradual.'},
        {'q': '¿Cuándo mi perro pasa a ser "senior"?',
         'a': 'Depende del tamaño: los perros grandes entran a la etapa senior antes (≈7 años) que los chicos (≈10-11). Calculá su edad humana para saber cuándo ajustar comida y controles veterinarios.'},
    ],
}


def get_arg(flag, default=None):
    if flag in sys.argv:
        idx = sys.argv.index(flag)
        if idx + 1 < len(sys.argv):
            return sys.argv[idx + 1]
    return default


def aplicables(mes):
    """Temas oportunos para el mes (meses==[] => todo el año)."""
    return [t for t in TEMAS if not t['meses'] or mes in t['meses']]


def hay_finde_largo_cerca(today, ventana=4):
    """Gate c: existe finde-largo-*.json con date a ±ventana días de hoy."""
    for f in glob.glob(str(BLOG / 'finde-largo-*.json')):
        try:
            j = json.load(open(f))
            d = (j.get('date') or '')[:10]
            if not d:
                continue
            fd = datetime.date.fromisoformat(d)
            if abs((fd - today).days) <= ventana:
                return f
        except Exception:
            continue
    return None


def ya_hay_post_de_la_semana(iso_year, iso_week):
    """Gate b: ya existe un finde-*.json (no finde-largo) de esta semana ISO."""
    for f in glob.glob(str(BLOG / 'finde-*.json')):
        name = Path(f).name
        if name.startswith('finde-largo-'):
            continue
        try:
            j = json.load(open(f))
            d = (j.get('date') or '')[:10]
            if not d:
                continue
            y, w, _ = datetime.date.fromisoformat(d).isocalendar()
            if (y, w) == (iso_year, iso_week):
                return f
        except Exception:
            continue
    return None


def generate():
    today_s = get_arg('--date')
    today = datetime.date.fromisoformat(today_s) if today_s else datetime.date.today()
    force = '--force' in sys.argv

    iso_year, iso_week, _ = today.isocalendar()

    # Gate d: Mundial (su propio generador cubre estos findes)
    if CUP_START <= today <= CUP_END:
        print(f'• {today} cae dentro del Mundial ({CUP_START}…{CUP_END}) — lo cubre mundial-weekend, no escribo')
        return

    # Gate c: finde largo cerca (su propio generador lo cubre)
    fl = hay_finde_largo_cerca(today)
    if fl:
        print(f'• hay finde largo cerca (±4 días): {Path(fl).name} — no escribo (evito colisión)')
        return

    # Gate b: ya hay un post de finde de esta semana ISO
    if not force:
        ex = ya_hay_post_de_la_semana(iso_year, iso_week)
        if ex:
            print(f'• ya hay post de finde de la semana ISO {iso_year}-W{iso_week:02d}: {Path(ex).name} — no escribo (skip)')
            return

    # Selección de tema: filtrar por mes; rotar por semana ISO entre los aplicables
    pool = aplicables(today.month)
    if not pool:
        pool = TEMAS  # safety net (no debería pasar: hay temas all-year)
    tema = pool[iso_week % len(pool)]

    mes_nombre = MESES[today.month - 1]
    slug = f'finde-{tema["key"]}-{today.day}-{mes_nombre}-{today.year}'

    out = BLOG / f'{slug}.json'
    if out.exists() and not force:
        print(f'• ya existe (skip): {out}')
        return

    faq = FAQS[tema['key']]
    assert len(faq) >= 7, f'FAQ de {tema["key"]} tiene {len(faq)} (<7)'

    post = {
        'slug': slug,
        'title': f'{tema["title_tpl"]} | Hacé Cuentas',
        'ogTitle': tema['og_tpl'],
        'description': tema['desc'],
        'seoKeywords': tema['keywords'],
        'category': tema['category'],
        'date': today.isoformat(),
        'updatedDate': today.isoformat(),
        'author': 'Hacé Cuentas',
        'readingTime': tema['reading'],
        'heroEmoji': tema['emoji'],
        'content': tema['content'],
        'relatedCalcs': tema['related'],
        'faq': faq,
    }

    out.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    print(f'✅ Post generado: {out}  (tema={tema["key"]}, semana ISO {iso_year}-W{iso_week:02d})')


if __name__ == '__main__':
    generate()
