export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Transferencia de inmuebles — régimen vigente 2026.
 *
 * El ITI (Ley 23.905, 1,5%) fue DEROGADO por la Ley 27.743 art. 67 (BO 8/7/2024).
 * Ya no se aplica a ninguna transferencia, ni siquiera a inmuebles adquiridos antes de 2018.
 *
 * Para inmuebles adquiridos DESDE el 1/1/2018 regía el Impuesto Cedular del 15% sobre la
 * utilidad (precio − costo actualizado por IPC). La Ley 27.802 EXIMIÓ ese cedular para las
 * enajenaciones realizadas a partir del 1/1/2026 cuando el vendedor es persona humana o
 * sucesión indivisa NO habitualista. Sigue gravado para habitualistas, personas jurídicas
 * y desarrolladores. La venta de la casa-habitación / vivienda única siempre estuvo exenta.
 */
export function impuestoTransferenciaItuItiInmueble(i: Inputs): Outputs {
  const valor = Number(i.valor) || 0;
  const costo = Number(i.costo) || 0;
  const fecha = String(i.fechaAdquisicion || 'antes2018'); // 'antes2018' | 'desde2018'
  const tipo = String(i.tipoVendedor || 'personaHumana'); // 'personaHumana' | 'habitualista'
  const viviendaUnica = String(i.viviendaUnica || 'no'); // 'no' | 'si' (casa-habitación)

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  // ITI histórico de referencia (lo que se hubiera pagado antes de la derogación)
  const itiHistorico = valor * 0.015;

  let iti = 0;
  let regimen = '';
  let exento = true;
  let detalle = '';

  const esCasaHabitacion = viviendaUnica === 'si';

  if (fecha === 'antes2018') {
    // ITI derogado por Ley 27.743: no paga nada a nivel nacional.
    iti = 0;
    exento = true;
    regimen = 'ITI derogado (Ley 27.743)';
    detalle = `El inmueble fue adquirido antes del 1/1/2018, por lo que correspondía el ITI. Pero el ITI fue **derogado por la Ley 27.743** (art. 67, vigente desde el 8/7/2024): hoy no se paga ningún impuesto nacional a la transferencia. A modo de referencia, el ITI derogado habría sido ${fmt(itiHistorico)} (1,5% sobre ${fmt(valor)}).`;
  } else {
    // Adquirido desde 2018: régimen del Impuesto Cedular 15% sobre la utilidad.
    const utilidad = Math.max(valor - costo, 0);
    const cedularPleno = utilidad * 0.15;
    if (esCasaHabitacion) {
      iti = 0;
      exento = true;
      regimen = 'Exento (casa-habitación)';
      detalle = `La venta de la **casa-habitación / vivienda única** del vendedor está exenta del Impuesto Cedular. No pagás impuesto nacional a la transferencia.`;
    } else if (tipo === 'personaHumana') {
      // Ley 27.802: cedular eximido para personas humanas no habitualistas desde 1/1/2026.
      iti = 0;
      exento = true;
      regimen = 'Cedular eximido (Ley 27.802)';
      detalle = `Como persona humana no habitualista, la **Ley 27.802 eximió el Impuesto Cedular del 15%** para las ventas realizadas desde el 1/1/2026. No pagás impuesto nacional a la transferencia. A modo de referencia, el cedular sobre una utilidad de ${fmt(utilidad)} habría sido ${fmt(cedularPleno)}.`;
    } else {
      // Habitualista / persona jurídica: sigue gravado.
      iti = cedularPleno;
      exento = false;
      regimen = 'Impuesto Cedular 15%';
      detalle = `Por tratarse de un vendedor habitualista o persona jurídica, la operación tributa el **Impuesto Cedular del 15%** sobre la utilidad (${fmt(valor)} − ${fmt(costo)} de costo = ${fmt(utilidad)}): **${fmt(cedularPleno)}**. La exención de la Ley 27.802 no alcanza a habitualistas.`;
    }
  }

  const _insight = exento
    ? {
        title: 'No pagás impuesto nacional a la transferencia',
        text: detalle,
        tone: 'good',
        icon: '🏡',
      }
    : {
        title: 'La operación está gravada',
        text: detalle,
        tone: 'warn',
        icon: '🧾',
      };

  return {
    iti: fmt(iti),
    exento: exento ? 'Sí' : 'No',
    regimen,
    resumen: `Venta de ${fmt(valor)} (${regimen}): ${exento ? 'sin impuesto nacional' : 'paga ' + fmt(iti)}.`,
    _insight,
  };
}
