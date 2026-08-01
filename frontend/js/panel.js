let registro = [];
let ordenesCompra = [];
let gastos = [];
let anticipos = [];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function poblarUsuarios(selectId) {
  document.getElementById(selectId).innerHTML = USUARIOS.map((u) => `<option value="${u}">${u}</option>`).join('');
}

function badgeEstado(estado) {
  const clase = 'badge-' + String(estado).toLowerCase();
  return `<span class="badge ${clase}">${estado}</span>`;
}

function badgeOC(nCot, estado) {
  const tieneOC = ordenesCompra.some((oc) => Number(oc.N_COT) === Number(nCot));
  if (tieneOC) return '<span class="badge badge-ok">OK</span>';
  if (estado === 'APROBADA') return '<span class="badge badge-falta">Falta OC</span>';
  return '<span class="badge badge-na">—</span>';
}

function renderResumen() {
  const sinOC = registro.filter((r) => r.ESTADO === 'APROBADA' && !ordenesCompra.some((oc) => Number(oc.N_COT) === Number(r.N_COT))).length;
  const totalGastos = gastos.reduce((s, g) => s + (Number(g.MONTO) || 0), 0);
  const totalAnticipos = anticipos.reduce((s, a) => s + (Number(a.MONTO) || 0), 0);
  document.getElementById('statSinOC').textContent = sinOC;
  document.getElementById('statGastos').textContent = fmt(totalGastos);
  document.getElementById('statAnticipos').textContent = fmt(totalAnticipos);
}

function renderTablaCotizaciones() {
  const filtro = document.getElementById('filtroEstado').value;
  const tbody = document.getElementById('tablaCotizaciones');
  const filas = registro.filter((r) => !filtro || r.ESTADO === filtro);
  tbody.innerHTML = filas.map((r) => `
    <tr>
      <td>N°${r.N_COT}</td>
      <td>${r.CLIENTE}</td>
      <td>${r.PROYECTO || ''}</td>
      <td>${fmt(r.TOTAL)}</td>
      <td>
        <select onchange="cambiarEstado(${r.N_COT}, this.value)">
          ${['PENDIENTE', 'APROBADA', 'RECHAZADA', 'FACTURADA'].map((e) => `<option value="${e}" ${e === r.ESTADO ? 'selected' : ''}>${e}</option>`).join('')}
        </select>
      </td>
      <td>${badgeOC(r.N_COT, r.ESTADO)}</td>
    </tr>`).join('');
}

function cambiarEstado(nCot, estado) {
  Api.post('actualizarEstadoCotizacion', { nCot, estado, registradoPor: USUARIOS[0] }).then((res) => {
    if (!res.ok) { alert('Error: ' + res.error); return; }
    const fila = registro.find((r) => Number(r.N_COT) === Number(nCot));
    if (fila) fila.ESTADO = estado;
    renderResumen();
    renderTablaCotizaciones();
  });
}

function poblarSelectCotizaciones(selectId, soloAprobadas) {
  const sel = document.getElementById(selectId);
  const base = sel.querySelector('option[value=""]');
  const opciones = registro
    .filter((r) => !soloAprobadas || r.ESTADO === 'APROBADA')
    .map((r) => `<option value="${r.N_COT}">N°${r.N_COT} — ${r.CLIENTE} (${r.PROYECTO || 'sin proyecto'})</option>`)
    .join('');
  sel.innerHTML = (base ? base.outerHTML : '') + opciones;
}

function cargarTodo() {
  return Promise.all([
    Api.get('registro'),
    Api.get('ordenesCompra'),
    Api.get('gastos'),
    Api.get('anticipos')
  ]).then(([rRegistro, rOC, rGastos, rAnticipos]) => {
    registro = rRegistro.ok ? rRegistro.data : [];
    ordenesCompra = rOC.ok ? rOC.data : [];
    gastos = rGastos.ok ? rGastos.data : [];
    anticipos = rAnticipos.ok ? rAnticipos.data : [];
    renderResumen();
    renderTablaCotizaciones();
    poblarSelectCotizaciones('ocNCot', true);
    poblarSelectCotizaciones('gNCot', false);
    poblarSelectCotizaciones('aNCot', false);
  });
}

function mostrarFeedback(id, msg, tipo) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'note' + (tipo ? ' ' + tipo : '');
}

