const SHEET_REGISTRO = 'REGISTRO';
const SHEET_ITEMS = 'ITEMS_COTIZACION';
const SHEET_CLIENTES = 'CLIENTES';
const SHEET_CONTACTOS = 'CONTACTOS';
const SHEET_TARIFAS = 'TARIFAS_BASE';

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('No existe la hoja: ' + name);
  return sh;
}

// Lee todas las filas de datos (sin encabezado) de una hoja como objetos {COLUMNA: valor}
function readRows_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizarRut_(rut) {
  return String(rut || '').trim().toUpperCase();
}
