import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'es/vida/comida-cuentas-y-tiempo-con-amigos',
  title: "Dividir gastos, propinas y barbacoa por persona en España",
  description: "Calculadoras para el plan con amigos en España: dividir gastos, propinas, carne para la barbacoa y bebidas por persona, y tazas a gramos para la receta.",
  silo: "Planes con amigos",
  siloHref: '/es/vida',
  locale: 'es',
  eyebrow: "España · Planes con amigos",
  h1: "¿Cuánto necesitamos para comer, pagar y organizar el plan entre amigos en España?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 6 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['6 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de bebidas para evento o fiesta — España",
    "hint": "Una celebración española de 4-5 horas sale a razón de 1 L de alcohol y 1 L de refresco o agua por invitado: 30 personas suponen ~36 L de cerveza (unos 108 botellines de tercio), 18 botellas de vino de 750 ml, 6 L de destilados para combinados y 45 L de refrescos y agua. El calor del verano añade un 20% al consumo, el invierno lo recorta un 15%, y conviene comprar un 10-15% de margen.",
    "yes": [
      "**En España, para 4-5 horas de celebración se estima en torno a 1 L de bebida con alcohol y otro litro de refresco o agua por invitado.** En una barbacoa: unos 6 botellines (2 L) de cerveza o una botella de vino por cabeza, y sangría aparte si hace calor."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-24.",
    "answer": "Una celebración española de 4-5 horas sale a razón de 1 L de alcohol y 1 L de refresco o agua por invitado: 30 personas suponen ~36 L de cerveza (unos 108 botellines de tercio), 18 botellas de vino de 750 ml, 6 L de destilados para combinados y 45 L de refrescos y agua. El calor del verano añade un 20% al consumo, el invierno lo recorta un 15%, y conviene comprar un 10-15% de margen."
  },
  {
    "id": "c2",
    "label": "Calculadora de carne para barbacoa por persona — España",
    "hint": "La pregunta eterna del que enciende la barbacoa en España: ¿cuánta carne compro? Comprar de más es dinero tirado, comprar de menos deja a los invitados con hambre. Esta calculadora te dice los kilos exactos de carne, embutidos y despieces (chorizo, morcilla, butifarra) según el número de comensales, el tipo de evento y si hay aperitivo previo.",
    "yes": [
      "**Regla de la barbacoa española: 500 g de carne por adulto.** Con embutido y picoteo de entrada, puedes bajar a 400 g. Para una barbacoa larga con mucho aperitivo previo: 350 g."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-24.",
    "answer": "La pregunta eterna del que enciende la barbacoa en España: ¿cuánta carne compro? Comprar de más es dinero tirado, comprar de menos deja a los invitados con hambre. Esta calculadora te dice los kilos exactos de carne, embutidos y despieces (chorizo, morcilla, butifarra) según el número de comensales, el tipo de evento y si hay aperitivo previo."
  },
  {
    "id": "c3",
    "label": "Calculadora de maratón de serie — cuánto tardas en verla entera",
    "hint": "Basta multiplicar episodios por minutos y dividir entre 60: La Casa de Papel (41 × 50 min) sale a 34,2 horas, unos 17 días a dos horas diarias.",
    "yes": [
      "**Duración del maratón (h) = episodios × minutos ÷ 60** — ver La Casa de Papel completa lleva **34,2 horas**: tres fines de semana intensivos o medio mes a ritmo de dos capítulos por noche."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-04-16.",
    "answer": "Basta multiplicar episodios por minutos y dividir entre 60: La Casa de Papel (41 × 50 min) sale a 34,2 horas, unos 17 días a dos horas diarias."
  },
  {
    "id": "c4",
    "label": "Calculadora de propinas en España: cuánto dejar y cuánto pone cada uno",
    "hint": "Propina = Total de la cuenta × (% ÷ 100). Por persona = (Cuenta + Propina) ÷ Personas. En España la propina es **opcional**: se redondea o se deja un 5-10 % solo si el servicio fue muy bueno. Ejemplo: cuenta de **50 € al 5 % entre 2** → propina 2,50 €, total 52,50 €, **26 € cada uno**.",
    "yes": [
      "**Propina = Cuenta × (% / 100). Total con propina = Cuenta + Propina. Por persona = Total con propina / Personas.** En España la propina es opcional: redondear o dejar un 5-10 % si el servicio fue muy bueno. Pon 1 persona si dejas la propina tú solo."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-12.",
    "answer": "Propina = Total de la cuenta × (% ÷ 100). Por persona = (Cuenta + Propina) ÷ Personas. En España la propina es **opcional**: se redondea o se deja un 5-10 % solo si el servicio fue muy bueno. Ejemplo: cuenta de **50 € al 5 % entre 2** → propina 2,50 €, total 52,50 €, **26 € cada uno**."
  },
  {
    "id": "c5",
    "label": "Calculadora para dividir gastos entre amigos — España",
    "hint": "Dividir gastos entre amigos parece sencillo, pero cuando cada uno ha pagado cosas distintas se complica rápido. Esta calculadora toma el gasto total, el número de personas y cuánto puso cada uno, y te dice quién le debe a quién y cuánto. Ideal para viajes, cenas, alquileres de vacaciones o cualquier gasto compartido.",
    "yes": [
      "**Cada persona debe pagar gasto_total ÷ N personas. Si alguien puso de más, los que pusieron de menos le deben la diferencia.** Así de simple."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-04-15.",
    "answer": "Dividir gastos entre amigos parece sencillo, pero cuando cada uno ha pagado cosas distintas se complica rápido. Esta calculadora toma el gasto total, el número de personas y cuánto puso cada uno, y te dice quién le debe a quién y cuánto. Ideal para viajes, cenas, alquileres de vacaciones o cualquier gasto compartido."
  },
  {
    "id": "c6",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — España",
    "hint": "1 taza de harina de trigo equivale a 120 g. 1 taza de azúcar blanco = 200 g; azúcar moreno compacto = 220 g; mantequilla = 227 g; cacao en polvo = 85 g; miel = 340 g. Para convertir tazas a gramos, multiplica el número de tazas por los gramos por taza del ingrediente. Para la conversión inversa (gramos a tazas), divide los gramos entre el factor del ingrediente.",
    "yes": [
      "1 taza de harina pesa 120 g, mientras que 1 taza de azúcar blanco pesa 200 g y 1 taza de mantequilla 227 g — la diferencia supera el 89% entre ingredientes."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-04-28.",
    "answer": "1 taza de harina de trigo equivale a 120 g. 1 taza de azúcar blanco = 200 g; azúcar moreno compacto = 220 g; mantequilla = 227 g; cacao en polvo = 85 g; miel = 340 g. Para convertir tazas a gramos, multiplica el número de tazas por los gramos por taza del ingrediente. Para la conversión inversa (gramos a tazas), divide los gramos entre el factor del ingrediente."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__personas",
    "label": "Calculadora de bebidas para evento o fiesta — España: Número de personas",
    "type": "number",
    "value": 30,
    "min": 1,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__duracionHoras",
    "label": "Calculadora de bebidas para evento o fiesta — España: Duración del evento",
    "type": "number",
    "value": 5,
    "suffix": "horas",
    "min": 1,
    "max": 12,
    "step": 0.5,
    "thousands": false,
    "help": "Número de horas."
  },
  {
    "id": "c1__tipoBebida",
    "label": "Calculadora de bebidas para evento o fiesta — España: Tipo principal de bebida",
    "type": "select",
    "value": "mixto",
    "options": [
      {
        "value": "cerveza",
        "label": "Cerveza (mayormente)"
      },
      {
        "value": "vino",
        "label": "Vino (mayormente)"
      },
      {
        "value": "mixto",
        "label": "Mixto (cerveza + vino + combinados)"
      },
      {
        "value": "sin_alcohol",
        "label": "Solo sin alcohol"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__temporada",
    "label": "Calculadora de bebidas para evento o fiesta — España: Temporada",
    "type": "select",
    "value": "intermedia",
    "options": [
      {
        "value": "verano",
        "label": "Verano (se bebe más)"
      },
      {
        "value": "invierno",
        "label": "Invierno (se bebe menos)"
      },
      {
        "value": "intermedia",
        "label": "Primavera/Otoño"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__adultos",
    "label": "Calculadora de carne para barbacoa por persona — España: Número de adultos",
    "type": "number",
    "value": 10,
    "min": 1,
    "step": 1,
    "thousands": false,
    "help": "Número de adultos que van a comer."
  },
  {
    "id": "c2__menores",
    "label": "Calculadora de carne para barbacoa por persona — España: Número de menores (hasta 12 años)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Número de niños de hasta 12 años."
  },
  {
    "id": "c2__tipoEvento",
    "label": "Calculadora de carne para barbacoa por persona — España: Tipo de evento",
    "type": "select",
    "value": "almuerzo",
    "options": [
      {
        "value": "almuerzo",
        "label": "Comida de mediodía (estándar)"
      },
      {
        "value": "cena",
        "label": "Cena (se come un poco menos)"
      },
      {
        "value": "evento_largo",
        "label": "Evento largo (cumpleaños, verbena, fiesta)"
      }
    ],
    "thousands": false,
    "help": "El tipo de reunión afecta a cuánta carne se consume por persona."
  },
  {
    "id": "c2__hayEntrada",
    "label": "Calculadora de carne para barbacoa por persona — España: ¿Hay aperitivo o picoteo antes?",
    "type": "select",
    "value": "no",
    "options": [
      {
        "value": "no",
        "label": "No, directo a la barbacoa"
      },
      {
        "value": "si",
        "label": "Sí, aperitivo / tabla de embutidos / picoteo"
      }
    ],
    "thousands": false,
    "help": "Si hay picoteo previo, la gente come menos carne principal."
  },
  {
    "id": "c2__incluirAchuras",
    "label": "Calculadora de carne para barbacoa por persona — España: ¿Incluir embutidos y despieces?",
    "type": "select",
    "value": "si",
    "options": [
      {
        "value": "si",
        "label": "Sí (chorizo, butifarra, morcilla, panceta)"
      },
      {
        "value": "no",
        "label": "No, solo carne"
      }
    ],
    "thousands": false,
    "help": "¿Quieres incluir chorizo, butifarra, morcilla y despiece en el cálculo?"
  },
  {
    "id": "c3__episodios",
    "label": "Calculadora de maratón de serie — cuánto tardas en verla entera: Total de episodios",
    "type": "number",
    "value": 41,
    "min": 1,
    "max": 10000,
    "step": 1,
    "thousands": false,
    "help": "Total de episodios."
  },
  {
    "id": "c3__duracionMin",
    "label": "Calculadora de maratón de serie — cuánto tardas en verla entera: Duración media por episodio (minutos)",
    "type": "number",
    "value": 50,
    "suffix": " min",
    "min": 1,
    "max": 300,
    "step": 1,
    "thousands": false,
    "help": "Duración media por episodio (minutos)."
  },
  {
    "id": "c3__horasDia",
    "label": "Calculadora de maratón de serie — cuánto tardas en verla entera: Horas al día para ver",
    "type": "number",
    "value": 4,
    "min": 0.5,
    "max": 16,
    "step": 0.5,
    "thousands": false,
    "help": "Número de horas."
  },
  {
    "id": "c4__totalCuenta",
    "label": "Calculadora de propinas en España: cuánto dejar y cuánto pone cada uno: Total de la cuenta",
    "type": "number",
    "value": 50,
    "prefix": "€",
    "min": 1,
    "max": 1000000,
    "step": 1,
    "thousands": false,
    "help": "El total de la cuenta, con IVA incluido."
  },
  {
    "id": "c4__propinaPct",
    "label": "Calculadora de propinas en España: cuánto dejar y cuánto pone cada uno: Propina (%)",
    "type": "number",
    "value": 5,
    "min": 0,
    "max": 100,
    "step": 1,
    "thousands": false,
    "help": "Opcional en España: 0 % es normal; 5-10 % si el servicio fue muy bueno."
  },
  {
    "id": "c4__personas",
    "label": "Calculadora de propinas en España: cuánto dejar y cuánto pone cada uno: Número de personas",
    "type": "number",
    "value": 1,
    "min": 1,
    "max": 100,
    "step": 1,
    "thousands": false,
    "help": "Pon 1 si la propina la dejas tú solo."
  },
  {
    "id": "c4__redondeo",
    "label": "Calculadora de propinas en España: cuánto dejar y cuánto pone cada uno: Redondear la parte de cada uno",
    "type": "select",
    "value": "no",
    "options": [
      {
        "value": "no",
        "label": "Sin redondeo"
      },
      {
        "value": "1",
        "label": "A 1 €"
      },
      {
        "value": "5",
        "label": "A 5 €"
      },
      {
        "value": "10",
        "label": "A 10 €"
      }
    ],
    "thousands": false,
    "help": "Redondea hacia arriba lo que pone cada uno. El sobrante suma como propina."
  },
  {
    "id": "c5__gastoTotal",
    "label": "Calculadora para dividir gastos entre amigos — España: Gasto total del grupo",
    "type": "number",
    "value": 325,
    "prefix": "€",
    "min": 1,
    "step": 1,
    "thousands": false,
    "help": "Suma de todo lo que se ha gastado entre todos, en euros."
  },
  {
    "id": "c5__cantidadPersonas",
    "label": "Calculadora para dividir gastos entre amigos — España: Número de personas",
    "type": "number",
    "value": 5,
    "min": 2,
    "max": 50,
    "step": 1,
    "thousands": false,
    "help": "Cuántas personas comparten el gasto."
  },
  {
    "id": "c5__montoPagadoPorUno",
    "label": "Calculadora para dividir gastos entre amigos — España: Cantidad que pagó una persona (la que pagó más)",
    "type": "number",
    "value": 0,
    "prefix": "€",
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Si alguien pagó más que su parte, introduce cuánto puso."
  },
  {
    "id": "c6__ingredient",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — España: Ingrediente",
    "type": "select",
    "value": "all_purpose_flour",
    "options": [
      {
        "value": "all_purpose_flour",
        "label": "Harina de trigo (todo uso)"
      },
      {
        "value": "whole_wheat_flour",
        "label": "Harina integral"
      },
      {
        "value": "white_sugar",
        "label": "Azúcar blanco"
      },
      {
        "value": "brown_sugar",
        "label": "Azúcar moreno (compacto)"
      },
      {
        "value": "powdered_sugar",
        "label": "Azúcar glas"
      },
      {
        "value": "butter",
        "label": "Mantequilla"
      },
      {
        "value": "vegetable_oil",
        "label": "Aceite (oliva o girasol)"
      },
      {
        "value": "milk",
        "label": "Leche"
      },
      {
        "value": "water",
        "label": "Agua"
      },
      {
        "value": "honey",
        "label": "Miel"
      },
      {
        "value": "cocoa_powder",
        "label": "Cacao en polvo"
      },
      {
        "value": "cornstarch",
        "label": "Maicena (almidón de maíz)"
      },
      {
        "value": "rolled_oats",
        "label": "Copos de avena"
      },
      {
        "value": "rice_white",
        "label": "Arroz blanco (crudo)"
      },
      {
        "value": "salt",
        "label": "Sal"
      },
      {
        "value": "baking_powder",
        "label": "Levadura química (tipo Royal)"
      },
      {
        "value": "baking_soda",
        "label": "Bicarbonato de sodio"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__quantity",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — España: Cantidad",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c6__from_unit",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — España: Unidad de origen",
    "type": "select",
    "value": "cup",
    "options": [
      {
        "value": "cup",
        "label": "Taza (240 ml)"
      },
      {
        "value": "tablespoon",
        "label": "Cucharada (15 ml)"
      },
      {
        "value": "teaspoon",
        "label": "Cucharadita (5 ml)"
      },
      {
        "value": "gram",
        "label": "Gramos (g)"
      },
      {
        "value": "ounce",
        "label": "Onza (oz)"
      },
      {
        "value": "pound",
        "label": "Libra (lb)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__to_unit",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — España: Unidad de destino",
    "type": "select",
    "value": "gram",
    "options": [
      {
        "value": "cup",
        "label": "Taza (240 ml)"
      },
      {
        "value": "tablespoon",
        "label": "Cucharada (15 ml)"
      },
      {
        "value": "teaspoon",
        "label": "Cucharadita (5 ml)"
      },
      {
        "value": "gram",
        "label": "Gramos (g)"
      },
      {
        "value": "ounce",
        "label": "Onza (oz)"
      },
      {
        "value": "pound",
        "label": "Libra (lb)"
      }
    ],
    "thousands": false
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuánta cerveza necesito para 20 personas?",
    "a": "Para un evento de 4-5 horas: **40-60 litros** (80-120 botellines de 330 ml o 3-4 packs grandes). Si es solo cerveza, apunta al rango alto. Si también hay vino y combinados, al bajo. En verano, con calor y cañas, suma un 20%."
  },
  {
    "q": "¿Cuántas botellas de vino para 10 personas en una comida?",
    "a": "Para una comida de 3-4 horas: **5-8 botellas** de 750 ml. Si es solo vino: 8. Si también hay cerveza u otras bebidas: 4-5. Si vas a hacer sangría o tinto de verano, cuenta 1 botella extra de tinto por cada litro de gaseosa."
  },
  {
    "q": "¿Cuánta ginebra o destilado necesito para una fiesta?",
    "a": "Regla práctica: **1 botella de ginebra o ron (700 ml) cada 6-8 personas** que tomen combinados. Cada botella da ~10 gin-tonics o cubatas. Para 30 personas: 4-5 botellas de destilado + tónica y cola en abundancia. No te olvides del hielo, que se va rápido."
  },
  {
    "q": "¿Cuánto refresco compro?",
    "a": "**1-1,5 litros de refresco/agua por persona** para un evento de 4-5 h. Para 20 personas: 20-30 litros (10-15 botellas de 2 L). Incluye agua mineral además de refresco (cola, naranja, limón), y guarda tónica y gaseosa aparte para los combinados y la sangría."
  },
  {
    "q": "¿Cuánto hielo necesito?",
    "a": "**1-2 bolsas de hielo de 5 kg por cada 10 personas**. En verano, dobla la cantidad. El hielo se derrite rápido, así que es mejor pasarse. Total para 30 personas en verano: 10-12 bolsas. En España, en agosto, el hielo se agota en muchas gasolineras y súper, así que cómpralo con antelación."
  },
  {
    "q": "¿Se bebe más cerveza en verano?",
    "a": "**Sí**, un 20-30% más. El calor dispara el consumo de bebidas frías, cañas, tinto de verano y sangría. En invierno se bebe más vino tinto y menos cerveza. Ajusta las proporciones según la estación."
  },
  {
    "q": "¿Cómo calculo la bebida para una boda?",
    "a": "Una boda de 6-8 horas para 100 personas necesita aproximadamente: **200 L de cerveza**, **60-80 botellas de vino** (más cava para el brindis), **15-20 botellas de destilados** para la barra libre y **100-150 L de refresco/agua**. Consulta con el catering o el restaurante, muchos incluyen barra libre en el menú."
  },
  {
    "q": "¿Cuántas bebidas para un cumpleaños de 30, un afterwork de 15 o una boda de 100?",
    "a": "**Guía completa de bebidas según tipo de evento y número de personas**:\n\n**CUMPLEAÑOS DE 30 PERSONAS (5 horas, mixto, temporada media)**:\n\n| Bebida | Cantidad | Formato de compra | Coste referencial 2026 |\n|---|---|---|---|\n| Cerveza (40% del alcohol) | 36 litros | 3 packs de 24 tercios + litronas | 60 € |\n| Vino tinto/blanco/rosado | 18 botellas (750 ml) | 12 tinto + 4 blanco + 2 rosado | 90 € |\n| Ginebra (para gin-tonic) | 3 botellas (700 ml) | 3 unidades | 45 € |\n| Ron | 1 botella (700 ml) | 1 unidad | 15 € |\n| Cola/naranja (combinados + mesa) | 18 L | 9 botellas de 2 L | 18 € |\n| Tónica (para gin-tonic) | 9 L | 18 botellines de 500 ml | 18 € |\n| Gaseosa (para sangría/tinto verano) | 6 L | 3 botellas de 2 L | 6 € |\n| Agua mineral | 15 L | 8 botellas de 2 L | 8 € |\n| Zumos y sin alcohol | 6 L | varios | 8 € |\n| Hielo | 15 kg | 3 bolsas de 5 kg | 9 € |\n| **Coste total estimado** | — | — | **~277 €** |\n\n**AFTERWORK DE 15 PERSONAS (2-3 horas, tras el trabajo, entre semana)**:\n\n| Bebida | Cantidad | Notas |\n|---|---|---|\n| Cerveza (cañas mayormente) | 12 litros (36 tercios) | Marca de barril: Mahou, Estrella, Cruzcampo |\n| Vino | 4 botellas | 3 tinto + 1 blanco |\n| Vermú (aperitivo) | 1 botella | De grifo o embotellado, con hielo y naranja |\n| Refresco / tónica | 6 L | 3 botellas de 2 L |\n| Agua | 5 L | 3 botellas |\n| Hielo | 5 kg | 1 bolsa |\n| **Coste bebida total** | — | **~90 €** |\n\n*El afterwork español se caracteriza por: muchas cañas, poco vino, vermú de aperitivo y picoteo (bravas, croquetas). Duración corta.*\n\n**BODA DE 100 PERSONAS (8 horas, barra libre, restaurante con barra propia)**:\n\n| Bebida | Cantidad | Formato | Coste referencial |\n|---|---|---|---|\n| Cerveza de barril o tercios | 180-220 L | 6 barriles de 30 L | 500 € |\n| Vino tinto (Rioja/Ribera) | 50 botellas | Cajas de 6 | 350 € |\n| Vino blanco (Rueda/Albariño) | 25 botellas | Cajas de 6 | 175 € |\n| Vino rosado | 15 botellas | Cajas de 6 | 90 € |\n| Cava (brindis) | 25 botellas | Brindis + barra | 200 € |\n| Ginebra premium | 8 botellas | Barra libre | 200 € |\n| Ron | 4 botellas | Cubatas | 80 € |\n| Whisky | 3 botellas | Barra | 90 € |\n| Vodka | 3 botellas | Combinados | 60 € |\n| Cola/naranja/limón (mezclas) | 60 L | Botellas y latas | 60 € |\n| Tónica | 30 L | Botellines | 60 € |\n| Agua mineral | 50 L | Botellas | 30 € |\n| Zumos y sin alcohol | 20 L | Varios | 30 € |\n| Café (cierre del banquete) | 100 tazas | Servicio del restaurante | 100 € |\n| Hielo | 40 kg | Bolsas comerciales | 30 € |\n| **Coste bebida total boda** | — | — | **~2.055 €** |\n\n*Coste por persona en boda: ~20 €/persona solo bebida. Con menú completo, lugar y decoración, la boda de 100 personas ronda 12.000-18.000 €.*\n\n**Comparativa rápida coste bebida por persona**:\n\n| Tipo de evento | €/persona |\n|---|---|\n| Afterwork 15 | ~6 € |\n| Cumpleaños 30 informal | ~9 € |\n| Boda 100 (barra libre) | ~20 € |\n| Comida formal 80 | ~15 € |\n\n**Trucos para optimizar el coste de la bebida**:\n1. **Comprar en cash and carry** (Makro, Costco): -25-30% frente al súper.\n2. **Packs de tercios vs botellín suelto**: -15-20%.\n3. **Vino por caja cerrada** vs botella individual: -10-15%.\n4. **Pedir presupuesto a la bodega** de la zona: muchas hacen descuento por +20 botellas.\n5. **Hielo**: pedir a fábrica de hielo o al bar del pueblo, no en la gasolinera.\n6. **Evitar demasiados destilados**: con ginebra, ron y whisky basta; no hace falta tequila ni cinco marcas."
  },
  {
    "q": "¿Cuántos packs de cerveza, six-packs y litronas se necesitan?",
    "a": "**Cálculo de formatos comerciales según el número de invitados**. Es clave saber convertir litros a formatos comprables:\n\n**Equivalencias de formatos de cerveza en España 2026**:\n\n| Formato | Contenido | Rinde | Precio referencial (Mahou/Cruzcampo/Estrella) |\n|---|---|---|---|\n| Botellín / tercio 330 ml | 330 ml | 1 caña larga | 0,50-0,80 € c/u |\n| Lata 330 ml | 330 ml | 1 caña | 0,50-0,70 € c/u |\n| Lata 500 ml | 500 ml | 1 tanque | 0,80-1,10 € c/u |\n| Litrona (botella 1 L) | 1.000 ml | 2-3 cañas | 1,20-1,80 € c/u |\n| **Pack 6 tercios** | 1,98 L | ~5 personas/hora | 3,00-4,80 € |\n| **Pack 12 latas 330 ml** | 3,96 L | ~10 personas/hora | 6,00-9,00 € |\n| **Pack 24 tercios (caja)** | 7,92 L | ~16 personas/hora | 12-18 € |\n| **Barril 5 L (con grifo casero)** | 5 L | ~10 cañas | 12-16 € |\n| **Barril 30 L (con tirador)** | 30 L | ~65 cañas / 65 personas | 55-75 € (grifo aparte) |\n| **Barril 50 L (hostelería)** | 50 L | ~110 cañas / 110 personas | 90-130 € (alquiler tirador +40 €) |\n\n**Cómo elegir formato según cantidad**:\n\n| Personas | Recomendación | Detalle |\n|---|---|---|\n| **5-10 personas** | Packs de tercios o latas | Fácil de servir, sin equipo |\n| **10-20 personas** | 1-2 cajas de 24 tercios | Mejor relación cantidad/precio |\n| **20-30 personas** | 2-3 cajas + litronas | Variedad y cantidad |\n| **30-50 personas** | 4-5 cajas + 1 barril de 30 L | Combinar formatos |\n| **50-80 personas** | 1 barril de 30 L + cajas | El barril sale a cuenta |\n| **80-120 personas** | 2 barriles de 30 L + cajas | Tirador de barril ya rentable |\n| **120+ personas** | 3-4 barriles de 30/50 L | Solo barril por coste y logística |\n\n**Cálculos prácticos (1 tercio de 330 ml por persona y hora de media)**:\n\n**Cumpleaños de 30 personas, 5 horas**:\n- Cerveza necesaria: 30 × 5 × 0,4 (40% del consumo) × 0,33 L ≈ **20 L cerveza** (perfil mixto) o hasta 36 L si es cervecero.\n- Conversión: 36 L ≈ 5 cajas de 24 tercios.\n- **Coste aproximado**: 60-90 €.\n\n**Boda de 100 personas, 8 horas**:\n- Cerveza necesaria: 100 × 8 × 0,3 (proporción boda, más vino) × 0,33 L ≈ **80-240 L** según perfil.\n- **Opción A**: 8 barriles de 30 L = 240 L. Más práctico, menos residuos, requiere tirador. Coste: 440-600 € + alquiler tirador.\n- **Opción B**: 30 cajas de 24 tercios = 237 L. Más envases que tirar. Coste: 360-540 €.\n- **Opción híbrida recomendada**: 3 barriles de 30 L (90 L) + 15 cajas de tercios (119 L) = 209 L. Variedad y buena presentación.\n\n**Comida familiar de 12 personas, 4 horas**:\n- Cerveza: 12 × 4 × 0,4 × 0,33 ≈ **6-19 L** según perfil.\n- **Opción correcta**: 2 cajas de 24 tercios (16 L) + 2 litronas (2 L) = 18 L. **+10% de margen**.\n- **Coste**: ~28-40 €.\n\n**Consejos importantes**:\n\n1. **Envase retornable**: en algunos pueblos la caja de tercios con casco retornable sale más barata, pero hay que devolver los envases al bar o supermercado.\n\n2. **Refrigeración**: la cerveza fría se bebe con más gusto. 1 caja necesita ~6 horas en la nevera. Si no tienes espacio, usa **bolsas de hielo en una bañera o barreño**: 5 kg de hielo enfrían 1 caja en 30 min.\n\n3. **Barril vs tercios**: el barril es más eficiente para >50 personas, pero necesita tirador, CO2 y presión correcta. El alquiler del tirador ronda 40-60 €/día (muchas distribuidoras lo incluyen gratis si compras 3+ barriles).\n\n4. **Marca común vs premium**: para bodas, mejor 80% marca habitual (Mahou, Estrella, Cruzcampo) + 20% premium o artesana para variar sin disparar el coste.\n\n5. **Cerveza artesana**: 30-50% más cara que la comercial. Para eventos especiales, 1 barril de IPA o tostada es un buen añadido de calidad.\n\n6. **Mermas**: cuenta un -5% de pérdida por espuma, vasos al suelo y restos. Si calculaste 60 L, compra 63 L."
  },
  {
    "q": "¿Cuánta carne necesito para una barbacoa de 10 personas en España?",
    "a": "Entre **4 y 5 kg de carne** (400-500 g por persona). Si hay aperitivo o tabla de embutidos antes, con 4 kg llega. Si es solo barbacoa, compra 5 kg. Súmale 1 kg de panceta/secreto ibérico y 10 chorizos o butifarras."
  },
  {
    "q": "¿500 gramos por persona es con hueso o sin hueso?",
    "a": "**Con hueso**. El chuletón y el costillar tienen ~30% de hueso, así que los 500 g incluyen esa merma. Si usas solo piezas sin hueso (secreto ibérico, solomillo, entraña), puedes bajar a 350-400 g."
  },
  {
    "q": "¿Cuántos chorizos y butifarras compro para una barbacoa?",
    "a": "**1 chorizo (o butifarra) por adulto** como regla general. Para 10 personas: 10 unidades. Si quieres que sobre para el bocadillo del día siguiente, compra 12-15. Las morcillas: 1 cada 2 adultos, porque no a todos les gustan."
  }
],
  sources: [
  {
    "name": "Ministerio de Salud — Guías Alimentarias para la Población Argentina",
    "url": "https://www.argentina.gob.ar/salud/alimentacion-saludable"
  },
  {
    "name": "Organización Mundial de la Salud — Recomendaciones sobre actividad física, sedentarismo y sueño",
    "url": "https://www.who.int/es/news-room/fact-sheets/detail/physical-activity",
    "publisher": "Organización Mundial de la Salud"
  },
  {
    "name": "CNMC — Panel de hogares (consumo de plataformas de streaming en España)",
    "url": "https://www.cnmc.es/",
    "publisher": "Comisión Nacional de los Mercados y la Competencia"
  },
  {
    "url": "https://www.infobae.com/espana/2026/07/14/el-detalle-en-el-que-debes-fijarte-al-pedir-en-un-restaurante-este-verano-y-que-es-ilegal-segun-la-ocu/",
    "name": "La propina es opcional en España y ningún local puede imponerla, según la OCU",
    "publisher": "Infobae (con datos de la OCU)"
  },
  {
    "url": "https://n26.com/es-es/blog/propinas-espana",
    "name": "Propina en España: cómo funciona y si es obligatoria",
    "publisher": "N26"
  },
  {
    "name": "Autoridad Bancaria Europea — consumidores",
    "url": "https://www.eba.europa.eu/activities/information-consumers"
  },
  {
    "name": "USDA — Ingredient Weight Chart (tabla de densidades de ingredientes alimenticios)",
    "url": "https://fdc.nal.usda.gov/food-search",
    "publisher": "United States Department of Agriculture",
    "date": "2024"
  },
  {
    "name": "King Arthur Baking — Ingredient Weight Chart",
    "url": "https://www.kingarthurbaking.com/learn/ingredient-weight-chart",
    "publisher": "King Arthur Baking Company",
    "date": "2025"
  },
  {
    "name": "AESAN — Agencia Española de Seguridad Alimentaria y Nutrición",
    "url": "https://www.aesan.gob.es/",
    "publisher": "Ministerio de Sanidad (Gobierno de España)",
    "date": "2025"
  },
  {
    "name": "CEM — Centro Español de Metrología (unidades de medida)",
    "url": "https://www.cem.es/",
    "publisher": "Centro Español de Metrología",
    "date": "2025"
  }
],
  replaces: [
    '/es/calculadora-bebidas-por-invitado-evento-espana', // Absorbida como caso calculable con formulaId bebidas-evento-litros-por-persona.
    '/es/calculadora-carne-asado-kg-por-persona-espana', // Absorbida como caso calculable con formulaId carne-asado-kg-por-persona.
    '/es/calculadora-cuanto-tarda-ver-serie-espana', // Absorbida como caso calculable con formulaId maraton-serie-tiempo.
    '/es/calculadora-de-propinas-espana', // Absorbida como caso calculable con formulaId propinas-completa.
    '/es/calculadora-dividir-gastos-cuenta-amigos-espana', // Absorbida como caso calculable con formulaId split-gastos-grupo-amigos.
    '/es/conversor-tazas-a-gramos-cocina-espana', // Absorbida como caso calculable con formulaId conversion-medidas-cocina-tazas-gramos.
  ],
  lastReviewed: '2026-08-16',
};
