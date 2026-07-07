// Obra social del monotributo 2026: aporte fijo uniforme por categoría
// (ARCA lo actualiza en enero y julio) + el mismo importe por cada adherente.
// La cuota total por categoría sale del data module compartido (pipeline).
import { cuota, CATEGORIAS, type Cat, type Actividad } from '../data/monotributo-2026';

// Aporte de obra social vigente (desde mayo 2026, ARCA). Cada adherente paga
// este mismo importe. Actualizar junto con la recomposición semestral.
export const APORTE_OS_2026 = 22500;
export const APORTE_OS_VIGENCIA = 'mayo 2026';

export interface Inputs {
  categoria: string;
  actividad: string;
  adherentes: number;
}

export interface Outputs {
  aporteTitular: number;
  aporteAdherentes: number;
  totalObraSocial: number;
  cuotaCategoria: number;
  cuotaConAdherentes: number;
  porcentajeOS: number;
  explicacion: string;
  _chart?: unknown;
}

export function obraSocialMonotributo2026(i: Inputs): Outputs {
  const cat = (String(i.categoria || 'A').toUpperCase() as Cat);
  if (!CATEGORIAS.includes(cat)) throw new Error('Elegí una categoría válida (A a K)');
  const actividad = (i.actividad === 'bienes' ? 'bienes' : 'servicios') as Actividad;
  const adherentes = Math.max(0, Math.min(10, Math.floor(Number(i.adherentes) || 0)));

  const aporteTitular = APORTE_OS_2026;
  const aporteAdherentes = adherentes * APORTE_OS_2026;
  const totalObraSocial = aporteTitular + aporteAdherentes;
  const cuotaCategoria = cuota(cat, actividad);
  const cuotaConAdherentes = cuotaCategoria + aporteAdherentes;
  const porcentajeOS = +(aporteTitular / cuotaCategoria * 100).toFixed(1);

  const fmt = (n: number) => '$ ' + Math.round(n).toLocaleString('es-AR');
  const explicacion =
    `De tu cuota de categoría ${cat} (${fmt(cuotaCategoria)}), ${fmt(aporteTitular)} van a la obra social ` +
    `(${porcentajeOS}% de la cuota). ` +
    (adherentes > 0
      ? `Por tus ${adherentes} adherente${adherentes > 1 ? 's' : ''} sumás ${fmt(aporteAdherentes)} más por mes: ` +
        `la cuota total pasa a ${fmt(cuotaConAdherentes)} y tu cobertura de salud te cuesta ${fmt(totalObraSocial)} mensuales.`
      : `Si sumás cónyuge o hijos como adherentes, cada uno agrega ${fmt(APORTE_OS_2026)} por mes a la cuota.`);

  return {
    aporteTitular,
    aporteAdherentes,
    totalObraSocial,
    cuotaCategoria,
    cuotaConAdherentes,
    porcentajeOS,
    explicacion,
    _chart: {
      type: 'donut',
      title: 'Composición de tu cuota con adherentes',
      items: [
        { label: 'Obra social (titular)', value: aporteTitular },
        { label: 'Adherentes', value: aporteAdherentes },
        { label: 'Resto de la cuota (impuesto + SIPA)', value: Math.max(0, cuotaCategoria - aporteTitular) },
      ],
    },
  };
}
