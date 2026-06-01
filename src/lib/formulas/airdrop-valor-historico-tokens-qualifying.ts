export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function airdropValorHistoricoTokensQualifying(i: Inputs): Outputs {
  const h=Number(i.horasInvertidas)||0; const v=Number(i.airdropValorUsd)||0;
  const porH=h>0?v/h:0;
  let interp='';
  if(porH>50) interp='Excepcional (>USD 50/h)';
  else if(porH>20) interp='Muy bueno (USD 20-50/h)';
  else if(porH>10) interp='Bueno';
  else interp='Pobre — considerar trabajo alternativo';
  const bueno=porH>20;
  const _insight={
    title:'Tu retorno por hora',
    text:`El airdrop de **USD ${v.toLocaleString('en-US')}** por **${h} h** de actividad equivale a **USD ${porH.toFixed(2)}/h** (${interp}). `+(porH>50?`Un rendimiento excepcional: el farmeo te rindió muchísimo más que un trabajo por hora típico.`:porH>20?`Muy buen retorno por tu tiempo invertido.`:porH>10?`Un retorno decente, por encima del piso pero lejos de un farmeo top.`:`Por debajo de USD 10/h: tu tiempo posiblemente rinda más en otra actividad.`),
    tone:(bueno?'good':porH>10?'neutral':'warn') as const,
    icon:porH>20?'🪂':'⏳',
  };
  const _chart={
    type:'scale',
    marker:Number(porH.toFixed(2)),
    markerLabel:`USD ${porH.toFixed(0)}/h`,
    min:0,
    segments:[
      {nombre:'Pobre',max:10,color:'#f87171',colorDark:'#b91c1c'},
      {nombre:'Bueno',max:20,color:'#fbbf24',colorDark:'#b45309'},
      {nombre:'Muy bueno',max:50,color:'#34d399',colorDark:'#047857'},
      {nombre:'Excepcional',max:Math.max(60,Math.ceil(porH+1)),color:'#22c55e',colorDark:'#15803d'},
    ],
    ariaLabel:`Retorno de USD ${porH.toFixed(2)} por hora en zona ${interp}`,
  };
  return { valorPorHora:`USD ${porH.toFixed(2)}/h`, interpretacion:interp, _insight, _chart };
}
