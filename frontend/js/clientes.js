const Clientes = (() => {
  let contactos = [];
  let clienteEncontrado = null;
  let debounceTimer = null;

  function init() {
    document.getElementById('rut').addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(buscar, 350);
    });
    document.getElementById('contacto').addEventListener('change', onContactoChange);
  }

  function buscar() {
    const rut = document.getElementById('rut').value.trim();
    const hint = document.getElementById('rutHint');
    if (!rut) {
      limpiar();
      hint.textContent = '';
      return;
    }
    Api.get('cliente', { rut }).then((res) => {
      if (!res.ok) { hint.textContent = 'Error buscando cliente: ' + res.error; hint.className = 'hint error'; return; }
      clienteEncontrado = res.data.cliente;
      contactos = res.data.contactos || [];
      if (clienteEncontrado) {
        document.getElementById('razon').value = clienteEncontrado.RAZON_SOCIAL || '';
        document.getElementById('direccion').value = clienteEncontrado.DIRECCION || '';
        document.getElementById('ciudad').value = clienteEncontrado.CIUDAD_COMUNA || '';
        hint.textContent = '✓ Cliente encontrado en base — datos autocompletados';
        hint.className = 'hint';
      } else {
        ['razon', 'direccion', 'ciudad'].forEach((id) => { document.getElementById(id).readOnly = false; document.getElementById(id).value = ''; });
        hint.textContent = 'Cliente nuevo — complete manualmente (se guardará al registrar)';
        hint.className = 'hint';
      }
      renderContactos();
    });
  }

  function renderContactos() {
    const sel = document.getElementById('contacto');
    const opciones = contactos.map((c, i) => `<option value="${i}">${c.NOMBRE_CONTACTO}</option>`).join('');
    sel.innerHTML = opciones + `<option value="nuevo">+ Agregar nuevo contacto</option>`;
    sel.dispatchEvent(new Event('change'));
  }

  function onContactoChange() {
    const sel = document.getElementById('contacto');
    const nuevoFields = document.getElementById('contactoNuevoFields');
    if (sel.value === 'nuevo' || contactos.length === 0) {
      nuevoFields.style.display = 'grid';
      document.getElementById('correo').value = '';
      document.getElementById('correo').readOnly = false;
    } else {
      nuevoFields.style.display = 'none';
      const c = contactos[sel.value];
      document.getElementById('correo').value = (c && c.CORREO) || '';
      document.getElementById('correo').readOnly = true;
    }
  }

  function limpiar() {
    clienteEncontrado = null;
    contactos = [];
    ['razon', 'direccion', 'ciudad', 'correo'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('contacto').innerHTML = '';
  }

  function getClienteData() {
    return {
      rut: document.getElementById('rut').value.trim(),
      razonSocial: document.getElementById('razon').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      ciudadComuna: document.getElementById('ciudad').value.trim()
    };
  }

  function getContactoData() {
    const sel = document.getElementById('contacto');
    if (sel.value === 'nuevo' || contactos.length === 0) {
      return {
        nombre: document.getElementById('contactoNombre').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('contactoTelefono').value.trim(),
        cargoNota: document.getElementById('contactoCargo').value.trim()
      };
    }
    const c = contactos[sel.value];
    return { nombre: c.NOMBRE_CONTACTO, correo: c.CORREO, telefono: c.TELEFONO, cargoNota: c.CARGO_NOTA };
  }

  return { init, getClienteData, getContactoData };
})();