function registrarOC() {
  const nCot = document.getElementById('ocNCot').value;
  const registradoPor = document.getElementById('ocRegistradoPor').value;
  if (!nCot) { mostrarFeedback('ocFeedback', 'Seleccione una cotización.', 'error'); return; }

  const payload = {
    nCot,
    nOcCliente: document.getElementById('ocNumero').value.trim(),
    fechaRecepcion: document.getElementById('ocFecha').value,
    monto: document.getElementById('ocMonto').value,
    observaciones: document.getElementById('ocObs').value.trim(),
    registradoPor
  };

  const archivoInput = document.getElementById('ocArchivo');
  const archivoFile = archivoInput.files[0];
  const btn = document.getElementById('btnRegistrarOC');
  btn.disabled = true;
  mostrarFeedback('ocFeedback', 'Registrando...', '');

  const conArchivo = archivoFile
    ? fileToBase64(archivoFile).then((base64) => {
        payload.archivo = { base64, nombre: archivoFile.name, mimeType: archivoFile.type || 'application/pdf' };
      })
    : Promise.resolve();

  conArchivo.then(() => Api.post('registrarOrdenCompra', payload)).then((res) => {
    btn.disabled = false;
    if (!res.ok) { mostrarFeedback('ocFeedback', 'Error: ' + res.error, 'error'); return; }
    mostrarFeedback('ocFeedback', 'OC registrada correctamente.', 'success');
    document.getElementById('ocNumero').value = '';
    document.getElementById('ocMonto').value = '';
    document.getElementById('ocObs').value = '';
    archivoInput.value = '';
    cargarTodo();
  }).catch((err) => {
    btn.disabled = false;
    mostrarFeedback('ocFeedback', 'Error de conexión: ' + err.message, 'error');
  });
}

function registrarGasto() {
  const categoria = document.getElementById('gCategoria').value;
  const monto = document.getElementById('gMonto').value;
  const registradoPor = document.getElementById('gRegistradoPor').value;
  if (!monto) { mostrarFeedback('gFeedback', 'Ingrese el monto del gasto.', 'error'); return; }

  const payload = {
    fecha: document.getElementById('gFecha').value,
    categoria,
    descripcion: document.getElementById('gDescripcion').value.trim(),
    monto,
    nCot: document.getElementById('gNCot').value,
    proveedor: document.getElementById('gProveedor').value.trim(),
    observaciones: document.getElementById('gObs').value.trim(),
    registradoPor
  };

  const btn = document.getElementById('btnRegistrarGasto');
  btn.disabled = true;
  mostrarFeedback('gFeedback', 'Registrando...', '');

  Api.post('registrarGasto', payload).then((res) => {
    btn.disabled = false;
    if (!res.ok) { mostrarFeedback('gFeedback', 'Error: ' + res.error, 'error'); return; }
    mostrarFeedback('gFeedback', 'Gasto registrado correctamente.', 'success');
    document.getElementById('gDescripcion').value = '';
    document.getElementById('gMonto').value = '';
    document.getElementById('gProveedor').value = '';
    document.getElementById('gObs').value = '';
    cargarTodo();
  }).catch((err) => {
    btn.disabled = false;
    mostrarFeedback('gFeedback', 'Error de conexión: ' + err.message, 'error');
  });
}

function registrarAnticipo() {
  const rut = document.getElementById('aRut').value.trim();
  const monto = document.getElementById('aMonto').value;
  const registradoPor = document.getElementById('aRegistradoPor').value;
  if (!rut) { mostrarFeedback('aFeedback', 'Ingrese el RUT del cliente.', 'error'); return; }
  if (!monto) { mostrarFeedback('aFeedback', 'Ingrese el monto del anticipo.', 'error'); return; }

  const payload = {
    rutCliente: rut,
    clienteNombre: document.getElementById('aNombre').value.trim(),
    nCot: document.getElementById('aNCot').value,
    fecha: document.getElementById('aFecha').value,
    monto,
    concepto: document.getElementById('aConcepto').value,
    observaciones: document.getElementById('aObs').value.trim(),
    registradoPor
  };

  const btn = document.getElementById('btnRegistrarAnticipo');
  btn.disabled = true;
  mostrarFeedback('aFeedback', 'Registrando...', '');

  Api.post('registrarAnticipo', payload).then((res) => {
    btn.disabled = false;
    if (!res.ok) { mostrarFeedback('aFeedback', 'Error: ' + res.error, 'error'); return; }
    mostrarFeedback('aFeedback', 'Anticipo registrado correctamente.', 'success');
    document.getElementById('aRut').value = '';
    document.getElementById('aNombre').value = '';
    document.getElementById('aMonto').value = '';
    document.getElementById('aObs').value = '';
    cargarTodo();
  }).catch((err) => {
    btn.disabled = false;
    mostrarFeedback('aFeedback', 'Error de conexión: ' + err.message, 'error');
  });
}

function rutAutofill() {
  const rut = document.getElementById('aRut').value.trim();
  if (!rut) return;
  Api.get('cliente', { rut }).then((res) => {
    if (res.ok && res.data.cliente) {
      document.getElementById('aNombre').value = res.data.cliente.RAZON_SOCIAL || '';
    }
  });
}

function init() {
  poblarUsuarios('ocRegistradoPor');
  poblarUsuarios('gRegistradoPor');
  poblarUsuarios('aRegistradoPor');
  document.getElementById('filtroEstado').addEventListener('change', renderTablaCotizaciones);
  document.getElementById('btnRegistrarOC').addEventListener('click', registrarOC);
  document.getElementById('btnRegistrarGasto').addEventListener('click', registrarGasto);
  document.getElementById('btnRegistrarAnticipo').addEventListener('click', registrarAnticipo);
  let debounce;
  document.getElementById('aRut').addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(rutAutofill, 400);
  });
  cargarTodo();
}

document.addEventListener('DOMContentLoaded', init);
