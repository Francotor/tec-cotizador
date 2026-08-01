let registrada = false;

function recalcular() {
  const items = Items.getItems();
  const ggPct = Number(document.getElementById('ggPct').value) || 0;
  const utPct = Number(document.getElementById('utPct').value) || 0;
  const ivaAplica = document.getElementById('tipoDocumento').value === 'con_iva';
  const t = calcularTotales(items, ggPct, utPct, ivaAplica);
  document.getElementById('neto').textContent = fmt(t.netoParcial);
  document.getElementById('gg').textContent = fmt(t.montoGG);
  document.getElementById('ut').textContent = fmt(t.montoUt);
  document.getElementById('iva').textContent = fmt(t.iva);
  document.getElementById('total').textContent = fmt(t.total);
}

function poblarUsuarios() {
  const sel = document.getElementById('registradoPor');
  sel.innerHTML = USUARIOS.map((u) => `<option value="${u}">${u}</option>`).join('');
}

function mostrarFeedback(msg, tipo) {
  const fb = document.getElementById('feedback');
  fb.textContent = msg;
  fb.className = 'note' + (tipo ? ' ' + tipo : '');
}

function registrar() {
  if (registrada) return;
  const cliente = Clientes.getClienteData();
  const contacto = Clientes.getContactoData();
  const items = Items.getItems();

  if (!cliente.rut || !cliente.razonSocial) {
    mostrarFeedback('Complete el RUT y la razón social del cliente.', 'error');
    return;
  }
  if (!items.length) {
    mostrarFeedback('Agregue al menos un ítem con cantidad y precio.', 'error');
    return;
  }

  const ggPct = Number(document.getElementById('ggPct').value) || 0;
  const utPct = Number(document.getElementById('utPct').value) || 0;
  const ivaAplica = document.getElementById('tipoDocumento').value === 'con_iva';
  const fechaEmision = new Date();
  const vencimiento = new Date(fechaEmision.getTime() + VALIDEZ_DIAS * 86400000);

  const payload = {
    cliente,
    contacto,
    cotizacion: {
      proyecto: document.getElementById('proyecto').value.trim(),
      fechaEmision: fechaEmision.toISOString(),
      vencimiento: vencimiento.toISOString(),
      estado: 'PENDIENTE',
      formaPago: document.getElementById('formaPago').value.trim(),
      gastosGeneralesPct: ggPct,
      utilidadesPct: utPct,
      ivaAplica,
      observaciones: document.getElementById('observaciones').value.trim(),
      registradoPor: document.getElementById('registradoPor').value
    },
    items
  };

  document.getElementById('btnRegistrar').disabled = true;
  mostrarFeedback('Registrando cotización...', '');

  Api.post('registrarCotizacion', payload).then((res) => {
    if (!res.ok) {
      mostrarFeedback('Error: ' + res.error, 'error');
      document.getElementById('btnRegistrar').disabled = false;
      return;
    }
    registrada = true;
    document.getElementById('numCot').textContent = 'N°' + res.data.nCot;
    mostrarFeedback('Cotización N°' + res.data.nCot + ' registrada correctamente.', 'success');
  }).catch((err) => {
    mostrarFeedback('Error de conexión: ' + err.message, 'error');
    document.getElementById('btnRegistrar').disabled = false;
  });
}

function init() {
  document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-CL');
  poblarUsuarios();
  Clientes.init();
  document.getElementById('ggPct').addEventListener('input', recalcular);
  document.getElementById('utPct').addEventListener('input', recalcular);
  document.getElementById('tipoDocumento').addEventListener('change', recalcular);
  document.getElementById('btnAddItem').addEventListener('click', () => Items.addRow());
  document.getElementById('btnRegistrar').addEventListener('click', registrar);
  document.getElementById('btnImprimir').addEventListener('click', imprimirCotizacion);

  Api.get('tarifas').then((res) => {
    Items.init(res.ok ? res.data : [], recalcular);
  }).catch(() => {
    mostrarFeedback('No se pudo cargar el catálogo de TARIFAS BASE — revise API_URL en config.js.', 'error');
    Items.init([], recalcular);
  });
}

document.addEventListener('DOMContentLoaded', init);
