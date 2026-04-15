/** Huella hídrica de alimentos en litros */
export interface Inputs { tipoAlimento: number; cantidadKg: number; vecesporSemana: number; }
export interface Outputs { litrosPorKg: number; litrosPorConsumo: number; litrosSemana: number; litrosMes: number; detalle: string; }

const ALIMENTOS: Record<number, { nombre: string; litrosKg: number }> = {
  1: { nombre: 'Carne vacuna', litrosKg: 15400 },
  2: { nombre: 'Pollo', litrosKg: 4325 },
  3: { nombre: 'Cerdo', litrosKg: 5988 },
  4: { nombre: 'Arroz', litrosKg: 2500 },
  5: { nombre: 'Trigo (pan)', litrosKg: 1608 },
  6: { nombre: 'Papa', litrosKg: 287 },
  7: { nombre: 'Tomate', litrosKg: 214 },
  8: { nombre: 'Lechuga', litrosKg: 237 },
  9: { nombre: 'Leche (por L)', litrosKg: 1020 },
  10: { nombre: 'Huevos', litrosKg: 3265 },
};

export function huellaHidricaAlimentosLitros(i: Inputs): Outputs {
  const tipo = Number(i.tipoAlimento);
  const kg = Number(i.cantidadKg);
  const veces = Number(i.vecesporSemana);

  if (!ALIMENTOS[tipo]) throw new Error('Tipo inválido. Usá 1-10: 1=Carne vacuna 2=Pollo 3=Cerdo 4=Arroz 5=Trigo 6=Papa 7=Tomate 8=Lechuga 9=Leche 10=Huevos');
  if (!kg || kg <= 0) throw new Error('Ingresá la cantidad en kg');
  if (!veces || veces <= 0) throw new Error('Ingresá las veces por semana');

  const alimento = ALIMENTOS[tipo];
  const litrosPorConsumo = kg * alimento.litrosKg;
  const litrosSemana = litrosPorConsumo * veces;
  const litrosMes = litrosSemana * 4.33;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    litrosPorKg: alimento.litrosKg,
    litrosPorConsumo: Number(litrosPorConsumo.toFixed(0)),
    litrosSemana: Number(litrosSemana.toFixed(0)),
    litrosMes: Number(litrosMes.toFixed(0)),
    detalle: `${alimento.nombre}: ${fmt.format(alimento.litrosKg)} L/kg × ${kg} kg = ${fmt.format(litrosPorConsumo)} L por consumo × ${veces} veces/semana = ${fmt.format(litrosSemana)} L/semana (${fmt.format(litrosMes)} L/mes).`,
  };
}
