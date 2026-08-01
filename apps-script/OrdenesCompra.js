function listarOrdenesCompra() {
  return readRows_(sheet_(SHEET_ORDENES_COMPRA));
}

function registrarOrdenCompra(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!payload.nCot) throw new Error('Falta el N° de cotización');
    if (!payload.registradoPor) throw new Error('Falta indicar quién registra');

    const sh = sheet_(SHEET_ORDENES_COMPRA);
    const idOc = siguienteId_(sh, 'ID_OC');
    const archivoUrl = payload.archivo ? guardarArchivoAdjunto_(payload.archivo) : '';
    const fechaRegistro = new Date();

    sh.appendRow([
      idOc,
      Number(payload.nCot),
      payload.nOcCliente || '',
      payload.fechaRecepcion || fechaRegistro,
      Number(payload.monto) || 0,
      archivoUrl,
      payload.observaciones || '',
      payload.registradoPor,
      fechaRegistro
    ]);

    return { idOc: idOc, archivoUrl: archivoUrl };
  } finally {
    lock.releaseLock();
  }
}
