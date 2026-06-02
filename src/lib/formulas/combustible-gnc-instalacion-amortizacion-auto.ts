export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined | any; _insight?: any; _chart?: any; }
export function combustibleGncInstalacionAmortizacionAuto(i: Inputs): Outputs {
  const ci=Number(i.costoInstalacion)||0; const km=Number(i.kmMensuales)||0; const c=Number(i.consumo100km)||0;
  const pn=Number(i.precioNafta)||0; const pg=Number(i.precioGnc)||0;
  const costoNaftaMes=km/100*c*pn;
  const consumoGncMes=km/100*c*0.75;
  const costoGncMes=consumoGncMes*pg;
  const ahorro=costoNaftaMes-costoGncMes;
  const meses=ahorro>0?ci/ahorro:0;
  const mesesEnt=Math.ceil(meses);
  const ahorroFmt=`$${Math.round(ahorro).toLocaleString('es-AR')}`;

  let _insight;
  if (ahorro <= 0) {
    _insight = {
      title: 'El GNC no te conviene acá',
      text: `Con estos datos el GNC **no genera ahorro** frente a la nafta, así que la instalación nunca se recupera. Revisá el precio del GNC, los km mensuales o el consumo del auto.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    const tono = meses < 12 ? 'good' : meses < 24 ? 'neutral' : 'warn';
    _insight = {
      title: 'Cuándo recuperás la inversión',
      text: `El GNC te ahorra **${ahorroFmt} por mes**. A ese ritmo recuperás los **$${Math.round(ci).toLocaleString('es-AR')}** del equipo en **${mesesEnt} mes${mesesEnt === 1 ? '' : 'es'}** (${(meses/12).toFixed(1)} años). ${meses < 12 ? 'Se paga en menos de un año: muy conveniente.' : meses < 24 ? 'Se paga en 1 a 2 años: razonable si pensás conservar el auto.' : 'Tarda más de 2 años en pagarse: evaluá si vas a tener el auto tanto tiempo.'}`,
      tone: tono,
      icon: meses < 12 ? '✅' : meses < 24 ? '⛽' : '⏳',
    };
  }

  const out: Outputs = { ahorroMensual:ahorroFmt, mesesAmortizar:`${mesesEnt} meses`, conviene:meses<12?'Sí, menos de 1 año':meses<24?'Sí, moderado':'Evaluar: >2 años para recuperar', _insight };

  if (ahorro > 0) {
    out._chart = {
      type: 'scale',
      marker: mesesEnt,
      markerLabel: `${mesesEnt} meses`,
      min: 0,
      segments: [
        { nombre: 'Conviene', max: 12, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Moderado', max: 24, color: '#d97706', colorDark: '#f59e0b' },
        { nombre: 'A evaluar', max: Math.max(36, mesesEnt + 6), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Tiempo de amortización del GNC: ${mesesEnt} meses, sobre una escala de conveniencia`,
    };
  }

  return out;
}
