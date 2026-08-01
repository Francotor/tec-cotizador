function buscarContactosPorRut(rut) {
  rut = normalizarRut_(rut);
  const sh = sheet_(SHEET_CONTACTOS);
  const rows = readRows_(sh);
  return rows.filter(function (r) { return normalizarRut_(r.RUT_CLIENTE) === rut; });
}

// Inserta el contacto si (rut, nombre) no existe ya para ese cliente
function upsertContacto_(rutCliente, contacto) {
  if (!contacto || !contacto.nombre) return;
  const rut = normalizarRut_(rutCliente);
  const sh = sheet_(SHEET_CONTACTOS);
  const rows = readRows_(sh);
  const yaExiste = rows.some(function (r) {
    return normalizarRut_(r.RUT_CLIENTE) === rut && r.NOMBRE_CONTACTO === contacto.nombre;
  });
  if (yaExiste) return;
  sh.appendRow([rut, contacto.nombre, contacto.correo || '', contacto.telefono || '', contacto.cargoNota || '']);
}
