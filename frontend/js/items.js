const Items = (() => {
  let rows = [];
  let tarifas = [];
  let onChange = () => {};

  function init(tarifasList, onChangeCallback) {
    tarifas = tarifasList || [];
    onChange = onChangeCallback || (() => {});
    const datalist = document.getElementById('tarifasList');
    datalist.innerHTML = tarifas.map((t) => `<option value="${escapeHtml(t.SERVICIO_ITEM)}">`).join('');
    addRow();
  }

  function addRow() {
    rows.push({ descripcion: '', unidad: '', cantidad: '', vUnitario: '' });
    render();
  }

  function removeRow(index) {
    if (rows.length === 1) return;
    rows.splice(index, 1);
    render();
  }

  // Solo actualiza el DOM de esta fila (no re-renderiza la tabla completa):
  // reconstruir el innerHTML en cada tecla le hacía perder el foco al input.
  function updateRow(index, field, value) {
    rows[index][field] = value;
    const tr = document.getElementById('items').children[index];
    if (field === 'descripcion') {
      const tarifa = tarifas.find((t) => t.SERVICIO_ITEM === value);
      if (tarifa && !rows[index].unidad) {
        rows[index].unidad = tarifa.UNIDAD;
        tr.querySelector('.col-und input').value = tarifa.UNIDAD;
      }
      if (tarifa && !rows[index].vUnitario) {
        rows[index].vUnitario = tarifa.PRECIO_REF;
        tr.querySelector('.col-precio input').value = tarifa.PRECIO_REF;
      }
    }
    const total = (Number(rows[index].cantidad) || 0) * (Number(rows[index].vUnitario) || 0);
    tr.querySelector('.col-total').textContent = fmt(total);
    onChange();
  }

  function render() {
    const tbody = document.getElementById('items');
    tbody.innerHTML = rows.map((r, i) => {
      const total = (Number(r.cantidad) || 0) * (Number(r.vUnitario) || 0);
      return `
        <tr>
          <td>${i + 1}</td>
          <td><input list="tarifasList" value="${escapeHtml(r.descripcion)}" oninput="Items.updateRow(${i},'descripcion',this.value)"></td>
          <td class="col-und"><input value="${escapeHtml(r.unidad)}" oninput="Items.updateRow(${i},'unidad',this.value)"></td>
          <td class="col-cant"><input type="number" min="0" step="any" value="${r.cantidad}" oninput="Items.updateRow(${i},'cantidad',this.value)"></td>
          <td class="col-precio"><input type="number" min="0" step="any" value="${r.vUnitario}" oninput="Items.updateRow(${i},'vUnitario',this.value)"></td>
          <td class="col-total">${fmt(total)}</td>
          <td class="col-del"><button type="button" class="btn-del" onclick="Items.removeRow(${i})">✕</button></td>
        </tr>`;
    }).join('');
    onChange();
  }

  function getItems() {
    return rows
      .filter((r) => r.descripcion && Number(r.cantidad) > 0 && Number(r.vUnitario) > 0)
      .map((r) => ({ descripcion: r.descripcion, unidad: r.unidad, cantidad: Number(r.cantidad), vUnitario: Number(r.vUnitario) }));
  }

  function reset() {
    rows = [];
    addRow();
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  return { init, addRow, removeRow, updateRow, getItems, reset };
})();
