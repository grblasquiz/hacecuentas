/** Tiempo de biodegradación según tipo de material */
export interface Inputs { cantidadUnidades: number; tipoMaterial: number; pesoUnitarioKg: number; }
export interface Outputs { tiempoDegradacionAnios: number; nombreMaterial: string; pesoTotalKg: number; detalle: string; }

const MATERIALES: Record<number, { nombre: string; anios: number }> = {
  1: { nombre: 'Papel', anios: 0.4 },
  2: { nombre: 'Cartón', anios: 1 },
  3: { nombre: 'Residuo orgánico', anios: 0.4 },
  4: { nombre: 'Lata de aluminio', anios: 200 },
  5: { nombre: 'Lata de acero', anios: 100 },
  6: { nombre: 'Plástico PET', anios: 450 },
  7: { nombre: 'Bolsa plástica', anios: 150 },
  8: { nombre: 'Vidrio', anios: 4000 },
};

export function biodegradacionTiempoMateriales(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadUnidades);
  const tipo = Number(i.tipoMaterial);
  const pesoUnit = Number(i.pesoUnitarioKg);

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de unidades');
  if (!MATERIALES[tipo]) throw new Error('Tipo de material inválido. Usá 1-8: 1=Papel 2=Cartón 3=Orgánico 4=Aluminio 5=Acero 6=PET 7=Bolsa plástica 8=Vidrio');
  if (!pesoUnit || pesoUnit <= 0) throw new Error('Ingresá el peso por unidad');

  const mat = MATERIALES[tipo];
  const pesoTotal = cantidad * pesoUnit;
  const anioFuturo = 2026 + mat.anios;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let tiempoTexto: string;
  if (mat.anios < 1) {
    tiempoTexto = `${Math.round(mat.anios * 12)} meses`;
  } else {
    tiempoTexto = `${fmt.format(mat.anios)} años`;
  }

  return {
    tiempoDegradacionAnios: mat.anios,
    nombreMaterial: mat.nombre,
    pesoTotalKg: Number(pesoTotal.toFixed(3)),
    detalle: `${cantidad} unidades de ${mat.nombre} (${fmt.format(pesoTotal)} kg total). Tiempo de degradación: ${tiempoTexto}. Si lo tirás hoy, recién se degrada alrededor del año ${fmt.format(anioFuturo)}.`,
  };
}
