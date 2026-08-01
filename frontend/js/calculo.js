function calcularTotales(items, ggPct, utPct, ivaAplica) {
  const netoParcial = items.reduce((s, it) => s + (Number(it.cantidad) || 0) * (Number(it.vUnitario) || 0), 0);
  const montoGG = netoParcial * (ggPct / 100);
  const montoUt = netoParcial * (utPct / 100);
  const neto = netoParcial + montoGG + montoUt;
  const iva = ivaAplica ? Math.round(neto * 0.19) : 0;
  const total = neto + iva;
  return { netoParcial, montoGG, montoUt, neto, iva, total };
}

function fmt(n) {
  return '$' + Math.round(n || 0).toLocaleString('es-CL');
}
