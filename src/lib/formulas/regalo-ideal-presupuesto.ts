/** Sugerencias de regalo según presupuesto */
export interface Inputs { presupuesto: number; ocasion?: string; persona?: string; }
export interface Outputs { sugerencias: string; rangoGasto: string; mensaje: string; }

const REGALOS: Record<string, Record<string, string[]>> = {
  bajo: {
    pareja: ['Desayuno sorpresa casero','Carta escrita a mano + playlist','Velas aromáticas artesanales','Chocolate artesanal','Album de fotos impreso'],
    amigo: ['Libro best seller','Taza personalizada','Suculenta con maceta','Alfajores premium','Vela aromática'],
    'mama-papa': ['Planta de interior bonita','Libro de recetas','Chocolate premium','Mate artesanal','Vela decorativa'],
    hermano: ['Snack box sorpresa','Libro o comic','Medias divertidas','Taza geek','Chocolate'],
    'compañero': ['Chocolate artesanal','Planta chica','Alfajores','Taza original','Librería de bolsillo']
  },
  medio: {
    pareja: ['Perfume nacional premium','Cena romántica para 2','Curso online juntos','Set skincare','Escapada de un día'],
    amigo: ['Experiencia gastronómica','Ropa de marca local','Auriculares wireless','Botella de vino premium','Clase de cocina'],
    'mama-papa': ['Mate premium con bombilla','Set de spa en casa','Experiencia gastronómica','Electrodoméstico chico','Ropa de marca'],
    hermano: ['Juego de mesa premium','Ropa/zapatillas','Auriculares','Gift card gaming','Experiencia deportiva'],
    'compañero': ['Set de vinos','Gift card gastronómica','Agenda premium','Set de café especial','Experiencia']
  },
  alto: {
    pareja: ['Perfume importado','Fin de semana escapada','Spa para 2','Joya','Tecnología (auriculares premium)'],
    amigo: ['Tecnología','Set de vinos colección','Experiencia premium','Ropa importada','Reloj'],
    'mama-papa': ['Electrodoméstico premium','Escapada fin de semana','Joya','Tecnología','Tratamiento spa'],
    hermano: ['Consola/juego','Zapatillas premium','Gadget tech','Experiencia deportiva VIP','Ropa importada'],
    'compañero': ['Gift card premium','Set ejecutivo','Tecnología','Experiencia VIP','Vino colección']
  },
  premium: {
    pareja: ['Viaje fin de semana largo','Joya de diseñador','Smartwatch','Experiencia VIP','Set tech completo'],
    amigo: ['Viaje','Tecnología premium','Experiencia VIP (recital)','Set coleccionista','Reloj de marca'],
    'mama-papa': ['Viaje para 2','Smart TV','Electrodoméstico top','Joya','Experiencia de lujo'],
    hermano: ['Consola nueva','Viaje','Tech premium','Experiencia VIP','Ropa de marca internacional'],
    'compañero': ['Tech premium','Gift card alto valor','Set ejecutivo premium','Experiencia exclusiva','Viaje']
  }
};

export function regaloIdealPresupuesto(i: Inputs): Outputs {
  const p = Number(i.presupuesto);
  if (!p || p < 5000) throw new Error('Ingresá un presupuesto (mínimo $5.000)');
  const ocasion = String(i.ocasion || 'cumpleanos');
  const persona = String(i.persona || 'pareja');

  const rango = p < 15000 ? 'bajo' : p < 50000 ? 'medio' : p < 150000 ? 'alto' : 'premium';
  const rangoLabels: Record<string,string> = { bajo:'Hasta $15.000', medio:'$15.000 - $50.000', alto:'$50.000 - $150.000', premium:'Más de $150.000' };

  const ideas = REGALOS[rango]?.[persona] || REGALOS[rango]?.pareja || ['Experiencia','Gift card'];
  const sugerencias = ideas.map((r, i) => `${i+1}. ${r}`).join('\n');

  const tips: Record<string,string> = {
    cumpleanos: 'Para cumpleaños, personalizá el regalo con algo que demuestre que escuchaste sus gustos.',
    aniversario: 'Los aniversarios piden experiencias compartidas: cena, viaje, actividad nueva juntos.',
    navidad: 'En Navidad vale lo grupal: canasta gourmet, juego de mesa para compartir, experiencia familiar.',
    'san-valentin': 'San Valentín: combiná algo material + experiencia. Perfume + cena > solo perfume.',
    'dia-madre-padre': 'Mamá/papá valoran el tiempo compartido. Sumá un almuerzo juntos al regalo.',
    'sin-motivo': 'Los regalos sin motivo son los más valorados. Sorprendé cuando menos lo espere.'
  };

  return {
    sugerencias,
    rangoGasto: rangoLabels[rango],
    mensaje: tips[ocasion] || 'Elegí algo que demuestre que pensaste en la persona.'
  };
}
