function imprimirCotizacion() {
  const numCot = document.getElementById('numCot').textContent || 'COTIZACION';
  const tituloOriginal = document.title;
  document.title = `TEC ${numCot}`;
  window.print();
  document.title = tituloOriginal;
}
