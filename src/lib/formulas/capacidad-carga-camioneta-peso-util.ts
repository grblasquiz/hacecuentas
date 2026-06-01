export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function capacidadCargaCamionetaPesoUtil(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p=Number(i.pbt)||0; const t=Number(i.tara)||0;
  const u=p-t;
  const resumen = __lang === 'en'
    ? `GVW ${p} - Tare ${t} = ${u} kg payload.`
    : __lang === 'pt'
    ? `PBT ${p} - Tara ${t} = ${u} kg de carga útil.`
    : `PBT ${p} - Tara ${t} = ${u} kg útiles.`;

  const pctUtil = p > 0 ? Math.round((u / p) * 100) : 0;
  const fmtKg = (n: number) => new Intl.NumberFormat(__lang === 'en' ? 'en-US' : 'es-AR').format(n);
  const tone: 'good' | 'warn' | 'neutral' = u <= 0 ? 'warn' : 'neutral';

  const _insight = {
    title: __lang === 'en' ? 'Usable payload' : __lang === 'pt' ? 'Carga útil disponível' : 'Carga útil disponible',
    text: u <= 0
      ? (__lang === 'en'
          ? `With a tare of **${fmtKg(t)} kg**, the vehicle already maxes out its GVW: there is **no usable payload** left. Check the GVW and tare figures.`
          : __lang === 'pt'
          ? `Com uma tara de **${fmtKg(t)} kg**, o veículo já esgota o PBT: **não sobra carga útil**. Reveja os valores de PBT e tara.`
          : `Con una tara de **${fmtKg(t)} kg**, el vehículo ya satura su PBT: **no queda carga útil**. Revisá los valores de PBT y tara.`)
      : (__lang === 'en'
          ? `You can load up to **${fmtKg(u)} kg** of cargo plus occupants — that is **${pctUtil}%** of the **${fmtKg(p)} kg** GVW. Going over it voids insurance and stresses brakes and suspension.`
          : __lang === 'pt'
          ? `Você pode carregar até **${fmtKg(u)} kg** de carga mais ocupantes — isso é **${pctUtil}%** do PBT de **${fmtKg(p)} kg**. Ultrapassar anula o seguro e força freios e suspensão.`
          : `Podés cargar hasta **${fmtKg(u)} kg** de carga más ocupantes — eso es el **${pctUtil}%** del PBT de **${fmtKg(p)} kg**. Pasarte anula el seguro y exige frenos y suspensión.`),
    tone,
    icon: '🚚',
  };

  const _chart = u > 0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Tare (empty weight)' : __lang === 'pt' ? 'Tara (peso vazio)' : 'Tara (peso en vacío)', value: t },
      { label: __lang === 'en' ? 'Usable payload' : __lang === 'pt' ? 'Carga útil' : 'Carga útil', value: u },
    ],
    suffix: ' kg',
    centerValue: `${fmtKg(p)} kg`,
    centerLabel: __lang === 'en' ? 'GVW' : 'PBT',
    ariaLabel: __lang === 'en'
      ? `GVW ${fmtKg(p)} kg split into tare ${fmtKg(t)} kg and usable payload ${fmtKg(u)} kg.`
      : `PBT ${fmtKg(p)} kg dividido en tara ${fmtKg(t)} kg y carga útil ${fmtKg(u)} kg.`,
  } : undefined;

  const out: Outputs = { util:`${u} kg`, resumen, _insight };
  if (_chart) out._chart = _chart;
  return out;
}
