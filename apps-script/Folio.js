// Núcleo anti-duplicado: todo el ciclo (folio + cliente/contacto + filas) ocurre
// dentro de un único LockService.getScriptLock(), así dos registros en el mismo
// segundo nunca pueden calcular el mismo N_COT.
function registrarCotizacion(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cliente = payload.cliente || {};
    const contacto = payload.contacto || {};
    const cot = payload.cotizacion || {};
    const items = payload.items || [];

    if (!cliente.rut) throw new Error('Falta RUT del cliente');
    if (!items.length) throw new Error('La cotización no tiene ítems');
    if (!cot.registradoPor) throw new Error('Falta indicar quién registra la cotización');

    upsertCliente_(cliente);
    upsertContacto_(cliente.rut, contacto);

    const shRegistro = sheet_(SHEET_REGISTRO);
    const nCot = siguienteFolio_(shRegistro);

    const netoParcial = items.reduce(function (s, it) {
      return s + (Number(it.cantidad) || 0) * (Number(it.vUnitario) || 0);
    }, 0);
    const ggPct = Number(cot.gastosGeneralesPct) || 0;
    const utPct = Number(cot.utilidadesPct) || 0;
    const montoGG = netoParcial * (ggPct / 100);
    const montoUt = netoParcial * (utPct / 100);
    const neto = netoParcial + montoGG + montoUt;
    const ivaAplica = !!cot.ivaAplica;
    const iva = ivaAplica ? Math.round(neto * 0.19) : 0;
    const total = neto + iva;
    const fechaRegistro = new Date();

    shRegistro.appendRow([
      nCot,
      cliente.razonSocial || '',
      normalizarRut_(cliente.rut),
      cot.proyecto || '',
      cot.fechaEmision || fechaRegistro,
      cot.vencimiento || '',
      cliente.direccion || '',
      cot.estado || 'PENDIENTE',
      cot.formaPago || '',
      Math.round(neto),
      Math.round(total),
      ggPct,
      utPct,
      ivaAplica,
      cot.observaciones || '',
      cot.registradoPor,
      fechaRegistro,
      cot.descripcionProyecto || '',
      cot.incluye || '',
      cot.excluye || '',
      cot.notasAdicionales || ''
    ]);

    const shItems = sheet_(SHEET_ITEMS);
    items.forEach(function (it, i) {
      const cantidad = Number(it.cantidad) || 0;
      const vUnitario = Number(it.vUnitario) || 0;
      shItems.appendRow([nCot, i + 1, it.descripcion || '', it.unidad || '', cantidad, vUnitario, cantidad * vUnitario]);
    });

    return {
      nCot: nCot,
      fechaRegistro: fechaRegistro.toISOString(),
      netoParcial: netoParcial,
      montoGG: montoGG,
      montoUt: montoUt,
      neto: neto,
      iva: iva,
      total: total
    };
  } finally {
    lock.releaseLock();
  }
}

function siguienteFolio_(shRegistro) {
  const lastRow = shRegistro.getLastRow();
  if (lastRow < 2) return 1;
  const valores = shRegistro.getRange(2, 1, lastRow - 1, 1).getValues();
  let max = 0;
  valores.forEach(function (row) {
    const v = Number(row[0]);
    if (!isNaN(v) && v > max) max = v;
  });
  return max + 1;
}
