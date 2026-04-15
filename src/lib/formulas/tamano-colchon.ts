/** Tamaño ideal de colchón según personas y altura */
export interface Inputs { cantidadPersonas?: string; alturaMaxima: number; }
export interface Outputs { anchoRecomendado: number; largoRecomendado: number; tamanoNombre: string; detalle: string; }

export function tamanoColchon(i: Inputs): Outputs {
  const personas = Number(i.cantidadPersonas || '2');
  const altura = Number(i.alturaMaxima);

  if (!altura || altura < 100 || altura > 250) throw new Error('Ingresá una altura válida en cm');

  const largoMin = altura + 20;

  // Determinar largo estándar
  const largo = largoMin <= 190 ? 190 : 200;

  // Determinar ancho según personas
  let ancho: number;
  let nombre: string;

  if (personas === 1) {
    if (largo === 200) {
      ancho = 100;
      nombre = '1½ Plaza (100×200)';
    } else {
      ancho = 100;
      nombre = '1½ Plaza (100×190)';
    }
  } else {
    // 2 personas
    if (largo === 200) {
      if (altura >= 180) {
        ancho = 180;
        nombre = 'King (180×200)';
      } else {
        ancho = 160;
        nombre = 'Queen (160×200)';
      }
    } else {
      ancho = 140;
      nombre = '2 Plazas / Queen (140-160×190)';
    }
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    anchoRecomendado: ancho,
    largoRecomendado: largo,
    tamanoNombre: nombre,
    detalle: `Para ${personas} persona${personas > 1 ? 's' : ''} (altura máx ${fmt.format(altura)} cm), el colchón recomendado es **${nombre}** (${ancho}×${largo} cm). Largo mínimo necesario: ${fmt.format(largoMin)} cm.`,
  };
}
