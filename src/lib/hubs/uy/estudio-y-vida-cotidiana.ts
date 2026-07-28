import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'uy/trabajo/estudio-y-vida-cotidiana',
  title: "¿Qué resultado necesito para decidir? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: Edad de perro en años humanos según tamaño — Uruguay; Calculadora de promedio de escolaridad — UdelaR (Uruguay).",
  silo: "Vida cotidiana",
  siloHref: '/uy/trabajo',
  locale: 'uy',
  eyebrow: "Uruguay · Vida cotidiana",
  h1: "¿Qué resultado necesito para decidir?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Edad de perro en años humanos según tamaño — Uruguay",
    "hint": "Un cimarrón uruguayo de 5 años —perro grande, de 25 a 45 kg— equivale a unos 42 años humanos según el método AAHA/AKC, mientras que un caniche toy de la misma edad recién llega a 36.",
    "yes": [
      "En Uruguay un perro grande como el cimarrón es senior desde los 8 años y un caniche recién desde los 10–11; ajustar los controles veterinarios a esa diferencia alarga la vida de la mascota."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-06-04.",
    "answer": "Un cimarrón uruguayo de 5 años —perro grande, de 25 a 45 kg— equivale a unos 42 años humanos según el método AAHA/AKC, mientras que un caniche toy de la misma edad recién llega a 36."
  },
  {
    "id": "c2",
    "label": "Calculadora de promedio de escolaridad — UdelaR (Uruguay)",
    "hint": "El promedio de escolaridad UdelaR pondera por créditos tus actividades aprobadas: Σ(nota × créditos) ÷ Σ créditos, en la escala 0 a 12. Ej.: notas 10, 8, 12, 6 y créditos 12, 8, 10, 6 → 9,44 (Muy bueno).",
    "yes": [
      "La **escolaridad UdelaR** es el promedio **ponderado por créditos** de las actividades **aprobadas** (nota ≥ 3): **Σ(nota × créditos) ÷ Σ créditos**, en la **escala 0 a 12**. Las materias de más créditos pesan más. Sirve para becas del **Fondo de Solidaridad** y requisitos académicos."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "El promedio de escolaridad UdelaR pondera por créditos tus actividades aprobadas: Σ(nota × créditos) ÷ Σ créditos, en la escala 0 a 12. Ej.: notas 10, 8, 12, 6 y créditos 12, 8, 10, 6 → 9,44 (Muy bueno)."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__v1",
    "label": "Edad de perro en años humanos según tamaño — Uruguay: Edad del perro",
    "type": "number",
    "value": 5,
    "min": 0,
    "max": 25,
    "step": 0.5,
    "thousands": false,
    "help": "Podés ingresar medios años (ej: 1.5 para 18 meses)"
  },
  {
    "id": "c1__v2",
    "label": "Edad de perro en años humanos según tamaño — Uruguay: Tamaño del perro",
    "type": "select",
    "value": "mediano",
    "options": [
      {
        "value": "pequeno",
        "label": "Pequeño / Toy — menos de 10 kg (Caniche, Yorkshire, Chihuahua)"
      },
      {
        "value": "mediano",
        "label": "Mediano — 10 a 25 kg (Cimarrón chico, Beagle, Cocker Spaniel)"
      },
      {
        "value": "grande",
        "label": "Grande — 25 a 45 kg (Labrador, Ovejero alemán, Cimarrón Uruguayo)"
      },
      {
        "value": "gigante",
        "label": "Gigante — más de 45 kg (Gran Danés, San Bernardo, Rottweiler)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__notas",
    "label": "Calculadora de promedio de escolaridad — UdelaR (Uruguay): Notas (separadas por coma)",
    "type": "text",
    "value": 108126,
    "thousands": false,
    "help": "Notas en la escala UdelaR 0 a 12, en el mismo orden que los créditos. Solo cuentan las aprobadas (≥ 3)."
  },
  {
    "id": "c2__creditos",
    "label": "Calculadora de promedio de escolaridad — UdelaR (Uruguay): Créditos por actividad (separados por coma)",
    "type": "text",
    "value": 128106,
    "thousands": false,
    "help": "Los créditos de cada actividad, en el mismo orden que las notas."
  },
  {
    "id": "c2__modo",
    "label": "Calculadora de promedio de escolaridad — UdelaR (Uruguay): ¿Qué querés calcular?",
    "type": "select",
    "value": "promedio",
    "options": [
      {
        "value": "promedio",
        "label": "Mi promedio de escolaridad"
      },
      {
        "value": "que-necesito",
        "label": "¿Qué nota necesito para un objetivo?"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__objetivoPromedio",
    "label": "Calculadora de promedio de escolaridad — UdelaR (Uruguay): Objetivo de promedio (0 a 12)",
    "type": "number",
    "value": 9,
    "min": 0,
    "max": 12,
    "step": 0.1,
    "thousands": false,
    "help": "Solo para el modo «¿Qué nota necesito?»: el promedio de escolaridad que querés alcanzar."
  },
  {
    "id": "c2__creditosRestantes",
    "label": "Calculadora de promedio de escolaridad — UdelaR (Uruguay): Créditos que te faltan por cursar",
    "type": "number",
    "value": 20,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Solo para el modo «¿Qué nota necesito?»: los créditos de las actividades que todavía te quedan."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Por qué el tamaño del perro afecta cuánto envejece por año?",
    "a": "Los perros de razas grandes y gigantes tienen un metabolismo celular más acelerado y acumulan daño oxidativo más rápidamente. Esto se traduce en una menor esperanza de vida: un Gran Danés promedia 7–8 años, mientras que un Caniche o un Chihuahua puede vivir 15–17 años. Por eso los perros grandes suman más años humanos por cada año calendario."
  },
  {
    "q": "¿La regla de multiplicar por 7 es correcta?",
    "a": "No. Es una simplificación que ignora que el primer año de vida equivale a unos 15 años humanos (un cachorro ya puede reproducirse al año), que el envejecimiento no es lineal y que varía mucho por tamaño. El método AAHA/AKC ajustado por tamaño es más preciso y está respaldado por veterinarios."
  },
  {
    "q": "¿Cuántos años humanos tiene un Cimarrón Uruguayo de 5 años?",
    "a": "El Cimarrón Uruguayo es una raza grande (25–45 kg). Un ejemplar de 5 años equivale a: 24 años humanos (por los dos primeros años) + 3 años × 6 = 18, es decir **42 años humanos**. Está en plena etapa adulta madura. A partir de los 8 años entra en la etapa senior y conviene reforzar los controles veterinarios."
  },
  {
    "q": "¿Mi perro de 2 años ya es un adulto?",
    "a": "Sí, en términos fisiológicos. A los 2 años cualquier perro ya completó la pubertad y equivale a unos 24 años humanos. A partir de ahí entra en la etapa de adulto joven o maduro según las guías AAHA."
  },
  {
    "q": "¿A qué edad mi perro se considera senior?",
    "a": "Depende del tamaño: los perros **gigantes** (> 45 kg) son senior desde los 6 años aproximadamente, los **grandes** (25–45 kg) desde los 8 años, los **medianos** desde los 9 años y los **pequeños** desde los 10–11 años. En la etapa senior se recomienda un control veterinario completo cada 6 meses en lugar de uno anual."
  },
  {
    "q": "¿Existe una fórmula científica más precisa?",
    "a": "Sí. En 2020 investigadores de la UCSD publicaron en *Cell Systems* la fórmula epigenética: años_humanos = 16 × ln(edad_perro) + 31. Es más precisa biológicamente, pero fue calibrada en Labradores y no distingue entre razas pequeñas y gigantes. Para uso práctico cotidiano, el método AAHA ajustado por tamaño que usa esta calculadora es el estándar veterinario más recomendado."
  },
  {
    "q": "¿Cuántos años humanos tiene un cachorro de 6 meses?",
    "a": "Aproximadamente 7–8 años humanos (la mitad de los 15 que equivale el primer año completo). A esa edad el cachorro ya está en pleno desarrollo, similar a un niño de 7–8 años que está creciendo rápidamente."
  }
],
  sources: [
  {
    "name": "AAHA — 2019 Canine Life Stage Guidelines",
    "url": "https://www.aaha.org/resources/life-stage-canine-2019/",
    "publisher": "American Animal Hospital Association"
  },
  {
    "name": "Sociedad de Medicina Veterinaria del Uruguay (SMVU)",
    "url": "https://www.smvu.com.uy/",
    "publisher": "Sociedad de Medicina Veterinaria del Uruguay"
  },
  {
    "name": "Wang T. et al. — Epigenetic dog-human age formula (Cell Systems, 2020)",
    "url": "https://www.cell.com/cell-systems/fulltext/S2405-4712(20)30203-9",
    "publisher": "Cell Systems"
  },
  {
    "name": "UdelaR — Nueva escala de calificaciones",
    "url": "https://udelar.edu.uy/portal/nueva-escala-de-calificaciones/"
  },
  {
    "name": "UdelaR (Gestión) — Nueva escala de calificaciones en la escolaridad de egresados",
    "url": "https://gestion.udelar.edu.uy/noticias/nueva-escala-de-calificaciones-en-la-escolaridad-de-egresados"
  }
],
  replaces: [
    '/uy/calculadora-edad-perro-anos-humanos-uruguay', // Absorbida como caso calculable con formulaId edad-perro-humano-raza-tamano.
    '/uy/calculadora-promedio-escolaridad-udelar-uruguay', // Absorbida como caso calculable con formulaId calculadora-promedio-escolaridad-udelar-uruguay.
  ],
  lastReviewed: '2026-07-28',
};
