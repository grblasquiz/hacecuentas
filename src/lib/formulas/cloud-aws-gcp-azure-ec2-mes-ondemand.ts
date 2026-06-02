export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; _chart?: any; }
export function cloudAwsGcpAzureEc2MesOndemand(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { saExpensive: 'SA más caro por infraestructura.', ondemand: 'On-demand. Reserved/Spot más baratos.', insTitle: 'Tu factura mensual estimada', insSavings: 'En modo on-demand pagás por hora sin compromiso: pasar a Reserved (1-3 años) o Spot puede recortar **30-70%** del costo.', insRegion: 'La región SA East suma un **+35%** sobre US East por costos de infraestructura local.' },
    en: { saExpensive: 'SA region is more expensive due to infrastructure costs.', ondemand: 'On-demand pricing. Reserved/Spot instances are cheaper.', insTitle: 'Your estimated monthly bill', insSavings: 'On-demand bills hourly with no commitment: switching to Reserved (1-3 yr) or Spot can cut **30-70%** of the cost.', insRegion: 'The SA East region adds a **+35%** premium over US East due to local infrastructure costs.' },
    pt: { saExpensive: 'Região SA é mais cara por custos de infraestrutura.', ondemand: 'Preço sob demanda. Instâncias Reserved/Spot são mais baratas.', insTitle: 'Sua fatura mensal estimada', insSavings: 'No modo sob demanda você paga por hora sem compromisso: migrar para Reserved (1-3 anos) ou Spot pode cortar **30-70%** do custo.', insRegion: 'A região SA East adiciona **+35%** sobre US East por custos de infraestrutura local.' },
  } as const)[__lang];
  const t=String(i.tipoInstancia||'t3_medium'); const r=String(i.region||'us_east');
  const baseHr={'t3_micro':0.0104,'t3_medium':0.0416,'m5_large':0.096,'c5_xlarge':0.17,'r5_2xlarge':0.504}[t];
  const regMult={'us_east':1,'eu_west':1.08,'sa_east_1':1.35}[r];
  const mes=baseHr*720*regMult;
  const specs={'t3_micro':'2 vCPU 1GB','t3_medium':'2 vCPU 4GB','m5_large':'2 vCPU 8GB','c5_xlarge':'4 vCPU 8GB','r5_2xlarge':'8 vCPU 64GB'}[t];
  const costoFmt = `USD ${mes.toFixed(2)}`;
  const insText = `**${costoFmt}/mes** por una instancia ${t.replace('_','.')} (${specs}) corriendo 24/7 (720 h). ${r==='sa_east_1' ? T.insRegion + ' ' : ''}${T.insSavings}`;
  return {
    costoMensual: costoFmt,
    cpu: specs,
    observacion: r==='sa_east_1'?T.saExpensive:T.ondemand,
    _insight: { title: T.insTitle, text: insText, tone: r==='sa_east_1' ? 'warn' : 'neutral', icon: '☁️' },
  };
}
