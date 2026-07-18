/**
 * Conversor TRM oficial USD ↔ COP — Colombia.
 * La TRM (Tasa Representativa del Mercado) la certifica la Superintendencia Financiera cada día hábil.
 * Default en vivo: snapshot del fx-cron diario (src/data/live/colombia.json ← datos.gov.co/d/32sa-8pi3),
 * mismo patrón que tasa-de-cambio-paralelo-colombia-dolar-blue.ts. El usuario puede pisar la tasa.
 */
import coLive from '../../data/live/colombia.json';

export interface Inputs {
  monto: number;
  direccion: 'usd_a_cop' | 'cop_a_usd';
  trm?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; }

const fmtCOP = (n: number) => '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(n));
const fmtUSD = (n: number) => 'USD ' + new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtTRM = (n: number) => '$' + new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto);
  if (!Number.isFinite(monto) || monto <= 0) throw new Error('Ingresa el monto a convertir');

  const trmLive = Number((coLive as any)?.trm?.valor) || 0;
  const trmUsuario = Number(i.trm) || 0;
  const trm = trmUsuario > 0 ? trmUsuario : trmLive;
  if (trm <= 0) throw new Error('Ingresa la TRM del día (COP por USD)');

  const vigencia = trmUsuario > 0 ? null : ((coLive as any)?.trm?.vigenciaDesde?.slice(0, 10) ?? null);
  const esOficial = trmUsuario === 0 || Math.abs(trmUsuario - trmLive) < 0.005;

  const aCop = i.direccion !== 'cop_a_usd';
  const resultado = aCop ? monto * trm : monto / trm;

  const detalle = aCop
    ? `${fmtUSD(monto)} × TRM ${fmtTRM(trm)} = ${fmtCOP(resultado)}`
    : `${fmtCOP(monto)} ÷ TRM ${fmtTRM(trm)} = ${fmtUSD(resultado)}`;

  const _insight = {
    title: aCop ? `${fmtUSD(monto)} son ${fmtCOP(resultado)}` : `${fmtCOP(monto)} son ${fmtUSD(resultado)}`,
    text: `Con la TRM ${esOficial ? 'oficial' : 'que ingresaste'} de **${fmtTRM(trm)} por dólar**${vigencia ? ` (vigente desde el ${vigencia})` : ''}, ${aCop ? `**${fmtUSD(monto)}** equivalen a **${fmtCOP(resultado)}**` : `**${fmtCOP(monto)}** equivalen a **${fmtUSD(resultado)}**`}. La TRM es la tasa de referencia que certifica la Superfinanciera: bancos y casas de cambio aplican sus propios márgenes al comprar o vender dólares.`,
    tone: 'neutral',
    icon: '💵',
  };

  return {
    resultado: aCop ? fmtCOP(resultado) : fmtUSD(resultado),
    trm_usada: fmtTRM(trm) + ' por USD' + (vigencia ? ` (vigente ${vigencia})` : ''),
    equivalencia_inversa: aCop ? `${fmtCOP(1000000)} ≈ ${fmtUSD(1000000 / trm)}` : `${fmtUSD(100)} ≈ ${fmtCOP(100 * trm)}`,
    detalle,
    _insight,
  };
}
