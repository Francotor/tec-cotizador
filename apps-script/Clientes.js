function buscarClientePorRut(rut) {
  rut = normalizarRut_(rut);
  const sh = sheet_(SHEET_CLIENTES);
  const rows = readRows_(sh);
  const cliente = rows.find(function (r) { return normalizarRut_(r.RUT) === rut; });
  const contactos = buscarContactosPorRut(rut);
  return { cliente: cliente || null, contactos: contactos };
}

// Inserta el cliente si su RUT no existe; si existe, no lo modifica (evita pisar datos ya corregidos a mano)
function upsertCliente_(cliente) {
  const sh = sheet_(SHEET_CLIENTES);
  const rows = readRows_(sh);
  const rut = normalizarRut_(cliente.rut);
  const yaExiste = rows.some(function (r) { return normalizarRut_(r.RUT) === rut; });
  if (yaExiste) return;
  sh.appendRow([rut, cliente.razonSocial || '', cliente.direccion || '', cliente.ciudadComuna || '']);
}
