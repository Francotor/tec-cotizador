function listarRegistro() {
  return readRows_(sheet_(SHEET_REGISTRO));
}

const ESTADOS_VALIDOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'FACTURADA'];

function actualizarEstadoCotizacion(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!payload.nCot) throw new Error('Falta el N° de cotización');
    if (ESTADOS_VALIDOS.indexOf(payload.estado) === -1) throw new Error('Estado inválido: ' + payload.estado);

    const sh = sheet_(SHEET_REGISTRO);
    const lastRow = sh.getLastRow();
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const colNCot = headers.indexOf('N_COT') + 1;
    const colEstado = headers.indexOf('ESTADO') + 1;
    const ids = sh.getRange(2, colNCot, lastRow - 1, 1).getValues();

    for (let i = 0; i < ids.length; i++) {
      if (Number(ids[i][0]) === Number(payload.nCot)) {
        sh.getRange(i + 2, colEstado).setValue(payload.estado);
        return { nCot: payload.nCot, estado: payload.estado };
      }
    }
    throw new Error('No se encontró la cotización N°' + payload.nCot);
  } finally {
    lock.releaseLock();
  }
}
