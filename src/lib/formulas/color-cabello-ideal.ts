/** Color de cabello ideal según tono de piel */
export interface Inputs {
  tonoPiel: string;
  subtonoPiel: string;
  colorOjos: string;
  colorNatural: string;
}
export interface Outputs {
  coloresRecomendados: string;
  coloresEvitar: string;
  tecnicaSugerida: string;
  mensaje: string;
}

export function colorCabelloIdeal(i: Inputs): Outputs {
  const tonoPiel = String(i.tonoPiel || 'medio');
  const subtono = String(i.subtonoPiel || 'neutro');
  const colorOjos = String(i.colorOjos || 'marron');

  let coloresRec: string;
  let coloresEvitar: string;
  let tecnica: string;

  if (tonoPiel === 'claro') {
    if (subtono === 'calido') {
      coloresRec = 'Rubio miel, cobrizo, castaño dorado, rubio fresa, caramelo';
      coloresEvitar = 'Negro azulado, rubio platinado (muy contrastante), borgoña oscuro';
      tecnica = 'Balayage con tonos dorados, babylights miel';
    } else if (subtono === 'frio') {
      coloresRec = 'Rubio ceniza, rubio platinado, castaño ceniza, borgoña, chocolate frío';
      coloresEvitar = 'Dorados intensos, cobrizos, naranja';
      tecnica = 'Highlights ceniza, ombre de castaño a rubio ceniza';
    } else {
      coloresRec = 'Castaño claro, rubio natural, avellana, bronde (rubio+castaño)';
      coloresEvitar = 'Tonos muy extremos (muy claro o muy oscuro)';
      tecnica = 'Bronde, shatush, mechas naturales';
    }
  } else if (tonoPiel === 'medio') {
    if (subtono === 'calido') {
      coloresRec = 'Caramelo, cobrizo, castaño dorado, miel oscura, chocolate con leche';
      coloresEvitar = 'Rubio platinado, ceniza muy frío';
      tecnica = 'Balayage caramelo, reflejos cobrizos';
    } else if (subtono === 'frio') {
      coloresRec = 'Castaño oscuro, chocolate frío, borgoña, ciruela, espresso';
      coloresEvitar = 'Dorados muy cálidos, cobrizos naranjas';
      tecnica = 'Highlights chocolate, baño de color borgoña';
    } else {
      coloresRec = 'Castaño chocolate, avellana, caramelo, cobrizo suave';
      coloresEvitar = 'Decoloraciones extremas sin matizar';
      tecnica = 'Balayage natural, mechas intercaladas';
    }
  } else { // oscuro
    if (subtono === 'calido') {
      coloresRec = 'Caramelo oscuro, miel, cobrizo intenso, castaño rojizo, toffee';
      coloresEvitar = 'Rubio platinado (daño capilar), ceniza muy frío';
      tecnica = 'Highlights caramelo face-framing, balayage miel';
    } else if (subtono === 'frio') {
      coloresRec = 'Negro azulado, espresso, ciruela, borgoña oscuro, violeta';
      coloresEvitar = 'Dorados intensos, naranjas, cobrizos claros';
      tecnica = 'Baño de color ciruela, reflejos violeta, glossing oscuro';
    } else {
      coloresRec = 'Chocolate oscuro, caoba, toffee, reflejos sutiles caramelo';
      coloresEvitar = 'Decoloraciones agresivas';
      tecnica = 'Reflejos sutiles, shatush con puntas más claras';
    }
  }

  return {
    coloresRecomendados: coloresRec,
    coloresEvitar,
    tecnicaSugerida: tecnica,
    mensaje: `Para piel ${tonoPiel} con subtono ${subtono}: te van bien ${coloresRec}. Técnica sugerida: ${tecnica}.`,
  };
}
