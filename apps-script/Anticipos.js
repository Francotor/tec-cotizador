function listarAnticipos() {
  return readRows_(sheet_(SHEET_ANTICIPOS));
}

function registrarAnticipo(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!payload.rutCliente) throw new Error('Falta el RUT del cliente');
    if (!payload.monto) throw new Error('Falta el monto del anticipo');
    if (!payload.registradoPor) throw new Error('Falta indicar quién registra');

    const sh = sheet_(SHEET_ANTICIPOS);
    const idAnticipo = siguienteId_(sh, 'ID_ANTICIPO');
    const fechaRegistro = new Date();

    sh.appendRow([
      idAnticipo,
      normalizarRut_(payload.rutCliente),
      payload.clienteNombre || '',
      payload.nCot ? Number(payload.nCot) : '',
      payload.fecha || fechaRegistro,
      Number(payload.monto) || 0,
      payload.concepto || 'Anticipo',
      payload.observaciones || '',
      payload.registradoPor,
      fechaRegistro
    ]);

    return { idAnticipo: idAnticipo };
  } finally {
    lock.releaseLock();
  }
}
