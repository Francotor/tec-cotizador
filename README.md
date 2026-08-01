# TEC Cotizador

Sistema web de cotizaciones y control de gestión para TEC Ingeniería Eléctrica y Construcción SpA.
Reemplaza el Excel (`TEC_Cotizaciones.xlsm`) para permitir que 3 personas trabajen en paralelo con
trazabilidad real y sin folios duplicados.

**En producción:**
- Frontend: https://francotor.github.io/tec-cotizador/
- Datos: [Google Sheet](https://docs.google.com/spreadsheets/d/1k_jIp0qWRTFx1rGSsF_b6FNzf00T0BAs1F0oIuET-gI/edit)

Ver [`docs/schema.md`](docs/schema.md) para el esquema completo de datos y la lógica de cálculo.

## Estructura

- `frontend/index.html` — Registrar cotizaciones
- `frontend/panel.html` — Panel de Control: seguimiento de estado, Órdenes de Compra, Gastos, Anticipos
- `apps-script/` — Backend (Google Apps Script Web App)

## Actualizar el backend (cada vez que cambien los archivos de `apps-script/`)

1. Desde el Sheet: Extensiones → Apps Script.
2. Reemplaza el contenido de cada archivo por el de `apps-script/` (mismo nombre, sin la extensión
   `.js` en el editor de Apps Script). Archivos actuales: `Utils`, `Clientes`, `Contactos`, `Tarifas`,
   `Folio`, `Registro`, `OrdenesCompra`, `Gastos`, `Anticipos`, `Setup`, `Code`, y el manifest
   `appsscript.json`.
3. **Solo la primera vez** que agregues `Setup.js`: selecciona la función `inicializarHojasControl`
   en el desplegable de funciones (arriba del editor) y dale **Ejecutar**. Esto crea las pestañas
   `ORDENES_COMPRA`, `GASTOS` y `ANTICIPOS` si todavía no existen. Te va a pedir autorizar permisos
   de Drive la primera vez (para poder guardar los PDF de las OC) — acéptalo.
4. **Implementar → Gestionar implementaciones** → ícono de lápiz en la implementación activa →
   en "Versión" elige **Nueva versión** → Implementar. (Si usas "Implementar → Nueva implementación"
   en cambio de esto, se genera una URL distinta y hay que volver a actualizar `config.js`.)
5. La URL del Web App no cambia al usar "Nueva versión", así que no hace falta tocar
   `frontend/js/config.js`.

## Conectar el frontend (solo la primera vez)

Editar `frontend/js/config.js`:

```js
const API_URL = 'https://script.google.com/macros/s/XXXXX/exec';
const USUARIOS = ['Franco', 'Felipe', 'Otro'];
```

## Probar en local

```bash
py -m http.server 5502 --directory frontend
```

Abrir `http://localhost:5502` (cotizador) o `http://localhost:5502/panel.html` (panel de control).

## Publicar cambios

```bash
git add -A
git commit -m "mensaje"
git push
```

El push dispara `.github/workflows/pages.yml`, que publica `frontend/` en GitHub Pages
automáticamente (Settings → Pages → Source debe estar en **GitHub Actions**).

## Sobre ElectroGestión

Hay un prototipo visual separado (`Francotor/electrogestor-app`) sin backend real — sus datos están
hardcodeados en el HTML. Tiene 6 planillas reales y bien diseñadas en Drive (Proyectos, OT,
Materiales, Facturación, Equipo, Incidencias) que vale la pena reutilizar cuando se retome ese
proyecto, conectándolas con Apps Script igual que aquí. La planilla "cotizaciones" que trae reservada
es un template genérico sin relación con TEC — no usarla; en su lugar, cuando se conecte
ElectroGestión, su sección de Cotizaciones debe apuntar a este mismo Sheet/Web App.

## Estado actual

- [x] Cotizador: formulario completo, folio atómico, cálculo idéntico al Excel, autocompletado por RUT, impresión/PDF
- [x] Google Sheet en producción, backend desplegado, GitHub Pages publicado
- [x] Panel de Control: cambiar estado de cotización, Órdenes de Compra (con adjunto PDF a Drive), Gastos (por categoría, opcionalmente ligados a una cotización), Anticipos de clientes (con o sin cotización asociada)
- [ ] Conectar ElectroGestión a este mismo backend para la sección de Cotizaciones
