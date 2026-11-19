/** Mantiene la tasa inicial, el texto del campo y su fuente en el mismo JSON. */
export function applySunatReference(calc, { purchase, sale, valueDate, source, sourceUrl }) {
  const field = calc.fields?.find(({ id }) => id === 'tipoCambio');
  if (!field) throw new Error('No existe fields.tipoCambio en el conversor SUNAT');

  const previous = calc.dataUpdate;
  const previousDate = previous?.dataAsOf ?? previous?.valueDate;
  const sameDateWithBetterSource = previousDate === valueDate &&
    previous.source?.startsWith('SUNAT') && !source.startsWith('SUNAT');
  if (previousDate > valueDate || sameDateWithBetterSource) return false;

  const before = JSON.stringify([field, previous]);
  const [yyyy, mm, dd] = valueDate.split('-');
  const dateLabel = `${dd}/${mm}/${yyyy}`;
  const fmt = (rate) => rate.toFixed(3).replace('.', ',');
  const rates = `${dateLabel}, según ${source}: venta S/ ${fmt(sale)} y compra S/ ${fmt(purchase)}.`;
  field.default = sale;
  field.help = `Referencia inicial de venta. ${rates} Puedes ingresar la tasa aplicable a tu operación.`;
  calc.dataUpdate = {
    ...previous,
    frequency: 'daily',
    lastUpdated: valueDate,
    dataAsOf: valueDate,
    updateType: 'auto-api',
    notes: `${rates} El valor inicial es referencial.`,
    source,
    sourceUrl,
    currentPurchase: purchase,
    currentSale: sale,
    valueDate,
  };
  return JSON.stringify([field, calc.dataUpdate]) !== before;
}
