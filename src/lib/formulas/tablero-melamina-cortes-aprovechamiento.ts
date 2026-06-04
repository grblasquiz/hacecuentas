export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function tableroMelaminaCortesAprovechamiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Board dimensions (mm)
  const boardL = Number(i.board_length) || 2440;
  const boardW = Number(i.board_width) || 1220;

  // Piece dimensions (mm)
  const pieceL = Number(i.piece_length) || 0;
  const pieceW = Number(i.piece_width) || 0;

  // Saw kerf (mm) - default 3 mm
  const kerf = Number(i.kerf) || 3;

  // Total pieces needed for the job
  const totalPieces = Math.max(1, Math.round(Number(i.total_pieces) || 1));

  // Guard: piece must be smaller than board
  if (pieceL <= 0 || pieceW <= 0) {
    const err = __lang === 'en'
      ? 'Enter piece dimensions greater than 0.'
      : 'Ingresá dimensiones de pieza mayores a 0.';
    return { resultado: '—', resumen: err, _insight: { title: '', text: err, tone: 'warning', icon: '⚠️' } };
  }
  if (pieceL >= boardL || pieceW >= boardW) {
    // Try rotating: the piece might fit rotated
    if (pieceW >= boardL || pieceL >= boardW) {
      const err = __lang === 'en'
        ? 'Piece is larger than the board in both orientations.'
        : 'La pieza supera las dimensiones del tablero en ambas orientaciones.';
      return { resultado: '—', resumen: err, _insight: { title: '', text: err, tone: 'warning', icon: '⚠️' } };
    }
  }

  // Calculate pieces per board in both orientations, pick the best
  // Orientation A: piece length along board length
  const colsA = Math.floor(boardL / (pieceL + kerf));
  const rowsA = Math.floor(boardW / (pieceW + kerf));
  const piecesA = colsA * rowsA;

  // Orientation B: piece rotated 90°
  const colsB = Math.floor(boardL / (pieceW + kerf));
  const rowsB = Math.floor(boardW / (pieceL + kerf));
  const piecesB = colsB * rowsB;

  // Best guillotine layout
  const piecesPerBoard = Math.max(piecesA, piecesB);
  const bestOrientation = piecesA >= piecesB ? 'A' : 'B';
  const usedCols = bestOrientation === 'A' ? colsA : colsB;
  const usedRows = bestOrientation === 'A' ? rowsA : rowsB;

  if (piecesPerBoard <= 0) {
    const err = __lang === 'en'
      ? 'No piece fits in the board with this kerf. Check dimensions.'
      : 'La pieza no entra en el tablero con ese kerf. Revisá las medidas.';
    return { resultado: '0', resumen: err, _insight: { title: '', text: err, tone: 'warning', icon: '⚠️' } };
  }

  // Board and piece areas (m²)
  const boardArea = (boardL * boardW) / 1_000_000;
  const pieceArea = (pieceL * pieceW) / 1_000_000;

  // Yield and waste per board
  const usedArea = piecesPerBoard * pieceArea;
  const wasteArea = boardArea - usedArea;
  const yieldPct = (usedArea / boardArea) * 100;
  const wastePct = 100 - yieldPct;

  // Number of boards needed for the full job
  const boardsNeeded = Math.ceil(totalPieces / piecesPerBoard);

  // Total waste for the full job
  const totalBoardArea = boardsNeeded * boardArea;
  const totalUsedArea = totalPieces * pieceArea;
  const totalWasteArea = totalBoardArea - totalUsedArea;

  // Format helpers
  const fmt2 = (n: number) => n.toFixed(2);
  const fmt1 = (n: number) => n.toFixed(1);
  const fmtInt = (n: number) => n.toString();

  // Insight tone based on yield
  const tone = yieldPct >= 80 ? 'positive' : yieldPct >= 65 ? 'neutral' : 'warning';

  if (__lang === 'en') {
    const rotationNote = bestOrientation === 'B'
      ? ' (pieces rotated 90° for best yield)'
      : ' (pieces in standard orientation)';
    const resumen = [
      `**${piecesPerBoard} piece${piecesPerBoard !== 1 ? 's' : ''} per board** — ${usedCols} column${usedCols !== 1 ? 's' : ''} × ${usedRows} row${usedRows !== 1 ? 's' : ''}${rotationNote}.`,
      `Board area: ${fmt2(boardArea)} m² · Piece area: ${fmt2(pieceArea)} m²`,
      `Yield: **${fmt1(yieldPct)}%** · Waste per board: ${fmt2(wasteArea)} m²`,
      `For ${totalPieces} piece${totalPieces !== 1 ? 's' : ''}: **${boardsNeeded} board${boardsNeeded !== 1 ? 's' : ''} needed** — total waste ${fmt2(totalWasteArea)} m².`,
    ].join('\n\n');

    const insightText = yieldPct >= 80
      ? `**${fmt1(yieldPct)}% yield** — excellent utilization. ${wasteArea < 0.3 ? 'Minimal offcuts.' : `${fmt2(wasteArea)} m² offcut per board can be reused for smaller parts.`}`
      : yieldPct >= 65
      ? `**${fmt1(yieldPct)}% yield** — typical for guillotine cutting. Consider reorienting pieces or using a different board size to improve yield.`
      : `**${fmt1(yieldPct)}% yield** — high waste. Try rotating pieces 90°, using a narrower board, or combining different piece sizes per sheet.`;

    return {
      resultado: `${piecesPerBoard} pieces/board`,
      resumen,
      piezas_por_tablero: fmtInt(piecesPerBoard),
      aprovechamiento: `${fmt1(yieldPct)}%`,
      desperdicio_m2: fmt2(wasteArea),
      tableros_necesarios: fmtInt(boardsNeeded),
      _insight: {
        title: `${piecesPerBoard} pieces per ${boardL}×${boardW} mm board`,
        text: insightText,
        tone,
        icon: '📐',
      },
    };
  } else {
    // Spanish
    const rotationNote = bestOrientation === 'B'
      ? ' (piezas rotadas 90° para mejor aprovechamiento)'
      : ' (piezas en orientación estándar)';
    const resumen = [
      `**${piecesPerBoard} pieza${piecesPerBoard !== 1 ? 's' : ''} por tablero** — ${usedCols} columna${usedCols !== 1 ? 's' : ''} × ${usedRows} fila${usedRows !== 1 ? 's' : ''}${rotationNote}.`,
      `Área tablero: ${fmt2(boardArea)} m² · Área pieza: ${fmt2(pieceArea)} m²`,
      `Aprovechamiento: **${fmt1(yieldPct)}%** · Desperdicio por tablero: ${fmt2(wasteArea)} m²`,
      `Para ${totalPieces} pieza${totalPieces !== 1 ? 's' : ''}: **${boardsNeeded} tablero${boardsNeeded !== 1 ? 's' : ''} necesario${boardsNeeded !== 1 ? 's' : ''}** — desperdicio total ${fmt2(totalWasteArea)} m².`,
    ].join('\n\n');

    const insightText = yieldPct >= 80
      ? `**${fmt1(yieldPct)}% de aprovechamiento** — excelente utilización. ${wasteArea < 0.3 ? 'Scrap mínimo.' : `${fmt2(wasteArea)} m² de recorte por tablero pueden reutilizarse para piezas menores.`}`
      : yieldPct >= 65
      ? `**${fmt1(yieldPct)}% de aprovechamiento** — típico para corte guillotina. Considerá rotar las piezas o cambiar el formato del tablero para mejorar el rendimiento.`
      : `**${fmt1(yieldPct)}% de aprovechamiento** — desperdicio alto. Probá rotar 90° las piezas, usar un tablero de diferente ancho, o combinar distintos tamaños en la misma plancha.`;

    return {
      resultado: `${piecesPerBoard} piezas/tablero`,
      resumen,
      piezas_por_tablero: fmtInt(piecesPerBoard),
      aprovechamiento: `${fmt1(yieldPct)}%`,
      desperdicio_m2: fmt2(wasteArea),
      tableros_necesarios: fmtInt(boardsNeeded),
      _insight: {
        title: `${piecesPerBoard} piezas por tablero de ${boardL}×${boardW} mm`,
        text: insightText,
        tone,
        icon: '📐',
      },
    };
  }
}
