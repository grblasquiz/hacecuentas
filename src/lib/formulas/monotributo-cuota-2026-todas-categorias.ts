export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function monotributoCuota2026TodasCategorias(i: Inputs): Outputs {
  const c=String(i.categoria||'A');
  // Cuota mensual total — escala ARCA vigente JUNIO 2026 (+14,3%).
  // Validado contra 2 fuentes (Estudio Brady + Ámbito), 2026-06.
  // A-H: servicios. I-J-K: exclusivas de venta de bienes (servicios topea en H).
  const total: Record<string,number> = {
    A:42387, B:48251, C:56502, D:72414, E:102538, F:129045, G:197108, H:447347,
    I:406512, J:497059, K:600880
  };
  // Composición integrado/SIPA/obra social — proporción para el donut ilustrativo.
  // El dato exacto es el total; el desglose se reparte manteniendo proporción.
  const prop: Record<string,[number,number,number]> = {
    A:[7100,20500,15400], B:[13500,22500,15400], C:[23200,24800,15400], D:[38100,27300,15400],
    E:[72300,30000,19200], F:[99400,33000,23200], G:[126400,36300,27900], H:[286700,39900,33600],
    I:[467300,43900,40400], J:[544700,48300,48500], K:[632500,53100,58300]
  };
  const t=total[c]??total.A;
  const [pi,ps,po]=prop[c]||prop.A;
  const psum=pi+ps+po;
  const ig=Math.round(t*pi/psum);
  const sp=Math.round(t*ps/psum);
  const os=t-ig-sp;
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Impuesto integrado', value: ig },
      { label: 'Aportes SIPA', value: sp },
      { label: 'Obra social', value: os },
    ],
    prefix: '$',
    centerValue: '$' + t.toLocaleString('es-AR'),
    centerLabel: 'Cuota/mes',
    ariaLabel: 'Composición de la cuota mensual: impuesto integrado, aportes SIPA y obra social',
  };
  const _insight = {
    title: 'Cómo se compone tu cuota',
    text: `La cuota de la categoría **${c}** es de **$${t.toLocaleString('es-AR')}/mes** (escala ARCA junio 2026) e incluye tres componentes: impuesto integrado, aportes jubilatorios (SIPA) y obra social.`,
    tone: 'neutral',
    icon: '🧾',
  };
  return { cuota:'$'+t.toLocaleString('es-AR'), integrado:'$'+ig.toLocaleString('es-AR'), sipa:'$'+sp.toLocaleString('es-AR'), resumen:`Categoría ${c}: cuota total $${t.toLocaleString('es-AR')}/mes.`, _chart, _insight };
}
