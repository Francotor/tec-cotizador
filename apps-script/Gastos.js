function listarGastos() {
  return readRows_(sheet_(SHEET_GASTOS));
}

function registrarGasto(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!payload.categoria) throw new Error('Falta la categoría del gasto');
    if (!payload.monto) throw new Error('Falta el monto del gasto');
    if (!payload.registradoPor) throw new Error('Falta indicar quién registra');

    const sh = sheet_(SHEET_GASTOS);
    const idGasto = siguienteId_(sh, 'ID_GASTO');
    const fechaRegistro = new Date();

    sh.appendRow([
      idGasto,
      payload.fecha || fechaRegistro,
      payload.categoria,
      payload.descripcion || '',
      Number(payload.monto) || 0,
      payload.nCot ? Number(payload.nCot) : '',
      payload.proveedor || '',
      payload.observaciones || '',
      payload.registradoPor,
      fechaRegistro
    ]);

    return { idGasto: idGasto };
  } finally {
    lock.releaseLock();
  }
}
