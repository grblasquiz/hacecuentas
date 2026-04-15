/** Calculadora de sustitución de ingredientes de cocina */
export interface Inputs {
  ingredienteOriginal: string;
  cantidad: number;
}
export interface Outputs {
  sustitutoPrincipal: string;
  alternativas: string;
  detalle: string;
}

interface Sustitucion {
  nombre: string;
  factor: number;
  unidad: string;
  nota: string;
}

interface DatoIngrediente {
  unidadOriginal: string;
  principal: Sustitucion;
  alternativas: Sustitucion[];
}

export function sustitucionIngredientesCocina(i: Inputs): Outputs {
  const ingrediente = i.ingredienteOriginal;
  const cantidad = Number(i.cantidad);

  if (!ingrediente) throw new Error('Seleccioná el ingrediente a reemplazar');
  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad');

  const datos: Record<string, DatoIngrediente> = {
    huevo: {
      unidadOriginal: 'huevo(s)',
      principal: { nombre: 'Banana pisada', factor: 65, unidad: 'g', nota: 'Aporta dulzor, ideal para tortas y muffins' },
      alternativas: [
        { nombre: 'Yogur natural', factor: 45, unidad: 'ml (3 cdas)', nota: 'Bueno para pancakes y muffins' },
        { nombre: 'Semilla de lino + agua', factor: 1, unidad: 'cda lino + 3 cdas agua', nota: 'Reposar 5 min. Sin sabor adicional' },
        { nombre: 'Compota de manzana', factor: 60, unidad: 'g', nota: 'Aporta humedad, poco dulzor' },
      ],
    },
    manteca: {
      unidadOriginal: 'g',
      principal: { nombre: 'Aceite neutro', factor: 0.8, unidad: 'ml', nota: 'Más húmedo, menos estructura' },
      alternativas: [
        { nombre: 'Aceite de coco', factor: 1, unidad: 'g', nota: 'Textura similar, sabor a coco' },
        { nombre: 'Palta pisada', factor: 1, unidad: 'g', nota: 'Para brownies, aporta humedad' },
        { nombre: 'Yogur griego', factor: 1, unidad: 'g', nota: 'Reduce grasas, más húmedo' },
      ],
    },
    leche: {
      unidadOriginal: 'ml',
      principal: { nombre: 'Leche de soja', factor: 1, unidad: 'ml', nota: 'La más similar en proteína y textura' },
      alternativas: [
        { nombre: 'Leche de avena', factor: 1, unidad: 'ml', nota: 'Cremosa, buena para cocinar' },
        { nombre: 'Leche de almendras', factor: 1, unidad: 'ml', nota: 'Más liviana, buena para repostería' },
        { nombre: 'Agua + manteca', factor: 1, unidad: 'ml agua + 1 cda manteca', nota: 'Emergencia' },
      ],
    },
    harina_trigo: {
      unidadOriginal: 'g',
      principal: { nombre: 'Harina de arroz', factor: 1, unidad: 'g', nota: 'Sin gluten, textura similar' },
      alternativas: [
        { nombre: 'Harina de avena', factor: 1, unidad: 'g', nota: 'Más densa, con fibra' },
        { nombre: 'Almidón de maíz (maicena)', factor: 0.5, unidad: 'g', nota: 'Solo para espesar, no para masas' },
        { nombre: 'Harina de almendras', factor: 1, unidad: 'g', nota: 'Sin gluten, más grasa' },
      ],
    },
    azucar: {
      unidadOriginal: 'g',
      principal: { nombre: 'Azúcar mascabo', factor: 1, unidad: 'g', nota: 'Más sabor, más humedad' },
      alternativas: [
        { nombre: 'Miel', factor: 0.75, unidad: 'g', nota: 'Reducir líquidos 10-15% en la receta' },
        { nombre: 'Pasta de dátiles', factor: 1, unidad: 'g', nota: 'Natural, con fibra' },
      ],
    },
    crema: {
      unidadOriginal: 'ml',
      principal: { nombre: 'Leche + manteca', factor: 1, unidad: 'ml leche + 1 cda manteca', nota: 'Para cocinar, no para batir' },
      alternativas: [
        { nombre: 'Crema de coco (parte sólida)', factor: 1, unidad: 'ml', nota: 'Se puede batir si está bien fría' },
        { nombre: 'Yogur griego', factor: 1, unidad: 'ml', nota: 'Para salsas y aliños' },
      ],
    },
    levadura_fresca: {
      unidadOriginal: 'g',
      principal: { nombre: 'Levadura seca', factor: 0.33, unidad: 'g', nota: '30 g fresca = 10 g seca' },
      alternativas: [
        { nombre: 'Levadura instantánea', factor: 0.33, unidad: 'g', nota: 'Se agrega directo a la harina' },
      ],
    },
    polvo_hornear: {
      unidadOriginal: 'cdita(s)',
      principal: { nombre: 'Bicarbonato + vinagre/limón', factor: 1, unidad: 'cdita bicarb + 1 cdita ácido', nota: '½ cdita bicarb = 1 cdita polvo de hornear' },
      alternativas: [
        { nombre: 'Claras batidas a nieve', factor: 2, unidad: 'claras por cdita', nota: 'Aportan estructura y volumen' },
      ],
    },
  };

  const dato = datos[ingrediente];
  if (!dato) throw new Error('Ingrediente no encontrado');

  const cantPrincipal = cantidad * dato.principal.factor;
  const principal = `${dato.principal.nombre}: ${cantPrincipal % 1 === 0 ? cantPrincipal : cantPrincipal.toFixed(1)} ${dato.principal.unidad} (${dato.principal.nota})`;

  const alts = dato.alternativas.map(a => {
    const cant = cantidad * a.factor;
    return `${a.nombre}: ${cant % 1 === 0 ? cant : cant.toFixed(1)} ${a.unidad} (${a.nota})`;
  }).join(' | ');

  return {
    sustitutoPrincipal: principal,
    alternativas: alts,
    detalle: `Para reemplazar ${cantidad} ${dato.unidadOriginal} de ${ingrediente.replace('_', ' ')}: mejor opción → ${dato.principal.nombre} (${cantPrincipal % 1 === 0 ? cantPrincipal : cantPrincipal.toFixed(1)} ${dato.principal.unidad}).`,
  };
}
