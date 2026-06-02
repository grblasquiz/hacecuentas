export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function creatinaCargaMantenimientoPeso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.pesoKg)||0; const f=String(i.fase||'mantenimiento');
  let d='', dur='', mom='';
  let _insight: any;
  if(f==='carga'){
    d=`${(p*0.3).toFixed(1)} g/día`;
    dur=__lang==='en'?'5-7 days':'5-7 días';
    mom=__lang==='en'?'4 equal doses with food':'4 tomas iguales con comida';
    _insight = {
      title: __lang==='en' ? 'Loading phase' : 'Fase de carga',
      text: __lang==='en'
        ? `For your **${p} kg** take **${(p*0.3).toFixed(1)} g/day** split into **4 doses with food** for 5-7 days. This saturates your muscles fast; then drop to a maintenance dose.`
        : `Para tus **${p} kg** tomá **${(p*0.3).toFixed(1)} g/día** repartidos en **4 tomas con comida** durante 5-7 días. Así saturás el músculo rápido; después pasá a la dosis de mantenimiento.`,
      tone: 'neutral',
      icon: '💪',
    };
  }
  else if(f==='mantenimiento'){
    d='3-5 g/día';
    dur=__lang==='en'?'Indefinite':'Indefinido';
    mom=__lang==='en'?'Any time, with or without food':'Cualquier momento, con o sin comida';
    _insight = {
      title: __lang==='en' ? 'Maintenance phase' : 'Fase de mantenimiento',
      text: __lang==='en'
        ? `**3-5 g/day** is enough to keep your muscle creatine topped up, **any time and with or without food**. Consistency every day matters more than timing.`
        : `Con **3-5 g/día** alcanza para mantener el músculo saturado, **a cualquier hora y con o sin comida**. Importa más la constancia diaria que el momento de la toma.`,
      tone: 'good',
      icon: '💪',
    };
  }
  else {
    d='5 g/día';
    dur=__lang==='en'?'From day 1 (saturation 3-4 weeks)':'Desde día 1 (saturación 3-4 semanas)';
    mom=__lang==='en'?'Any time':'Cualquier momento';
    _insight = {
      title: __lang==='en' ? 'No loading' : 'Sin carga',
      text: __lang==='en'
        ? `Skipping the loading phase you take a flat **5 g/day** from day 1. You reach full saturation in **3-4 weeks** instead of a week, but it's simpler on the stomach.`
        : `Sin fase de carga tomás **5 g/día** fijos desde el día 1. Llegás a la saturación completa en **3-4 semanas** en vez de una, pero es más amable con el estómago.`,
      tone: 'neutral',
      icon: '💪',
    };
  }
  return { dosis:d, duracion:dur, momento:mom, _insight };
}
