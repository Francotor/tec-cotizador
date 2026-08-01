function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'tarifas') {
      return jsonOutput_({ ok: true, data: listarTarifas() });
    }
    if (action === 'cliente') {
      return jsonOutput_({ ok: true, data: buscarClientePorRut(e.parameter.rut) });
    }
    if (action === 'registro') {
      return jsonOutput_({ ok: true, data: listarRegistro() });
    }
    if (action === 'ordenesCompra') {
      return jsonOutput_({ ok: true, data: listarOrdenesCompra() });
    }
    if (action === 'gastos') {
      return jsonOutput_({ ok: true, data: listarGastos() });
    }
    if (action === 'anticipos') {
      return jsonOutput_({ ok: true, data: listarAnticipos() });
    }
    return jsonOutput_({ ok: false, error: 'Acción GET desconocida: ' + action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message });
  }
}

// El frontend envía el body como text/plain (evita el preflight CORS que
// Apps Script no puede responder) y aquí se parsea como JSON igual.
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    if (action === 'registrarCotizacion') {
      return jsonOutput_({ ok: true, data: registrarCotizacion(body.payload) });
    }
    if (action === 'actualizarEstadoCotizacion') {
      return jsonOutput_({ ok: true, data: actualizarEstadoCotizacion(body.payload) });
    }
    if (action === 'registrarOrdenCompra') {
      return jsonOutput_({ ok: true, data: registrarOrdenCompra(body.payload) });
    }
    if (action === 'registrarGasto') {
      return jsonOutput_({ ok: true, data: registrarGasto(body.payload) });
    }
    if (action === 'registrarAnticipo') {
      return jsonOutput_({ ok: true, data: registrarAnticipo(body.payload) });
    }
    return jsonOutput_({ ok: false, error: 'Acción POST desconocida: ' + action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message });
  }
}
