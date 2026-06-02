/**
 * Calculadora de Torta - Kg y Porciones.
 */
export interface TortaPersonasKgPorcionesInputs { invitados:number; tipoEvento:string; }
export interface TortaPersonasKgPorcionesOutputs { kgTorta:number; porciones:number; pisos:number; diametroCm:number; _insight?: any; }
export function tortaPersonasKgPorciones(inputs: TortaPersonasKgPorcionesInputs): TortaPersonasKgPorcionesOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoEvento;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gramos = 100;
  if (tipo === 'boda') gramos = 80;
  else if (tipo === 'infantil') gramos = 60;
  const kgTorta = Number(((inv * gramos) / 1000 * 1.1).toFixed(2));
  let pisos = 1;
  if (inv > 50) pisos = 2;
  if (inv > 100) pisos = 3;
  if (inv > 150) pisos = 4;
  if (inv > 200) pisos = 5;
  let diametroCm = 20;
  if (kgTorta >= 2) diametroCm = 25;
  if (kgTorta >= 3) diametroCm = 30;
  if (kgTorta >= 4) diametroCm = 32;
  if (kgTorta >= 5) diametroCm = 35;
  if (kgTorta >= 6) diametroCm = 38;
  const porciones = Math.round((kgTorta * 1000) / gramos);
  const tipoLabel = tipo === 'boda' ? 'boda' : tipo === 'infantil' ? 'cumpleaños infantil' : 'evento';
  return {
    kgTorta,
    porciones,
    pisos,
    diametroCm,
    _insight: {
      title: 'Cuánta torta encargar',
      text: `Para ${inv} invitados en un ${tipoLabel} necesitás unos **${kgTorta} kg** de torta, que rinden **${porciones} porciones** (${gramos} g c/u). Pedila de **${diametroCm} cm** de diámetro${pisos > 1 ? ` en **${pisos} pisos**` : ' en **1 piso**'}.`,
      tone: 'neutral',
      icon: '🎂',
    },
  };
}
