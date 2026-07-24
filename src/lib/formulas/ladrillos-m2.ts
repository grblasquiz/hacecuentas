/** Ladrillos por m²: pared simple, pared doble */
export interface Inputs {
  m2: number;
  tipo?: string;
  desperdicio?: number;
}
export interface Outputs {
  ladrillos: number;
  ladrillosPorM2: number;
  mortero: number;
  desperdicio: number;
  tipo: string;
  _insight?: any;
  _chart?: any;
}

const TIPOS: Record<string, { nombre: string; porM2: number; morteroM3: number }> = {
  comun: { nombre: 'Ladrillo común 24×12×6 cm', porM2: 63, morteroM3: 0.04 },
  hueco_12: { nombre: 'Ladrillo hueco 18×12×33 cm (pared 12)', porM2: 16, morteroM3: 0.025 },
  hueco_18: { nombre: 'Ladrillo hueco 18×18×33 cm (pared 18)', porM2: 16, morteroM3: 0.03 },
  hueco_8: { nombre: 'Ladrillo hueco 8×18×33 cm (tabique)', porM2: 16, morteroM3: 0.02 },
  visto: { nombre: 'Ladrillo visto 24×11×5 cm', porM2: 72, morteroM3: 0.03 },
  bloque: { nombre: 'Bloque hormigón 19×19×39 cm', porM2: 12.5, morteroM3: 0.03 },
};

export function ladrillosM2(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  const tipo = String(i.tipo || 'comun');
  const desperdRaw = Number(i.desperdicio);
  const desperd = Number.isFinite(desperdRaw) ? desperdRaw : 10;
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m² de pared');
  if (!TIPOS[tipo]) throw new Error('Tipo de ladrillo no válido');

  const t = TIPOS[tipo];
  const base = m2 * t.porM2;
  const conDesp = base * (1 + desperd / 100);
  const mortero = m2 * t.morteroM3;

  const totalLadrillos = Math.ceil(conDesp);
  const netos = Math.ceil(base);
  const extraDesp = Math.max(0, totalLadrillos - netos);

  return {
    ladrillos: totalLadrillos,
    ladrillosPorM2: t.porM2,
    mortero: Number(mortero.toFixed(3)),
    desperdicio: desperd,
    tipo: t.nombre,
    _insight: {
      title: 'Cuántos comprar',
      text: `Para **${m2} m²** de pared con ${t.nombre.toLowerCase()} necesitás **${totalLadrillos} ladrillos** (${netos} netos + ${extraDesp} por el ${desperd}% de desperdicio) y ~**${mortero.toFixed(2)} m³** de mortero. Comprá por unidad cerrada de pallet para no quedarte corto.`,
      tone: 'neutral',
      icon: '🧱',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Ladrillos netos', value: netos },
        { label: `Desperdicio (${desperd}%)`, value: extraDesp },
      ],
      prefix: '',
      centerValue: String(totalLadrillos),
      centerLabel: 'ladrillos',
      ariaLabel: `Total ${totalLadrillos} ladrillos: ${netos} netos más ${extraDesp} de desperdicio`,
    },
  };
}
