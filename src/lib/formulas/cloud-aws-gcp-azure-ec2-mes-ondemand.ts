export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function cloudAwsGcpAzureEc2MesOndemand(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { saExpensive: 'SA más caro por infraestructura.', ondemand: 'On-demand. Reserved/Spot más baratos.' },
    en: { saExpensive: 'SA region is more expensive due to infrastructure costs.', ondemand: 'On-demand pricing. Reserved/Spot instances are cheaper.' },
    pt: { saExpensive: 'Região SA é mais cara por custos de infraestrutura.', ondemand: 'Preço sob demanda. Instâncias Reserved/Spot são mais baratas.' },
  } as const)[__lang];
  const t=String(i.tipoInstancia||'t3_medium'); const r=String(i.region||'us_east');
  const baseHr={'t3_micro':0.0104,'t3_medium':0.0416,'m5_large':0.096,'c5_xlarge':0.17,'r5_2xlarge':0.504}[t];
  const regMult={'us_east':1,'eu_west':1.08,'sa_east_1':1.35}[r];
  const mes=baseHr*720*regMult;
  const specs={'t3_micro':'2 vCPU 1GB','t3_medium':'2 vCPU 4GB','m5_large':'2 vCPU 8GB','c5_xlarge':'4 vCPU 8GB','r5_2xlarge':'8 vCPU 64GB'}[t];
  return { costoMensual:`USD ${mes.toFixed(2)}`, cpu:specs, observacion:r==='sa_east_1'?T.saExpensive:T.ondemand };
}
