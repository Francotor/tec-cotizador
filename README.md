# TEC Cotizador

Sistema web de cotizaciones para TEC Ingeniería Eléctrica y Construcción SpA. Reemplaza el
Excel (`TEC_Cotizaciones.xlsm`) para permitir que 3 personas trabajen en paralelo con
trazabilidad real y sin folios duplicados.

Ver [`docs/schema.md`](docs/schema.md) para el esquema completo de datos y la lógica de cálculo.

## 1. Crear el Google Sheet

Crea un Spreadsheet nuevo (no reutilices el `.xlsm`) con 5 pestañas, exactamente con los
encabezados de `docs/schema.md`, en este orden de columnas:

- `REGISTRO`
- `ITEMS_COTIZACION`
- `CLIENTES`
- `CONTACTOS`
- `TARIFAS_BASE`

Migra los datos actuales:
- `TARIFAS BASE` → `TARIFAS_BASE` (14 filas reales del Excel)
- `CLIENTES` → `CLIENTES`
- `CONTACTOS` → `CONTACTOS`
- El histórico de `REGISTRO` del Excel puede migrarse a mano (son solo 2 filas), asignando
  `REGISTRADO_POR = "Franco"` y `FECHA_REGISTRO` = hoy, ya que no existía ese dato antes.

## 2. Publicar el backend (Apps Script)

1. Desde el Sheet: Extensiones → Apps Script.
2. Copia los archivos de `apps-script/` (`Code.js`, `Folio.js`, `Clientes.js`, `Contactos.js`,
   `Cotizaciones.js`, `Tarifas.js`, `Utils.js`, `appsscript.json`) al editor.
3. Implementar → Nueva implementación → Tipo "Aplicación web".
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario** (o "Cualquiera dentro de la organización" si
     usas Google Workspace y quieres restringirlo)
4. Copia la URL del Web App generada.

## 3. Conectar el frontend

Edita `frontend/js/config.js`:

```js
const API_URL = 'https://script.google.com/macros/s/XXXXX/exec';
const USUARIOS = ['Franco', 'Felipe', 'Otro']; // ajustar nombres reales
```

## 4. Probar en local

```bash
py -m http.server 5502 --directory frontend
```

Abrir `http://localhost:5502`.

## 5. Publicar en GitHub Pages

Repo dedicado (no mezclar con ElectroGestión):

```bash
git init
git add .
git commit -m "Primera versión del cotizador TEC"
git branch -M main
git remote add origin https://github.com/francotor/tec-cotizador.git
git push -u origin main
```

GitHub Pages no permite servir una subcarpeta arbitraria como `/frontend` con "Deploy from
branch" (solo root o `/docs`), así que el repo incluye `.github/workflows/pages.yml`, que
publica `frontend/` vía GitHub Actions. Solo falta activarlo:

Settings → Pages → Source → **GitHub Actions** (no "Deploy from branch").

El primer push ya dispara el workflow. Quedará en `https://francotor.github.io/tec-cotizador/`.

## Estado actual

- [x] Estructura de carpetas y esquema de datos
- [x] Backend Apps Script: folio atómico con LockService, upsert de clientes/contactos, registro de cotización
- [x] Frontend: formulario completo, cálculo en vivo idéntico al Excel, autocompletado por RUT, ítems editables, impresión/PDF
- [ ] Google Sheet real creado y poblado con los datos migrados
- [ ] Web App desplegado y `API_URL` configurado
- [ ] Prueba con los 3 usuarios en paralelo
- [ ] Publicado en GitHub Pages
