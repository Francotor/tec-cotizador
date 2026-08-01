// Ejecutar UNA VEZ desde el editor de Apps Script (seleccionar esta función → Ejecutar)
// para crear las hojas de la extensión de control de gestión si todavía no existen.
function inicializarHojasControl() {
  crearHojaSiNoExiste_(SHEET_ORDENES_COMPRA, [
    'ID_OC', 'N_COT', 'N_OC_CLIENTE', 'FECHA_RECEPCION', 'MONTO_OC',
    'ARCHIVO_URL', 'OBSERVACIONES', 'REGISTRADO_POR', 'FECHA_REGISTRO'
  ]);
  crearHojaSiNoExiste_(SHEET_GASTOS, [
    'ID_GASTO', 'FECHA', 'CATEGORIA', 'DESCRIPCION', 'MONTO', 'N_COT',
    'PROVEEDOR_BENEFICIARIO', 'OBSERVACIONES', 'REGISTRADO_POR', 'FECHA_REGISTRO'
  ]);
  crearHojaSiNoExiste_(SHEET_ANTICIPOS, [
    'ID_ANTICIPO', 'RUT_CLIENTE', 'CLIENTE_NOMBRE', 'N_COT', 'FECHA', 'MONTO',
    'CONCEPTO', 'OBSERVACIONES', 'REGISTRADO_POR', 'FECHA_REGISTRO'
  ]);
  Logger.log('Hojas de control listas.');
}

function crearHojaSiNoExiste_(nombre, headers) {
  const ss = ss_();
  if (ss.getSheetByName(nombre)) return;
  const sh = ss.insertSheet(nombre);
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
}
