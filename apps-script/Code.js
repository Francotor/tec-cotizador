function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'tarifas') {
      return jsonOutput_({ ok: true, data: listarTarifas() });
    }
    if (action === 'cliente') {
      return jsonOutput_({ ok: true, data: buscarClientePorRut(e.parameter.rut) });
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
    return jsonOutput_({ ok: false, error: 'Acción POST desconocida: ' + action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message });
  }
}
