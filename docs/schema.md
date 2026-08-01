# Esquema de Google Sheets — TEC Cotizador

Un solo Spreadsheet (no reutilizar el .xlsm) con 8 pestañas. Fila 1 = encabezados, datos desde fila 2.
Las últimas 3 (`ORDENES_COMPRA`, `GASTOS`, `ANTICIPOS`) son la extensión de control de gestión y las crea
automáticamente `Setup.js` la primera vez que se ejecuta (no hace falta crearlas a mano).

## REGISTRO

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | N_COT | número | PK. Solo lo escribe el backend (Folio.js) |
| B | CLIENTE | texto | Razón social, denormalizado |
| C | RUT | texto | `XX.XXX.XXX-X`, FK → CLIENTES |
| D | PROYECTO | texto | |
| E | FECHA_EMISION | fecha | |
| F | VENCIMIENTO | fecha | Emisión + 7 días |
| G | DIRECCION | texto | Denormalizado desde CLIENTES |
| H | ESTADO | texto (enum) | PENDIENTE / APROBADA / RECHAZADA / FACTURADA |
| I | FORMA_PAGO | texto | |
| J | NETO | número | Total Neto (post GG+utilidades, pre-IVA) |
| K | TOTAL | número | Total a pagar (post-IVA) |
| L | GASTOS_GENERALES_PCT | número | % usado en esta cotización (default 10) |
| M | UTILIDADES_PCT | número | % usado en esta cotización (default 7) |
| N | IVA_APLICA | booleano | TRUE = "Con IVA (19%)", FALSE = Exento |
| O | OBSERVACIONES | texto | |
| P | REGISTRADO_POR | texto (enum) | Franco / Felipe / tercera persona |
| Q | FECHA_REGISTRO | timestamp | Auto, generado por backend |
| R | DESCRIPCION_PROYECTO | texto | Descripción general del trabajo (aparece en el documento) |
| S | INCLUYE | texto | Alcance — qué incluye la cotización |
| T | EXCLUYE | texto | Alcance — qué excluye la cotización |
| U | NOTAS_ADICIONALES | texto | Notas que aparecen en el documento (distinto de OBSERVACIONES, que es de uso interno) |

## ITEMS_COTIZACION

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | N_COT | número | FK → REGISTRO.N_COT |
| B | N_ITEM | número | Orden dentro de la cotización |
| C | DESCRIPCION | texto | |
| D | UNIDAD | texto | |
| E | CANTIDAD | número | |
| F | V_UNITARIO | número | |
| G | V_TOTAL | número | = CANTIDAD × V_UNITARIO |

## CLIENTES

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | RUT | texto | PK |
| B | RAZON_SOCIAL | texto | |
| C | DIRECCION | texto | |
| D | CIUDAD_COMUNA | texto | |

## CONTACTOS

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | RUT_CLIENTE | texto | FK → CLIENTES.RUT (1 cliente → N contactos) |
| B | NOMBRE_CONTACTO | texto | |
| C | CORREO | texto | |
| D | TELEFONO | texto | |
| E | CARGO_NOTA | texto | |

## TARIFAS_BASE

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | SERVICIO_ITEM | texto | |
| B | UNIDAD | texto | hr / día / gl / ml / un |
| C | PRECIO_REF | número | |
| D | ULTIMA_ACTUALIZACION | texto | |
| E | NOTAS | texto | |

## ORDENES_COMPRA

Registra la OC del cliente asociada a una cotización aprobada. Una cotización puede tener más de una OC
(órdenes parciales).

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | ID_OC | número | PK. Autoincremental (igual mecanismo que N_COT) |
| B | N_COT | número | FK → REGISTRO.N_COT |
| C | N_OC_CLIENTE | texto | N° de OC que emite el cliente (no es un folio nuestro) |
| D | FECHA_RECEPCION | fecha | |
| E | MONTO_OC | número | |
| F | ARCHIVO_URL | texto (URL) | Link al PDF subido a Drive |
| G | OBSERVACIONES | texto | |
| H | REGISTRADO_POR | texto | |
| I | FECHA_REGISTRO | timestamp | Auto |

## GASTOS

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | ID_GASTO | número | PK. Autoincremental |
| B | FECHA | fecha | |
| C | CATEGORIA | texto (enum) | Materiales / Remuneraciones / Otros |
| D | DESCRIPCION | texto | |
| E | MONTO | número | |
| F | N_COT | número | FK opcional → REGISTRO.N_COT (vacío = gasto general, no ligado a un proyecto) |
| G | PROVEEDOR_BENEFICIARIO | texto | |
| H | OBSERVACIONES | texto | |
| I | REGISTRADO_POR | texto | |
| J | FECHA_REGISTRO | timestamp | Auto |

## ANTICIPOS

Abonos de clientes que no siempre están amarrados a una cotización formal (frecuente en clientes
particulares).

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | ID_ANTICIPO | número | PK. Autoincremental |
| B | RUT_CLIENTE | texto | Requerido, aunque el cliente no exista en CLIENTES |
| C | CLIENTE_NOMBRE | texto | Denormalizado, por si no está en CLIENTES |
| D | N_COT | número | FK opcional → REGISTRO.N_COT |
| E | FECHA | fecha | |
| F | MONTO | número | |
| G | CONCEPTO | texto (enum) | Anticipo / Materiales / Otro |
| H | OBSERVACIONES | texto | |
| I | REGISTRADO_POR | texto | |
| J | FECHA_REGISTRO | timestamp | Auto |

## Cotizaciones aprobadas sin OC

No es una columna almacenada — el Panel de Control cruza `REGISTRO` (ESTADO = APROBADA) contra
`ORDENES_COMPRA` (por N_COT) en el momento de mostrar la lista, y marca las que no tienen ninguna
fila de OC asociada.

## Lógica de cálculo (idéntica al Excel original)

```
Neto parcial      = Σ (CANTIDAD × V_UNITARIO) de los ítems
Monto GG          = Neto parcial × (GASTOS_GENERALES_PCT / 100)
Monto Utilidades  = Neto parcial × (UTILIDADES_PCT / 100)
NETO (Total Neto) = Neto parcial + Monto GG + Monto Utilidades
IVA               = IVA_APLICA ? ROUND(NETO × 0.19, 0) : 0
TOTAL             = NETO + IVA
```

## Folio atómico

`N_COT` nunca se genera en el frontend. `Folio.js` en Apps Script toma `LockService.getScriptLock()`,
lee el máximo `N_COT` actual de `REGISTRO`, suma 1, y escribe la fila completa (REGISTRO + ITEMS_COTIZACION)
antes de liberar el lock. Esto evita que dos personas registrando en el mismo segundo choquen folio.
