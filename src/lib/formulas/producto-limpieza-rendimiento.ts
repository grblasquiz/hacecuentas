export interface Inputs { producto: string; m2Superficie: number; vecesXsemana: number; }
export interface Outputs { mlPorUso: number; envasesMes: number; duracionEnvase: string; consejo: string; }
const ML_POR_M2: Record<string, number> = { limpiador: 5, desengrasante: 8, lavandina: 3, limpiavidrios: 10, cera: 15, detergente: 2 };
const CONSEJOS: Record<string, string> = {
  limpiador: 'Diluido en agua rinde 3x más. No mezclar con lavandina.', desengrasante: 'Dejá actuar 5 min antes de pasar el trapo.',
  lavandina: 'Siempre diluida: 10 ml/L para superficies.', limpiavidrios: 'Usá papel de diario arrugado para no dejar marcas.',
  cera: 'Aplicá capa fina y dejá secar antes de lustrar.', detergente: '2-3 gotas por plato. El exceso es desperdicio.',
};
export function productoLimpiezaRendimiento(i: Inputs): Outputs {
  const prod = String(i.producto || 'limpiador'); const m2 = Number(i.m2Superficie); const veces = Number(i.vecesXsemana);
  if (!m2 || !veces) throw new Error('Ingresá superficie y frecuencia');
  const mlM2 = ML_POR_M2[prod] || 5; const mlUso = m2 * mlM2; const mlMes = mlUso * veces * 4.3;
  const envases = mlMes / 1000; const dias = Math.round(1000 / (mlUso * veces / 7));
  return { mlPorUso: Math.round(mlUso), envasesMes: Number(envases.toFixed(1)), duracionEnvase: `~${dias} días`, consejo: CONSEJOS[prod] || 'Usá la dosis recomendada del envase.' };
}