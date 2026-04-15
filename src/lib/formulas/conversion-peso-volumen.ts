/** Conversión peso-volumen para ingredientes de cocina */
export interface Inputs { ingrediente?: string; cantidad: number; unidadOrigen?: string; }
export interface Outputs { resultado: number; unidadDestino: string; detalle: string; }

export function conversionPesoVolumen(i: Inputs): Outputs {
  const ing = String(i.ingrediente || 'harina');
  const cant = Number(i.cantidad);
  const unidad = String(i.unidadOrigen || 'gramos');

  if (!cant || cant <= 0) throw new Error('Ingresá una cantidad válida');

  // Gramos por taza y por cucharada para cada ingrediente
  const datos: Record<string, { taza: number; cda: number; nombre: string }> = {
    harina:   { taza: 125, cda: 8,  nombre: 'Harina 000' },
    azucar:   { taza: 200, cda: 13, nombre: 'Azúcar' },
    manteca:  { taza: 227, cda: 14, nombre: 'Manteca' },
    arroz:    { taza: 185, cda: 12, nombre: 'Arroz' },
    avena:    { taza: 90,  cda: 6,  nombre: 'Avena' },
    leche:    { taza: 245, cda: 15, nombre: 'Leche' },
    aceite:   { taza: 218, cda: 14, nombre: 'Aceite' },
    cacao:    { taza: 85,  cda: 5,  nombre: 'Cacao en polvo' },
    sal:      { taza: 288, cda: 18, nombre: 'Sal fina' },
    maicena:  { taza: 128, cda: 8,  nombre: 'Maicena' },
  };

  const d = datos[ing] || datos.harina;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let resultado: number;
  let unidadDest: string;
  let detalleStr: string;

  if (unidad === 'gramos') {
    const tazas = cant / d.taza;
    const cdas = cant / d.cda;
    resultado = Number(tazas.toFixed(2));
    unidadDest = tazas === 1 ? 'taza' : 'tazas';
    detalleStr = `${fmt.format(cant)} g de ${d.nombre} = ${fmt.format(tazas)} tazas o ${fmt.format(cdas)} cucharadas.`;
  } else if (unidad === 'tazas') {
    const gramos = cant * d.taza;
    resultado = Math.round(gramos);
    unidadDest = 'gramos';
    detalleStr = `${fmt.format(cant)} taza${cant !== 1 ? 's' : ''} de ${d.nombre} = ${fmt.format(gramos)} g o ${fmt.format(cant * 16)} cucharadas.`;
  } else {
    // cucharadas
    const gramos = cant * d.cda;
    resultado = Math.round(gramos);
    unidadDest = 'gramos';
    detalleStr = `${fmt.format(cant)} cucharada${cant !== 1 ? 's' : ''} de ${d.nombre} = ${fmt.format(gramos)} g o ${fmt.format(cant / 16)} tazas.`;
  }

  return { resultado, unidadDestino: unidadDest, detalle: detalleStr };
}
