const SHEET_REGISTRO = 'REGISTRO';
const SHEET_ITEMS = 'ITEMS_COTIZACION';
const SHEET_CLIENTES = 'CLIENTES';
const SHEET_CONTACTOS = 'CONTACTOS';
const SHEET_TARIFAS = 'TARIFAS_BASE';
const SHEET_ORDENES_COMPRA = 'ORDENES_COMPRA';
const SHEET_GASTOS = 'GASTOS';
const SHEET_ANTICIPOS = 'ANTICIPOS';

const CARPETA_ADJUNTOS = 'TEC Cotizador - Adjuntos';

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

// Máximo valor actual de una columna (por nombre de encabezado) + 1. Debe llamarse
// siempre dentro de un LockService para evitar IDs duplicados entre usuarios simultáneos.
function siguienteId_(sheet, columnaId) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return 1;
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const col = headers.indexOf(columnaId) + 1;
  const valores = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  let max = 0;
  valores.forEach(function (row) {
    const v = Number(row[0]);
    if (!isNaN(v) && v > max) max = v;
  });
  return max + 1;
}

function getOrCrearCarpetaAdjuntos_() {
  const carpetas = DriveApp.getFoldersByName(CARPETA_ADJUNTOS);
  if (carpetas.hasNext()) return carpetas.next();
  return DriveApp.createFolder(CARPETA_ADJUNTOS);
}

// archivo = {base64, nombre, mimeType}. Devuelve la URL del archivo subido a Drive.
function guardarArchivoAdjunto_(archivo) {
  const carpeta = getOrCrearCarpetaAdjuntos_();
  const bytes = Utilities.base64Decode(archivo.base64);
  const blob = Utilities.newBlob(bytes, archivo.mimeType, archivo.nombre);
  const file = carpeta.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}
