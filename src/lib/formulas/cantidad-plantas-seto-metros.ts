export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadPlantasSetoMetros(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.metros) || 0;
  const d: Record<string, number> = { tuya: 0.8, liguster: 0.4, bambu: 1 };
  const dist = d[String(i.especie)] || 0.5;
  const n = Math.ceil(m / dist);
  const resumen = __lang === 'en'
    ? `${n} plants of ${i.especie} for ${m} m of hedge (spacing ${dist}m).`
    : `${n} plantas de ${i.especie} para ${m} m de seto (distancia ${dist}m).`;
  const _insight = {
    title: __lang === 'en' ? 'Spacing makes the wall' : 'La distancia arma la pared',
    text: __lang === 'en'
      ? `You need **${n} plants** of ${i.especie} for **${m} m**, spaced **${dist} m** apart. Tighter spacing fills in faster but costs more plants; respect it so the hedge closes evenly.`
      : `Necesitás **${n} plantas** de ${i.especie} para **${m} m**, separadas **${dist} m** entre sí. Plantar más juntas tapa antes pero sale más caro; respetá la distancia para que el seto cierre parejo.`,
    tone: 'neutral',
    icon: '🌿',
  };
  return { cantidad: n.toString(), resumen, _insight };
}
